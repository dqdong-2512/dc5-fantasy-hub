/**
 * Public Data Synchronizer
 * Downloads public FPL data (bootstrap, fixtures) and normalizes
 * No manager ID required - works standalone
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FplClient } from '../../src/shared/services/fpl-client';
import type {
  BootstrapStatic,
  Event,
  Team,
  Player,
  ElementType,
  FPLFixture,
} from '../../src/shared/services/fpl-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
const rawDataDir = path.join(projectRoot, 'data', 'seasons', '2025-2026', 'raw');
const normalizedDataDir = path.join(projectRoot, 'data', 'seasons', '2025-2026', 'normalized');

interface NormalizedTeam {
  id: number;
  name: string;
  shortName: string;
  code: number;
  strength: number;
  position: number;
  strengthOverallHome: number;
  strengthOverallAway: number;
  strengthAttackHome: number;
  strengthAttackAway: number;
  strengthDefenceHome: number;
  strengthDefenceAway: number;
}

interface NormalizedPlayer {
  id: number;
  firstName: string;
  secondName: string;
  webName: string;
  team: number;
  elementType: number;
  squadNumber: number | null;
  selectedByPercent: string;
  nowCost: number;
  form: string;
  pointsPerGame: string;
  totalPoints: number;
  minutes: number;
}

interface NormalizedGameweek {
  id: number;
  name: string;
  deadlineTime: string;
  finished: boolean;
  averageEntryScore: number | null;
}

interface NormalizedElementType {
  id: number;
  name: string;
  pluralName: string;
  singularName: string;
}

interface NormalizedFixture {
  id: number;
  gameweek: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  started: boolean;
  finished: boolean;
  kickoffTime: string;
  homeDifficulty: number;
  awayDifficulty: number;
}

export async function syncPublicData(): Promise<void> {
  console.log('Syncing public FPL data...');

  try {
    const client = new FplClient();

    // Fetch bootstrap and fixtures in parallel
    console.log('Fetching bootstrap-static...');
    const bootstrapData = await client.getBootstrap();

    console.log('Fetching fixtures...');
    const fixturesData = await client.getFixtures();

    // Ensure directories exist
    if (!fs.existsSync(rawDataDir)) {
      fs.mkdirSync(rawDataDir, { recursive: true });
    }

    if (!fs.existsSync(normalizedDataDir)) {
      fs.mkdirSync(normalizedDataDir, { recursive: true });
    }

    // Save raw data
    const bootstrapPath = path.join(rawDataDir, 'bootstrap-static.json');
    fs.writeFileSync(bootstrapPath, JSON.stringify(bootstrapData, null, 2));
    console.log(`✓ Bootstrap saved: ${bootstrapPath}`);

    const fixturesPath = path.join(rawDataDir, 'fixtures.json');
    fs.writeFileSync(fixturesPath, JSON.stringify(fixturesData, null, 2));
    console.log(`✓ Fixtures saved: ${fixturesPath} (${fixturesData.length} fixtures)`);

    // Normalize teams
    const normalizedTeams: NormalizedTeam[] = bootstrapData.teams.map((team: Team) => ({
      id: team.id,
      name: team.name,
      shortName: team.short_name,
      code: team.code,
      strength: team.strength,
      position: team.position,
      strengthOverallHome: team.strength_overall_home,
      strengthOverallAway: team.strength_overall_away,
      strengthAttackHome: team.strength_attack_home,
      strengthAttackAway: team.strength_attack_away,
      strengthDefenceHome: team.strength_defence_home,
      strengthDefenceAway: team.strength_defence_away,
    }));
    fs.writeFileSync(
      path.join(normalizedDataDir, 'teams.json'),
      JSON.stringify(normalizedTeams, null, 2)
    );
    console.log(`✓ Teams normalized: ${normalizedTeams.length} teams`);

    // Normalize players
    const normalizedPlayers: NormalizedPlayer[] = bootstrapData.elements.map((player: Player) => ({
      id: player.id,
      firstName: player.first_name,
      secondName: player.second_name,
      webName: player.web_name,
      team: player.team,
      elementType: player.element_type,
      squadNumber: player.squad_number,
      selectedByPercent: player.selected_by_percent,
      nowCost: player.now_cost,
      form: player.form,
      pointsPerGame: player.points_per_game,
      totalPoints: player.total_points,
      minutes: player.minutes,
    }));
    fs.writeFileSync(
      path.join(normalizedDataDir, 'players.json'),
      JSON.stringify(normalizedPlayers, null, 2)
    );
    console.log(`✓ Players normalized: ${normalizedPlayers.length} players`);

    // Normalize gameweeks
    const normalizedGameweeks: NormalizedGameweek[] = bootstrapData.events.map((event: Event) => ({
      id: event.id,
      name: event.name,
      deadlineTime: event.deadline_time,
      finished: event.finished,
      averageEntryScore: event.average_entry_score,
    }));
    fs.writeFileSync(
      path.join(normalizedDataDir, 'gameweeks.json'),
      JSON.stringify(normalizedGameweeks, null, 2)
    );
    console.log(`✓ Gameweeks normalized: ${normalizedGameweeks.length} gameweeks`);

    // Normalize element types
    const normalizedElementTypes: NormalizedElementType[] = bootstrapData.element_types.map(
      (type: ElementType) => ({
        id: type.id,
        name: type.singular_name, // Use singular name as the primary name
        pluralName: type.plural_name,
        singularName: type.singular_name,
      })
    );
    fs.writeFileSync(
      path.join(normalizedDataDir, 'element-types.json'),
      JSON.stringify(normalizedElementTypes, null, 2)
    );
    console.log(`✓ Element types normalized: ${normalizedElementTypes.length} types`);

    // Normalize fixtures
    const normalizedFixtures: NormalizedFixture[] = fixturesData.map((fixture: FPLFixture) => ({
      id: fixture.id,
      gameweek: fixture.event,
      homeTeamId: fixture.team_h, // Correct field name from API
      awayTeamId: fixture.team_a, // Correct field name from API
      homeTeamScore: fixture.team_h_score, // Correct field name from API
      awayTeamScore: fixture.team_a_score, // Correct field name from API
      started: fixture.started,
      finished: fixture.finished,
      kickoffTime: fixture.kickoff_time,
      homeDifficulty: fixture.team_h_difficulty, // Correct field name from API
      awayDifficulty: fixture.team_a_difficulty, // Correct field name from API
    }));
    fs.writeFileSync(
      path.join(normalizedDataDir, 'fixtures.json'),
      JSON.stringify(normalizedFixtures, null, 2)
    );
    console.log(`✓ Fixtures normalized: ${normalizedFixtures.length} fixtures`);

    return {
      players: normalizedPlayers.length,
      teams: normalizedTeams.length,
      gameweeks: normalizedGameweeks.length,
      fixtures: normalizedFixtures.length,
      elementTypes: normalizedElementTypes.length,
    } as any;
  } catch (error) {
    throw new Error(
      `Failed to sync public data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
