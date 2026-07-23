/**
 * Improved FPL Data Sync Entry Point - SEASON AWARE
 * Orchestrates complete sync pipeline with validation and atomic db.json writes
 * Supports multi-season sync with transfer detection
 *
 * Usage:
 *   npm run sync:fpl                               - Sync 2026-2027 data
 *   npm run sync:fpl -- --season=2026-2027        - Explicit season
 *   npm run sync:fpl -- --manager-id=12345        - Sync manager data
 *   npm run sync:fpl -- --no-validate             - Skip validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { syncPublicData } from './public-sync';
import { DataQualityValidator, type DataQualityReport } from '../services/data-quality-validator';
import { AtomicDbWriter, type DatabaseSchema } from '../services/atomic-db-writer';
import { getSyncConfig } from '../services/fpl-sync-config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
const dbPath = path.join(projectRoot, 'db.json');

interface SyncResult {
  publicData: {
    players: number;
    teams: number;
    gameweeks: number;
    fixtures: number;
    elementTypes: number;
  } | null;
  dataQuality: DataQualityReport | null;
  dbWritten: boolean;
}

interface TransferEvent {
  playerId: number;
  playerName: string;
  fromTeamId: number | null;
  toTeamId: number;
  detectedAt: string;
}

/**
 * Detect player transfers by comparing previous squad to new squad
 */
function detectTransfers(
  previousPlayers: any[],
  currentPlayers: any[],
  teamMap: Map<number, string>
): TransferEvent[] {
  const transfers: TransferEvent[] = [];

  // Map previous players by stable identifier (use web_name + FPL ID if available)
  const prevMap = new Map<number, any>();
  previousPlayers.forEach((p) => {
    prevMap.set(p.id, p);
  });

  // Check for team changes
  currentPlayers.forEach((player) => {
    const prevPlayer = prevMap.get(player.id);
    if (prevPlayer && prevPlayer.team !== player.team) {
      transfers.push({
        playerId: player.id,
        playerName: player.webName || player.web_name || player.firstName + ' ' + player.secondName,
        fromTeamId: prevPlayer.team,
        toTeamId: player.team,
        detectedAt: new Date().toISOString(),
      });
    }
  });

  return transfers;
}

