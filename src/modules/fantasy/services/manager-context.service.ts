/**
 * Manager Context Service
 * Provides centralized access to manager data and derived gameweek context
 * Handles calculations for display gameweek, performance statistics, and team composition
 */

import type { FantasyEntry, FantasyGameweekHistory, FantasyLeague } from '@domain/models';

export interface ManagerContext {
  // Manager profile
  managerId: number;
  managerName: string;
  teamName: string;
  region?: string;

  // Season performance
  totalPoints: number;
  overallRank: number | null;

  // Current state
  teamValue: number;
  bank: number;

  // Gameweek context
  displayGameweek: number;
  isGameweekActive: boolean;
  gameweekHistory: FantasyGameweekHistory | undefined;
  gameweekPoints: number;
  gameweekRank: number | null;
}

export interface ManagerStats {
  averagePointsPerGameweek: number;
  bestGameweekPoints: number;
  worstGameweekPoints: number;
  totalTransfers: number;
  totalTransferCost: number;
  ranksImprovement: number | null;
  bestRank: number | null;
  worstRank: number | null;
}

export class ManagerContextService {
  /**
   * Extract context from entry data for a specific gameweek
   */
  static buildContext(
    entry: FantasyEntry | null,
    history: FantasyGameweekHistory[] | null,
    displayGameweek: number,
    isGameweekActive: boolean
  ): ManagerContext | null {
    if (!entry) return null;

    const gameweekHistory = history?.find((h) => h.event === displayGameweek);

    return {
      managerId: entry.manager.id,
      managerName: entry.manager.name,
      teamName: entry.team.name,
      region: entry.manager.region,
      totalPoints: entry.manager.totalPoints,
      overallRank: entry.manager.overallRank,
      teamValue: entry.team.value ?? 100,
      bank: entry.team.bank ?? 0,
      displayGameweek,
      isGameweekActive,
      gameweekHistory,
      gameweekPoints: gameweekHistory?.points ?? 0,
      gameweekRank: gameweekHistory?.rank ?? null,
    };
  }

  /**
   * Calculate season-wide statistics from history
   */
  static calculateStats(history: FantasyGameweekHistory[] | null): ManagerStats {
    if (!history || history.length === 0) {
      return {
        averagePointsPerGameweek: 0,
        bestGameweekPoints: 0,
        worstGameweekPoints: 0,
        totalTransfers: 0,
        totalTransferCost: 0,
        ranksImprovement: null,
        bestRank: null,
        worstRank: null,
      };
    }

    const points = history.map((h) => h.points);
    const ranks = history.map((h) => h.rank).filter((r) => r !== null) as number[];
    const transfers = history.reduce((sum, h) => sum + h.transfers, 0);
    const transferCost = history.reduce((sum, h) => sum + h.transfersCost, 0);

    const avgPoints = points.length > 0 ? points.reduce((a, b) => a + b, 0) / points.length : 0;
    const bestPoints = Math.max(...points, 0);
    const worstPoints = Math.min(...points, 0);
    const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;
    const worstRank = ranks.length > 0 ? Math.max(...ranks) : null;

    // Calculate rank improvement (negative = improved, positive = worsened)
    let ranksImprovement: number | null = null;
    if (ranks.length >= 2) {
      ranksImprovement = ranks[ranks.length - 1] - ranks[0];
    }

    return {
      averagePointsPerGameweek: Math.round(avgPoints * 10) / 10,
      bestGameweekPoints: bestPoints,
      worstGameweekPoints: worstPoints,
      totalTransfers: transfers,
      totalTransferCost: transferCost,
      ranksImprovement,
      bestRank,
      worstRank,
    };
  }

  /**
   * Determine which gameweek should be displayed
   * Prefers current/active gameweek, falls back to latest completed
   */
  static determineDisplayGameweek(
    gameweeks: Array<{ id: number; finished: boolean }>
  ): number | null {
    if (!gameweeks || gameweeks.length === 0) return null;

    // Find first unfinished gameweek
    let target = gameweeks.find((gw) => !gw.finished);

    // If all finished, use latest
    if (!target) {
      target = gameweeks[gameweeks.length - 1];
    }

    return target?.id ?? null;
  }

  /**
   * Check if a gameweek is currently active/live
   */
  static isGameweekActive(gameweek: { id: number; finished: boolean } | undefined): boolean {
    return gameweek ? !gameweek.finished : false;
  }

  /**
   * Format manager display information for UI
   */
  static formatManagerDisplay(context: ManagerContext | null): {
    displayName: string;
    teamName: string;
    pointsDisplay: string;
    rankDisplay: string;
    statusLabel: string;
  } {
    if (!context) {
      return {
        displayName: 'Not Connected',
        teamName: '',
        pointsDisplay: '—',
        rankDisplay: '—',
        statusLabel: 'Configure Entry',
      };
    }

    return {
      displayName: context.managerName,
      teamName: context.teamName,
      pointsDisplay: `${context.totalPoints}`,
      rankDisplay: context.overallRank ? `#${context.overallRank.toLocaleString()}` : '—',
      statusLabel: context.isGameweekActive ? 'GW ACTIVE' : `GW ${context.displayGameweek}`,
    };
  }

  /**
   * Get summary of league performance
   */
  static getLaguePerformanceSummary(
    leagues: FantasyLeague[] | null,
    managerLeagueIds: number[] | null
  ): Array<{
    leagueId: number;
    leagueName: string;
    isJoined: boolean;
  }> {
    if (!leagues) return [];

    return leagues
      .filter((l) => managerLeagueIds?.includes(l.id) ?? false)
      .map((l) => ({
        leagueId: l.id,
        leagueName: l.name,
        isJoined: true,
      }));
  }
}
