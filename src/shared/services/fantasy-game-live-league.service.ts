/**
 * Fantasy Game Live League Service
 * Orchestrates live scoring for multiple managers in a league
 * Reuses FantasyGameLiveService for individual scoring
 */

import type {
  FantasyLeagueStanding,
  FantasyGameweekPicks,
  LiveManagerScore,
  LiveLeagueStanding,
  LiveLeagueStandingsResult,
} from '@domain/models';
import { FantasyGameLiveService } from './fantasy-game-live.service';
import type { EventLiveData } from './fpl-client';
import { FplClient } from './fpl-client';

/**
 * Manages parallel request concurrency without external libraries
 */
class ConcurrencyController {
  private running = 0;

  constructor(private readonly limit: number = 5) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.limit) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
    }
  }
}

export class FantasyGameLiveLeagueService {
  private liveService = new FantasyGameLiveService();
  private fplClient: FplClient;
  private concurrency = new ConcurrencyController(5); // Max 5 parallel requests

  constructor(fplClient?: FplClient) {
    this.fplClient = fplClient || new FplClient();
  }

  /**
   * Calculate live league standings
   * Fetches picks for each manager and calculates live scores
   * @param standings - Official league standings
   * @param gameweekId - Current gameweek
   * @param connectedEntryId - Currently connected entry ID (for highlighting)
   * @returns Live standings with calculated ranks and movements
   */
  async calculateLiveLeagueStandings(
    standings: FantasyLeagueStanding[],
    gameweekId: number,
    connectedEntryId?: number
  ): Promise<LiveLeagueStandingsResult> {
    // Fetch event live data once for all managers
    let eventLiveData: EventLiveData | undefined;

    try {
      eventLiveData = await this.fplClient.getEventLive(gameweekId);
    } catch (err) {
      // If live data fails, we still calculate but may have incomplete data
      console.warn('Failed to fetch event live data:', err);
    }

    if (!eventLiveData) {
      throw new Error('Unable to fetch event live data');
    }

    // Fetch picks for each manager with concurrency control
    const managerScores: LiveManagerScore[] = [];

    const pickPromises = standings.map((standing) =>
      this.concurrency.run(async () => {
        const score = await this.calculateManagerLiveScore(standing, gameweekId, eventLiveData!);
        managerScores.push(score);
      })
    );

    // Wait for all picks to load
    await Promise.all(pickPromises);

    // Calculate live rankings from valid scores
    const validScores = managerScores
      .filter((s) => s.isLoaded && !s.error)
      .sort((a, b) => b.calculatedLiveTotal - a.calculatedLiveTotal);

    // Assign calculated ranks
    const scoresByEntryId = new Map(managerScores.map((s) => [s.entryId, s]));
    validScores.forEach((score, index) => {
      const manager = scoresByEntryId.get(score.entryId);
      if (manager) {
        manager.calculatedLiveRank = index + 1;
        manager.rankMovement = manager.calculatedLiveRank
          ? (manager.officialRank || 0) - manager.calculatedLiveRank
          : undefined;
      }
    });

    // Convert to league standings format
    const liveStandings: LiveLeagueStanding[] = standings.map((official) => {
      const score = scoresByEntryId.get(official.entryId);

      return {
        officialRank: official.rank,
        officialPrevRank: official.prevRank ?? null,
        entryId: official.entryId,
        playerName: official.playerName,
        teamName: official.teamName,
        officialGameweekPoints: official.eventPoints,
        officialTotalPoints: official.totalPoints,
        liveGameweekPoints: score?.liveGameweekPoints ?? 0,
        calculatedLiveTotal: score?.calculatedLiveTotal ?? 0,
        calculatedLiveRank: score?.calculatedLiveRank,
        rankMovement: score?.rankMovement,
        captainName: score?.captainName,
        captainRawPoints: score?.captainRawPoints,
        captainEffectivePoints: score?.captainEffectivePoints,
        benchPoints: score?.benchPoints ?? 0,
        playersPlayed: score?.playersPlayed ?? 0,
        playersLive: score?.playersLive ?? 0,
        playersRemaining: score?.playersRemaining ?? 0,
        isConnectedUser: connectedEntryId ? official.entryId === connectedEntryId : false,
        isLoaded: score?.isLoaded ?? false,
        error: score?.error,
      };
    });

    // Sort by live rank (valid scores first, then failures)
    liveStandings.sort((a, b) => {
      if (a.isLoaded && !a.error && b.isLoaded && !b.error) {
        return (a.calculatedLiveRank ?? 999) - (b.calculatedLiveRank ?? 999);
      }
      if (a.isLoaded && !a.error) return -1;
      if (b.isLoaded && !b.error) return 1;
      return 0;
    });

    // Calculate page-scoped summary metrics
    const loadedScores = managerScores.filter((s) => s.isLoaded && !s.error);
    const gameweekPoints = loadedScores.map((s) => s.liveGameweekPoints);
    const pageAverage =
      gameweekPoints.length > 0
        ? gameweekPoints.reduce((a, b) => a + b, 0) / gameweekPoints.length
        : 0;
    const pageHighest = gameweekPoints.length > 0 ? Math.max(...gameweekPoints) : 0;
    const pageLowest = gameweekPoints.length > 0 ? Math.min(...gameweekPoints) : 0;

    return {
      leagueId: 0, // Will be set by caller
      leagueName: '',
      gameweekId,
      standings: liveStandings,
      pageAverage: Math.round(pageAverage * 100) / 100,
      pageHighest,
      pageLowest,
      totalManagersOnPage: standings.length,
      successfullyLoadedManagers: loadedScores.length,
      dataState:
        eventLiveData.state === 'live'
          ? 'live'
          : eventLiveData.state === 'post'
            ? 'completed'
            : 'unknown',
      lastUpdated: new Date(),
      isCompleted: eventLiveData.state === 'post',
    };
  }

