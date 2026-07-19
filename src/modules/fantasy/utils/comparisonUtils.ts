/**
 * Manager Comparison Utilities
 * Functions for calculating differentials, formations, and other comparison metrics
 */

import type { FantasySquadPick } from '../types';

/**
 * Calculate formation from a squad
 * Formation is determined by number of defenders, midfielders, forwards
 * Format: GK-DEF-MID-FWD (e.g., 1-4-3-3)
 */
export const calculateFormation = (squad: FantasySquadPick[]): string => {
  const starters = squad.filter((p) => p.isStarter);

  // Count by position: 1=GK, 2-5=DEF, 6-8=MID, 9-10=FWD
  let gk = 0;
  let def = 0;
  let mid = 0;
  let fwd = 0;

  starters.forEach((player) => {
    if (player.position === 1) gk = 1;
    else if (player.position >= 2 && player.position <= 5) def += 1;
    else if (player.position >= 6 && player.position <= 8) mid += 1;
    else if (player.position >= 9 && player.position <= 11) fwd += 1;
  });

  return `${gk}-${def}-${mid}-${fwd}`;
};

/**
 * Get captain from squad
 */
export const getCaptain = (squad: FantasySquadPick[]): FantasySquadPick | null => {
  return squad.find((p) => p.isCaptain) || null;
};

/**
 * Get vice captain from squad
 */
export const getViceCaptain = (squad: FantasySquadPick[]): FantasySquadPick | null => {
  return squad.find((p) => p.isViceCaptain) || null;
};

/**
 * Calculate player IDs in starting XI
 */
export const getStartingXIPlayerIds = (squad: FantasySquadPick[]): Set<number> => {
  return new Set(squad.filter((p) => p.isStarter).map((p) => p.playerId));
};

/**
 * Calculate differential players between two squads
 */
export interface DifferentialSummary {
  sharedPlayers: number[];
  myDifferentials: number[];
  opponentDifferentials: number[];
}

export const calculateDifferentials = (
  mySquad: FantasySquadPick[],
  opponentSquad: FantasySquadPick[]
): DifferentialSummary => {
  const myStartingXI = getStartingXIPlayerIds(mySquad);
  const opponentStartingXI = getStartingXIPlayerIds(opponentSquad);

  const sharedPlayers: number[] = [];
  const myDifferentials: number[] = [];
  const opponentDifferentials: number[] = [];

  // Find shared players
  myStartingXI.forEach((playerId) => {
    if (opponentStartingXI.has(playerId)) {
      sharedPlayers.push(playerId);
    } else {
      myDifferentials.push(playerId);
    }
  });

  // Find opponent-only players
  opponentStartingXI.forEach((playerId) => {
    if (!myStartingXI.has(playerId)) {
      opponentDifferentials.push(playerId);
    }
  });

  return {
    sharedPlayers,
    myDifferentials,
    opponentDifferentials,
  };
};

/**
 * Calculate total gameweek points for squad
 */
export const calculateSquadGameweekPoints = (squad: FantasySquadPick[]): number => {
  return squad.reduce((sum, p) => sum + (p.gameweekPoints || 0), 0);
};

/**
 * Get bench players from squad
 */
export const getBenchPlayers = (squad: FantasySquadPick[]): FantasySquadPick[] => {
  return squad
    .filter((p) => !p.isStarter)
    .sort((a, b) => (a.benchOrder ?? 0) - (b.benchOrder ?? 0));
};
