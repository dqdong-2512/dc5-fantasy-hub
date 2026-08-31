import { BootstrapRepository } from '@repositories/bootstrap';
import { FixtureRepository } from '@repositories/fixtures';
import { PlayerRepository } from '@repositories/players';
import { FantasyGameRepository } from '@repositories/fantasy';
import {
  FplClient,
  type Event,
  type EventLiveData,
  type FPLFixture,
} from '@shared/services/fpl-client';
import type { FantasyEntry, FantasyGameweekPicks } from '@domain/models';

export type LiveStatusBadge = 'upcoming' | 'live' | 'ht' | 'ft' | 'postponed' | 'suspended';

export type MatchEventType =
  | 'goal'
  | 'assist'
  | 'yellow'
  | 'red'
  | 'substitution'
  | 'own_goal'
  | 'penalty_scored'
  | 'penalty_missed'
  | 'var'
  | 'bonus_change';

export interface MatchTimelineEvent {
  id: string;
  minute: number | null;
  type: MatchEventType;
  label: string;
  playerId: number;
  playerName: string;
  teamId: number;
  teamShortName: string;
  quantity: number;
}

export interface MatchOwnedPlayerLive {
  playerId: number;
  playerName: string;
  teamShortName: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  multiplier: number;
  isBench: boolean;
  minutes: number;
  currentPoints: number;
  projectedPoints: number;
  bonusPending: number;
}

export interface MatchPlayerStat {
  playerId: number;
  playerName: string;
  playerCode: number;
  teamId: number;
  teamShortName: string;
  minutes: number;
  goals: number;
  assists: number;
  ownGoals: number;
  penaltiesSaved: number;
  penaltiesMissed: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  bonus: number;
  bps: number;
  totalPoints: number;
}

export interface MatchCenterFixture {
  id: number;
  kickoffTime: string;
  status: LiveStatusBadge;
  period: 'NS' | '1H' | 'HT' | '2H' | 'FT' | 'PPD' | 'SUS';
  elapsedMinute: number | null;
  stoppageTime: number | null;
  venue: string | null;
  referee: string | null;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamShortName: string;
  homeTeamCode: number;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamShortName: string;
  awayTeamCode: number;
  homeScore: number | null;
  awayScore: number | null;
  difficulty: number;
  timeline: MatchTimelineEvent[];
  ownedPlayers: MatchOwnedPlayerLive[];
  playerStats: MatchPlayerStat[];
}

export interface LiveLeagueRow {
  entryId: number;
  rank: number;
  liveRank: number;
  managerName: string;
  teamName: string;
  gameweekPoints: number;
  totalPoints: number;
  rankMovement: number;
  isHighestScorer: boolean;
  captainName: string | null;
  chipUsed: string | null;
  benchPoints: number;
  isConnectedManager: boolean;
}

export interface LiveTeamPlayerCard {
  playerId: number;
  playerName: string;
  playerCode: number;
  positionLabel: string;
  teamId: number;
  teamShortName: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isBench: boolean;
  multiplier: number;
  minutes: number;
  livePoints: number;
  expectedPoints: number;
  bonus: number;
  bonusPending: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cardStatus: 'none' | 'yellow' | 'red';
  status: LiveStatusBadge;
  currentFixture: string;
  remainingFixture: string;
}

export interface LiveTeamView {
  starters: LiveTeamPlayerCard[];
  bench: LiveTeamPlayerCard[];
  currentPoints: number;
  projectedPoints: number;
  bonusPending: number;
  captainMultiplierPoints: number;
  benchPoints: number;
  autosubPrediction: string[];
}

export interface GameweekLiveHeader {
  currentGameweek: number;
  matchesFinished: number;
  matchesLive: number;
  matchesRemaining: number;
  averageScore: number | null;
  highestScore: number | null;
  deadlineIso: string | null;
  deadlineCountdownLabel: string;
  lastSyncIso: string;
  phase: 'PRESEASON' | 'PRE_DEADLINE' | 'LOCKED' | 'LIVE' | 'PROVISIONAL' | 'FINAL';
}

export interface LiveManagerSummary {
  teamName: string;
  managerName: string;
  gameweekPoints: number;
  overallPoints: number;
  overallRank: number | null;
  liveRank: number | null;
  transferCost: number;
  activeChip: string | null;
  captainName: string | null;
  viceCaptainName: string | null;
  teamValue: number | null;
  bank: number | null;
}

export interface ClubLivePanel {
  clubId: number;
  clubName: string;
  clubShortName: string;
  clubCode: number;
  lineup: Array<{ playerId: number; playerName: string; playerCode: number; minutes: number }>;
  bench: Array<{ playerId: number; playerName: string; playerCode: number; minutes: number }>;
  formation: string;
  matchStats: {
    possession: number | null;
    shots: number | null;
    xg: number | null;
    corners: number | null;
    cards: number;
  };
  upcomingFixtures: string[];
  leaguePosition: number | null;
  form: string;
}

