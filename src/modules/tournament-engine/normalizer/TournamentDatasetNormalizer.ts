import type {
  TournamentFixtureRaw,
  TournamentGroupRaw,
  TournamentPlayerRaw,
  TournamentRawDataset,
  TournamentStatisticRaw,
  KnockoutTeamRaw,
} from '../models/tournament-engine.models';

export class TournamentDatasetNormalizer {
  public normalize(dataset: TournamentRawDataset): TournamentRawDataset {
    const normalizedFixtures = dataset.fixtures.map((fixture) => this.sanitizeFixture(fixture));
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

  private sanitizeFixture(fixture: TournamentFixtureRaw): TournamentFixtureRaw {
    const kickoffTime = new Date(fixture.kickoff).getTime();
    const hasValidKickoff = Number.isFinite(kickoffTime);
    const now = Date.now();
    const hasScore = fixture.homeScore !== null && fixture.awayScore !== null;
    const isFutureKickoff = hasValidKickoff && kickoffTime > now;

    if (fixture.status === 'LIVE' || fixture.status === 'HALF_TIME') {
      if (isFutureKickoff) {
        return {
          ...fixture,
          status: 'UPCOMING',
          homeScore: null,
          awayScore: null,
          minute: undefined,
          addedTime: undefined,
          note: fixture.note,
        };
      }
      return fixture;
    }

    if (fixture.status === 'FINISHED' && !hasScore) {
      return {
        ...fixture,
        status: 'UPCOMING',
        minute: undefined,
        addedTime: undefined,
      };
    }

    if (
      fixture.status === 'UPCOMING' ||
      fixture.status === 'POSTPONED' ||
      fixture.status === 'CANCELLED'
    ) {
      return {
        ...fixture,
        homeScore: null,
        awayScore: null,
        minute: undefined,
        addedTime: undefined,
      };
    }

    return fixture;
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
