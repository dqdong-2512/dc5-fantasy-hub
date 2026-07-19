/**
 * League Race Service
 * Calculates league race metrics and data for the Live League Race feature
 * Reuses existing gameweek contribution logic via manager snapshots
 */

import { PlayerRepository } from '@repositories/players';
import { getManagerGameweekSnapshot } from '../fixtures';
import type {
  LeagueRaceEntry,
  LeagueMovers,
  NearestRivalsData,
  CaptainRaceEntry,
  LeagueRaceMetrics,
} from '@domain/models';
import type { LeagueStandingEntry } from '../types';

export class LeagueRaceService {
  private playerRepository: PlayerRepository;

  constructor() {
    this.playerRepository = new PlayerRepository();
  }

  /**
   * Build league race entries from standings
   * Applies gameweek context to enhance standings with gameweek-specific data
   */
  buildLeagueRaceEntries(
    standings: LeagueStandingEntry[],
    gameweekId: number,
    gameweekStatus: 'live' | 'final' | 'snapshot' | 'upcoming'
  ): LeagueRaceEntry[] {
    if (!standings || standings.length === 0) {
      return [];
    }

    // Get leader's total points for gap calculation
    const leader = standings[0];
    const leaderTotal = leader?.totalPoints ?? 0;

    return standings.map((entry, index): LeagueRaceEntry => {
      // Get manager snapshot for gameweek
      const snapshot = getManagerGameweekSnapshot(gameweekId);
      const hasCompleteGameweekData = snapshot?.managerId === entry.managerId && !!snapshot;

      // Calculate captain contribution (already includes multiplier in snapshot)
      let captainContribution = 0;
      let captainPlayerId: number | undefined;

      if (hasCompleteGameweekData && snapshot) {
        const captainContribution_ = snapshot.playerContributions.find((p) => p.isCaptain);
        if (captainContribution_) {
          captainContribution = captainContribution_.managerPoints;
          captainPlayerId = captainContribution_.playerId;
        }
      }

      // Rank movement
      const rankMovement = entry.previousRank - entry.currentRank;

      // Points before gameweek (already included in standings)
      const pointsBeforeGameweek = entry.totalPoints - entry.gameweekPoints;

      // Net gameweek points (already accounted in totalPoints, but calculate for display)
      const netGameweekPoints = entry.gameweekPoints - (hasCompleteGameweekData ? 0 : 0);

      // Gap calculations
      const gapToLeader = entry.totalPoints - leaderTotal;
      const managerAbove = index > 0 ? standings[index - 1] : null;
      const gapToManagerAbove = managerAbove ? entry.totalPoints - managerAbove.totalPoints : 0;

      return {
        managerId: entry.managerId,
        teamName: entry.teamName,
        managerName: entry.managerName,
        currentRank: entry.currentRank,
        previousRank: entry.previousRank,
        rankMovement,
        pointsBeforeGameweek,
        gameweekPoints: entry.gameweekPoints,
        transferCost: hasCompleteGameweekData ? (snapshot?.transferCost ?? 0) : 0,
        netGameweekPoints,
        totalPoints: entry.totalPoints,
        gapToLeader,
        gapToManagerAbove,
        captainPlayerId,
        captainContribution,
        dataStatus: gameweekStatus,
        hasCompleteGameweekData,
      };
    });
  }

  /**
   * Get current manager metrics
   */
  getManagerMetrics(entries: LeagueRaceEntry[], managerId: number): LeagueRaceMetrics | null {
    const entry = entries.find((e) => e.managerId === managerId);
    if (!entry) {
      return null;
    }

    return {
      currentRank: entry.currentRank,
      previousRank: entry.previousRank,
      rankMovement: entry.rankMovement,
      gameweekPoints: entry.gameweekPoints,
      totalPoints: entry.totalPoints,
      gapToLeader: entry.gapToLeader,
    };
  }

  /**
   * Find nearest rivals around current manager
   * Returns managers immediately above and below
   */
  getNearestRivals(
    entries: LeagueRaceEntry[],
    managerId: number,
    count: number = 2
  ): NearestRivalsData | null {
    const currentIndex = entries.findIndex((e) => e.managerId === managerId);
    if (currentIndex === -1) {
      return null;
    }

    const above = entries.slice(Math.max(0, currentIndex - count), currentIndex);
    const current = entries[currentIndex];
    const below = entries.slice(currentIndex + 1, currentIndex + 1 + count);

    return { above, current, below };
  }

