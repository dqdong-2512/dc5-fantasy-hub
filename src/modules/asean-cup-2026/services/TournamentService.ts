import type {
  KnockoutMatch,
  KnockoutMatchRaw,
  KnockoutTeam,
  KnockoutTeamRaw,
  TournamentCenterData,
  TournamentFixture,
  TournamentFixtureRaw,
  TournamentFixtureStatus,
  TournamentFixtureStatusRaw,
  TournamentGroup,
  TournamentGroupRaw,
  TournamentGroupStanding,
  TournamentHero,
  TournamentHighlight,
  TournamentRawDataset,
  TournamentStatistic,
  TournamentTeam,
} from '../models/tournament.models';
import { TournamentRepository } from '../repositories/TournamentRepository';

interface RepositoryPayload {
  data: TournamentRawDataset;
  syncedAt: string;
}

export class TournamentService {
  private readonly repository: TournamentRepository;

  constructor(repository?: TournamentRepository) {
    this.repository = repository ?? new TournamentRepository();
  }

  public async getTournamentCenterData(forceRefresh = false): Promise<TournamentCenterData> {
    const payload = await this.repository.getSnapshot(forceRefresh);
    const teamMap = this.createTeamMap(payload.data.teams);

    const fixtures = payload.data.fixtures.map((fixture) => this.toFixture(fixture, teamMap));
    const groups = payload.data.groups.map((group) => this.toGroup(group, teamMap));
    const players = payload.data.players.map((player) => ({
      id: player.id,
      name: player.name,
      nation: teamMap.get(player.nationTeamId) ?? this.createUnknownTeam(player.nationTeamId),
      club: player.club,
      position: player.position,
      goals: player.goals,
      assists: player.assists,
      minutes: player.minutes,
      yellowCards: player.yellowCards,
      redCards: player.redCards,
    }));

    const sortedFixtures = [...fixtures].sort(
      (left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime()
    );

    const today = new Date();
    const fixturesToday = sortedFixtures.filter((fixture) =>
      this.isSameDay(new Date(fixture.kickoff), today)
    );
    const upcomingFixtures = sortedFixtures.filter(
      (fixture) =>
        fixture.status === 'upcoming' ||
        fixture.status === 'postponed' ||
        fixture.status === 'cancelled'
    );
    const completedFixtures = sortedFixtures
      .filter((fixture) => fixture.status === 'finished')
      .sort((left, right) => new Date(right.kickoff).getTime() - new Date(left.kickoff).getTime());

    const hero = this.buildHero(payload, sortedFixtures, completedFixtures, upcomingFixtures);

    return {
      hero,
      groups,
      fixtures: {
        today: fixturesToday,
        upcoming: upcomingFixtures,
        completed: completedFixtures,
      },
      players,
      knockout: {
        semiFinal1: this.toKnockoutMatch(payload.data.knockout.semiFinal1, teamMap),
        semiFinal2: this.toKnockoutMatch(payload.data.knockout.semiFinal2, teamMap),
        final: this.toKnockoutMatch(payload.data.knockout.final, teamMap),
        champion: this.toKnockoutTeam(payload.data.knockout.champion, teamMap),
      },
      statistics: payload.data.statistics.map((stat): TournamentStatistic => ({
        id: stat.id,
        title: stat.title,
        value: stat.value,
        subtitle: stat.subtitle,
      })),
    };
  }

  public invalidate(): void {
    this.repository.invalidate();
  }

  private buildHero(
    payload: RepositoryPayload,
    fixtures: TournamentFixture[],
    completedFixtures: TournamentFixture[],
    upcomingFixtures: TournamentFixture[]
  ): TournamentHero {
    const liveFixture = fixtures.find(
      (fixture) => fixture.status === 'live' || fixture.status === 'half-time'
    );
    const latestResult = completedFixtures[0];
    const nextFixture = upcomingFixtures[0];

    const highlight = this.resolveHighlight(liveFixture, latestResult, nextFixture);

    return {
      tournamentName: payload.data.meta.name,
      subtitle: payload.data.meta.subtitle,
      currentStage: payload.data.meta.currentStage,
      currentMatchday: payload.data.meta.currentMatchday,
      matchesCompleted: completedFixtures.length,
      matchesRemaining: fixtures.length - completedFixtures.length,
      nextFixture: nextFixture
        ? `${nextFixture.homeTeam.name} vs ${nextFixture.awayTeam.name}`
        : 'To be announced',
      latestResult: latestResult
        ? `${latestResult.homeTeam.name} ${this.formatScore(latestResult.homeScore, latestResult.awayScore)} ${latestResult.awayTeam.name}`
        : 'No finished fixture yet',
      highlight,
      lastUpdated: payload.syncedAt,
    };
  }

  private resolveHighlight(
    liveFixture: TournamentFixture | undefined,
    latestResult: TournamentFixture | undefined,
    nextFixture: TournamentFixture | undefined
  ): TournamentHighlight {
    if (liveFixture) {
      return {
        state: 'live',
        label: liveFixture.status === 'half-time' ? 'Half Time' : 'Live',
        fixtureText: `${liveFixture.homeTeam.name} vs ${liveFixture.awayTeam.name}`,
        minuteText: this.getMinuteText(liveFixture),
      };
    }

    if (latestResult) {
      return {
        state: 'finished',
        label: 'Finished',
        fixtureText: `${latestResult.homeTeam.name} ${this.formatScore(latestResult.homeScore, latestResult.awayScore)} ${latestResult.awayTeam.name}`,
        minuteText: null,
      };
    }

    if (nextFixture) {
      return {
        state: 'upcoming',
        label: 'Upcoming',
        fixtureText: `${nextFixture.homeTeam.name} vs ${nextFixture.awayTeam.name}`,
        minuteText: this.formatKickoff(nextFixture.kickoff),
      };
    }

    return {
      state: 'none',
      label: 'No fixture',
      fixtureText: 'Schedule unavailable',
      minuteText: null,
    };
  }

  private toGroup(
    group: TournamentGroupRaw,
    teamMap: Map<number, TournamentTeam>
  ): TournamentGroup {
    const standings: TournamentGroupStanding[] = [...group.standings]
      .sort((left, right) => {
        if (right.points !== left.points) {
          return right.points - left.points;
        }

        const rightGd = right.gf - right.ga;
        const leftGd = left.gf - left.ga;
        if (rightGd !== leftGd) {
          return rightGd - leftGd;
        }

        return right.gf - left.gf;
      })
      .map((row, index) => {
        const team = teamMap.get(row.teamId) ?? this.createUnknownTeam(row.teamId);
        const gd = row.gf - row.ga;

        return {
          position: index + 1,
          team,
          played: row.played,
          won: row.won,
          draw: row.draw,
          lost: row.lost,
          gf: row.gf,
          ga: row.ga,
          gd,
          points: row.points,
        };
      });

    return {
      id: group.id,
      name: group.name,
      standings,
    };
  }

  private toFixture(
    fixture: TournamentFixtureRaw,
    teamMap: Map<number, TournamentTeam>
  ): TournamentFixture {
    const homeTeam = teamMap.get(fixture.homeTeamId) ?? this.createUnknownTeam(fixture.homeTeamId);
    const awayTeam = teamMap.get(fixture.awayTeamId) ?? this.createUnknownTeam(fixture.awayTeamId);

    return {
      id: fixture.id,
      stage: fixture.stage,
      kickoff: fixture.kickoff,
      venue: fixture.venue,
      homeTeam,
      awayTeam,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      status: this.mapFixtureStatus(fixture.status),
      minute: fixture.minute ?? null,
      addedTime: fixture.addedTime ?? null,
      note: fixture.note ?? null,
    };
  }

  private toKnockoutMatch(
    match: KnockoutMatchRaw,
    teamMap: Map<number, TournamentTeam>
  ): KnockoutMatch {
    return {
      title: match.title,
      legDates: match.legDates,
      home: this.toKnockoutTeam(match.home, teamMap),
      away: this.toKnockoutTeam(match.away, teamMap),
    };
  }

  private toKnockoutTeam(
    team: KnockoutTeamRaw,
    teamMap: Map<number, TournamentTeam>
  ): KnockoutTeam {
    return {
      label: team.label,
      team: team.teamId ? (teamMap.get(team.teamId) ?? this.createUnknownTeam(team.teamId)) : null,
      score: team.score,
      aggregate: team.aggregate,
      status: team.status,
    };
  }

  private createTeamMap(teams: TournamentTeam[]): Map<number, TournamentTeam> {
    return new Map(teams.map((team) => [team.id, team]));
  }

  private createUnknownTeam(id: number): TournamentTeam {
    return {
      id,
      name: 'TBD',
      shortName: 'TBD',
      code: 'TBD',
    };
  }

  private mapFixtureStatus(status: TournamentFixtureStatusRaw): TournamentFixtureStatus {
    switch (status) {
      case 'LIVE':
        return 'live';
      case 'HALF_TIME':
        return 'half-time';
      case 'FINISHED':
        return 'finished';
      case 'POSTPONED':
        return 'postponed';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'upcoming';
    }
  }

  private formatScore(home: number | null, away: number | null): string {
    if (home === null || away === null) {
      return 'vs';
    }

    return `${home}-${away}`;
  }

  private formatKickoff(kickoff: string): string {
    const date = new Date(kickoff);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  private getMinuteText(fixture: TournamentFixture): string | null {
    if (fixture.minute === null) {
      return null;
    }

    if (fixture.addedTime && fixture.addedTime > 0) {
      return `${fixture.minute}+${fixture.addedTime}'`;
    }

    return `${fixture.minute}'`;
  }

  private isSameDay(left: Date, right: Date): boolean {
    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  }
}