export interface PlayerLivePanel {
  playerId: number;
  playerName: string;
  playerCode: number;
  teamShortName: string;
  livePoints: number;
  seasonPoints: number;
  ownership: number;
  price: number;
  recentForm: number;
  upcomingFixtures: string[];
  transferTrend: number | null;
  captainOwnership: string | null;
  leagueOwnership: string | null;
}

export interface LiveMatchCenterSnapshot {
  header: GameweekLiveHeader;
  fixtures: MatchCenterFixture[];
  liveLeague: {
    leagueId: number | null;
    leagueName: string | null;
    rows: LiveLeagueRow[];
    dataStatus: 'LIVE' | 'STALE' | 'ERROR';
  };
  liveTeam: LiveTeamView | null;
  manager: LiveManagerSummary | null;
  changedResources: string[];
}

interface CachedResource<T> {
  data: T;
  hash: string;
  updatedAt: number;
}

interface LiveDataOptions {
  gameweekId?: number;
  connectedEntryId?: number | null;
  connectedLeagueId?: number | null;
  forceRefresh?: boolean;
}

interface RuntimeResourceBundle {
  event: Event;
  fixtures: FPLFixture[];
  eventLive: EventLiveData;
  picks: FantasyGameweekPicks | null;
  connectedEntryId: number | null;
  connectedLeagueId: number | null;
}

export class LiveDataService {
  private readonly fplClient: FplClient;
  private readonly bootstrapRepository: BootstrapRepository;
  private readonly fixtureRepository: FixtureRepository;
  private readonly playerRepository: PlayerRepository;
  private readonly fantasyRepository: FantasyGameRepository;

  private readonly cache = new Map<string, CachedResource<unknown>>();
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly pollers = new Map<string, number>();
  private latestBundle: RuntimeResourceBundle | null = null;

  constructor() {
    this.fplClient = new FplClient();
    this.bootstrapRepository = new BootstrapRepository();
    this.fixtureRepository = new FixtureRepository();
    this.playerRepository = new PlayerRepository();
    this.fantasyRepository = new FantasyGameRepository();
  }

  scheduleRefresh(key: string, intervalMs: number, callback: () => Promise<void>): void {
    this.stopRefresh(key);
    const timer = window.setInterval(() => {
      void callback();
    }, intervalMs);
    this.pollers.set(key, timer);
  }

  startBackgroundPolling(key: string, intervalMs: number, callback: () => Promise<void>): void {
    this.scheduleRefresh(key, intervalMs, callback);
  }

  stopRefresh(key: string): void {
    const timer = this.pollers.get(key);
    if (timer) {
      clearInterval(timer);
      this.pollers.delete(key);
    }
  }

  stopAllRefreshes(): void {
    this.pollers.forEach((timer) => clearInterval(timer));
    this.pollers.clear();
  }

  invalidate(resourcePrefix?: string): void {
    if (!resourcePrefix) {
      this.cache.clear();
      return;
    }

    Array.from(this.cache.keys())
      .filter((key) => key.startsWith(resourcePrefix))
      .forEach((key) => this.cache.delete(key));
  }

  async getLiveMatchCenterSnapshot(options: LiveDataOptions): Promise<LiveMatchCenterSnapshot> {
    const forceRefresh = options.forceRefresh === true;
    const changedResources: string[] = [];

    const bootstrap = await this.getResource(
      'bootstrap-static',
      () => this.fplClient.getBootstrap(),
      {
        ttlMs: 120000,
        forceRefresh: false,
        changedResources,
      }
    );

    const event = this.resolveTargetEvent(bootstrap.events, options.gameweekId);

    const fixtures = await this.getResource(
      `fixtures-event-${event.id}`,
      async () => {
        const allFixtures = await this.fplClient.getFixtures(event.id);
        return allFixtures.filter((fixture) => fixture.event === event.id);
      },
      {
        ttlMs: 15000,
        forceRefresh,
        changedResources,
      }
    );

    const eventLive = await this.getResource(
      `event-live-${event.id}`,
      () => this.fplClient.getEventLive(event.id),
      {
        ttlMs: 15000,
        forceRefresh,
        changedResources,
      }
    );

    const picksPromise = options.connectedEntryId
      ? this.getResource(
          `entry-picks-${options.connectedEntryId}-${event.id}`,
          () => this.fantasyRepository.getEntryPicks(options.connectedEntryId!, event.id),
          {
            ttlMs: 900000,
            forceRefresh: false,
            changedResources,
          }
        )
      : Promise.resolve(null);

    const entryPromise = options.connectedEntryId
      ? this.getResource(
          `entry-${options.connectedEntryId}`,
          () => this.fantasyRepository.getEntry(options.connectedEntryId!),
          { ttlMs: 120000, forceRefresh, changedResources }
        ).catch(() => null)
      : Promise.resolve(null);

    const [picks, entry] = await Promise.all([picksPromise, entryPromise]);

    this.latestBundle = {
      event,
      fixtures,
      eventLive,
      picks,
      connectedEntryId: options.connectedEntryId ?? null,
      connectedLeagueId: options.connectedLeagueId ?? null,
    };

    const fixtureCards = this.buildFixtureCards(fixtures, eventLive, bootstrap, picks);
    const liveTeam = this.buildLiveTeamView(fixtureCards, eventLive, bootstrap, picks);
    const liveLeague = await this.buildLiveLeagueView(
      event.id,
      options.connectedEntryId ?? null,
      options.connectedLeagueId ?? null
    );

    const header = this.buildHeader(event, fixtureCards, liveLeague.rows);
    const manager = this.buildManagerSummary(entry, picks, liveTeam, liveLeague.rows, bootstrap);

    return {
      header,
      fixtures: fixtureCards,
      liveLeague,
      liveTeam,
      manager,
      changedResources,
    };
  }

