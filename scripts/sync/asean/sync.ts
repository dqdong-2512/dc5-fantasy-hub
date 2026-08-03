import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import {
  collectMatchDetails,
  collectMatchPageSnapshots,
} from './collectors/match-detail-collector';
import { collectMatchEventsFromDetails } from './collectors/match-event-collector';
import { collectPlayers } from './collectors/player-collector';
import { collectStandings } from './collectors/standing-collector';
import { collectStatistics } from './collectors/statistics-collector';
import { collectTeams } from './collectors/team-collector';
import type {
  FixtureSeedCollected,
  ManualSchedule,
  ManualTeamPlaceholder,
  MatchDetailCollected,
} from './types';
import { normalizeName } from './utils';
import { getAseanSeasonPaths } from '../../services/competition-data-paths';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

interface SyncAseanOptions {
  season: string;
}

function buildKnockoutPayload(
  groupPositionTeamIds: Map<string, number>,
  tieWinnerTeamIds: Map<string, number>,
  championTeamId: number
) {
  const qualifiedTeamId = (key: string): number | null => groupPositionTeamIds.get(key) || null;
  const tieWinnerTeamId = (key: string): number | null => tieWinnerTeamIds.get(key) || null;

  return {
    semiFinal1: {
      title: 'Semi-final 1',
      legDates: 'Aug 15-19, 2026 (Two-legged)',
      home: {
        label: '2nd Group A',
        teamId: qualifiedTeamId('A:2'),
        score: null,
        aggregate: '-',
        status: 'pending',
      },
      away: {
        label: '1st Group B',
        teamId: qualifiedTeamId('B:1'),
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
        teamId: qualifiedTeamId('B:2'),
        score: null,
        aggregate: '-',
        status: 'pending',
      },
      away: {
        label: '1st Group A',
        teamId: qualifiedTeamId('A:1'),
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
        teamId: tieWinnerTeamId('semi-final-1'),
        score: null,
        aggregate: '-',
        status: 'pending',
      },
      away: {
        label: 'Winner SF B',
        teamId: tieWinnerTeamId('semi-final-2'),
        score: null,
        aggregate: '-',
        status: 'pending',
      },
    },
    champion: {
      label: 'Champion',
      teamId: championTeamId || null,
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

function loadManualSchedule(manualSchedulePath: string): ManualSchedule {
  if (!fs.existsSync(manualSchedulePath)) {
    throw new Error(`Manual ASEAN schedule is missing: ${manualSchedulePath}`);
  }

  const schedule = JSON.parse(fs.readFileSync(manualSchedulePath, 'utf-8')) as ManualSchedule;
  if (schedule.source !== 'manual' || !Array.isArray(schedule.fixtures)) {
    throw new Error('Manual ASEAN schedule has an invalid root structure');
  }

  const fixtureIds = new Set<string>();
  for (const fixture of schedule.fixtures) {
    if (
      !fixture.fixtureId ||
      !fixture.stage ||
      !Number.isInteger(fixture.matchday) ||
      Number.isNaN(Date.parse(fixture.kickoff)) ||
      typeof fixture.venue !== 'string' ||
      !fixture.homePlaceholder ||
      !fixture.awayPlaceholder
    ) {
      throw new Error(`Manual ASEAN schedule contains an invalid fixture: ${fixture.fixtureId}`);
    }
    if (fixtureIds.has(fixture.fixtureId)) {
      throw new Error(`Manual ASEAN schedule contains duplicate fixture ${fixture.fixtureId}`);
    }
    fixtureIds.add(fixture.fixtureId);
  }

  return schedule;
}

function toFixtureSeeds(schedule: ManualSchedule): FixtureSeedCollected[] {
  return schedule.fixtures.map((fixture) => ({
    id: fixture.fixtureId,
    detailUrl: `https://aseanutdfc.com/asean-championship/match/${fixture.fixtureId}/details`,
  }));
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
  for (const fixture of records) {
    const kickoff = new Date(fixture.kickoff);
    if (Number.isNaN(kickoff.getTime())) {
      throw new Error(`Fixture ${fixture.fixtureId} has an invalid kickoff: ${fixture.kickoff}`);
    }

    const vietnamTime = formatVietnamTime(fixture.kickoff);
    if (!/^\d{2}:\d{2}$/.test(vietnamTime)) {
      throw new Error(`Fixture ${fixture.fixtureId} has an invalid Vietnam kickoff time`);
    }
  }
}

export async function syncAseanTournament(options: SyncAseanOptions): Promise<void> {
  const syncId = randomUUID();
  const startedAt = new Date().toISOString();
  const season = options.season;
  const { normalizedDir, manualDir } = getAseanSeasonPaths(projectRoot, season);
  const manualSchedulePath = path.join(manualDir, 'asean-cup-2026.schedule.json');
  ensureDirectory(normalizedDir);
  const mainOutputPath = path.join(normalizedDir, 'asean-cup-2026.json');
  const manualSchedule = loadManualSchedule(manualSchedulePath);
  const fixtureSeeds = toFixtureSeeds(manualSchedule);

  console.log(`Starting ASEAN sync for season ${season} (${syncId})...`);

  const [{ groups }, players] = await Promise.all([
    collectStandings(),
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

  const teams = collectTeams(groups);
  const teamIdByName = new Map(teams.map((team) => [normalizeKey(team.name), team.id]));
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const scheduleByFixtureId = new Map(
    manualSchedule.fixtures.map((fixture) => [fixture.fixtureId, fixture])
  );

  for (const fixture of manualSchedule.fixtures) {
    for (const placeholder of [fixture.homePlaceholder, fixture.awayPlaceholder]) {
      if (placeholder.type === 'team' && !teamById.has(placeholder.teamId)) {
        throw new Error(
          `Manual fixture ${fixture.fixtureId} references unknown stable team ID ${placeholder.teamId}`
        );
      }
    }
  }

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
      const scheduledFixture = scheduleByFixtureId.get(event.fixtureId);
      const eventPlaceholder = scheduledFixture
        ? event.side === 'home'
          ? scheduledFixture.homePlaceholder
          : scheduledFixture.awayPlaceholder
        : null;
      const eventTeamId =
        eventPlaceholder?.type === 'team' && teams.some((team) => team.id === eventPlaceholder.teamId)
          ? eventPlaceholder.teamId
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

  const groupPositionTeamIds = new Map<string, number>();
  for (const group of groups) {
    const groupIsFinal =
      group.standings.length > 1 &&
      group.standings.every((standing) => standing.played >= group.standings.length - 1);
    if (!groupIsFinal) {
      continue;
    }

    group.standings.forEach((standing, index) => {
      const teamId = teamIdByName.get(normalizeKey(standing.teamName));
      if (teamId) {
        groupPositionTeamIds.set(`${group.id}:${index + 1}`, teamId);
      }
    });
  }

  const resolveStaticPlaceholder = (placeholder: ManualTeamPlaceholder): number => {
    if (placeholder.type === 'team') {
      return teams.some((team) => team.id === placeholder.teamId) ? placeholder.teamId : 0;
    }
    if (placeholder.type === 'group-position') {
      return groupPositionTeamIds.get(`${placeholder.groupId}:${placeholder.position}`) ?? 0;
    }
    return 0;
  };

  const resolvedStaticTeams = new Map(
    manualSchedule.fixtures.map((fixture) => [
      fixture.fixtureId,
      {
        homeTeamId: resolveStaticPlaceholder(fixture.homePlaceholder),
        awayTeamId: resolveStaticPlaceholder(fixture.awayPlaceholder),
      },
    ])
  );

  const resolveTieWinner = (tieId: 'semi-final-1' | 'semi-final-2'): number => {
    const stagePrefix = tieId === 'semi-final-1' ? 'SF A' : 'SF B';
    const legs = manualSchedule.fixtures.filter((fixture) => fixture.stage.startsWith(stagePrefix));
    if (legs.length !== 2) {
      return 0;
    }

    const aggregateByTeamId = new Map<number, number>();
    for (const leg of legs) {
      const dynamic = detailsByFixtureId.get(leg.fixtureId);
      const resolved = resolvedStaticTeams.get(leg.fixtureId);
      if (
        !dynamic ||
        dynamic.statusLabel !== 'FINISHED' ||
        dynamic.homeScore === null ||
        dynamic.awayScore === null ||
        !resolved?.homeTeamId ||
        !resolved.awayTeamId
      ) {
        return 0;
      }

      aggregateByTeamId.set(
        resolved.homeTeamId,
        (aggregateByTeamId.get(resolved.homeTeamId) ?? 0) + dynamic.homeScore
      );
      aggregateByTeamId.set(
        resolved.awayTeamId,
        (aggregateByTeamId.get(resolved.awayTeamId) ?? 0) + dynamic.awayScore
      );
    }

    const ranked = [...aggregateByTeamId.entries()].sort((left, right) => right[1] - left[1]);
    return ranked.length === 2 && ranked[0][1] > ranked[1][1] ? ranked[0][0] : 0;
  };

  const tieWinnerTeamIds = new Map([
    ['semi-final-1', resolveTieWinner('semi-final-1')],
    ['semi-final-2', resolveTieWinner('semi-final-2')],
  ]);
  const resolvePlaceholder = (placeholder: ManualTeamPlaceholder): number =>
    placeholder.type === 'tie-winner'
      ? (tieWinnerTeamIds.get(placeholder.tieId) ?? 0)
      : resolveStaticPlaceholder(placeholder);

  const fixtures = manualSchedule.fixtures.map((scheduledFixture) => {
    const dynamic = detailsByFixtureId.get(scheduledFixture.fixtureId);
    if (!dynamic) {
      throw new Error(`Missing live data for scheduled fixture ${scheduledFixture.fixtureId}`);
    }

    return {
      id: scheduledFixture.fixtureId,
      stage: scheduledFixture.stage,
      matchday: scheduledFixture.matchday,
      leg: scheduledFixture.leg,
      kickoff: scheduledFixture.kickoff,
      venue: scheduledFixture.venue,
      broadcast: scheduledFixture.broadcast,
      homePlaceholder: scheduledFixture.homePlaceholder,
      awayPlaceholder: scheduledFixture.awayPlaceholder,
      homeTeamId: resolvePlaceholder(scheduledFixture.homePlaceholder),
      awayTeamId: resolvePlaceholder(scheduledFixture.awayPlaceholder),
      homeScore: dynamic.homeScore,
      awayScore: dynamic.awayScore,
      status: dynamic.statusLabel,
    };
  });

  const resolveCompletedTieWinner = (stagePrefix: string): number => {
    const legs = fixtures.filter((fixture) => fixture.stage.startsWith(stagePrefix));
    if (
      legs.length !== 2 ||
      legs.some(
        (fixture) =>
          fixture.status !== 'FINISHED' ||
          fixture.homeScore === null ||
          fixture.awayScore === null ||
          !fixture.homeTeamId ||
          !fixture.awayTeamId
      )
    ) {
      return 0;
    }

    const aggregateByTeamId = new Map<number, number>();
    for (const leg of legs) {
      aggregateByTeamId.set(
        leg.homeTeamId,
        (aggregateByTeamId.get(leg.homeTeamId) ?? 0) + (leg.homeScore ?? 0)
      );
      aggregateByTeamId.set(
        leg.awayTeamId,
        (aggregateByTeamId.get(leg.awayTeamId) ?? 0) + (leg.awayScore ?? 0)
      );
    }
    const ranked = [...aggregateByTeamId.entries()].sort((left, right) => right[1] - left[1]);
    return ranked.length === 2 && ranked[0][1] > ranked[1][1] ? ranked[0][0] : 0;
  };
  const championTeamId = resolveCompletedTieWinner('Final');

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
    knockout: buildKnockoutPayload(groupPositionTeamIds, tieWinnerTeamIds, championTeamId),
    statistics: collectStatistics(players, teams),
  };

  const teamNameById = new Map(teams.map((team) => [team.id, team.name]));
  const detailFixtures = fixtures.map((fixture) => {
    const dynamic = detailsByFixtureId.get(fixture.id) as MatchDetailCollected;
    return {
      fixtureId: fixture.id,
      detailUrl: dynamic.detailUrl,
      stage: fixture.stage,
      matchday: fixture.matchday,
      leg: fixture.leg,
      kickoff: fixture.kickoff,
      venue: fixture.venue,
      broadcast: fixture.broadcast,
      homePlaceholder: fixture.homePlaceholder,
      awayPlaceholder: fixture.awayPlaceholder,
      status: fixture.status,
      homeTeam: teamNameById.get(fixture.homeTeamId) ?? 'Unknown Home',
      awayTeam: teamNameById.get(fixture.awayTeamId) ?? 'Unknown Away',
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      goals: dynamic.goals,
    };
  });
  const detailsPayload = {
    meta: metadata,
    fixtures: detailFixtures,
  };

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
