import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FplClient } from '../../src/shared/services/fpl-client';
import type {
  ElementType,
  Event,
  FPLFixture,
  Player,
  Team,
} from '../../src/shared/services/fpl-client';
import { getFplSeasonPaths } from '../services/competition-data-paths';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

interface CollectionFailure {
  id: number;
  message: string;
}

export interface SyncPublicResult {
  players: number;
  teams: number;
  gameweeks: number;
  fixtures: number;
  elementTypes: number;
  playerDetails: number;
  eventLiveSnapshots: number;
  playerPhotos: number;
  complete: boolean;
}

export interface SyncPublicOptions {
  trigger?: 'manual' | 'automatic';
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  worker: (value: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(values[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => runWorker())
  );
  return results;
}

function ensureDirectories(directories: string[]): void {
  directories.forEach((directory) => fs.mkdirSync(directory, { recursive: true }));
}

function writeJson(filePath: string, payload: unknown): void {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(payload, null, 2), 'utf-8');
  fs.renameSync(temporaryPath, filePath);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function fetchWithRetry<T>(label: string, operation: () => Promise<T>): Promise<T> {
  const maxAttempts = 4;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;

      const delayMs = 750 * 2 ** (attempt - 1);
      console.warn(
        `  ${label} failed (${attempt}/${maxAttempts}): ${errorMessage(error)}. ` +
          `Retrying in ${delayMs}ms...`
      );
      await wait(delayMs);
    }
  }

  throw new Error(`${label} failed after ${maxAttempts} attempts: ${errorMessage(lastError)}`, {
    cause: lastError,
  });
}

function pruneNumberedJsonFiles(directory: string, activeIds: Set<number>): void {
  for (const fileName of fs.readdirSync(directory)) {
    const match = /^(\d+)\.json$/.exec(fileName);
    if (match && !activeIds.has(Number(match[1]))) {
      fs.unlinkSync(path.join(directory, fileName));
    }
  }
}

function prunePlayerPhotos(directory: string, activeCodes: Set<number>): void {
  for (const fileName of fs.readdirSync(directory)) {
    const match = /^(\d+)\.png$/.exec(fileName);
    if (match && !activeCodes.has(Number(match[1]))) {
      fs.unlinkSync(path.join(directory, fileName));
    }
  }
}

