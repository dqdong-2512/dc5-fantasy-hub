/**
 * League Detail Service
 * Handles all league-related business logic and data orchestration
 * Coordinates between repositories, caching, and calculations
 */

import { FantasyGameRepository } from '@repositories/fantasy';
import type { FantasyLeagueStandings, FantasyLeagueStanding } from '@domain/models';

interface LeagueDetail {
  standings: FantasyLeagueStandings;
  connectedUserPosition: FantasyLeagueStanding | null;
  rankMovement: number | null;
}

interface ManagerComparison {
  connectedManager: FantasyLeagueStanding;
  opponentManager: FantasyLeagueStanding;
  leagueId: number;
  leagueName: string;
  pointsDifference: number;
  leagueRankDifference: number;
}

export class LeagueDetailService {
  private repository: FantasyGameRepository;
  // Simple in-memory cache to prevent duplicate API calls
  private leagueCache: Map<number, { data: FantasyLeagueStandings; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.repository = new FantasyGameRepository();
  }

  /**
   * Load complete league detail
   * Returns standings and connected user's position
   */
  async loadLeagueDetail(
    leagueId: number,
    connectedEntryId: number,
    page: number = 1
  ): Promise<LeagueDetail> {
    try {
      // Check cache first
      const cached = this.getFromCache(leagueId);
      const standings = cached || (await this.repository.getLeagueStandings(leagueId, page));

      // Cache the result if not already cached
      if (!cached) {
        this.setCache(leagueId, standings);
      }

      // Find connected user's position in standings
      const connectedUserPosition =
        standings.standings.find((s) => s.entryId === connectedEntryId) || null;

      // Calculate rank movement if available
      const rankMovement = connectedUserPosition
        ? this.calculateRankMovement(connectedUserPosition)
        : null;

      return {
        standings,
        connectedUserPosition,
        rankMovement,
      };
    } catch (err) {
      throw new Error(
        `Failed to load league detail: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Compare two managers within a league
   */
  async compareManagersInLeague(
    leagueId: number,
    connectedManagerId: number,
    opponentManagerId: number,
    page: number = 1
  ): Promise<ManagerComparison> {
    try {
      const standings = await this.repository.getLeagueStandings(leagueId, page);

      const connectedManager = standings.standings.find((s) => s.entryId === connectedManagerId);
      const opponentManager = standings.standings.find((s) => s.entryId === opponentManagerId);

      if (!connectedManager || !opponentManager) {
        throw new Error('One or both managers not found in league standings');
      }

      const pointsDifference = connectedManager.totalPoints - opponentManager.totalPoints;
      const leagueRankDifference = opponentManager.rank - connectedManager.rank; // negative = better

      return {
        connectedManager,
        opponentManager,
        leagueId,
        leagueName: standings.leagueName,
        pointsDifference,
        leagueRankDifference,
      };
    } catch (err) {
      throw new Error(
        `Failed to compare managers: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calculate rank movement for a manager
   * Returns number indicating improvement (positive) or decline (negative)
   */
  private calculateRankMovement(standing: FantasyLeagueStanding): number | null {
    if (!standing.prevRank) {
      return null;
    }

    // Rank is inverse: lower number = better
    // prevRank - currentRank gives movement where positive = improved
    return standing.prevRank - standing.rank;
  }

  /**
   * Clear cache for a specific league or all leagues
   */
  clearCache(leagueId?: number): void {
    if (leagueId) {
      this.leagueCache.delete(leagueId);
    } else {
      this.leagueCache.clear();
    }
  }

  /**
   * Cache management
   */
  private getFromCache(leagueId: number): FantasyLeagueStandings | null {
    const cached = this.leagueCache.get(leagueId);
    if (!cached) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.leagueCache.delete(leagueId);
      return null;
    }

    return cached.data;
  }

  private setCache(leagueId: number, data: FantasyLeagueStandings): void {
    this.leagueCache.set(leagueId, {
      data,
      timestamp: Date.now(),
    });
  }
}
