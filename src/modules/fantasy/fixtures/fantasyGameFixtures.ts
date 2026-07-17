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

  /**
   * Current squad - 15 players (11 starting XI + 4 bench)
   * Uses real FPL player IDs from synced player database
   * Starting XI formation: 4-3-3
   *
   * NOTE: These player IDs reference real players in the synced FPL 2025/26 database.
   * If a player is not found, the rendering gracefully handles missing data.
   */
  squad: [
    // Goalkeeper (1)
    {
      playerId: 1,
      position: 1,
      isStarter: true,
      isCaptain: false,
      isViceCaptain: false,
      gameweekPoints: 7,
    },

    // Defenders (4)
    {
      playerId: 5,
      position: 2,
      isStarter: true,
      isCaptain: false,
      isViceCaptain: false,
      gameweekPoints: 6,
    },
    {
      playerId: 8,
      position: 3,
      isStarter: true,
      isCaptain: false,
      isViceCaptain: false,
      gameweekPoints: 5,
    },
    {
      playerId: 12,
      position: 4,
      isStarter: true,
      isCaptain: false,
      isViceCaptain: false,
      gameweekPoints: 4,
    },
    {
      playerId: 18,
      position: 5,
      isStarter: true,
      isCaptain: false,
      isViceCaptain: true,
      gameweekPoints: 8,
    },

    // Midfielders (3)
    {
      playerId: 25,
      position: 6,
      isStarter: true,
      isCaptain: true,
      isViceCaptain: false,
      gameweekPoints: 24,
    },
    {
      playerId: 32,
      position: 7,
      isStarter: true,
      isCaptain: false,
      isViceCaptain: false,
      gameweekPoints: 10,
    },
    {
      playerId: 38,
      position: 8,
      isStarter: true,
      isCaptain: false,
      isViceCaptain: false,
      gameweekPoints: 6,
    },

    // Forwards (3)
    {
      playerId: 45,
      position: 9,
      isStarter: true,
      isCaptain: false,
      isViceCaptain: false,
      gameweekPoints: 8,
    },
    {
      playerId: 52,
      position: 10,
      isStarter: true,
      isCaptain: false,
      isViceCaptain: false,
      gameweekPoints: 5,
    },
    {
      playerId: 60,
      position: 11,
      isStarter: true,
      isCaptain: false,
      isViceCaptain: false,
      gameweekPoints: 2,
    },

    // Bench (4)
    { playerId: 62, position: 12, isStarter: false, benchOrder: 0, gameweekPoints: 0 },
    { playerId: 68, position: 13, isStarter: false, benchOrder: 1, gameweekPoints: 2 },
    { playerId: 75, position: 14, isStarter: false, benchOrder: 2, gameweekPoints: 0 },
    { playerId: 80, position: 15, isStarter: false, benchOrder: 3, gameweekPoints: 3 },
  ],
};
