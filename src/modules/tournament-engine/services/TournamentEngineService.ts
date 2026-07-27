import type {
  KnockoutMatch,
  KnockoutMatchRaw,
  KnockoutTeam,
  KnockoutTeamRaw,
  TournamentCenterData,
  TournamentDataProvider,
  TournamentEngineConfiguration,
  TournamentFixture,
  TournamentFixtureRaw,
  TournamentFixtureStatus,
  TournamentFixtureStatusRaw,
  TournamentGroup,
  TournamentGroupRaw,
  TournamentGroupStanding,
  TournamentGroupStandingRaw,
  TournamentHero,
  TournamentHighlight,
  TournamentPlayerRaw,
  TournamentRawDataset,
  TournamentStatistic,
  TournamentStatisticRaw,
  TournamentTeam,
} from '../models/tournament-engine.models';

const DEFAULT_TIMEZONE = 'UTC';

export class TournamentEngineService {
  private readonly provider: TournamentDataProvider;

  private readonly configuration: TournamentEngineConfiguration;

  constructor(configuration: TournamentEngineConfiguration, provider: TournamentDataProvider) {
    this.configuration = configuration;
    this.provider = provider;
  }

  public async getTournamentCenterData(forceRefresh = false): Promise<TournamentCenterData> {
    const payload = await this.provider.getSnapshot(forceRefresh);
    const normalizedDataset = this.normalizeDataset(payload.data);
    const teamMap = this.createTeamMap(normalizedDataset.teams);

    const evaluatedFixtures = normalizedDataset.fixtures.map((fixture) =>
      this.evaluateFixtureByTime(fixture)
    );
    const computedGroupStandings = this.computeGroupStandings(
      normalizedDataset.groups,
      evaluatedFixtures,
      teamMap
    );
    const fixtures = evaluatedFixtures.map((fixture) => this.toFixture(fixture, teamMap));
    const groups = normalizedDataset.groups.map((group) =>
      this.toGroup(group, teamMap, computedGroupStandings.get(group.id) ?? group.standings)
    );
    const players = normalizedDataset.players.map((player) => ({
      id: player.id,
      name: player.name,
      nation: teamMap.get(player.nationTeamId) ?? this.createUnknownTeam(player.nationTeamId),
      club: player.club,
      position: player.position,
      age: this.toOptionalNumber(player.age),
      appearances: this.toOptionalNumber(player.appearances),
      goals: player.goals,
      assists: player.assists,
      minutes: player.minutes,
      yellowCards: player.yellowCards,
      redCards: player.redCards,
    }));

    const sortedFixtures = [...fixtures].sort(
      (left, right) => this.getKickoffTimeMs(left.kickoff) - this.getKickoffTimeMs(right.kickoff)
    );

    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
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
        all: sortedFixtures,
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
      statistics: this.buildTournamentStatistics(players, sortedFixtures, teamMap),
    };
  }

  public invalidate(): void {
    this.provider.invalidate();
  }

  protected normalizeDataset(dataset: TournamentRawDataset): TournamentRawDataset {
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

  protected sanitizeFixture(fixture: TournamentFixtureRaw): TournamentFixtureRaw {
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

  protected zeroGroupStandings(group: TournamentGroupRaw): TournamentGroupRaw {
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

  protected zeroPlayerStats(player: TournamentPlayerRaw): TournamentPlayerRaw {
    return {
      ...player,
      age: this.toOptionalNumber(player.age),
      appearances: this.toOptionalNumber(player.appearances),
      goals: 0,
      assists: 0,
      minutes: 0,
      yellowCards: 0,
      redCards: 0,
    };
  }

  protected resetKnockout(
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

  protected resetStatistic(stat: TournamentStatisticRaw): TournamentStatisticRaw {
    return {
      ...stat,
      value: 'TBD',
      subtitle: 'Tournament has not started',
    };
  }

  protected buildHero(
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

  protected evaluateFixtureByTime(fixture: TournamentFixtureRaw): TournamentFixtureRaw {
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
    const matchDurationMs = this.configuration.matchDurationMs;

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

    if (hasScore && (fixture.status === 'FINISHED' || now >= kickoffTime + matchDurationMs)) {
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

  protected resolveHighlight(
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

  protected toGroup(
    group: TournamentGroupRaw,
    teamMap: Map<number, TournamentTeam>,
    standingsInput: TournamentGroupStandingRaw[]
  ): TournamentGroup {
    const standings: TournamentGroupStanding[] = standingsInput.map((row, index) => {
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

  protected toFixture(
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

  protected toKnockoutMatch(
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

  protected toKnockoutTeam(
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

  protected createTeamMap(teams: TournamentTeam[]): Map<number, TournamentTeam> {
    return new Map(teams.map((team) => [team.id, team]));
  }

  protected createUnknownTeam(id: number): TournamentTeam {
    return {
      id,
      name: 'TBD',
      countryCode: 'TBD',
    };
  }

  protected mapFixtureStatus(status: TournamentFixtureStatusRaw): TournamentFixtureStatus {
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

  protected formatScore(home: number | null, away: number | null): string {
    if (home === null || away === null) {
      return 'vs';
    }

    return `${home}-${away}`;
  }

  protected formatKickoff(kickoff: string): string {
    const date = new Date(this.normalizeKickoffToIsoUtc(kickoff));
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: this.configuration.timezone || DEFAULT_TIMEZONE,
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  protected getMinuteText(fixture: TournamentFixture): string | null {
    if (fixture.minute === null) {
      return null;
    }

    if (fixture.addedTime && fixture.addedTime > 0) {
      return `${fixture.minute}+${fixture.addedTime}'`;
    }

    return `${fixture.minute}'`;
  }

  protected getDateKeyInTimezone(date: Date, timeZone: string): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  }

  protected getKickoffTimeMs(kickoff: string): number {
    const normalized = this.normalizeKickoffToIsoUtc(kickoff);
    const value = new Date(normalized).getTime();
    return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
  }

  protected normalizeKickoffToIsoUtc(kickoff: string): string {
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

  protected toOptionalNumber(value: unknown): number | null {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return null;
    }
    return value;
  }

  protected isCompletedFixture(fixture: TournamentFixtureRaw): boolean {
    return (
      fixture.status === 'FINISHED' && fixture.homeScore !== null && fixture.awayScore !== null
    );
  }

  protected getGroupIdFromStage(stage: string): string | null {
    const match = /^Group\s+(.+)$/i.exec(stage.trim());
    if (!match) {
      return null;
    }

    return match[1].trim();
  }

  protected getPairKey(firstTeamId: number, secondTeamId: number): string {
    return firstTeamId < secondTeamId
      ? `${firstTeamId}-${secondTeamId}`
      : `${secondTeamId}-${firstTeamId}`;
  }

  protected computeGroupStandings(
    groups: TournamentGroupRaw[],
    fixtures: TournamentFixtureRaw[],
    teamMap: Map<number, TournamentTeam>
  ): Map<string, TournamentGroupStandingRaw[]> {
    const result = new Map<string, TournamentGroupStandingRaw[]>();

    groups.forEach((group) => {
      const rows = new Map<number, TournamentGroupStandingRaw>();
      group.standings.forEach((standing) => {
        rows.set(standing.teamId, {
          teamId: standing.teamId,
          played: 0,
          won: 0,
          draw: 0,
          lost: 0,
          gf: 0,
          ga: 0,
          points: 0,
        });
      });

      const completedGroupFixtures = fixtures.filter((fixture) => {
        if (!this.isCompletedFixture(fixture)) {
          return false;
        }

        const fixtureGroupId = this.getGroupIdFromStage(fixture.stage);
        return fixtureGroupId === group.id;
      });

      completedGroupFixtures.forEach((fixture) => {
        const home = rows.get(fixture.homeTeamId);
        const away = rows.get(fixture.awayTeamId);
        if (!home || !away || fixture.homeScore === null || fixture.awayScore === null) {
          return;
        }

        home.played += 1;
        away.played += 1;
        home.gf += fixture.homeScore;
        home.ga += fixture.awayScore;
        away.gf += fixture.awayScore;
        away.ga += fixture.homeScore;

        if (fixture.homeScore > fixture.awayScore) {
          home.won += 1;
          home.points += 3;
          away.lost += 1;
          return;
        }

        if (fixture.homeScore < fixture.awayScore) {
          away.won += 1;
          away.points += 3;
          home.lost += 1;
          return;
        }

        home.draw += 1;
        away.draw += 1;
        home.points += 1;
        away.points += 1;
      });

      const headToHeadMap = new Map<
        string,
        {
          [teamId: number]: {
            points: number;
            gd: number;
            gf: number;
          };
        }
      >();

      completedGroupFixtures.forEach((fixture) => {
        if (fixture.homeScore === null || fixture.awayScore === null) {
          return;
        }

        const key = this.getPairKey(fixture.homeTeamId, fixture.awayTeamId);
        const current = headToHeadMap.get(key) ?? {
          [fixture.homeTeamId]: { points: 0, gd: 0, gf: 0 },
          [fixture.awayTeamId]: { points: 0, gd: 0, gf: 0 },
        };

        if (!current[fixture.homeTeamId]) {
          current[fixture.homeTeamId] = { points: 0, gd: 0, gf: 0 };
        }
        if (!current[fixture.awayTeamId]) {
          current[fixture.awayTeamId] = { points: 0, gd: 0, gf: 0 };
        }

        current[fixture.homeTeamId].gf += fixture.homeScore;
        current[fixture.homeTeamId].gd += fixture.homeScore - fixture.awayScore;
        current[fixture.awayTeamId].gf += fixture.awayScore;
        current[fixture.awayTeamId].gd += fixture.awayScore - fixture.homeScore;

        if (fixture.homeScore > fixture.awayScore) {
          current[fixture.homeTeamId].points += 3;
        } else if (fixture.homeScore < fixture.awayScore) {
          current[fixture.awayTeamId].points += 3;
        } else {
          current[fixture.homeTeamId].points += 1;
          current[fixture.awayTeamId].points += 1;
        }

        headToHeadMap.set(key, current);
      });

      const standings = Array.from(rows.values()).sort((left, right) => {
        if (right.points !== left.points) {
          return right.points - left.points;
        }

        const leftGd = left.gf - left.ga;
        const rightGd = right.gf - right.ga;
        if (rightGd !== leftGd) {
          return rightGd - leftGd;
        }

        if (right.gf !== left.gf) {
          return right.gf - left.gf;
        }

        const pair = headToHeadMap.get(this.getPairKey(left.teamId, right.teamId));
        if (pair && pair[left.teamId] && pair[right.teamId]) {
          if (pair[right.teamId].points !== pair[left.teamId].points) {
            return pair[right.teamId].points - pair[left.teamId].points;
          }
          if (pair[right.teamId].gd !== pair[left.teamId].gd) {
            return pair[right.teamId].gd - pair[left.teamId].gd;
          }
          if (pair[right.teamId].gf !== pair[left.teamId].gf) {
            return pair[right.teamId].gf - pair[left.teamId].gf;
          }
        }

        const leftName = teamMap.get(left.teamId)?.name ?? '';
        const rightName = teamMap.get(right.teamId)?.name ?? '';
        return leftName.localeCompare(rightName);
      });

      result.set(group.id, standings);
    });

    return result;
  }

  protected buildTournamentStatistics(
    players: TournamentCenterData['players'],
    fixtures: TournamentFixture[],
    teamMap: Map<number, TournamentTeam>
  ): TournamentStatistic[] {
    const completedFixtures = fixtures.filter(
      (fixture) =>
        fixture.status === 'finished' && fixture.homeScore !== null && fixture.awayScore !== null
    );
    const totalGoals = completedFixtures.reduce(
      (sum, fixture) => sum + (fixture.homeScore ?? 0) + (fixture.awayScore ?? 0),
      0
    );
    const averageGoalsPerMatch =
      completedFixtures.length > 0 ? totalGoals / completedFixtures.length : 0;

    const teamTotals = new Map<
      number,
      {
        goalsFor: number;
        goalsAgainst: number;
        cleanSheets: number;
        played: number;
      }
    >();

    teamMap.forEach((_, teamId) => {
      teamTotals.set(teamId, { goalsFor: 0, goalsAgainst: 0, cleanSheets: 0, played: 0 });
    });

    completedFixtures.forEach((fixture) => {
      const homeStats = teamTotals.get(fixture.homeTeam.id);
      const awayStats = teamTotals.get(fixture.awayTeam.id);
      if (!homeStats || !awayStats || fixture.homeScore === null || fixture.awayScore === null) {
        return;
      }

      homeStats.played += 1;
      awayStats.played += 1;
      homeStats.goalsFor += fixture.homeScore;
      homeStats.goalsAgainst += fixture.awayScore;
      awayStats.goalsFor += fixture.awayScore;
      awayStats.goalsAgainst += fixture.homeScore;

      if (fixture.awayScore === 0) {
        homeStats.cleanSheets += 1;
      }
      if (fixture.homeScore === 0) {
        awayStats.cleanSheets += 1;
      }
    });

    const topScorer = this.getTopPlayerBy(players, (player) => player.goals);
    const topAssists = this.getTopPlayerBy(players, (player) => player.assists);
    const mostYellowCards = this.getTopPlayerBy(players, (player) => player.yellowCards);
    const mostRedCards = this.getTopPlayerBy(players, (player) => player.redCards);
    const mostCleanSheetsTeam = this.getTopTeamBy(teamTotals, teamMap, (team) => team.cleanSheets);
    const mostGoalsTeam = this.getTopTeamBy(teamTotals, teamMap, (team) => team.goalsFor);
    const bestAttackTeam = this.getTopTeamBy(teamTotals, teamMap, (team) => {
      if (team.played === 0) {
        return 0;
      }
      return team.goalsFor / team.played;
    });
    const bestDefenceTeam = this.getTopTeamBy(teamTotals, teamMap, (team) => {
      if (team.played === 0) {
        return Number.NEGATIVE_INFINITY;
      }
      return -(team.goalsAgainst / team.played);
    });

    const highestScoringMatch = completedFixtures.reduce<TournamentFixture | null>(
      (best, fixture) => {
        if (!best) {
          return fixture;
        }

        const bestTotal = (best.homeScore ?? 0) + (best.awayScore ?? 0);
        const fixtureTotal = (fixture.homeScore ?? 0) + (fixture.awayScore ?? 0);
        if (fixtureTotal > bestTotal) {
          return fixture;
        }
        return best;
      },
      null
    );

    const highlightedStatisticIds = new Set([
      'top-scorer',
      'top-assists',
      'most-clean-sheets',
      'most-goals',
      'best-attack',
      'highest-scoring-match',
    ]);

    return [
      {
        id: 'top-scorer',
        title: 'Top Scorer',
        value: topScorer ? `${topScorer.player.name} (${topScorer.value})` : 'N/A',
        subtitle: topScorer
          ? `${topScorer.player.nation.name} • ${topScorer.player.club}`
          : 'No goal data yet',
      },
      {
        id: 'top-assists',
        title: 'Most Assists',
        value: topAssists ? `${topAssists.player.name} (${topAssists.value})` : 'N/A',
        subtitle: topAssists
          ? `${topAssists.player.nation.name} • ${topAssists.player.club}`
          : 'No assist data yet',
      },
      {
        id: 'most-clean-sheets',
        title: 'Most Clean Sheets',
        value: mostCleanSheetsTeam
          ? `${mostCleanSheetsTeam.team.name} (${mostCleanSheetsTeam.value})`
          : 'N/A',
        subtitle: 'Team clean sheets in completed fixtures',
      },
      {
        id: 'most-goals',
        title: 'Most Goals',
        value: mostGoalsTeam ? `${mostGoalsTeam.team.name} (${mostGoalsTeam.value})` : 'N/A',
        subtitle: 'Most goals scored by a team',
      },
      {
        id: 'most-yellow-cards',
        title: 'Most Yellow Cards',
        value: mostYellowCards
          ? `${mostYellowCards.player.name} (${mostYellowCards.value})`
          : 'N/A',
        subtitle: mostYellowCards
          ? `${mostYellowCards.player.nation.name} • ${mostYellowCards.player.club}`
          : 'No card data yet',
      },
      {
        id: 'most-red-cards',
        title: 'Most Red Cards',
        value: mostRedCards ? `${mostRedCards.player.name} (${mostRedCards.value})` : 'N/A',
        subtitle: mostRedCards
          ? `${mostRedCards.player.nation.name} • ${mostRedCards.player.club}`
          : 'No card data yet',
      },
      {
        id: 'best-attack',
        title: 'Best Attack',
        value: bestAttackTeam ? bestAttackTeam.team.name : 'N/A',
        subtitle: bestAttackTeam
          ? `${bestAttackTeam.value.toFixed(2)} goals per match`
          : 'No completed matches yet',
      },
      {
        id: 'best-defence',
        title: 'Best Defence',
        value: bestDefenceTeam ? bestDefenceTeam.team.name : 'N/A',
        subtitle: bestDefenceTeam
          ? `${Math.abs(bestDefenceTeam.value).toFixed(2)} goals conceded per match`
          : 'No completed matches yet',
      },
      {
        id: 'highest-scoring-match',
        title: 'Highest Scoring Match',
        value: highestScoringMatch
          ? `${highestScoringMatch.homeTeam.name} ${highestScoringMatch.homeScore}-${highestScoringMatch.awayScore} ${highestScoringMatch.awayTeam.name}`
          : 'N/A',
        subtitle: highestScoringMatch
          ? this.formatKickoff(highestScoringMatch.kickoff)
          : 'No completed matches yet',
      },
      {
        id: 'average-goals-per-match',
        title: 'Average Goals Per Match',
        value: averageGoalsPerMatch.toFixed(2),
        subtitle: `${completedFixtures.length} completed matches`,
      },
      {
        id: 'total-goals',
        title: 'Total Goals',
        value: `${totalGoals}`,
        subtitle: 'From completed fixtures',
      },
      {
        id: 'completed-matches',
        title: 'Completed Matches',
        value: `${completedFixtures.length}`,
        subtitle: `${Math.max(0, fixtures.length - completedFixtures.length)} remaining matches`,
      },
      {
        id: 'remaining-matches',
        title: 'Remaining Matches',
        value: `${Math.max(0, fixtures.length - completedFixtures.length)}`,
        subtitle: `${fixtures.length} total scheduled fixtures`,
      },
    ].filter((statistic) => highlightedStatisticIds.has(statistic.id));
  }

  protected getTopPlayerBy(
    players: TournamentCenterData['players'],
    selector: (player: TournamentCenterData['players'][number]) => number
  ): { player: TournamentCenterData['players'][number]; value: number } | null {
    const sorted = [...players].sort((left, right) => {
      const rightValue = selector(right);
      const leftValue = selector(left);
      if (rightValue !== leftValue) {
        return rightValue - leftValue;
      }
      return left.name.localeCompare(right.name);
    });

    if (sorted.length === 0) {
      return null;
    }

    return {
      player: sorted[0],
      value: selector(sorted[0]),
    };
  }

  protected getTopTeamBy(
    teamTotals: Map<
      number,
      {
        goalsFor: number;
        goalsAgainst: number;
        cleanSheets: number;
        played: number;
      }
    >,
    teamMap: Map<number, TournamentTeam>,
    selector: (team: {
      goalsFor: number;
      goalsAgainst: number;
      cleanSheets: number;
      played: number;
    }) => number
  ): { team: TournamentTeam; value: number } | null {
    const candidates = Array.from(teamTotals.entries())
      .filter(([, totals]) => totals.played > 0)
      .map(([teamId, totals]) => ({
        team: teamMap.get(teamId) ?? this.createUnknownTeam(teamId),
        value: selector(totals),
      }))
      .sort((left, right) => {
        if (right.value !== left.value) {
          return right.value - left.value;
        }
        return left.team.name.localeCompare(right.team.name);
      });

    return candidates[0] ?? null;
  }
}
