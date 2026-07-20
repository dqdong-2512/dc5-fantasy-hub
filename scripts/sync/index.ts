/**
 * Improved FPL Data Sync Entry Point
 * Orchestrates complete sync pipeline with validation and atomic db.json writes
 *
 * Usage:
 *   npm run sync:fpl                        - Sync public data only
 *   npm run sync:fpl -- --manager-id=12345 - Sync public + manager-specific data
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
const normalizedDataDir = path.join(projectRoot, 'data', 'seasons', '2025-2026', 'normalized');
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

async function main(): Promise<void> {
  const startTime = Date.now();

  try {
    // Get sync configuration
    const config = getSyncConfig();
    console.log('═══════════════════════════════════════════════════════════');
    console.log('FPL Data Sync Pipeline');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Season: ${config.season}`);
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

    // Step 1: Sync public data
    if (config.syncPublic) {
      console.log('STEP 1: Syncing public FPL data...\n');
      await syncPublicData();
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

    // Update result with actual counts
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

    // Step 4: Write atomic db.json
    if (config.writeDb) {
      console.log('STEP 4: Writing atomic db.json...\n');
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
        },
        teams,
        players,
        gameweeks,
        elementTypes,
        fixtures,
      };

      const writer = new AtomicDbWriter(dbPath);
      await writer.write(db);
      result.dbWritten = true;

      console.log(`✓ db.json written: ${dbPath}`);
      console.log(`  File size: ${(fs.statSync(dbPath).size / 1024).toFixed(2)} KB`);
      console.log('');
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