  getClubLivePanel(clubId: number): ClubLivePanel | null {
    if (!this.latestBundle) {
      return null;
    }

    const bootstrap = this.bootstrapRepository.getBootstrap();
    const team = bootstrap.teams.find((club) => club.id === clubId);
    if (!team) {
      return null;
    }

    const players = bootstrap.players.filter((player) => player.teamId === clubId);
    const liveByPlayerId = new Map(
      this.latestBundle.eventLive.elements.map((entry) => [entry.id, entry.stats])
    );

    const lineup = players
      .filter((player) => (liveByPlayerId.get(player.id)?.minutes ?? 0) > 0)
      .sort(
        (a, b) =>
          (liveByPlayerId.get(b.id)?.minutes ?? 0) - (liveByPlayerId.get(a.id)?.minutes ?? 0)
      )
      .slice(0, 11)
      .map((player) => ({
        playerId: player.id,
        playerName: player.displayName,
        playerCode: player.clubCode ?? 0,
        minutes: liveByPlayerId.get(player.id)?.minutes ?? 0,
      }));

    const bench = players
      .filter((player) => (liveByPlayerId.get(player.id)?.minutes ?? 0) === 0)
      .slice(0, 9)
      .map((player) => ({
        playerId: player.id,
        playerName: player.displayName,
        playerCode: player.clubCode ?? 0,
        minutes: 0,
      }));

    const byPosition = {
      gk: lineup.filter(
        (row) => this.playerRepository.getById(row.playerId)?.position === 'GOALKEEPER'
      ).length,
      def: lineup.filter(
        (row) => this.playerRepository.getById(row.playerId)?.position === 'DEFENDER'
      ).length,
      mid: lineup.filter(
        (row) => this.playerRepository.getById(row.playerId)?.position === 'MIDFIELDER'
      ).length,
      fwd: lineup.filter(
        (row) => this.playerRepository.getById(row.playerId)?.position === 'FORWARD'
      ).length,
    };

    const cards = players.reduce((sum, player) => {
      const stats = liveByPlayerId.get(player.id);
      return sum + (stats?.yellow_cards ?? 0) + (stats?.red_cards ?? 0);
    }, 0);

    const upcomingFixtures = this.fixtureRepository
      .getUpcomingByTeam(clubId)
      .slice(0, 5)
      .map((fixture) => {
        const isHome = fixture.homeTeam.id === clubId;
        const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
        return `${opponent.shortName} (${isHome ? 'H' : 'A'})`;
      });

    return {
      clubId,
      clubName: team.name,
      clubShortName: team.shortName,
      clubCode: Number(team.code),
      lineup,
      bench,
      formation: `${Math.max(1, byPosition.def)}-${Math.max(1, byPosition.mid)}-${Math.max(1, byPosition.fwd)}`,
      matchStats: {
        possession: null,
        shots: null,
        xg: null,
        corners: null,
        cards,
      },
      upcomingFixtures,
      leaguePosition: team.leaguePosition ?? null,
      form: this.buildTeamForm(clubId),
    };
  }

