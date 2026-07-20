/**
 * Pick Enrichment Service
 * Enriches manager picks with real-time player performance data
 * Integrates EventLive data to calculate actual points scored
 *
 * API ARCHITECTURE NOTE:
 * This service directly instantiates FplClient to fetch EventLive data.
 * This is appropriate for a service layer that enriches domain data with real-time API results.
 *
 * Data flow:
 * UI Hook (useEnrichedManagerPicks)
 *   → PickEnrichmentService.enrichPicks()
 *   → FplClient.getEventLive()
 *   → /event/{eventId}/live endpoint
 *
 * The FplClient remains the single point of contact with FPL API.
 * Alternative architectures (e.g., DI of FplClient) could be explored in future refactors
 * but are not necessary for current requirements.
 */

import type { FantasyGameweekPicks, FantasyPick } from '@domain/models';
import { FplClient } from '@shared/services/fpl-client';

export interface EnrichedPick extends FantasyPick {
  // Player performance data
  playerEventPoints: number; // Raw points scored in this gameweek
  playerMultiplier: number; // 1 for regular, 2 for captain, 3 for triple captain, 0 for bench not playing
  playerEffectivePoints: number; // Final points including multiplier

  // Status info
  didPlay: boolean; // Did player actually play
  matchStatus: 'finished' | 'live' | 'not_started' | 'unknown';
  fixture?: string; // e.g., "ARS v MAN" or "ARS (H)" / "ARS (A)"
}

export interface PickEnrichmentResult {
  picks: EnrichedPick[];
  starters: EnrichedPick[];
  bench: EnrichedPick[];
  captain: EnrichedPick | undefined;
  viceCaptain: EnrichedPick | undefined;
  totalPoints: number;
  captainPoints: number;
  benchPoints: number;
}

export class PickEnrichmentService {
  private fplClient: FplClient;

  constructor() {
    this.fplClient = new FplClient();
  }

  /**
   * Enrich manager picks with event live data
   * Combines pick data with real player performance
   */
  async enrichPicks(
    picks: FantasyGameweekPicks,
    gameweekId: number
  ): Promise<PickEnrichmentResult> {
    try {
      // Fetch event live data for this gameweek
      const eventLiveData = await this.fplClient.getEventLive(gameweekId);

      // Create a map of player ID -> live data for quick lookup
      const playerLiveMap = new Map();
      if (eventLiveData.elements) {
        eventLiveData.elements.forEach((el: any) => {
          playerLiveMap.set(el.id, el);
        });
      }

      // Enrich each pick
      const enrichedPicks: EnrichedPick[] = picks.picks.map((pick) => ({
        ...pick,
        ...this.calculatePlayerPoints(pick, playerLiveMap, picks),
      }));

      // Separate starters and bench
      const starters = enrichedPicks.filter((p) => p.position <= 11);
      const bench = enrichedPicks.filter((p) => p.position > 11);

      // Find captain and vice captain
      const captain = enrichedPicks.find((p) => p.isCaptain);
      const viceCaptain = enrichedPicks.find((p) => p.isViceCaptain);

      // Calculate totals
      const totalPoints = enrichedPicks.reduce((sum, p) => sum + p.playerEffectivePoints, 0);
      const captainPoints = captain?.playerEffectivePoints ?? 0;
      const benchPoints = bench.reduce((sum, p) => sum + p.playerEffectivePoints, 0);

      return {
        picks: enrichedPicks,
        starters,
        bench,
        captain,
        viceCaptain,
        totalPoints,
        captainPoints,
        benchPoints,
      };
    } catch (error) {
      console.warn('Failed to enrich picks with event live data:', error);
      // Return picks with default values if enrichment fails
      return this.createDefaultEnrichment(picks);
    }
  }

  /**
   * Calculate player points for a single pick
   */
  private calculatePlayerPoints(
    pick: FantasyPick,
    playerLiveMap: Map<number, any>,
    picks: FantasyGameweekPicks
  ): Omit<EnrichedPick, keyof FantasyPick> {
    const liveData = playerLiveMap.get(pick.element);

    if (!liveData) {
      // No live data available - use defaults
      return {
        playerEventPoints: 0,
        playerMultiplier: 1,
        playerEffectivePoints: 0,
        didPlay: false,
        matchStatus: 'unknown',
      };
    }

    // Get raw points from live data
    const rawPoints = liveData.stats?.total_points ?? 0;

    // Determine multiplier
    let multiplier = 1;

    // Check if captain
    if (pick.isCaptain) {
      // Check for Triple Captain chip
      if (picks.activeChip === 'TC') {
        multiplier = 3;
      } else {
        // Regular captain multiplier
        multiplier = 2;
      }
    }

    // Check if bench player with Bench Boost
    if (pick.position > 11 && picks.activeChip === 'BB') {
      multiplier = 1; // Bench Boost allows bench to score
    } else if (pick.position > 11) {
      // Regular bench player - no points unless autosub
      multiplier = 0;
    }

    // Check for auto-substitution
    const autoSub = picks.autoSubs?.find((sub) => sub.elementIn === pick.element);
    if (autoSub && pick.position > 11) {
      // Player was substituted in - gets regular multiplier
      multiplier = 1;
    }

    // Calculate effective points
    const effectivePoints = rawPoints * multiplier;

    // Determine match status
    let matchStatus: 'finished' | 'live' | 'not_started' | 'unknown' = 'unknown';
    if (liveData.stats?.minutes === 0) {
      matchStatus = 'not_started';
    } else if (liveData.stats?.minutes === null) {
      matchStatus = 'unknown';
    } else if (liveData.fixture?.finished) {
      matchStatus = 'finished';
    } else if (liveData.fixture?.started) {
      matchStatus = 'live';
    }

    // Determine if player played
    const didPlay = (liveData.stats?.minutes ?? 0) > 0;

    return {
      playerEventPoints: rawPoints,
      playerMultiplier: multiplier,
      playerEffectivePoints: effectivePoints,
      didPlay,
      matchStatus,
    };
  }

  /**
   * Create default enrichment when live data fetch fails
   * Returns picks with zero points
   */
  private createDefaultEnrichment(picks: FantasyGameweekPicks): PickEnrichmentResult {
    const enrichedPicks: EnrichedPick[] = picks.picks.map((pick) => ({
      ...pick,
      playerEventPoints: 0,
      playerMultiplier: pick.position > 11 ? 0 : 1,
      playerEffectivePoints: 0,
      didPlay: false,
      matchStatus: 'unknown',
    }));

    const starters = enrichedPicks.filter((p) => p.position <= 11);
    const bench = enrichedPicks.filter((p) => p.position > 11);
    const captain = enrichedPicks.find((p) => p.isCaptain);
    const viceCaptain = enrichedPicks.find((p) => p.isViceCaptain);

    return {
      picks: enrichedPicks,
      starters,
      bench,
      captain,
      viceCaptain,
      totalPoints: 0,
      captainPoints: 0,
      benchPoints: 0,
    };
  }
}
