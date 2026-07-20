/**
 * Fantasy Game Data Adapter
 * Converts domain models to fixture types for display
 * Bridges real API data with UI components expecting fixture structure
 */

import type { FantasyEntry, FantasyGameweekHistory } from '@domain/models';
import type {
  FantasyGameManagerFixture,
  FantasyGameweekFixture,
  FantasyLeagueFixture,
} from '../types';

export class FantasyGameDataAdapter {
  /**
   * Convert FantasyEntry domain model to manager fixture for display
   */
  static entryToManagerFixture(entry: FantasyEntry): FantasyGameManagerFixture {
    return {
      id: entry.manager.id,
      name: entry.manager.name,
      teamName: entry.team.name,
      overallPoints: entry.manager.totalPoints,
      overallRank: entry.manager.overallRank ?? 999999,
      teamValue: 0, // Not available in entry
      bank: 0, // Not available in entry
      primaryLeagueId: entry.joinedLeaguesIds?.[0] ?? 0,
    };
  }

  /**
   * Convert FantasyGameweekHistory entry to gameweek fixture for display
   */
  static historyToGameweekFixture(history: FantasyGameweekHistory): FantasyGameweekFixture {
    return {
      gameweek: history.event,
      points: history.points,
      averagePoints: 0, // Not available in history
      highestPoints: 0, // Not available in history
      transfers: history.eventTransfers ?? 0,
      transferCost: history.eventTransfersCost ?? 0,
      benchPoints: history.benchPoints ?? 0,
      rank: history.rank ?? 999999,
    };
  }

  /**
   * Get most recent gameweek from history, or create placeholder
   */
  static getLatestGameweekFromHistory(
    history: FantasyGameweekHistory[] | null
  ): FantasyGameweekFixture {
    if (!history || history.length === 0) {
      return {
        gameweek: 1,
        points: 0,
        averagePoints: 0,
        highestPoints: 0,
        transfers: 0,
        transferCost: 0,
        benchPoints: 0,
        rank: 999999,
      };
    }

    // Get most recent (last in array)
    const latest = history[history.length - 1];
    return this.historyToGameweekFixture(latest);
  }

  /**
   * Convert entry leagues to league fixtures
   */
  static entriesToLeagueFixtures(
    entry: FantasyEntry | null,
    leagueData?: Array<{ id: number; name: string }>
  ): FantasyLeagueFixture[] {
    if (!entry?.joinedLeaguesIds || entry.joinedLeaguesIds.length === 0) {
      return [];
    }

    return entry.joinedLeaguesIds.map((leagueId) => ({
      id: leagueId,
      name: leagueData?.find((l) => l.id === leagueId)?.name ?? `League ${leagueId}`,
      rank: 0, // Not available from entry endpoint
      previousRank: 0,
      members: 0, // Not available from entry endpoint
    }));
  }
}