  getPlayerLivePanel(playerId: number): PlayerLivePanel | null {
    if (!this.latestBundle) {
      return null;
    }

    const bootstrap = this.bootstrapRepository.getBootstrap();
    const seasonPlayer = bootstrap.players.find((player) => player.id === playerId);
    const domainPlayer = this.playerRepository.getById(playerId);
    if (!seasonPlayer || !domainPlayer) {
      return null;
    }

    const live = this.latestBundle.eventLive.elements.find((entry) => entry.id === playerId)?.stats;
    const upcomingFixtures = this.fixtureRepository
      .getUpcomingByTeam(domainPlayer.teamId)
      .slice(0, 5)
      .map((fixture) => {
        const isHome = fixture.homeTeam.id === domainPlayer.teamId;
        const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
        return `${opponent.shortName} (${isHome ? 'H' : 'A'})`;
      });

    const transferTrend =
      typeof domainPlayer.transfersInEvent === 'number' &&
      typeof domainPlayer.transfersOutEvent === 'number'
        ? domainPlayer.transfersInEvent - domainPlayer.transfersOutEvent
        : null;

    const captainOwnership =
      this.latestBundle.event.most_captained === playerId ? 'Most captained this gameweek' : null;

    return {
      playerId,
      playerName: seasonPlayer.displayName,
      playerCode: seasonPlayer.teamCode,
      teamShortName: domainPlayer.club,
      livePoints: live?.total_points ?? 0,
      seasonPoints: seasonPlayer.totalPoints,
      ownership: seasonPlayer.ownership,
      price: seasonPlayer.price / 10,
      recentForm: seasonPlayer.form,
      upcomingFixtures,
      transferTrend,
      captainOwnership,
      leagueOwnership: null,
    };
  }

  private resolveTargetEvent(events: Event[], gameweekId?: number): Event {
    if (gameweekId) {
      const explicit = events.find((event) => event.id === gameweekId);
      if (explicit) {
        return explicit;
      }
    }

    const current = events.find((event) => !event.finished);
    if (current) {
      return current;
    }

    return events[events.length - 1];
  }

  private buildHeader(
    event: Event,
    fixtures: MatchCenterFixture[],
    leagueRows: LiveLeagueRow[]
  ): GameweekLiveHeader {
    const matchesFinished = fixtures.filter((fixture) => fixture.status === 'ft').length;
    const matchesLive = fixtures.filter(
      (fixture) => fixture.status === 'live' || fixture.status === 'ht'
    ).length;
    const matchesRemaining = fixtures.filter((fixture) => fixture.status === 'upcoming').length;

    const averageScore =
      leagueRows.length > 0
        ? Number(
            (
              leagueRows.reduce((sum, row) => sum + row.gameweekPoints, 0) / leagueRows.length
            ).toFixed(2)
          )
        : event.average_entry_score;

    const highestScore =
      leagueRows.length > 0
        ? Math.max(...leagueRows.map((row) => row.gameweekPoints))
        : (event.top_element_info?.points ?? null);

    return {
      currentGameweek: event.id,
      matchesFinished,
      matchesLive,
      matchesRemaining,
      averageScore: averageScore ?? null,
      highestScore,
      deadlineIso: event.deadline_time ?? null,
      deadlineCountdownLabel: this.formatCountdown(event.deadline_time),
      lastSyncIso: new Date().toISOString(),
      phase: this.resolveGameweekPhase(event, fixtures),
    };
  }

  private resolveGameweekPhase(
    event: Event,
    fixtures: MatchCenterFixture[]
  ): GameweekLiveHeader['phase'] {
    const now = Date.now();
    const deadline = event.deadline_time ? new Date(event.deadline_time).getTime() : Number.NaN;
    const beforeDeadline = !Number.isNaN(deadline) && now < deadline;
    const hasLive = fixtures.some(
      (fixture) => fixture.status === 'live' || fixture.status === 'ht'
    );
    const allFinished = fixtures.length > 0 && fixtures.every((fixture) => fixture.status === 'ft');

    if (hasLive) return 'LIVE';
    if (event.finished && event.data_checked) return 'FINAL';
    if (allFinished || event.finished) return 'PROVISIONAL';
    if (!beforeDeadline) return 'LOCKED';
    return event.id === 1 ? 'PRESEASON' : 'PRE_DEADLINE';
  }

  private buildManagerSummary(
    entry: FantasyEntry | null,
    picks: FantasyGameweekPicks | null,
    liveTeam: LiveTeamView | null,
    leagueRows: LiveLeagueRow[],
    bootstrap: Awaited<ReturnType<FplClient['getBootstrap']>>
  ): LiveManagerSummary | null {
    if (!entry) return null;
    const playerById = new Map(bootstrap.elements.map((player) => [player.id, player.web_name]));
    const captain = picks?.picks.find((pick) => pick.isCaptain);
    const viceCaptain = picks?.picks.find((pick) => pick.isViceCaptain);
    const leagueRow = leagueRows.find((row) => row.entryId === entry.id);

    return {
      teamName: entry.team.name,
      managerName: entry.manager.name,
      gameweekPoints: liveTeam?.currentPoints ?? entry.manager.currentGameweekPoints ?? 0,
      overallPoints: entry.manager.totalPoints ?? 0,
      overallRank: entry.manager.overallRank ?? null,
      liveRank: leagueRow?.liveRank ?? null,
      transferCost: picks?.transfersCost ?? 0,
      activeChip: picks?.activeChip ?? null,
      captainName: captain ? (playerById.get(captain.element) ?? null) : null,
      viceCaptainName: viceCaptain ? (playerById.get(viceCaptain.element) ?? null) : null,
      teamValue: picks ? (Number.isFinite(picks.teamValue) ? picks.teamValue : null) : null,
      bank: picks ? (Number.isFinite(picks.bankValue) ? picks.bankValue : null) : null,
    };
  }