export async function syncPublicData(
  season: string = '2026-2027',
  options: SyncPublicOptions = {}
): Promise<SyncPublicResult> {
  const paths = getFplSeasonPaths(projectRoot, season);
  ensureDirectories([
    paths.rawDir,
    paths.normalizedDir,
    paths.assetsDir,
    paths.playerPhotosDir,
    paths.elementSummariesDir,
    paths.eventLiveDir,
  ]);
  fs.copyFileSync(
    path.join(projectRoot, 'data', 'competitions', 'fpl', 'shared', 'player-photo-placeholder.svg'),
    path.join(paths.assetsDir, 'player-photo-placeholder.svg')
  );

  console.log(`Syncing comprehensive public FPL data for ${season}...`);
  const client = new FplClient();

  console.log('Fetching bootstrap-static and fixtures...');
  const [bootstrapData, fixturesData] = await Promise.all([
    fetchWithRetry('bootstrap-static', () => client.getBootstrap()),
    fetchWithRetry('fixtures', () => client.getFixtures()),
  ]);

  const playerDetailFailures: CollectionFailure[] = [];
  console.log(
    `Refreshing all ${bootstrapData.elements.length} player detail/history records from FPL...`
  );
  const playerDetailResults = await mapWithConcurrency(bootstrapData.elements, 8, async (player) => {
    try {
      const summary = await fetchWithRetry(`element-summary/${player.id}`, () =>
        client.getElementSummary(player.id)
      );
      return { playerId: player.id, summary };
    } catch (error) {
      playerDetailFailures.push({ id: player.id, message: errorMessage(error) });
      return null;
    }
  });
  const playerDetails = playerDetailResults.filter(
    (entry): entry is NonNullable<typeof entry> => entry !== null
  );
  if (playerDetailFailures.length > 0) {
    throw new Error(
      `FPL player detail refresh is incomplete: ${playerDetailFailures.length}/` +
        `${bootstrapData.elements.length} requests failed. No new snapshot was published. ` +
        `First failure: player ${playerDetailFailures[0].id}: ${playerDetailFailures[0].message}`
    );
  }

  const eventLiveFailures: CollectionFailure[] = [];
  console.log(`Refreshing all ${bootstrapData.events.length} gameweek live snapshots from FPL...`);
  const eventLiveResults = await mapWithConcurrency(bootstrapData.events, 4, async (event) => {
    try {
      const live = await fetchWithRetry(`event/${event.id}/live`, () =>
        client.getEventLive(event.id)
      );
      return { eventId: event.id, live };
    } catch (error) {
      eventLiveFailures.push({ id: event.id, message: errorMessage(error) });
      return null;
    }
  });
  const eventLiveSnapshots = eventLiveResults.filter(
    (entry): entry is NonNullable<typeof entry> => entry !== null
  );
  if (eventLiveFailures.length > 0) {
    throw new Error(
      `FPL event-live refresh is incomplete: ${eventLiveFailures.length}/` +
        `${bootstrapData.events.length} requests failed. No new snapshot was published. ` +
        `First failure: GW ${eventLiveFailures[0].id}: ${eventLiveFailures[0].message}`
    );
  }

  // Publish mandatory JSON only after every endpoint has been refreshed successfully. This
  // prevents a failed run from leaving a mixture of old and new season data on disk.
  writeJson(path.join(paths.rawDir, 'bootstrap-static.json'), bootstrapData);
  writeJson(path.join(paths.rawDir, 'fixtures.json'), fixturesData);
  for (const entry of playerDetails) {
    writeJson(path.join(paths.elementSummariesDir, `${entry.playerId}.json`), entry.summary);
  }
  for (const entry of eventLiveSnapshots) {
    writeJson(path.join(paths.eventLiveDir, `${entry.eventId}.json`), entry.live);
  }
  pruneNumberedJsonFiles(
    paths.elementSummariesDir,
    new Set(bootstrapData.elements.map((player) => player.id))
  );
  pruneNumberedJsonFiles(
    paths.eventLiveDir,
    new Set(bootstrapData.events.map((event) => event.id))
  );
  writeJson(path.join(paths.normalizedDir, 'player-details.json'), playerDetails);
  writeJson(path.join(paths.normalizedDir, 'event-live.json'), eventLiveSnapshots);

  const playerPhotoFailures: CollectionFailure[] = [];
  console.log(`Downloading ${bootstrapData.elements.length} player photos...`);
  const photoResults = await mapWithConcurrency(bootstrapData.elements, 8, async (player) => {
    const fileName = `${player.code}.png`;
    const photoUrl =
      `https://resources.premierleague.com/premierleague/photos/players/` +
      `250x250/p${player.code}.png`;
    try {
      const outputPath = path.join(paths.playerPhotosDir, fileName);
      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        const response = await fetchWithRetry(`player photo ${player.code}`, () => fetch(photoUrl));
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        const temporaryPath = `${outputPath}.${process.pid}.tmp`;
        fs.writeFileSync(temporaryPath, Buffer.from(await response.arrayBuffer()));
        fs.renameSync(temporaryPath, outputPath);
      }
      return {
        playerId: player.id,
        code: player.code,
        available: true,
        file: `assets/player-photos/${fileName}`,
      };
    } catch (error) {
      playerPhotoFailures.push({ id: player.id, message: errorMessage(error) });
      return {
        playerId: player.id,
        code: player.code,
        available: false,
        file: '../../shared/player-photo-placeholder.svg',
      };
    }
  });
  const availablePlayerPhotos = photoResults.filter((entry) => entry.available);
  prunePlayerPhotos(
    paths.playerPhotosDir,
    new Set(bootstrapData.elements.map((player) => player.code))
  );
  writeJson(path.join(paths.assetsDir, 'player-photos.manifest.json'), photoResults);
  const photoPathByPlayerId = new Map(photoResults.map((entry) => [entry.playerId, entry.file]));

  const normalizedTeams = bootstrapData.teams.map((team: Team) => ({
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
  writeJson(path.join(paths.normalizedDir, 'teams.json'), normalizedTeams);

  type ExtendedPlayer = Player & {
    cost_change_event?: number;
    cost_change_start?: number;
    transfers_in?: number;
    transfers_out?: number;
    transfers_in_event?: number;
    transfers_out_event?: number;
  };
  const normalizedPlayers = bootstrapData.elements.map((rawPlayer: Player) => {
    const player = rawPlayer as ExtendedPlayer;
    return {
      id: player.id,
      firstName: player.first_name,
      secondName: player.second_name,
      webName: player.web_name,
      status: player.status,
      code: player.code,
      team: player.team,
      teamCode: player.team_code,
      elementType: player.element_type,
      squadNumber: player.squad_number,
      photo: player.photo,
      avatarPath:
        photoPathByPlayerId.get(player.id) ?? '../../shared/player-photo-placeholder.svg',
      selectedByPercent: player.selected_by_percent,
      nowCost: player.now_cost,
      costChangeEvent: player.cost_change_event ?? 0,
      costChangeStart: player.cost_change_start ?? 0,
      transfersIn: player.transfers_in ?? 0,
      transfersOut: player.transfers_out ?? 0,
      transfersInEvent: player.transfers_in_event ?? 0,
      transfersOutEvent: player.transfers_out_event ?? 0,
      form: player.form,
      pointsPerGame: player.points_per_game,
      totalPoints: player.total_points,
      minutes: player.minutes,
      goalsScored: player.goals_scored,
      assists: player.assists,
      cleanSheets: player.clean_sheets,
      goalsConceded: player.goals_conceded,
      ownGoals: player.own_goals,
      penaltiesSaved: player.penalties_saved,
      penaltiesMissed: player.penalties_missed,
      yellowCards: player.yellow_cards,
      redCards: player.red_cards,
    };
  });
  writeJson(path.join(paths.normalizedDir, 'players.json'), normalizedPlayers);

  const normalizedGameweeks = bootstrapData.events.map((event: Event) => ({
    id: event.id,
    name: event.name,
    deadlineTime: event.deadline_time,
    finished: event.finished,
    averageEntryScore: event.average_entry_score,
  }));
  writeJson(path.join(paths.normalizedDir, 'gameweeks.json'), normalizedGameweeks);

  const normalizedElementTypes = bootstrapData.element_types.map((type: ElementType) => ({
    id: type.id,
    name: type.singular_name,
    pluralName: type.plural_name,
    singularName: type.singular_name,
  }));
  writeJson(path.join(paths.normalizedDir, 'element-types.json'), normalizedElementTypes);

  const normalizedFixtures = fixturesData.map((fixture: FPLFixture) => ({
    id: fixture.id,
    gameweek: fixture.event,
    homeTeamId: fixture.team_h,
    awayTeamId: fixture.team_a,
    homeTeamScore: fixture.team_h_score,
    awayTeamScore: fixture.team_a_score,
    started: fixture.started,
    finished: fixture.finished,
    kickoffTime: fixture.kickoff_time,
    homeDifficulty: fixture.team_h_difficulty,
    awayDifficulty: fixture.team_a_difficulty,
  }));
  writeJson(path.join(paths.normalizedDir, 'fixtures.json'), normalizedFixtures);

  const result: SyncPublicResult = {
    players: normalizedPlayers.length,
    teams: normalizedTeams.length,
    gameweeks: normalizedGameweeks.length,
    fixtures: normalizedFixtures.length,
    elementTypes: normalizedElementTypes.length,
    playerDetails: playerDetails.length,
    eventLiveSnapshots: eventLiveSnapshots.length,
    playerPhotos: availablePlayerPhotos.length,
    complete:
      playerDetails.length === bootstrapData.elements.length &&
      eventLiveSnapshots.length === bootstrapData.events.length,
  };
  const manifest = {
    competition: 'fpl',
    season,
    syncedAt: new Date().toISOString(),
    trigger: options.trigger ?? 'manual',
    mode: 'full-refresh',
    complete: result.complete,
    source: 'https://fantasy.premierleague.com/api',
    counts: {
      players: result.players,
      teams: result.teams,
      gameweeks: result.gameweeks,
      fixtures: result.fixtures,
      elementTypes: result.elementTypes,
      playerDetails: result.playerDetails,
      eventLiveSnapshots: result.eventLiveSnapshots,
      playerPhotos: result.playerPhotos,
    },
    coverage: {
      playerDetails: {
        expected: bootstrapData.elements.length,
        actual: playerDetails.length,
      },
      eventLive: {
        expected: bootstrapData.events.length,
        actual: eventLiveSnapshots.length,
      },
      playerPhotos: {
        expected: bootstrapData.elements.length,
        actual: availablePlayerPhotos.length,
        placeholders: playerPhotoFailures.length,
      },
    },
    failures: {
      playerDetails: playerDetailFailures,
      eventLive: eventLiveFailures,
      playerPhotos: playerPhotoFailures,
    },
  };
  writeJson(path.join(paths.rawDir, 'sync-manifest.json'), manifest);
  writeJson(path.join(projectRoot, 'data', 'competitions', 'fpl', 'manifest.json'), manifest);

  console.log(`FPL sync complete: ${JSON.stringify(result)}`);
  return result;
}
