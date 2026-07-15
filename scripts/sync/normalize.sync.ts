/**
 * Normalizer
 * Transforms raw bootstrap data into normalized, application-specific JSON files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  BootstrapStatic,
  Event,
  Team,
  Player,
  ElementType,
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

export async function normalize(): Promise<void> {
  console.log('Generating normalized data...');

  try {
    // Read raw bootstrap data
    const bootstrapPath = path.join(rawDataDir, 'bootstrap-static.json');
    if (!fs.existsSync(bootstrapPath)) {
      throw new Error('bootstrap-static.json not found. Run sync:bootstrap first.');
    }

    const rawData: BootstrapStatic = JSON.parse(fs.readFileSync(bootstrapPath, 'utf-8'));

    // Ensure normalized directory exists
    if (!fs.existsSync(normalizedDataDir)) {
      fs.mkdirSync(normalizedDataDir, { recursive: true });
    }

    // Normalize teams
    const normalizedTeams: NormalizedTeam[] = rawData.teams.map((team: Team) => ({
      id: team.id,
      name: team.name,
      shortName: team.short_name,
      code: team.code,
      strength: team.strength,
      position: team.position,
    }));
    fs.writeFileSync(
      path.join(normalizedDataDir, 'teams.json'),
      JSON.stringify(normalizedTeams, null, 2)
    );
    console.log('Teams generated.');

    // Normalize players
    const normalizedPlayers: NormalizedPlayer[] = rawData.elements.map((player: Player) => ({
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
    console.log('Players generated.');

    // Normalize gameweeks
    const normalizedGameweeks: NormalizedGameweek[] = rawData.events.map((event: Event) => ({
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
    console.log('Gameweeks generated.');

    // Normalize element types
    const normalizedElementTypes: NormalizedElementType[] = rawData.element_types.map(
      (type: ElementType) => ({
        id: type.id,
        name: type.name,
        pluralName: type.plural_name,
        singularName: type.singular_name,
      })
    );
    fs.writeFileSync(
      path.join(normalizedDataDir, 'element-types.json'),
      JSON.stringify(normalizedElementTypes, null, 2)
    );
    console.log('Element types generated.');
  } catch (error) {
    throw new Error(
      `Failed to normalize data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
