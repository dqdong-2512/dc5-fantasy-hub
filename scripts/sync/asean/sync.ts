import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { collectFixtureSeeds } from './collectors/fixture-collector';
import {
  collectMatchDetails,
  collectMatchPageSnapshots,
} from './collectors/match-detail-collector';
import { collectMatchEventsFromDetails } from './collectors/match-event-collector';
import { collectPlayers } from './collectors/player-collector';
import { collectStandings } from './collectors/standing-collector';
import { collectStatistics } from './collectors/statistics-collector';
import { collectTeams } from './collectors/team-collector';
import type { FixtureSeedCollected } from './types';
import { normalizeName, toUtcIsoFromIct } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

interface SyncAseanOptions {
  season: string;
}

function buildKnockoutPayload(): {
  semiFinal1: {
    title: string;
    legDates: string;
    home: { label: string; teamId: null; score: null; aggregate: string; status: 'pending' };
    away: { label: string; teamId: null; score: null; aggregate: string; status: 'pending' };
  };
  semiFinal2: {
    title: string;
    legDates: string;
    home: { label: string; teamId: null; score: null; aggregate: string; status: 'pending' };
    away: { label: string; teamId: null; score: null; aggregate: string; status: 'pending' };
  };
  final: {
    title: string;
    legDates: string;
    home: { label: string; teamId: null; score: null; aggregate: string; status: 'pending' };
    away: { label: string; teamId: null; score: null; aggregate: string; status: 'pending' };
  };
  champion: { label: string; teamId: null; score: null; aggregate: string; status: 'champion' };
} {
  return {
    semiFinal1: {
      title: 'Semi-final 1',
      legDates: 'Aug 15-19, 2026 (Two-legged)',
      home: {
        label: '2nd Group A',
        teamId: null,
        score: null,
        aggregate: '-',
        status: 'pending',
      },
      away: {
        label: '1st Group B',
        teamId: null,
        score: null,
        aggregate: '-',
        status: 'pending',
      },
    },
    semiFinal2: {
      title: 'Semi-final 2',
      legDates: 'Aug 16-19, 2026 (Two-legged)',
      home: {
        label: '2nd Group B',
        teamId: null,
        score: null,
        aggregate: '-',
        status: 'pending',
      },
      away: {
        label: '1st Group A',
        teamId: null,
        score: null,
        aggregate: '-',
        status: 'pending',
      },
    },
    final: {
      title: 'Final',
      legDates: 'Aug 22-26, 2026 (Two-legged)',
      home: {
        label: 'Winner SF A',
        teamId: null,
        score: null,
        aggregate: '-',
        status: 'pending',
      },
      away: {
        label: 'Winner SF B',
        teamId: null,
        score: null,
        aggregate: '-',
        status: 'pending',
      },
    },
    champion: {
      label: 'To Be Decided',
      teamId: null,
      score: null,
      aggregate: '-',
      status: 'champion',
    },
  };
}

