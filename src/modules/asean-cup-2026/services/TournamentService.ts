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
  TournamentPlayerRaw,
  TournamentRawDataset,
  TournamentStatisticRaw,
  TournamentStatistic,
  TournamentTeam,
} from '../models/tournament.models';
import { TournamentRepository } from '../repositories/TournamentRepository';

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';
const MATCH_DURATION_MS = 120 * 60 * 1000;

export class TournamentService {
  private readonly repository: TournamentRepository;

  constructor(repository?: TournamentRepository) {
    this.repository = repository ?? new TournamentRepository();
  }

  public async getTournamentCenterData(forceRefresh = false): Promise<TournamentCenterData> {
    const payload = await this.repository.getSnapshot(forceRefresh);
    const normalizedDataset = this.normalizeDataset(payload.data);
    const teamMap = this.createTeamMap(normalizedDataset.teams);

    const evaluatedFixtures = normalizedDataset.fixtures.map((fixture) =>
      this.evaluateFixtureByTime(fixture)
    );
    const fixtures = evaluatedFixtures.map((fixture) => this.toFixture(fixture, teamMap));
    const groups = normalizedDataset.groups.map((group) => this.toGroup(group, teamMap));
    const players = normalizedDataset.players.map((player) => ({
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
      (left, right) => this.getKickoffTimeMs(left.kickoff) - this.getKickoffTimeMs(right.kickoff)
    );

    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const today = new Date();
    const todayKey = this.getDateKeyInTimezone(today, browserTimezone);
    const fixturesToday = sortedFixtures.filter(
      (fixture) =>
        this.getDateKeyInTimezone(new Date(fixture.kickoff), browserTimezone) === todayKey
    );
    const futureDateKeys = sortedFixtures
      .map((fixture) => this.getDateKeyInTimezone(new Date(fixture.kickoff), browserTimezone))
      .filter((fixtureDateKey) => fixtureDateKey > todayKey)
      .sort((left, right) => left.localeCompare(right));
    const nextMatchdayKey = futureDateKeys.length > 0 ? futureDateKeys[0] : null;
    const upcomingFixtures =
      nextMatchdayKey === null
        ? []
        : sortedFixtures.filter((fixture) => {
            const fixtureDateKey = this.getDateKeyInTimezone(
              new Date(fixture.kickoff),
              browserTimezone
            );
            return fixtureDateKey === nextMatchdayKey && fixture.status !== 'finished';
          });
    const completedFixtures = sortedFixtures.filter((fixture) => fixture.status === 'finished');

    const hero = this.buildHero(
      normalizedDataset,
      payload.syncedAt,
      sortedFixtures,
      completedFixtures,
      upcomingFixtures
    );

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
        semiFinal1: this.toKnockoutMatch(normalizedDataset.knockout.semiFinal1, teamMap),
        semiFinal2: this.toKnockoutMatch(normalizedDataset.knockout.semiFinal2, teamMap),
        final: this.toKnockoutMatch(normalizedDataset.knockout.final, teamMap),
        champion: this.toKnockoutTeam(normalizedDataset.knockout.champion, teamMap),
      },
      statistics: normalizedDataset.statistics.map((stat): TournamentStatistic => ({
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

  private normalizeDataset(dataset: TournamentRawDataset): TournamentRawDataset {
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

  private buildHero(
    dataset: TournamentRawDataset,
    syncedAt: string,
    fixtures: TournamentFixture[],
    completedFixtures: TournamentFixture[],
    upcomingFixtures: TournamentFixture[]
  ): TournamentHero {
    const liveFixture = fixtures.find(
      (fixture) => fixture.status === 'live' || fixture.status === 'half-time'
    );
    const latestResult = completedFixtures[completedFixtures.length - 1];
    const nextFixture = upcomingFixtures[0];

    const highlight = this.resolveHighlight(liveFixture, latestResult, nextFixture);

    return {
      tournamentName: dataset.meta.name,
      subtitle: dataset.meta.subtitle,
      currentStage: dataset.meta.currentStage,
      currentMatchday: dataset.meta.currentMatchday,
      matchesCompleted: completedFixtures.length,
      matchesRemaining: fixtures.length - completedFixtures.length,
      nextFixture: nextFixture
        ? `${nextFixture.homeTeam.name} vs ${nextFixture.awayTeam.name}`
        : 'No upcoming fixture',
      latestResult: latestResult
        ? `${latestResult.homeTeam.name} ${this.formatScore(latestResult.homeScore, latestResult.awayScore)} ${latestResult.awayTeam.name}`
        : 'No finished fixture yet',
      highlight,
      lastUpdated: syncedAt,
    };
  }

  private evaluateFixtureByTime(fixture: TournamentFixtureRaw): TournamentFixtureRaw {
    if (fixture.status === 'POSTPONED' || fixture.status === 'CANCELLED') {
      return {
        ...fixture,
        homeScore: null,
        awayScore: null,
        minute: undefined,
        addedTime: undefined,
      };
    }

    const kickoffTime = this.getKickoffTimeMs(fixture.kickoff);
    if (!Number.isFinite(kickoffTime)) {
      return {
        ...fixture,
        status: 'UPCOMING',
        homeScore: null,
        awayScore: null,
        minute: undefined,
        addedTime: undefined,
      };
    }

    const now = Date.now();
    const hasScore = fixture.homeScore !== null && fixture.awayScore !== null;

    if (now < kickoffTime) {
      return {
        ...fixture,
        status: 'UPCOMING',
        homeScore: null,
        awayScore: null,
        minute: undefined,
        addedTime: undefined,
      };
    }

    if (hasScore && (fixture.status === 'FINISHED' || now >= kickoffTime + MATCH_DURATION_MS)) {
      return {
        ...fixture,
        status: 'FINISHED',
        minute: undefined,
        addedTime: undefined,
      };
    }

    const elapsedMinutes = Math.max(1, Math.floor((now - kickoffTime) / 60000));
    if (elapsedMinutes >= 46 && elapsedMinutes <= 60) {
      return {
        ...fixture,
        status: 'HALF_TIME',
        homeScore: hasScore ? fixture.homeScore : null,
        awayScore: hasScore ? fixture.awayScore : null,
        minute: 45,
        addedTime: undefined,
      };
    }

    if (elapsedMinutes <= 120) {
      return {
        ...fixture,
        status: 'LIVE',
        homeScore: hasScore ? fixture.homeScore : null,
        awayScore: hasScore ? fixture.awayScore : null,
        minute: Math.min(elapsedMinutes, 120),
      };
    }

    return {
      ...fixture,
      status: 'FINISHED',
      minute: undefined,
      addedTime: undefined,
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
      kickoff: this.normalizeKickoffToIsoUtc(fixture.kickoff),
      venue: fixture.venue && fixture.venue.trim().length > 0 ? fixture.venue : 'TBD',
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
      countryCode: 'TBD',
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
    const date = new Date(this.normalizeKickoffToIsoUtc(kickoff));
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: VIETNAM_TIMEZONE,
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

  private getDateKeyInTimezone(date: Date, timeZone: string): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  }

  private getKickoffTimeMs(kickoff: string): number {
    const normalized = this.normalizeKickoffToIsoUtc(kickoff);
    const value = new Date(normalized).getTime();
    return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
  }

  private normalizeKickoffToIsoUtc(kickoff: string): string {
    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(kickoff);
    if (hasTimezone) {
      return new Date(kickoff).toISOString();
    }

    const [datePart, timePart = '00:00:00'] = kickoff.trim().split('T');
    const [yearRaw, monthRaw, dayRaw] = datePart.split('-');
    const [hourRaw, minuteRaw = '0', secondRaw = '0'] = timePart.split(':');
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    const second = Number(secondRaw);

    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day) ||
      !Number.isFinite(hour) ||
      !Number.isFinite(minute) ||
      !Number.isFinite(second)
    ) {
      return kickoff;
    }

    const utcMs = Date.UTC(year, month - 1, day, hour - 7, minute, second);
    return new Date(utcMs).toISOString();
  }
}