  private async buildLiveLeagueView(
    gameweekId: number,
    connectedEntryId: number | null,
    connectedLeagueId: number | null
  ): Promise<{
    leagueId: number | null;
    leagueName: string | null;
    rows: LiveLeagueRow[];
    dataStatus: 'LIVE' | 'STALE' | 'ERROR';
  }> {
    if (!connectedLeagueId) {
      return {
        leagueId: connectedLeagueId,
        leagueName: null,
        rows: [],
        dataStatus: 'ERROR',
      };
    }

    const cacheKey = `worker-live-league:${connectedLeagueId}:${gameweekId}`;

    try {
      const envelope = await this.getResource(
        cacheKey,
        () => this.fplClient.getLiveLeague(connectedLeagueId, gameweekId),
        { ttlMs: 15_000, forceRefresh: true }
      );
      if (!envelope.data) throw new Error(envelope.error ?? 'Live league unavailable');
      const liveResult = envelope.data;

      const highestGameweekPoints =
        liveResult.members.length > 0
          ? Math.max(...liveResult.members.map((row) => row.liveGameweekPoints))
          : 0;

      const rows = liveResult.members.map((row) => ({
        entryId: row.entryId,
        rank: row.rank ?? row.liveRank,
        liveRank: row.liveRank,
        managerName: row.managerName,
        teamName: row.teamName,
        gameweekPoints: row.liveGameweekPoints,
        totalPoints: row.liveTotalPoints,
        rankMovement: row.rankMovement ?? 0,
        isHighestScorer: row.liveGameweekPoints === highestGameweekPoints,
        captainName: null,
        chipUsed: null,
        benchPoints: 0,
        isConnectedManager: connectedEntryId === row.entryId,
      }));

      return {
        leagueId: connectedLeagueId,
        leagueName: liveResult.leagueName,
        rows,
        dataStatus: envelope.dataStatus,
      };
    } catch {
      const previous = this.cache.get(cacheKey) as
        CachedResource<Awaited<ReturnType<FplClient['getLiveLeague']>>> | undefined;

      if (previous?.data.data) {
        const liveResult = previous.data.data;
        const highestGameweekPoints =
          liveResult.members.length > 0
            ? Math.max(...liveResult.members.map((row) => row.liveGameweekPoints))
            : 0;

        return {
          leagueId: connectedLeagueId,
          leagueName: liveResult.leagueName,
          rows: liveResult.members.map((row) => ({
            entryId: row.entryId,
            rank: row.rank ?? row.liveRank,
            liveRank: row.liveRank,
            managerName: row.managerName,
            teamName: row.teamName,
            gameweekPoints: row.liveGameweekPoints,
            totalPoints: row.liveTotalPoints,
            rankMovement: row.rankMovement ?? 0,
            isHighestScorer: row.liveGameweekPoints === highestGameweekPoints,
            captainName: null,
            chipUsed: null,
            benchPoints: 0,
            isConnectedManager: connectedEntryId === row.entryId,
          })),
          dataStatus: 'STALE',
        };
      }

      return {
        leagueId: connectedLeagueId,
        leagueName: null,
        rows: [],
        dataStatus: 'ERROR',
      };
    }
  }