function normalizeKey(value: string): string {
  return normalizeName(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function loadLastKnownFixtureSeeds(mainOutputPath: string): FixtureSeedCollected[] {
  if (!fs.existsSync(mainOutputPath)) {
    return [];
  }

  try {
    const payload = JSON.parse(fs.readFileSync(mainOutputPath, 'utf-8')) as {
      fixtures?: Array<{ id?: unknown }>;
    };
    if (!Array.isArray(payload.fixtures)) {
      return [];
    }

    return payload.fixtures
      .filter(
        (fixture): fixture is { id: string } =>
          typeof fixture.id === 'string' && fixture.id.length > 0
      )
      .map((fixture) => ({
        id: fixture.id,
        detailUrl: `https://aseanutdfc.com/asean-championship/match/${fixture.id}/details`,
      }));
  } catch {
    return [];
  }
}

interface SyncMetadata {
  syncId: string;
  startedAt: string;
  collectedAt: string;
  completedAt: string;
  updatedAt: string;
  source: 'aseanutdfc.com';
}

interface FixtureConsistencyRecord {
  fixtureId: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
}

interface AtomicJsonOutput {
  finalPath: string;
  payload: unknown;
}

function removeFileIfExists(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function writeJsonSnapshotAtomically(outputs: AtomicJsonOutput[], syncId: string): void {
  const transaction = outputs.map((output) => ({
    ...output,
    temporaryPath: `${output.finalPath}.tmp-${syncId}`,
    backupPath: `${output.finalPath}.backup-${syncId}`,
  }));
  const promotedFinalPaths = new Set<string>();

  try {
    for (const output of transaction) {
      fs.writeFileSync(output.temporaryPath, JSON.stringify(output.payload, null, 2), 'utf-8');
    }

    for (const output of transaction) {
      if (fs.existsSync(output.finalPath)) {
        fs.renameSync(output.finalPath, output.backupPath);
      }
    }

    for (const output of transaction) {
      fs.renameSync(output.temporaryPath, output.finalPath);
      promotedFinalPaths.add(output.finalPath);
    }
  } catch (error) {
    for (const finalPath of promotedFinalPaths) {
      removeFileIfExists(finalPath);
    }

    for (const output of transaction) {
      if (fs.existsSync(output.backupPath)) {
        removeFileIfExists(output.finalPath);
        fs.renameSync(output.backupPath, output.finalPath);
      }
      removeFileIfExists(output.temporaryPath);
    }

    throw error;
  }

  for (const output of transaction) {
    try {
      removeFileIfExists(output.backupPath);
    } catch (error) {
      console.warn(`Unable to remove synchronization backup ${output.backupPath}:`, error);
    }
  }
}

function assertSameValue(
  fixtureId: string,
  field: keyof FixtureConsistencyRecord,
  expected: unknown,
  actual: unknown
): void {
  if (!Object.is(expected, actual)) {
    throw new Error(
      `Fixture ${fixtureId} has conflicting ${field}: ${String(expected)} !== ${String(actual)}`
    );
  }
}

function validateFixtureRecords(
  mainRecords: FixtureConsistencyRecord[],
  comparedRecords: FixtureConsistencyRecord[],
  sourceName: string
): void {
  const mainByFixtureId = new Map(mainRecords.map((fixture) => [fixture.fixtureId, fixture]));

  for (const compared of comparedRecords) {
    const main = mainByFixtureId.get(compared.fixtureId);
    if (!main) {
      throw new Error(`${sourceName} references unknown fixture ${compared.fixtureId}`);
    }

    assertSameValue(compared.fixtureId, 'kickoff', main.kickoff, compared.kickoff);
    assertSameValue(compared.fixtureId, 'homeTeam', main.homeTeam, compared.homeTeam);
    assertSameValue(compared.fixtureId, 'awayTeam', main.awayTeam, compared.awayTeam);
    assertSameValue(compared.fixtureId, 'status', main.status, compared.status);
    assertSameValue(compared.fixtureId, 'homeScore', main.homeScore, compared.homeScore);
    assertSameValue(compared.fixtureId, 'awayScore', main.awayScore, compared.awayScore);
  }
}

function validateSnapshotMetadata(metadata: SyncMetadata[]): void {
  const [first, ...rest] = metadata;
  if (!first) {
    throw new Error('ASEAN snapshot metadata is missing');
  }

  for (const current of rest) {
    if (current.syncId !== first.syncId || current.collectedAt !== first.collectedAt) {
      throw new Error('ASEAN output metadata does not belong to the same synchronization snapshot');
    }
  }
}

function formatVietnamTime(kickoff: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(kickoff));
}

function verifyCurrentKickoffCases(records: FixtureConsistencyRecord[]): void {
  const byFixtureId = new Map(records.map((fixture) => [fixture.fixtureId, fixture]));
  const exactCases = [
    {
      fixtureId: '9kaz0vc8bs0voywdru0pvqcr8',
      teams: ['Malaysia', 'Laos'],
      kickoff: '2026-07-28T13:00:00.000Z',
      vietnamTime: '20:00',
    },
    {
      fixtureId: '9knzp49imdbgo0bd8ajlo3kes',
      teams: ['Philippines', 'Myanmar'],
      kickoff: '2026-07-28T10:00:00.000Z',
      vietnamTime: '17:00',
    },
  ];

  for (const expected of exactCases) {
    const fixture = byFixtureId.get(expected.fixtureId);
    if (!fixture) {
      const expectedTeams = expected.teams.map(normalizeKey).sort();
      const matchingTeams = records.find((candidate) =>
        [normalizeKey(candidate.homeTeam), normalizeKey(candidate.awayTeam)]
          .sort()
          .every((team, index) => team === expectedTeams[index])
      );
      throw new Error(
        `Verification fixture ${expected.fixtureId} is missing from ${records.length} collected fixtures` +
          (matchingTeams
            ? `; ${expected.teams.join(' vs ')} was collected as ${matchingTeams.fixtureId} at ${matchingTeams.kickoff}`
            : `; ${expected.teams.join(' vs ')} was not collected`)
      );
    }
    assertSameValue(expected.fixtureId, 'kickoff', expected.kickoff, fixture.kickoff);
    if (formatVietnamTime(fixture.kickoff) !== expected.vietnamTime) {
      throw new Error(`Fixture ${expected.fixtureId} has an unexpected Vietnam kickoff time`);
    }
  }

  const teamTimeCases = [
    { teams: ['Vietnam', 'Singapore'], vietnamTime: '20:00' },
    { teams: ['Timor-Leste', 'Indonesia'], vietnamTime: '17:00' },
  ];

  for (const expected of teamTimeCases) {
    const expectedTeams = expected.teams.map(normalizeKey).sort();
    const fixture = records.find((candidate) =>
      [normalizeKey(candidate.homeTeam), normalizeKey(candidate.awayTeam)]
        .sort()
        .every((team, index) => team === expectedTeams[index])
    );
    if (!fixture) {
      throw new Error(`Verification fixture ${expected.teams.join(' vs ')} is missing`);
    }
    if (formatVietnamTime(fixture.kickoff) !== expected.vietnamTime) {
      throw new Error(`${expected.teams.join(' vs ')} has an unexpected Vietnam kickoff time`);
    }
  }
}

export async function syncAseanTournament(options: SyncAseanOptions): Promise<void> {
  const syncId = randomUUID();
  const startedAt = new Date().toISOString();
  const season = options.season;
  const normalizedDir = path.join(projectRoot, 'data', 'seasons', season, 'normalized');
  ensureDirectory(normalizedDir);
  const mainOutputPath = path.join(normalizedDir, 'asean-cup-2026.json');
  const lastKnownFixtureSeeds = loadLastKnownFixtureSeeds(mainOutputPath);

  console.log(`Starting ASEAN sync for season ${season} (${syncId})...`);

  const fixtureSeedsPromise =
    lastKnownFixtureSeeds.length > 0
      ? Promise.resolve({ fixtures: lastKnownFixtureSeeds })
      : collectFixtureSeeds();
  const [{ groups }, { fixtures: fixtureSeeds }, players] = await Promise.all([
    collectStandings(),
    fixtureSeedsPromise,
    collectPlayers(),
  ]);
  const matchPageSnapshots = await collectMatchPageSnapshots(fixtureSeeds);
  const matchDetails = collectMatchDetails(fixtureSeeds, matchPageSnapshots);
  const collectedAt = new Date().toISOString();

  const fixtureSeedIds = fixtureSeeds.map((fixture) => fixture.id);
  const detailsByFixtureId = new Map(matchDetails.map((detail) => [detail.fixtureId, detail]));
  const orderedDetails = fixtureSeedIds
    .map((fixtureId) => detailsByFixtureId.get(fixtureId))
    .filter((detail): detail is NonNullable<typeof detail> => detail !== undefined);
  if (orderedDetails.length !== fixtureSeeds.length) {
    throw new Error(
      `Collected ${orderedDetails.length} match details for ${fixtureSeeds.length} fixture seeds`
    );
  }

  const teams = collectTeams(groups, orderedDetails);
  const teamIdByName = new Map(teams.map((team) => [normalizeKey(team.name), team.id]));

  const rawEvents = collectMatchEventsFromDetails(orderedDetails);

  const mappedPlayers = players.map((player) => ({
    ...player,
    nationTeamId: teamIdByName.get(normalizeKey(player.nationTeamName)) ?? 1,
  }));

  const supplementalPlayers: typeof mappedPlayers = [];
  const supplementalPlayersById = new Map<number, (typeof mappedPlayers)[number]>();
  const supplementalPlayerFixtures = new Map<number, Set<string>>();
  let nextPlayerId = mappedPlayers.reduce((maxId, player) => Math.max(maxId, player.id), 0) + 1;

  const playerIdByNameAndTeam = new Map(
    mappedPlayers.map((player) => [
      `${normalizeKey(player.name)}|${player.nationTeamId}`,
      player.id,
    ])
  );
  const playerIdByName = new Map(
    mappedPlayers.map((player) => [normalizeKey(player.name), player.id])
  );

  const events = rawEvents
    .map((event) => {
      const normalizedName = normalizeKey(event.playerName);
      const detail = detailsByFixtureId.get(event.fixtureId);
      const eventTeamName = detail
        ? event.side === 'home'
          ? detail.homeTeamName
          : detail.awayTeamName
        : null;
      const eventTeamId = eventTeamName
        ? (teamIdByName.get(normalizeKey(eventTeamName)) ?? 1)
        : null;

      let playerId: number | undefined;
      if (eventTeamId !== null) {
        playerId = playerIdByNameAndTeam.get(`${normalizedName}|${eventTeamId}`);
      }

      if (!playerId) {
        playerId = playerIdByName.get(normalizedName);
      }

      if (!playerId && eventTeamId !== null) {
        playerId = nextPlayerId;
        nextPlayerId += 1;

        const syntheticPlayer = {
          id: playerId,
          slug: `synthetic-player-${playerId}`,
          name: event.playerName,
          nationTeamId: eventTeamId,
          position: 'MID' as const,
          age: null,
          appearances: 1,
          goals: 0,
          assists: 0,
          minutes: 0,
          yellowCards: 0,
          redCards: 0,
        };

        supplementalPlayers.push(syntheticPlayer);
        supplementalPlayersById.set(playerId, syntheticPlayer);
        supplementalPlayerFixtures.set(playerId, new Set<string>());

        playerIdByNameAndTeam.set(`${normalizedName}|${eventTeamId}`, playerId);
        if (!playerIdByName.has(normalizedName)) {
          playerIdByName.set(normalizedName, playerId);
        }
      }

      if (!playerId) {
        return null;
      }

      const supplementalPlayer = supplementalPlayersById.get(playerId);
      if (supplementalPlayer) {
        supplementalPlayer.goals += 1;
        supplementalPlayer.minutes = Math.max(supplementalPlayer.minutes, event.minute);

        const fixturesSet = supplementalPlayerFixtures.get(playerId);
        if (fixturesSet) {
          fixturesSet.add(event.fixtureId);
          supplementalPlayer.appearances = fixturesSet.size;
        }
      }

      return {
        id: event.id,
        fixtureId: event.fixtureId,
        playerId,
        type: event.type,
        minute: event.minute,
        addedTime: event.addedTime,
        note: event.note,
      };
    })
    .filter((event): event is NonNullable<typeof event> => event !== null);

  const fixtures = orderedDetails.map((detail) => ({
    id: detail.fixtureId,
    stage: detail.stage,
    kickoff: toUtcIsoFromIct(detail.dateLabel, detail.localTimeLabel),
    venue: detail.venue,
    homeTeamId: teamIdByName.get(normalizeKey(detail.homeTeamName)) ?? 0,
    awayTeamId: teamIdByName.get(normalizeKey(detail.awayTeamName)) ?? 0,
    homeScore: detail.homeScore,
    awayScore: detail.awayScore,
    status: detail.statusLabel,
  }));

  const groupsPayload = groups.map((group) => ({
    id: group.id,
    name: group.name,
    standings: group.standings.map((standing) => ({
      teamId: teamIdByName.get(normalizeKey(standing.teamName)) ?? 0,
      played: standing.played,
      won: standing.won,
      draw: standing.draw,
      lost: standing.lost,
      gf: standing.gf,
      ga: standing.ga,
      points: standing.points,
    })),
  }));

  const playersPayload = mappedPlayers.map((player) => ({
    id: player.id,
    name: player.name,
    nationTeamId: player.nationTeamId,
    club: 'Not Available',
    position: player.position,
    age: player.age,
    appearances: player.appearances,
    goals: player.goals,
    assists: player.assists,
    minutes: player.minutes,
    yellowCards: player.yellowCards,
    redCards: player.redCards,
  }));

  const supplementalPlayersPayload = supplementalPlayers.map((player) => ({
    id: player.id,
    name: player.name,
    nationTeamId: player.nationTeamId,
    club: 'Not Available',
    position: player.position,
    age: player.age,
    appearances: player.appearances,
    goals: player.goals,
    assists: player.assists,
    minutes: player.minutes,
    yellowCards: player.yellowCards,
    redCards: player.redCards,
  }));

  const allPlayersPayload = [...playersPayload, ...supplementalPlayersPayload];

  const completedFixtures = fixtures.filter((fixture) => fixture.status === 'FINISHED').length;
  const currentMatchday = Math.max(1, completedFixtures);
  const completedAt = new Date().toISOString();
  const metadata: SyncMetadata = {
    syncId,
    startedAt,
    collectedAt,
    completedAt,
    updatedAt: completedAt,
    source: 'aseanutdfc.com',
  };

  const tournamentPayload = {
    meta: {
      ...metadata,
      competition: 'ASEAN Cup',
      season: '2026',
      name: 'ASEAN Cup 2026',
      subtitle: 'Official Tournament Center',
      currentStage: 'Group Stage',
      currentMatchday,
    },
    teams,
    groups: groupsPayload,
    fixtures,
    players: allPlayersPayload,
    events,
    knockout: buildKnockoutPayload(),
    statistics: collectStatistics(players, teams),
  };

  const detailFixtures = orderedDetails.map((detail) => ({
    fixtureId: detail.fixtureId,
    detailUrl: detail.detailUrl,
    stage: detail.stage,
    kickoff: toUtcIsoFromIct(detail.dateLabel, detail.localTimeLabel),
    dateLabel: detail.dateLabel,
    localTimeLabel: detail.localTimeLabel,
    venue: detail.venue,
    status: detail.statusLabel,
    homeTeam: detail.homeTeamName,
    awayTeam: detail.awayTeamName,
    homeScore: detail.homeScore,
    awayScore: detail.awayScore,
    goals: detail.goals,
  }));
  const detailsPayload = {
    meta: metadata,
    fixtures: detailFixtures,
  };

  const teamNameById = new Map(teams.map((team) => [team.id, team.name]));
  const mainConsistencyRecords: FixtureConsistencyRecord[] = fixtures.map((fixture) => ({
    fixtureId: fixture.id,
    kickoff: fixture.kickoff,
    homeTeam: teamNameById.get(fixture.homeTeamId) ?? 'Unknown Home',
    awayTeam: teamNameById.get(fixture.awayTeamId) ?? 'Unknown Away',
    status: fixture.status,
    homeScore: fixture.homeScore,
    awayScore: fixture.awayScore,
  }));
  const detailConsistencyRecords: FixtureConsistencyRecord[] = detailFixtures.map((fixture) => ({
    fixtureId: fixture.fixtureId,
    kickoff: fixture.kickoff,
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    status: fixture.status,
    homeScore: fixture.homeScore,
    awayScore: fixture.awayScore,
  }));
  const eventFixtureSnapshots = detailConsistencyRecords.map((fixture) => ({ ...fixture }));
  const eventsPayload = {
    meta: metadata,
    fixtures: eventFixtureSnapshots,
    events,
  };

  validateSnapshotMetadata([tournamentPayload.meta, detailsPayload.meta, eventsPayload.meta]);
  validateFixtureRecords(mainConsistencyRecords, detailConsistencyRecords, 'match details');
  validateFixtureRecords(mainConsistencyRecords, eventFixtureSnapshots, 'match events');

  const fixtureIds = new Set(mainConsistencyRecords.map((fixture) => fixture.fixtureId));
  for (const event of events) {
    if (!fixtureIds.has(event.fixtureId)) {
      throw new Error(`Match event ${event.id} references unknown fixture ${event.fixtureId}`);
    }
  }
  verifyCurrentKickoffCases(mainConsistencyRecords);

  writeJsonSnapshotAtomically(
    [
      {
        finalPath: mainOutputPath,
        payload: tournamentPayload,
      },
      {
        finalPath: path.join(normalizedDir, 'asean-cup-2026.match-details.json'),
        payload: detailsPayload,
      },
      {
        finalPath: path.join(normalizedDir, 'asean-cup-2026.match-events.json'),
        payload: eventsPayload,
      },
    ],
    syncId
  );

  console.log('');
  console.log('ASEAN Cup synchronization completed');
  console.log('');
  console.log(`Sync ID: ${syncId}`);
  console.log(`Started: ${startedAt}`);
  console.log(`Completed: ${completedAt}`);
  console.log(`Fixtures: ${fixtures.length}`);
  console.log(`Match details: ${detailFixtures.length}`);
  console.log(`Match events: ${events.length}`);
  console.log('Warnings: 0');
  console.log('');
  console.log('All output files written from the same snapshot.');
}
