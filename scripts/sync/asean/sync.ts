import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { collectFixtureSeeds } from './collectors/fixture-collector';
import { collectMatchDetails } from './collectors/match-detail-collector';
import { collectMatchEventsFromDetails } from './collectors/match-event-collector';
import { collectPlayers } from './collectors/player-collector';
import { collectStandings } from './collectors/standing-collector';
import { collectStatistics } from './collectors/statistics-collector';
import { collectTeams } from './collectors/team-collector';
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

function writeJson(filePath: string, payload: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
}

export async function syncAseanTournament(options: SyncAseanOptions): Promise<void> {
  const season = options.season;
  const normalizedDir = path.join(projectRoot, 'data', 'seasons', season, 'normalized');
  ensureDirectory(normalizedDir);

  console.log(`Starting ASEAN sync for season ${season}...`);

  const [{ groups }, { fixtures: fixtureSeeds }, players] = await Promise.all([
    collectStandings(),
    collectFixtureSeeds(),
    collectPlayers(),
  ]);
  const matchDetails = await collectMatchDetails(fixtureSeeds.map((fixture) => fixture.id));

  // Avoid duplicate work if fixture seeds were fetched twice by Promise execution.
  const fixtureSeedIds = fixtureSeeds.map((fixture) => fixture.id);
  const detailsByFixtureId = new Map(matchDetails.map((detail) => [detail.fixtureId, detail]));
  const orderedDetails = fixtureSeedIds
    .map((fixtureId) => detailsByFixtureId.get(fixtureId))
    .filter((detail): detail is NonNullable<typeof detail> => detail !== undefined);

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

  const tournamentPayload = {
    meta: {
      competition: 'ASEAN Cup',
      season: '2026',
      name: 'ASEAN Cup 2026',
      subtitle: 'Official Tournament Center',
      currentStage: 'Group Stage',
      currentMatchday,
      updatedAt: new Date().toISOString(),
    },
    teams,
    groups: groupsPayload,
    fixtures,
    players: allPlayersPayload,
    events,
    knockout: buildKnockoutPayload(),
    statistics: collectStatistics(players, teams),
  };

  const detailsPayload = orderedDetails.map((detail) => ({
    fixtureId: detail.fixtureId,
    detailUrl: detail.detailUrl,
    stage: detail.stage,
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

  const eventsPayload = events;

  writeJson(path.join(normalizedDir, 'asean-cup-2026.json'), tournamentPayload);
  writeJson(path.join(normalizedDir, 'asean-cup-2026.match-details.json'), detailsPayload);
  writeJson(path.join(normalizedDir, 'asean-cup-2026.match-events.json'), eventsPayload);

  console.log(`ASEAN dataset written:`);
  console.log(` - ${path.join(normalizedDir, 'asean-cup-2026.json')}`);
  console.log(` - ${path.join(normalizedDir, 'asean-cup-2026.match-details.json')}`);
  console.log(` - ${path.join(normalizedDir, 'asean-cup-2026.match-events.json')}`);
  console.log(
    `Teams: ${teams.length} | Fixtures: ${fixtures.length} | Players: ${allPlayersPayload.length} | Events: ${events.length}`
  );
}
