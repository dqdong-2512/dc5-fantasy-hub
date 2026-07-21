/**
 * Live Gameweek Engine Service
 * Centralizes live gameweek data orchestration
 *
 * Combines:
 * - Manager picks
 * - Player live data
 * - Captain/vice-captain state
 * - Chip state
 * - Fixture status
 * - Transfer cost
 *
 * Into a consistent manager gameweek view with official vs live/provisional points distinction
 */

import { FplClient } from './fpl-client';
import { BootstrapRepository } from '@repositories/bootstrap';
import { FantasyGameRepository } from '@repositories/fantasy';
import { FixtureRepository } from '@repositories/fixtures';
import { PlayerRepository } from '@repositories/players';
import type { Fixture, FantasyGameweekHistory } from '@domain/models';
import { FixtureStatus } from '@domain/enums';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Game status based on fixtures and event state
 */
export type GameStatus = 'upcoming' | 'live' | 'finished';

/**
 * Match status for individual players
 */
export type MatchStatus = 'not_started' | 'in_progress' | 'finished' | 'unknown';

/**
 * Player live performance with contribution breakdown
 */
export interface LivePlayerPerformance {
  playerId: number;
  playerName: string;
  position: string;
  teamId: number;
  teamName: string;
  fixtureId: number | null;
  opponent: string | null;
  matchStatus: MatchStatus;

  // Raw live stats
  minutes: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  ownGoals: number;
  penaltiesSaved: number;
  penaltiesMissed: number;
  yellowCards: number;
  redCards: number;
  bonus: number;
  bps: number; // Bonus points system score

  // Point calculations
  basePoints: number; // Points before multiplier
  multiplier: 1 | 2 | 3 | 0; // 1=normal, 2=captain, 3=triple captain, 0=bench
  finalPoints: number; // Points after multiplier

  // Squad status
  isCaptain: boolean;
  isViceCaptain: boolean;
  isBench: boolean;
  isStarter: boolean;
  benchPosition: number | null;
}

/**
 * Squad section with aggregated stats
 */
export interface SquadSection {
  players: LivePlayerPerformance[];
  totalBasePoints: number;
  totalFinalPoints: number;
  playerCount: number;
}

/**
 * Live gameweek performance summary
 */
export interface LiveGameweekPerformance {
  eventId: number;
  gameStatus: GameStatus;
  lastUpdated: Date;

  // Squad sections
  starters: SquadSection;
  bench: SquadSection;
  captain: LivePlayerPerformance | null;
  viceCaptain: LivePlayerPerformance | null;

  // Squad totals
  squadBasePoints: number; // Before multipliers
  squadFinalPoints: number; // After multipliers
  captainPoints: number; // Captain contribution
  benchPoints: number; // Bench contribution

  // Transfer impact
  transfersMade: number;
  transfersCost: number;
  bankValue: number;
  teamValue: number;

  // Chip state
  activeChip: string | null;

  // Final totals
  provisionalGameweekPoints: number; // Current calculated points
  officialGameweekPoints: number | null; // If gameweek finished
  netGameweekPoints: number; // Provisional minus transfer cost

  // Derived state
  isLive: boolean; // Whether gameweek is currently live
  isFinished: boolean; // Whether gameweek is finished (official points available)
}

/**
 * Live event (goal, assist, etc) for impact feed
 */
