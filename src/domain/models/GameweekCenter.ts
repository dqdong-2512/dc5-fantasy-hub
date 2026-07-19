/**
 * Gameweek Center Domain Models
 * Represents the composition of public gameweek data and manager snapshots
 */

/**
 * Player contribution model
 * Represents a single player's performance and contribution to manager's score
 */
export interface PlayerGameweekContribution {
  playerId: number;
  playerName?: string;
  position?: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isBench: boolean;
  benchOrder?: number;
  rawPoints: number;
  multiplier: number;
  managerPoints: number;
  minutesPlayed: number;
}

/**
 * Gameweek status enum
 * Represents the state of a gameweek's fixtures
 */
export enum GameweekStatus {
  Upcoming = 'upcoming',
  InProgress = 'in_progress',
  Finished = 'finished',
}

/**
 * Manager gameweek snapshot
 * Contains manager-specific data for a gameweek
 */
export interface ManagerGameweekSnapshot {
  managerId: number;
  gameweekId: number;
  totalPoints: number;
  benchPoints: number;
  transfers: number;
  transferCost: number;
  rank: number;
  averagePoints: number;
  highestPoints: number;
  captainId?: number;
  viceCaptainId?: number;
  playerContributions: PlayerGameweekContribution[];
}

/**
 * Gameweek center data
 * Combines public FPL gameweek data with manager snapshot
 */
export interface GameweekCenterData {
  gameweek: {
    id: number;
    name: string;
    deadline: string;
    finished: boolean;
  };
  status: GameweekStatus;
  managerSnapshot?: ManagerGameweekSnapshot;
  hasMissingSnapshot?: boolean;
}