  private buildLiveTeamView(
    fixtures: MatchCenterFixture[],
    eventLive: EventLiveData,
    bootstrap: Awaited<ReturnType<FplClient['getBootstrap']>>,
    picks: FantasyGameweekPicks | null
  ): LiveTeamView | null {
    if (!picks) {
      return null;
    }

    const playerById = new Map(bootstrap.elements.map((player) => [player.id, player]));
    const teamById = new Map(bootstrap.teams.map((team) => [team.id, team]));
    const positionById = new Map(
      bootstrap.element_types.map((position) => [position.id, position])
    );
    const liveById = new Map(eventLive.elements.map((entry) => [entry.id, entry.stats]));

    const cards: LiveTeamPlayerCard[] = picks.picks.map((pick) => {
      const player = playerById.get(pick.element);
      const live = liveById.get(pick.element);
      const team = player ? teamById.get(player.team) : null;
      const position = player ? positionById.get(player.element_type) : null;
      const fixture = player
        ? fixtures.find(
            (candidate) =>
              candidate.homeTeamId === player.team || candidate.awayTeamId === player.team
          )
        : null;

      const currentFixture = fixture
        ? fixture.homeTeamId === player?.team
          ? `${fixture.awayTeamShortName} (H)`
          : `${fixture.homeTeamShortName} (A)`
        : 'No fixture';

      const remainingFixture =
        fixture && fixture.status === 'upcoming'
          ? 'Remaining'
          : fixture && (fixture.status === 'live' || fixture.status === 'ht')
            ? 'In progress'
            : fixture && fixture.status === 'ft'
              ? 'Complete'
              : 'Unknown';

      const multiplier = pick.multiplier;
      const currentPoints = (live?.total_points ?? 0) * multiplier;
      const bonusPending = Math.max(0, Math.round((live?.bps ?? 0) / 12) - (live?.bonus ?? 0));
      const expectedPoints =
        currentPoints +
        (fixture && (fixture.status === 'live' || fixture.status === 'ht')
          ? Math.max(0, Math.round((90 - Math.min(90, live?.minutes ?? 0)) / 25))
          : 0) +
        Math.round(bonusPending * 0.5);

      return {
        playerId: pick.element,
        playerName: player?.web_name ?? `Player ${pick.element}`,
        playerCode: player?.code ?? 0,
        positionLabel: position?.singular_name ?? 'UNK',
        teamId: player?.team ?? 0,
        teamShortName: team?.short_name ?? 'UNK',
        isCaptain: pick.isCaptain,
        isViceCaptain: pick.isViceCaptain,
        isBench: pick.position > 11,
        multiplier,
        minutes: live?.minutes ?? 0,
        livePoints: currentPoints,
        expectedPoints,
        bonus: live?.bonus ?? 0,
        bonusPending,
        goals: live?.goals_scored ?? 0,
        assists: live?.assists ?? 0,
        yellowCards: live?.yellow_cards ?? 0,
        redCards: live?.red_cards ?? 0,
        cardStatus:
          (live?.red_cards ?? 0) > 0 ? 'red' : (live?.yellow_cards ?? 0) > 0 ? 'yellow' : 'none',
        status: fixture?.status ?? 'upcoming',
        currentFixture,
        remainingFixture,
      };
    });

    const starters = cards.filter((card) => !card.isBench);
    const bench = cards.filter((card) => card.isBench);

    const currentPoints = cards.reduce((sum, card) => sum + card.livePoints, 0);
    const projectedPoints = cards.reduce((sum, card) => sum + card.expectedPoints, 0);
    const bonusPending = cards.reduce((sum, card) => sum + card.bonusPending, 0);
    const captainMultiplierPoints = cards
      .filter((card) => card.isCaptain)
      .reduce((sum, card) => sum + card.livePoints, 0);
    const benchPoints = bench.reduce((sum, card) => sum + card.livePoints, 0);

    const autosubPrediction = this.buildAutosubPrediction(starters, bench);

    return {
      starters,
      bench,
      currentPoints,
      projectedPoints,
      bonusPending,
      captainMultiplierPoints,
      benchPoints,
      autosubPrediction,
    };
  }

  private buildAutosubPrediction(
    starters: LiveTeamPlayerCard[],
    bench: LiveTeamPlayerCard[]
  ): string[] {
    const noShowStarters = starters.filter(
      (starter) => starter.minutes === 0 && starter.status === 'ft'
    );
    const activeBench = bench.filter((reserve) => reserve.minutes > 0);

    if (noShowStarters.length === 0 || activeBench.length === 0) {
      return [];
    }

    return noShowStarters.slice(0, activeBench.length).map((starter, index) => {
      const reserve = activeBench[index];
      return `${reserve.playerName} for ${starter.playerName}`;
    });
  }

