/**
 * Opponent Squad Fixtures
 * Sample squad data for selected league managers to enable comparison testing
 * 15-player squads (11 starting XI + 4 bench) for realistic comparisons
 *
 * NOTE: This is temporary local fixture data.
 * Replace with real FPL API data once the connection flow is complete.
 */

import type { FantasySquadPick } from '../types';

/**
 * Opponent squad for Hải Trần (managerId: 9002) - Rank 2 in DC5 FPL league
 * Formation: 4-2-3-1
 * Captain: Haaland
 */
export const haiTranSquad: FantasySquadPick[] = [
  // Goalkeeper (1)
  {
    playerId: 2,
    position: 1,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 6,
  },

  // Defenders (4)
  {
    playerId: 6,
    position: 2,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 7,
  },
  {
    playerId: 9,
    position: 3,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 6,
  },
  {
    playerId: 14,
    position: 4,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 5,
  },
  {
    playerId: 20,
    position: 5,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: true,
    gameweekPoints: 5,
  },

  // Midfielders (2 + 3)
  {
    playerId: 28,
    position: 6,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 8,
  },
  {
    playerId: 35,
    position: 7,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 9,
  },
  {
    playerId: 33,
    position: 8,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 7,
  },
  {
    playerId: 40,
    position: 9,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 6,
  },

  // Forwards (2)
  {
    playerId: 48,
    position: 10,
    isStarter: true,
    isCaptain: true,
    isViceCaptain: false,
    gameweekPoints: 16,
  },
  {
    playerId: 55,
    position: 11,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 6,
  },

  // Bench (4)
  { playerId: 3, position: 12, isStarter: false, benchOrder: 0, gameweekPoints: 0 },
  { playerId: 70, position: 13, isStarter: false, benchOrder: 1, gameweekPoints: 2 },
  { playerId: 78, position: 14, isStarter: false, benchOrder: 2, gameweekPoints: 0 },
  { playerId: 82, position: 15, isStarter: false, benchOrder: 3, gameweekPoints: 0 },
];

/**
 * Opponent squad for Huy Nhất (managerId: 9003) - Rank 3 in DC5 FPL league
 * Formation: 3-5-2
 * Captain: Salah
 */
export const huyNhatSquad: FantasySquadPick[] = [
  // Goalkeeper (1)
  {
    playerId: 1,
    position: 1,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 7,
  },

  // Defenders (3)
  {
    playerId: 7,
    position: 2,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 6,
  },
  {
    playerId: 13,
    position: 3,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: true,
    gameweekPoints: 4,
  },
  {
    playerId: 19,
    position: 4,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 6,
  },

  // Midfielders (5)
  {
    playerId: 26,
    position: 5,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 11,
  },
  {
    playerId: 30,
    position: 6,
    isStarter: true,
    isCaptain: true,
    isViceCaptain: false,
    gameweekPoints: 18,
  },
  {
    playerId: 36,
    position: 7,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 8,
  },
  {
    playerId: 39,
    position: 8,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 5,
  },
  {
    playerId: 42,
    position: 9,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 7,
  },

  // Forwards (2)
  {
    playerId: 50,
    position: 10,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 4,
  },
  {
    playerId: 58,
    position: 11,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 2,
  },

  // Bench (4)
  { playerId: 4, position: 12, isStarter: false, benchOrder: 0, gameweekPoints: 1 },
  { playerId: 72, position: 13, isStarter: false, benchOrder: 1, gameweekPoints: 0 },
  { playerId: 79, position: 14, isStarter: false, benchOrder: 2, gameweekPoints: 3 },
  { playerId: 83, position: 15, isStarter: false, benchOrder: 3, gameweekPoints: 0 },
];

/**
 * Opponent squad for Hùng Trịnh (managerId: 9001) - Rank 1 in DC5 FPL league
 * Formation: 4-3-3
 * Captain: Saka
 */
export const hungTrinhSquad: FantasySquadPick[] = [
  // Goalkeeper (1)
  {
    playerId: 2,
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
    playerId: 10,
    position: 3,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 5,
  },
  {
    playerId: 15,
    position: 4,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 7,
  },
  {
    playerId: 21,
    position: 5,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: true,
    gameweekPoints: 6,
  },

  // Midfielders (3)
  {
    playerId: 27,
    position: 6,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 9,
  },
  {
    playerId: 31,
    position: 7,
    isStarter: true,
    isCaptain: true,
    isViceCaptain: false,
    gameweekPoints: 20,
  },
  {
    playerId: 37,
    position: 8,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 7,
  },

  // Forwards (3)
  {
    playerId: 46,
    position: 9,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 9,
  },
  {
    playerId: 53,
    position: 10,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 7,
  },
  {
    playerId: 61,
    position: 11,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 3,
  },

  // Bench (4)
  { playerId: 3, position: 12, isStarter: false, benchOrder: 0, gameweekPoints: 0 },
  { playerId: 71, position: 13, isStarter: false, benchOrder: 1, gameweekPoints: 1 },
  { playerId: 80, position: 14, isStarter: false, benchOrder: 2, gameweekPoints: 2 },
  { playerId: 84, position: 15, isStarter: false, benchOrder: 3, gameweekPoints: 0 },
];

/**
 * Map manager IDs to their squad fixtures
 */
export const opponentSquadsFixtures: Record<number, FantasySquadPick[]> = {
  9001: hungTrinhSquad,
  9002: haiTranSquad,
  9003: huyNhatSquad,
};