export interface LiveEvent {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  eventType: 'goal' | 'assist' | 'clean_sheet' | 'card' | 'save' | 'bonus' | 'own_goal';
  points: number;
  timestamp: string; // ISO format or 'unknown' if time not available
  description: string;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export class LiveGameweekEngine {
  private fplClient: FplClient;
  private bootstrapRepo: BootstrapRepository;
  private fantasyGameRepo: FantasyGameRepository;
  private fixtureRepo: FixtureRepository;
  private playerRepo: PlayerRepository;

  constructor() {
    this.fplClient = new FplClient();
    this.bootstrapRepo = new BootstrapRepository();
    this.fantasyGameRepo = new FantasyGameRepository();
    this.fixtureRepo = new FixtureRepository();
    this.playerRepo = new PlayerRepository();
  }

  /**
   * Calculate live gameweek performance for a manager's picks
   *
   * @param entryId - FPL entry ID
   * @param eventId - Gameweek ID
   * @param officialHistory - Optional official history for comparison
   * @returns Live performance summary
   */
  async calculateLivePerformance(
    entryId: number,
    eventId: number,
    officialHistory?: FantasyGameweekHistory
  ): Promise<LiveGameweekPerformance> {
    // 1. Fetch manager picks for this gameweek
    const picks = await this.fantasyGameRepo.getEntryPicks(entryId, eventId);
    if (!picks) {
      throw new Error(`Unable to fetch picks for entry ${entryId} event ${eventId}`);
    }

    // 2. Fetch live player data for this gameweek
    const eventLive = await this.fplClient.getEventLive(eventId);

    // 3. Create player live map for quick lookup
    const playerLiveMap = new Map(
      eventLive.elements.map((el) => [
        el.id,
        {
          minutes: el.stats.minutes || 0,
          goals_scored: el.stats.goals_scored || 0,
          assists: el.stats.assists || 0,
          clean_sheets: el.stats.clean_sheets || 0,
          goals_conceded: el.stats.goals_conceded || 0,
          own_goals: el.stats.own_goals || 0,
          penalties_saved: el.stats.penalties_saved || 0,
          penalties_missed: el.stats.penalties_missed || 0,
          yellow_cards: el.stats.yellow_cards || 0,
          red_cards: el.stats.red_cards || 0,
          bonus: el.stats.bonus || 0,
          bps: el.stats.bps || 0,
          total_points: el.stats.total_points || 0,
        },
      ])
    );

    // 4. Get bootstrap for current gameweek status
    const bootstrap = this.bootstrapRepo.getBootstrap();
    const currentGw = bootstrap.gameweeks.find((gw) => gw.id === eventId);
    const gameStatus = this.determineGameStatus(currentGw, eventLive.state);

    // 5. Get fixtures for match status lookup
    const fixtures = this.fixtureRepo.getAll();

    // 6. Enrich each pick with live data
    const enrichedPicks = picks.picks.map((pick) =>
      this.enrichPickWithLiveData(pick, playerLiveMap, fixtures, picks.activeChip ?? null)
    );

    // 7. Separate starters and bench
    const starters = enrichedPicks.filter((p) => p.isStarter);
    const bench = enrichedPicks.filter((p) => p.isBench);

    // 8. Find captain and vice-captain
    const captain = enrichedPicks.find((p) => p.isCaptain) || null;
    const viceCaptain = enrichedPicks.find((p) => p.isViceCaptain) || null;

    // 9. Calculate aggregates
    const startersSection = this.createSquadSection(starters);
    const benchSection = this.createSquadSection(bench);

    const squadBasePoints = startersSection.totalBasePoints + benchSection.totalBasePoints;
    const squadFinalPoints = startersSection.totalFinalPoints + benchSection.totalFinalPoints;
    const captainPoints = captain?.finalPoints ?? 0;
    const benchPoints = benchSection.totalFinalPoints;

    // 10. Calculate net points (with transfer cost)
    const provisionalGameweekPoints = squadFinalPoints;
    const netGameweekPoints = provisionalGameweekPoints - picks.transfersCost;

    // 11. Determine official points (if finished)
    const isFinished = gameStatus === 'finished';
    const officialGameweekPoints = isFinished ? (officialHistory?.points ?? null) : null;

    return {
      eventId,
      gameStatus,
      lastUpdated: new Date(),

      // Squad sections
      starters: startersSection,
      bench: benchSection,
      captain,
      viceCaptain,

      // Squad totals
      squadBasePoints,
      squadFinalPoints,
      captainPoints,
      benchPoints,

      // Transfer impact
      transfersMade: picks.transfersMade,
      transfersCost: picks.transfersCost,
      bankValue: picks.bankValue,
      teamValue: picks.teamValue,

      // Chip state
      activeChip: picks.activeChip ?? null,

      // Final totals
      provisionalGameweekPoints,
      officialGameweekPoints,
      netGameweekPoints,

      // Derived state
      isLive: gameStatus === 'live',
      isFinished,
    };
  }

  /**
   * Calculate differential impact for two managers for same gameweek
   *
   * @param myPerformance - Connected manager's live performance
   * @param opponentPerformance - Opponent manager's live performance
   * @returns Differential impact breakdown
   */
  calculateDifferentialImpact(
    myPerformance: LiveGameweekPerformance,
    opponentPerformance: LiveGameweekPerformance
  ): {
    myPoints: number;
    opponentPoints: number;
    netImpact: number;
    differentials: Array<{
      playerId: number;
      playerName: string;
      myMultiplier: number;
      opponentMultiplier: number;
      playerPoints: number;
      impact: number; // Positive = helps me
    }>;
  } {
    // Create player point maps
    const myPlayerMap = new Map<number, { name: string; points: number; multiplier: number }>();
    const opponentPlayerMap = new Map<
      number,
      { name: string; points: number; multiplier: number }
    >();

    // Populate maps from all players
    [...myPerformance.starters.players, ...myPerformance.bench.players].forEach((p) => {
      myPlayerMap.set(p.playerId, {
        name: p.playerName,
        points: p.basePoints,
        multiplier: p.multiplier,
      });
    });

    [...opponentPerformance.starters.players, ...opponentPerformance.bench.players].forEach((p) => {
      opponentPlayerMap.set(p.playerId, {
        name: p.playerName,
        points: p.basePoints,
        multiplier: p.multiplier,
      });
    });

    // Find all players involved
    const allPlayerIds = new Set([...myPlayerMap.keys(), ...opponentPlayerMap.keys()]);

    // Calculate differential impact for each player
    const differentials = Array.from(allPlayerIds)
      .map((playerId) => {
        const myData = myPlayerMap.get(playerId) || { name: 'Unknown', points: 0, multiplier: 0 };
        const opponentData = opponentPlayerMap.get(playerId) || {
          name: 'Unknown',
          points: 0,
          multiplier: 0,
        };

        const playerPoints = myData.points; // Base points
        const impact = (myData.multiplier - opponentData.multiplier) * playerPoints;

        return {
          playerId,
          playerName: myData.name,
          myMultiplier: myData.multiplier,
          opponentMultiplier: opponentData.multiplier,
          playerPoints,
          impact,
        };
      })
      .filter((d) => d.impact !== 0)
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    const totalImpact = differentials.reduce((sum, d) => sum + d.impact, 0);

    return {
      myPoints: myPerformance.provisionalGameweekPoints,
      opponentPoints: opponentPerformance.provisionalGameweekPoints,
      netImpact: totalImpact,
      differentials,
    };
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  /**
   * Determine overall game status from gameweek and event state
   */
  private determineGameStatus(gw: any | undefined, eventState: string): GameStatus {
    if (!gw) return 'unknown' as any;

    if (gw.finished) return 'finished';
    if (eventState === 'live') return 'live';
    if (eventState === 'pre') return 'upcoming';

    // Fallback: check if deadline passed
    const now = new Date();
    const deadline = new Date(gw.deadline);
    if (now < deadline) return 'upcoming';

    return 'live'; // Between deadline and finish
  }

  /**
   * Enrich a single pick with live data
   */
  private enrichPickWithLiveData(
    pick: any,
    playerLiveMap: Map<number, any>,
    fixtures: Fixture[],
    activeChip: string | null
  ): LivePlayerPerformance {
    const playerId = pick.element;
    const player = this.playerRepo.getById(playerId);
    const liveStats = playerLiveMap.get(playerId) || {
      minutes: 0,
      goals_scored: 0,
      assists: 0,
      clean_sheets: 0,
      goals_conceded: 0,
      own_goals: 0,
      penalties_saved: 0,
      penalties_missed: 0,
      yellow_cards: 0,
      red_cards: 0,
      bonus: 0,
      bps: 0,
      total_points: 0,
    };

    // Determine fixture and opponent
    const fixture = fixtures.find(
      (f) => player && (f.homeTeam.id === player.clubCode || f.awayTeam.id === player.clubCode)
    );
    const opponent =
      fixture && player
        ? fixture.homeTeam.id === player.clubCode
          ? fixture.awayTeam
          : fixture.homeTeam
        : null;

    // Determine match status
    const matchStatus = this.getMatchStatus(fixture);

    // Calculate multiplier
    const isCaptain = pick.is_captain;
    const isViceCaptain = pick.is_vice_captain;
    const isBench = pick.position > 11;

    let multiplier: 1 | 2 | 3 | 0 = 1;
    if (isBench) {
      multiplier = activeChip === 'BB' ? 1 : 0;
    } else if (isCaptain) {
      multiplier = activeChip === 'TC' ? 3 : 2;
    }

    // Calculate base points (without multiplier)
    const basePoints = liveStats.total_points;
    const finalPoints = basePoints * multiplier;

    return {
      playerId,
      playerName: player?.displayName || `Player ${playerId}`,
      position: player?.position || 'Unknown',
      teamId: 0, // Placeholder - Player model doesn't have direct team ID
      teamName: player?.club || 'Unknown',
      fixtureId: fixture?.id || null,
      opponent: opponent?.name || null,
      matchStatus,

      minutes: liveStats.minutes,
      goalsScored: liveStats.goals_scored,
      assists: liveStats.assists,
      cleanSheets: liveStats.clean_sheets,
      goalsConceded: liveStats.goals_conceded,
      ownGoals: liveStats.own_goals,
      penaltiesSaved: liveStats.penalties_saved,
      penaltiesMissed: liveStats.penalties_missed,
      yellowCards: liveStats.yellow_cards,
      redCards: liveStats.red_cards,
      bonus: liveStats.bonus,
      bps: liveStats.bps,

      basePoints,
      multiplier,
      finalPoints,

      isCaptain,
      isViceCaptain,
      isBench,
      isStarter: pick.position <= 11,
      benchPosition: isBench ? pick.position - 11 : null,
    };
  }

  /**
   * Get match status for a fixture
   */
  private getMatchStatus(fixture: Fixture | undefined): MatchStatus {
    if (!fixture) return 'unknown';

    if (fixture.status === FixtureStatus.Finished) return 'finished';
    if (fixture.status === FixtureStatus.Live) return 'in_progress';
    if (fixture.status === FixtureStatus.Upcoming) return 'not_started';

    return 'unknown';
  }

  /**
   * Create a squad section summary
   */
  private createSquadSection(players: LivePlayerPerformance[]): SquadSection {
    return {
      players,
      totalBasePoints: players.reduce((sum, p) => sum + p.basePoints, 0),
      totalFinalPoints: players.reduce((sum, p) => sum + p.finalPoints, 0),
      playerCount: players.length,
    };
  }
}