async function main(): Promise<void> {
  const startTime = Date.now();

  try {
    // Get sync configuration
    const config = getSyncConfig();
    const seasonDataDir = path.join(projectRoot, 'data', 'seasons', config.season);
    const normalizedDataDir = path.join(seasonDataDir, 'normalized');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('FPL Data Sync Pipeline - SEASON AWARE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Season: ${config.season}`);
    console.log(`Data Directory: ${seasonDataDir}`);
    console.log(`Manager ID: ${config.managerId || 'None (public data only)'}`);
    console.log(`Sync Public: ${config.syncPublic}`);
    console.log(`Sync Manager: ${config.syncManager}`);
    console.log(`Validate: ${config.validateData}`);
    console.log('───────────────────────────────────────────────────────────\n');

    const result: SyncResult = {
      publicData: null,
      dataQuality: null,
      dbWritten: false,
    };

    // Step 1: Sync public data (with season-aware paths passed to syncPublicData)
    if (config.syncPublic) {
      console.log('STEP 1: Syncing public FPL data...\n');
      await syncPublicData(config.season);
      result.publicData = {
        players: 0,
        teams: 0,
        gameweeks: 0,
        fixtures: 0,
        elementTypes: 0,
      };
    }

    // Step 2: Load synced data
    console.log('STEP 2: Loading synchronized data...\n');
    const teams = JSON.parse(fs.readFileSync(path.join(normalizedDataDir, 'teams.json'), 'utf-8'));
    const players = JSON.parse(
      fs.readFileSync(path.join(normalizedDataDir, 'players.json'), 'utf-8')
    );
    const gameweeks = JSON.parse(
      fs.readFileSync(path.join(normalizedDataDir, 'gameweeks.json'), 'utf-8')
    );
    const elementTypes = JSON.parse(
      fs.readFileSync(path.join(normalizedDataDir, 'element-types.json'), 'utf-8')
    );

    // Fixtures might be empty array if not synced yet
    let fixtures: any[] = [];
    const fixturesPath = path.join(normalizedDataDir, 'fixtures.json');
    if (fs.existsSync(fixturesPath)) {
      fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf-8'));
    }

    console.log(`  Players: ${players.length}`);
    console.log(`  Teams: ${teams.length}`);
    console.log(`  Gameweeks: ${gameweeks.length}`);
    console.log(`  Fixtures: ${fixtures.length}`);
    console.log(`  Element Types: ${elementTypes.length}`);
    console.log('');

    if (result.publicData) {
      result.publicData.players = players.length;
      result.publicData.teams = teams.length;
      result.publicData.gameweeks = gameweeks.length;
      result.publicData.fixtures = fixtures.length;
      result.publicData.elementTypes = elementTypes.length;
    }

    // Step 3: Data quality validation
    if (config.validateData) {
      console.log('STEP 3: Running data quality validation...\n');
      const validator = new DataQualityValidator();
      const report = validator.validate({
        players,
        teams,
        gameweeks,
        fixtures,
        elementTypes,
        season: config.season,
        managerId: config.managerId,
      });

      result.dataQuality = report;

      // Print quality summary
      console.log(`Status: ${report.status}`);
      console.log(`Errors: ${report.summary.errors}`);
      console.log(`Warnings: ${report.summary.warnings}`);
      console.log('');

      // Print critical errors
      if (report.summary.errors > 0) {
        console.log('CRITICAL ERRORS:');
        report.issues
          .filter((i) => i.severity === 'ERROR')
          .slice(0, 10)
          .forEach((issue) => {
            console.log(`  - [${issue.category}] ${issue.message}`);
          });
        if (report.issues.filter((i) => i.severity === 'ERROR').length > 10) {
          console.log(
            `  ... and ${report.issues.filter((i) => i.severity === 'ERROR').length - 10} more`
          );
        }
        console.log('');
      }

      // Print warnings (first 5)
      if (report.summary.warnings > 0) {
        console.log('WARNINGS (first 5):');
        report.issues
          .filter((i) => i.severity === 'WARNING')
          .slice(0, 5)
          .forEach((issue) => {
            console.log(`  - [${issue.category}] ${issue.message}`);
          });
        if (report.issues.filter((i) => i.severity === 'WARNING').length > 5) {
          console.log(
            `  ... and ${report.issues.filter((i) => i.severity === 'WARNING').length - 5} more`
          );
        }
        console.log('');
      }

      // Fail if critical errors
      if (report.status === 'FAIL') {
        throw new Error('Data quality validation failed - critical errors detected');
      }
    }

    // Step 3.5: Detect transfers by comparing with previous dataset
    console.log('STEP 3.5: Detecting transfers and squad changes...\n');
    let detectedTransfers: TransferEvent[] = [];
    let existingTransfers: TransferEvent[] = [];

    // Load previous db.json if it exists for this season
    if (fs.existsSync(dbPath)) {
      try {
        const prevDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        if (prevDb.transfers && Array.isArray(prevDb.transfers)) {
          existingTransfers = prevDb.transfers;
        }

        // Compare players with previous snapshot
        const prevPlayers = prevDb.players || [];
        if (prevPlayers.length > 0) {
          const prevMap = new Map<number, any>();
          prevPlayers.forEach((p: any) => {
            prevMap.set(p.id, p);
          });

          // Detect team changes
          const teamMap = new Map<number, string>();
          teams.forEach((t: any) => {
            teamMap.set(t.id, t.name);
          });

          players.forEach((player: any) => {
            const prevPlayer = prevMap.get(player.id);
            if (prevPlayer && prevPlayer.team !== player.team) {
              // Player changed team
              const fromTeamName = teamMap.get(prevPlayer.team) || `Team ${prevPlayer.team}`;
              const toTeamName = teamMap.get(player.team) || `Team ${player.team}`;
              const playerName =
                player.webName || player.web_name || `${player.firstName} ${player.secondName}`;

              const transfer: TransferEvent = {
                playerId: player.id,
                playerName: playerName,
                fromTeamId: prevPlayer.team,
                toTeamId: player.team,
                detectedAt: new Date().toISOString(),
              };

              // Avoid duplicates - check if this exact transfer already exists
              const isDuplicate = existingTransfers.some(
                (t) =>
                  t.playerId === transfer.playerId &&
                  t.fromTeamId === transfer.fromTeamId &&
                  t.toTeamId === transfer.toTeamId
              );

              if (!isDuplicate) {
                detectedTransfers.push(transfer);
              }
            }
          });
        }
      } catch (err) {
        console.log(
          '  (No previous db.json or error reading it - treating current sync as baseline)\n'
        );
      }
    } else {
      console.log('  (Initial sync - current data treated as baseline)\n');
    }

    // Merge detected transfers with existing ones (newest first)
    const allTransfers = [...detectedTransfers, ...existingTransfers];
    if (detectedTransfers.length > 0) {
      console.log(`✓ Detected ${detectedTransfers.length} new squad changes\n`);
      detectedTransfers.forEach((t) => {
        const fromTeam = teams.find((team: any) => team.id === t.fromTeamId)?.name || 'Unknown';
        const toTeam = teams.find((team: any) => team.id === t.toTeamId)?.name || 'Unknown';
        console.log(`  - ${t.playerName}: ${fromTeam} → ${toTeam}`);
      });
      console.log('');
    } else {
      console.log('  No new squad changes detected\n');
    }

    // Step 4: Write atomic db.json
    if (config.writeDb) {
      console.log('STEP 4: Writing atomic db.json...\n');

      // Resolve gameweek state
      let currentGameweekId: number | null = null;
      let nextGameweekId: number | null = null;
      let lastFinishedGameweekId: number | null = null;

      if (gameweeks && gameweeks.length > 0) {
        // Find current (first unfinished)
        for (const gw of gameweeks) {
          if (!gw.finished) {
            currentGameweekId = gw.id;
            break;
          }
          lastFinishedGameweekId = gw.id;
        }

        // If all finished, use last
        if (!currentGameweekId) {
          lastFinishedGameweekId = gameweeks[gameweeks.length - 1].id;
        } else {
          // Find next (first after current)
          const currentIdx = gameweeks.findIndex((gw: any) => gw.id === currentGameweekId);
          if (currentIdx >= 0 && currentIdx < gameweeks.length - 1) {
            nextGameweekId = gameweeks[currentIdx + 1].id;
          }
        }
      }

      const db: DatabaseSchema = {
        meta: {
          schemaVersion: 1,
          season: config.season,
          source: 'fpl',
          syncedAt: new Date().toISOString(),
          publicDataSynced: config.syncPublic,
          managerDataSynced: config.syncManager,
          managerId: config.managerId,
          dataQualityStatus: result.dataQuality?.status || 'UNKNOWN',
          // Gameweek state snapshot
          currentGameweekId,
          nextGameweekId,
          lastFinishedGameweekId,
          totalGameweeks: gameweeks ? gameweeks.length : 0,
        },
        teams,
        players,
        gameweeks,
        elementTypes,
        fixtures,
        transfers: allTransfers.length > 0 ? allTransfers : undefined,
      };

      const writer = new AtomicDbWriter(dbPath);
      await writer.write(db);
      result.dbWritten = true;

      console.log(`✓ db.json written: ${dbPath}`);
      console.log(`  File size: ${(fs.statSync(dbPath).size / 1024).toFixed(2)} KB`);
      console.log('');

      // Log gameweek state
      if (currentGameweekId) {
        console.log(`Gameweek State:`);
        console.log(`  Current: GW ${currentGameweekId}`);
        console.log(
          `  Next: ${nextGameweekId ? `GW ${nextGameweekId}` : 'None (season complete)'}`
        );
        console.log(
          `  Last Finished: ${lastFinishedGameweekId ? `GW ${lastFinishedGameweekId}` : 'None'}`
        );
        console.log('');
      } else if (lastFinishedGameweekId) {
        console.log(`Gameweek State:`);
        console.log(`  Status: Season Complete`);
        console.log(`  Last Gameweek: GW ${lastFinishedGameweekId}`);
        console.log('');
      }
    }

    // Summary
    const duration = Date.now() - startTime;
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Sync Complete - Summary');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Public Data Synced: ${config.syncPublic}`);
    console.log(
      `Manager Data Synced: ${config.syncManager} ${config.managerId ? `(Manager: ${config.managerId})` : ''}`
    );
    console.log(`Data Quality: ${result.dataQuality?.status || 'N/A'}`);
    console.log(`db.json Written: ${result.dbWritten}`);
    console.log('');

    if (result.publicData) {
      console.log('Data Counts:');
      console.log(`  Players: ${result.publicData.players}`);
      console.log(`  Teams: ${result.publicData.teams}`);
      console.log(`  Gameweeks: ${result.publicData.gameweeks}`);
      console.log(`  Fixtures: ${result.publicData.fixtures}`);
      console.log(`  Element Types: ${result.publicData.elementTypes}`);
      console.log('');
    }

    console.log('✓ Sync completed successfully');
  } catch (error) {
    console.error('✗ Sync failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
