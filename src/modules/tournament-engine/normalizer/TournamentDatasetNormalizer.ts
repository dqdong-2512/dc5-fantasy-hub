import type {
  TournamentFixtureRaw,
  TournamentFixtureStatusRaw,
  TournamentGroupRaw,
  TournamentPlayerRaw,
  TournamentRawDataset,
  TournamentStatisticRaw,
  KnockoutTeamRaw,
} from '../models/tournament-engine.models';

export function normalizeTournamentFixtureStatus(status: unknown): TournamentFixtureStatusRaw {
  const normalizedStatus =
    typeof status === 'string'
      ? status
          .trim()
          .replace(/[\s_-]+/g, '')
          .toUpperCase()
      : '';

  if (
    normalizedStatus === 'FT' ||
    normalizedStatus === 'FINISHED' ||
    normalizedStatus === 'COMPLETE' ||
    normalizedStatus === 'COMPLETED' ||
    normalizedStatus === 'PLAYED'
  ) {
    return 'FINISHED';
  }
  if (normalizedStatus === 'LIVE' || normalizedStatus === 'INPLAY') {
    return 'LIVE';
  }
  if (normalizedStatus === 'HALFTIME' || normalizedStatus === 'HT') {
    return 'HALF_TIME';
  }
  if (normalizedStatus === 'POSTPONED') {
    return 'POSTPONED';
  }
  if (normalizedStatus === 'CANCELLED' || normalizedStatus === 'CANCELED') {
    return 'CANCELLED';
  }

  return 'UPCOMING';
}

export function normalizeTournamentFixture(fixture: TournamentFixtureRaw): TournamentFixtureRaw {
  const normalizedFixture: TournamentFixtureRaw = {
    ...fixture,
    status: normalizeTournamentFixtureStatus(fixture.status),
  };
  const hasScore = normalizedFixture.homeScore !== null && normalizedFixture.awayScore !== null;

  if (normalizedFixture.status === 'FINISHED' && !hasScore) {
    return {
      ...normalizedFixture,
      status: 'UPCOMING',
      minute: undefined,
      addedTime: undefined,
    };
  }

  if (
    normalizedFixture.status === 'UPCOMING' ||
    normalizedFixture.status === 'POSTPONED' ||
    normalizedFixture.status === 'CANCELLED'
  ) {
    return {
      ...normalizedFixture,
      homeScore: null,
      awayScore: null,
      minute: undefined,
      addedTime: undefined,
    };
  }

  return normalizedFixture;
}

export class TournamentDatasetNormalizer {
  public normalize(dataset: TournamentRawDataset): TournamentRawDataset {
    const normalizedFixtures = dataset.fixtures.map(normalizeTournamentFixture);
    const hasPlayedMatch = normalizedFixtures.some(
      (fixture) =>
        fixture.status === 'FINISHED' || fixture.status === 'LIVE' || fixture.status === 'HALF_TIME'
    );

    if (hasPlayedMatch) {
      return {
        ...dataset,
        fixtures: normalizedFixtures,
      };
    }

    return {
      ...dataset,
      groups: dataset.groups.map((group) => this.zeroGroupStandings(group)),
      fixtures: normalizedFixtures,
      players: dataset.players.map((player) => this.zeroPlayerStats(player)),
      knockout: this.resetKnockout(dataset.knockout),
      statistics: dataset.statistics.map((stat) => this.resetStatistic(stat)),
      meta: {
        ...dataset.meta,
        currentStage: 'Group Stage',
        currentMatchday: 1,
      },
    };
  }

  private zeroGroupStandings(group: TournamentGroupRaw): TournamentGroupRaw {
    return {
      ...group,
      standings: group.standings.map((row) => ({
        ...row,
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        points: 0,
      })),
    };
  }

  private zeroPlayerStats(player: TournamentPlayerRaw): TournamentPlayerRaw {
    return {
      ...player,
      goals: 0,
      assists: 0,
      minutes: 0,
      yellowCards: 0,
      redCards: 0,
    };
  }

  private resetKnockout(
    knockout: TournamentRawDataset['knockout']
  ): TournamentRawDataset['knockout'] {
    const resetTeam = (team: KnockoutTeamRaw): KnockoutTeamRaw => ({
      ...team,
      teamId: null,
      score: null,
      aggregate: '-',
      status: 'pending',
    });

    return {
      semiFinal1: {
        ...knockout.semiFinal1,
        home: resetTeam(knockout.semiFinal1.home),
        away: resetTeam(knockout.semiFinal1.away),
      },
      semiFinal2: {
        ...knockout.semiFinal2,
        home: resetTeam(knockout.semiFinal2.home),
        away: resetTeam(knockout.semiFinal2.away),
      },
      final: {
        ...knockout.final,
        home: resetTeam(knockout.final.home),
        away: resetTeam(knockout.final.away),
      },
      champion: {
        ...knockout.champion,
        label: 'To Be Decided',
        teamId: null,
        score: null,
        aggregate: '-',
        status: 'champion',
      },
    };
  }

  private resetStatistic(stat: TournamentStatisticRaw): TournamentStatisticRaw {
    return {
      ...stat,
      value: 'TBD',
      subtitle: 'Tournament has not started',
    };
  }
}
