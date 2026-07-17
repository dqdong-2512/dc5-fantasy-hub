/**
 * Fantasy Game Fixture Data
 * Realistic sample data for Fantasy Premier League manager
 * Used for UI development and testing
 *
 * NOTE: This is temporary local fixture data.
 * Replace with real FPL API data once the connection flow is complete.
 */

import type { FantasyGameFixtures } from '../types';

/**
 * Sample Fantasy Game data for UI development
 * Represents a realistic manager in the 2025/26 FPL season
 */
export const fantasyGameFixtures: FantasyGameFixtures = {
  /**
   * Manager and team information
   * Real FPL data from an example manager entry
   */
  manager: {
    id: 1234567,
    name: 'Trí Nguyễn',
    teamName: 'Đã Tới Lúc Lụm Chi',
    overallPoints: 2228,
    overallRank: 120408,
    teamValue: 102.4, // £m
    bank: 0.8, // £m
  },

  /**
   * Current gameweek (or most recent completed)
   * Represents Gameweek 38 (final gameweek of 2025/26 season)
   */
  currentGameweek: {
    gameweek: 38,
    points: 58,
    averagePoints: 52,
    highestPoints: 124,
    transfers: 2,
    transferCost: 4,
    benchPoints: 8,
    rank: 1245322,
  },

  /**
   * My Leagues - personal league memberships
   * Typical manager participates in 2-5 leagues
   */
  leagues: [
    {
      id: 12345,
      name: 'DC5 FPL 25/26',
      rank: 8,
      previousRank: 9,
      members: 47,
    },
    {
      id: 67890,
      name: 'Bao Dong Da Fantasy',
      rank: 15,
      previousRank: 12,
      members: 156,
    },
    {
      id: 11111,
      name: 'Office Fantasy League',
      rank: 24,
      previousRank: 20,
      members: 92,
    },
  ],
};