  private buildFixtureCards(
    fixtures: FPLFixture[],
    eventLive: EventLiveData,
    bootstrap: Awaited<ReturnType<FplClient['getBootstrap']>>,
    picks: FantasyGameweekPicks | null
  ): MatchCenterFixture[] {
    const teamById = new Map(bootstrap.teams.map((team) => [team.id, team]));
    const liveByPlayerId = new Map(eventLive.elements.map((entry) => [entry.id, entry.stats]));
    const pickByPlayerId = new Map((picks?.picks ?? []).map((pick) => [pick.element, pick]));

    const mappedFixtures: MatchCenterFixture[] = [];

    fixtures.forEach((fixture) => {
      const homeTeam = teamById.get(fixture.team_h);
      const awayTeam = teamById.get(fixture.team_a);
      if (!homeTeam || !awayTeam) {
        return;
      }

      const status = this.getFixtureStatusBadge(fixture);
      const elapsedMinute = fixture.minutes ?? null;
      const stoppageTime = null;

      const fixturePlayers = bootstrap.elements.filter(
        (player) => player.team === fixture.team_h || player.team === fixture.team_a
      );

      const timeline = this.buildTimeline(fixture, fixturePlayers, liveByPlayerId, teamById);
      const playerStats: MatchPlayerStat[] = fixturePlayers
        .map((player) => {
          const live = liveByPlayerId.get(player.id);
          return {
            playerId: player.id,
            playerName: player.web_name,
            playerCode: player.code ?? 0,
            teamId: player.team,
            teamShortName: teamById.get(player.team)?.short_name ?? 'UNK',
            minutes: live?.minutes ?? 0,
            goals: live?.goals_scored ?? 0,
            assists: live?.assists ?? 0,
            ownGoals: live?.own_goals ?? 0,
            penaltiesSaved: live?.penalties_saved ?? 0,
            penaltiesMissed: live?.penalties_missed ?? 0,
            yellowCards: live?.yellow_cards ?? 0,
            redCards: live?.red_cards ?? 0,
            saves: live?.saves ?? 0,
            bonus: live?.bonus ?? 0,
            bps: live?.bps ?? 0,
            totalPoints: live?.total_points ?? 0,
          };
        })
        .filter((player) => player.minutes > 0 || player.goals > 0 || player.assists > 0 || player.totalPoints !== 0)
        .sort((left, right) => right.totalPoints - left.totalPoints || right.bps - left.bps);
      const ownedPlayers = this.buildOwnedPlayerLive(
        status,
        fixturePlayers,
        liveByPlayerId,
        pickByPlayerId,
        teamById
      );

      mappedFixtures.push({
        id: fixture.id,
        kickoffTime: fixture.kickoff_time,
        status,
        period: this.getFixturePeriod(status, elapsedMinute),
        elapsedMinute,
        stoppageTime,
        venue: null as string | null,
        referee: null as string | null,
        homeTeamId: homeTeam.id,
        homeTeamName: homeTeam.name,
        homeTeamShortName: homeTeam.short_name,
        homeTeamCode: homeTeam.code,
        awayTeamId: awayTeam.id,
        awayTeamName: awayTeam.name,
        awayTeamShortName: awayTeam.short_name,
        awayTeamCode: awayTeam.code,
        homeScore: fixture.team_h_score,
        awayScore: fixture.team_a_score,
        difficulty: Number(
          ((fixture.team_h_difficulty + fixture.team_a_difficulty) / 2).toFixed(1)
        ),
        timeline,
        ownedPlayers,
        playerStats,
      });
    });

    return mappedFixtures.sort((a, b) => {
      const statusRank = (status: LiveStatusBadge): number => {
        if (status === 'live' || status === 'ht') return 0;
        if (status === 'upcoming') return 1;
        return 2;
      };
      const rankDelta = statusRank(a.status) - statusRank(b.status);
      if (rankDelta !== 0) {
        return rankDelta;
      }
      return new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime();
    });
  }

  private buildTimeline(
    fixture: FPLFixture,
    fixturePlayers: Array<{ id: number; web_name: string; team: number }>,
    liveByPlayerId: Map<number, EventLiveData['elements'][number]['stats']>,
    teamById: Map<number, { short_name: string }>
  ): MatchTimelineEvent[] {
    const events: MatchTimelineEvent[] = [];

    fixturePlayers.forEach((player) => {
      const live = liveByPlayerId.get(player.id);
      if (!live) {
        return;
      }

      // FPL exposes aggregate player minutes, not event timestamps. Keep the
      // activity timestamp empty rather than presenting an invented minute.
      const minute = null;
      const teamShortName = teamById.get(player.team)?.short_name ?? 'UNK';

      const pushEvent = (type: MatchEventType, label: string, quantity: number): void => {
        if (quantity <= 0) {
          return;
        }

        events.push({
          id: `${fixture.id}-${player.id}-${type}`,
          minute,
          type,
          label,
          playerId: player.id,
          playerName: player.web_name,
          teamId: player.team,
          teamShortName,
          quantity,
        });
      };

      pushEvent('goal', 'Goal', live.goals_scored ?? 0);
      pushEvent('assist', 'Assist', live.assists ?? 0);
      pushEvent('yellow', 'Yellow card', live.yellow_cards ?? 0);
      pushEvent('red', 'Red card', live.red_cards ?? 0);
      pushEvent('own_goal', 'Own goal', live.own_goals ?? 0);
      pushEvent('penalty_missed', 'Penalty missed', live.penalties_missed ?? 0);
      pushEvent('bonus_change', 'Bonus change', live.bonus ?? 0);

      // The public FPL feed does not expose substitutions as discrete events.
      // Player minutes alone are insufficient to infer them reliably.
    });

    return events
      .sort((a, b) => {
        const minuteA = a.minute ?? 999;
        const minuteB = b.minute ?? 999;
        return minuteA - minuteB;
      })
      .slice(0, 120);
  }