  /**
   * Calculate relative gaps for rivals
   * Reference point is the current manager
   */
  calculateRivalGaps(rivals: NearestRivalsData): Map<number, number> {
    const gaps = new Map<number, number>();
    const currentTotal = rivals.current.totalPoints;

    rivals.above.forEach((entry) => {
      gaps.set(entry.managerId, entry.totalPoints - currentTotal);
    });

    gaps.set(rivals.current.managerId, 0);

    rivals.below.forEach((entry) => {
      gaps.set(entry.managerId, entry.totalPoints - currentTotal);
    });

    return gaps;
  }

  /**
   * Identify gameweek movers
   */
  getGameweekMovers(entries: LeagueRaceEntry[]): LeagueMovers {
    if (entries.length === 0) {
      return {
        biggestRiser: null,
        biggestFaller: null,
        bestGameweekScore: null,
      };
    }

    let biggestRiser: LeagueRaceEntry | null = entries[0];
    let biggestFaller: LeagueRaceEntry | null = entries[0];
    let bestGameweekScore: LeagueRaceEntry | null = entries[0];

    entries.forEach((entry) => {
      // Biggest riser: highest positive rank movement
      if (entry.rankMovement > (biggestRiser?.rankMovement ?? -Infinity)) {
        biggestRiser = entry;
      }

      // Biggest faller: lowest negative rank movement
      if (entry.rankMovement < (biggestFaller?.rankMovement ?? Infinity)) {
        biggestFaller = entry;
      }

      // Best gameweek score: highest gameweek points
      if (entry.gameweekPoints > (bestGameweekScore?.gameweekPoints ?? -Infinity)) {
        bestGameweekScore = entry;
      }
    });

    return {
      biggestRiser: biggestRiser && biggestRiser.rankMovement > 0 ? biggestRiser : null,
      biggestFaller: biggestFaller && biggestFaller.rankMovement < 0 ? biggestFaller : null,
      bestGameweekScore,
    };
  }

  /**
   * Build captain race entries for visualization
   * Shows captain choices for top managers and nearest rivals
   */
  async buildCaptainRaceEntries(
    entries: LeagueRaceEntry[],
    count: number = 5
  ): Promise<CaptainRaceEntry[]> {
    // Get top managers + nearest rivals
    const topEntries = entries.slice(0, count);

    const captainEntries = await Promise.all(
      topEntries.map(async (entry): Promise<CaptainRaceEntry> => {
        let captainPlayerName: string | undefined;

        if (entry.captainPlayerId) {
          try {
            const player = this.playerRepository.getById(entry.captainPlayerId);
            captainPlayerName = player?.displayName;
          } catch {
            // Player data unavailable, skip enrichment
          }
        }

        return {
          managerId: entry.managerId,
          managerName: entry.managerName,
          teamName: entry.teamName,
          captainPlayerId: entry.captainPlayerId,
          captainPlayerName,
          captainContribution: entry.captainContribution,
          currentRank: entry.currentRank,
        };
      })
    );

    return captainEntries;
  }

  /**
   * Validate available gameweeks for league race
   * Only show gameweeks that have meaningful data
   */
  getAvailableGameweeks(availableGameweekIds: number[]): number[] {
    // Filter to gameweeks with manager snapshot data
    return availableGameweekIds.filter((id) => {
      const snapshot = getManagerGameweekSnapshot(id);
      return !!snapshot;
    });
  }

  /**
   * Format data status for display
   */
  static formatStatus(status: 'live' | 'final' | 'snapshot' | 'upcoming'): string {
    const statusMap = {
      live: 'Live',
      final: 'Final',
      snapshot: 'Snapshot',
      upcoming: 'Upcoming',
    };
    return statusMap[status];
  }

  /**
   * Get status color for display
   */
  static getStatusColor(status: 'live' | 'final' | 'snapshot' | 'upcoming'): string {
    const colorMap = {
      live: '#ff6b6b',
      final: '#4caf50',
      snapshot: '#ff9800',
      upcoming: '#9e9e9e',
    };
    return colorMap[status];
  }
}