  /**
   * Calculate live score for a single manager
   * @param standing - Official standing
   * @param gameweekId - Current gameweek
   * @param eventLiveData - Live event data for the gameweek
   * @returns Calculated live score with error handling
   */
  private async calculateManagerLiveScore(
    standing: FantasyLeagueStanding,
    gameweekId: number,
    eventLiveData: EventLiveData
  ): Promise<LiveManagerScore> {
    const baseScore: LiveManagerScore = {
      entryId: standing.entryId,
      playerName: standing.playerName,
      teamName: standing.teamName,
      liveGameweekPoints: 0,
      benchPoints: 0,
      playersPlayed: 0,
      playersLive: 0,
      playersRemaining: 0,
      calculatedLiveTotal: 0,
      officialRank: standing.rank,
      officialPrevRank: standing.prevRank ?? null,
      isLoaded: false,
    };

    try {
      // Fetch picks for this manager
      const picks = await this.fetchManagerPicks(standing.entryId, gameweekId);
      if (!picks) {
        return {
          ...baseScore,
          error: 'Picks unavailable',
        };
      }

      // Calculate squad performance using existing live service
      const squadPerformance = this.liveService.calculateSquadPerformance(
        standing.entryId,
        gameweekId,
        picks,
        eventLiveData
      );

      // Extract captain info from squad
      const captain = squadPerformance.starters.find((p) => p.isCaptain);

      // Calculate live total
      const liveTotal =
        standing.totalPoints +
        squadPerformance.summary.totalPoints -
        standing.eventPoints -
        picks.transfersCost;

      return {
        ...baseScore,
        liveGameweekPoints: squadPerformance.summary.totalPoints,
        captainName: captain?.playerName,
        captainRawPoints: captain?.gameweekPoints,
        captainEffectivePoints: captain?.effectivePoints,
        benchPoints: squadPerformance.summary.benchPoints,
        playersPlayed: squadPerformance.summary.playersPlayed,
        playersLive: squadPerformance.summary.playersLive,
        playersRemaining: squadPerformance.summary.playersRemaining,
        calculatedLiveTotal: liveTotal,
        isLoaded: true,
      };
    } catch (err) {
      return {
        ...baseScore,
        error: err instanceof Error ? err.message : 'Failed to calculate score',
      };
    }
  }

  /**
   * Fetch picks for a manager
   * Separated into own method to allow easy caching/retry in future
   */
  private async fetchManagerPicks(
    entryId: number,
    gameweekId: number
  ): Promise<FantasyGameweekPicks | undefined> {
    try {
      const rawData = await this.fplClient.getEntryPicks(entryId, gameweekId);

      // Map raw API data to domain model
      return this.mapRawPicksToModel(rawData, entryId, gameweekId);
    } catch (err) {
      console.warn(`Failed to fetch picks for entry ${entryId}:`, err);
      return undefined;
    }
  }

  /**
   * Map raw FPL picks API data to domain model
   */
  private mapRawPicksToModel(data: any, entryId: number, eventId: number): FantasyGameweekPicks {
    const picks = data.picks.map((pick: any) => ({
      element: pick.element,
      position: pick.position,
      multiplier: pick.multiplier,
      isCaptain: pick.is_captain,
      isViceCaptain: pick.is_vice_captain,
      isBench: pick.position > 11,
      benchOrder: pick.position > 11 ? pick.position - 11 : undefined,
    }));

    return {
      eventId,
      entryId,
      picks,
      transfersMade: data.entry_history.event_transfers ?? 0,
      transfersCost: data.entry_history.event_transfers_cost ?? 0,
      bankValue: data.entry_history.bank ?? 0,
      teamValue: data.entry_history.value ?? 0,
      status: 'active',
      activeChip: data.active_chip ?? null,
      autoSubs: (data.automatic_subs ?? []).map((sub: any) => ({
        elementIn: sub.element_in,
        elementOut: sub.element_out,
        subOrder: sub.sub_order,
      })),
    };
  }
}