  private buildOwnedPlayerLive(
    fixtureStatus: LiveStatusBadge,
    fixturePlayers: Array<{ id: number; web_name: string; team: number }>,
    liveByPlayerId: Map<number, EventLiveData['elements'][number]['stats']>,
    pickByPlayerId: Map<number, FantasyGameweekPicks['picks'][number]>,
    teamById: Map<number, { short_name: string }>
  ): MatchOwnedPlayerLive[] {
    return fixturePlayers
      .filter((player) => pickByPlayerId.has(player.id))
      .map((player) => {
        const pick = pickByPlayerId.get(player.id)!;
        const live = liveByPlayerId.get(player.id);

        const rawPoints = live?.total_points ?? 0;
        const currentPoints = rawPoints * pick.multiplier;
        const bonusPending = Math.max(0, Math.round((live?.bps ?? 0) / 12) - (live?.bonus ?? 0));
        const projectedPoints =
          currentPoints +
          (fixtureStatus === 'live' || fixtureStatus === 'ht'
            ? Math.max(0, Math.round((90 - Math.min(90, live?.minutes ?? 0)) / 30))
            : 0) +
          Math.round(bonusPending * 0.5);

        return {
          playerId: player.id,
          playerName: player.web_name,
          teamShortName: teamById.get(player.team)?.short_name ?? 'UNK',
          isCaptain: pick.isCaptain,
          isViceCaptain: pick.isViceCaptain,
          multiplier: pick.multiplier,
          isBench: pick.position > 11,
          minutes: live?.minutes ?? 0,
          currentPoints,
          projectedPoints,
          bonusPending,
        };
      })
      .sort((a, b) => b.currentPoints - a.currentPoints);
  }

  private getFixtureStatusBadge(fixture: FPLFixture): LiveStatusBadge {
    if (fixture.finished) {
      return 'ft';
    }

    if (!fixture.started) {
      return 'upcoming';
    }

    const elapsed = fixture.minutes ?? null;
    if (elapsed === 45) {
      return 'ht';
    }

    return 'live';
  }

  private getFixturePeriod(
    status: LiveStatusBadge,
    elapsedMinute: number | null
  ): MatchCenterFixture['period'] {
    if (status === 'upcoming') return 'NS';
    if (status === 'ft') return 'FT';
    if (status === 'postponed') return 'PPD';
    if (status === 'suspended') return 'SUS';
    if (status === 'ht') return 'HT';
    if (elapsedMinute !== null && elapsedMinute >= 46) return '2H';
    return '1H';
  }

  private buildTeamForm(teamId: number): string {
    const fixtures = this.fixtureRepository
      .getByTeam(teamId)
      .filter((fixture) => fixture.finished)
      .slice(-5);

    if (fixtures.length === 0) {
      return 'N/A';
    }

    return fixtures
      .map((fixture) => {
        const isHome = fixture.homeTeam.id === teamId;
        const goalsFor = isHome ? (fixture.homeTeamScore ?? 0) : (fixture.awayTeamScore ?? 0);
        const goalsAgainst = isHome ? (fixture.awayTeamScore ?? 0) : (fixture.homeTeamScore ?? 0);
        if (goalsFor > goalsAgainst) return 'W';
        if (goalsFor < goalsAgainst) return 'L';
        return 'D';
      })
      .join('');
  }

  private formatCountdown(deadlineIso: string): string {
    const deadline = new Date(deadlineIso).getTime();
    const now = Date.now();
    if (Number.isNaN(deadline)) {
      return 'Deadline unavailable';
    }

    const delta = deadline - now;
    if (delta <= 0) {
      return 'Deadline passed';
    }

    const totalMinutes = Math.floor(delta / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return `${days}d ${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  }

  private async getResource<T>(
    key: string,
    loader: () => Promise<T>,
    options?: {
      ttlMs?: number;
      forceRefresh?: boolean;
      changedResources?: string[];
    }
  ): Promise<T> {
    const ttlMs = options?.ttlMs ?? 0;
    const forceRefresh = options?.forceRefresh ?? false;
    const now = Date.now();
    const current = this.cache.get(key) as CachedResource<T> | undefined;

    if (!forceRefresh && current && ttlMs > 0 && now - current.updatedAt < ttlMs) {
      return current.data;
    }

    const pending = this.inFlight.get(key) as Promise<T> | undefined;
    if (pending) {
      return pending;
    }

    const request = loader()
      .then((data) => {
        const nextHash = this.hash(data);
        const previous = this.cache.get(key) as CachedResource<T> | undefined;

        if (!previous || previous.hash !== nextHash) {
          this.cache.set(key, {
            data,
            hash: nextHash,
            updatedAt: now,
          });
          options?.changedResources?.push(key);
          return data;
        }

        this.cache.set(key, {
          ...previous,
          updatedAt: now,
        });
        return previous.data;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, request);
    return request;
  }

  private hash(data: unknown): string {
    try {
      return JSON.stringify(data);
    } catch {
      return `${Date.now()}`;
    }
  }
}
