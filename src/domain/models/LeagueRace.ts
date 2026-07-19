/**
 * League Race Domain Models
 * Represents league race data and derived metrics
 */

/**
 * League race entry
 * Represents a single manager's position and metrics in a league race
 */
export interface LeagueRaceEntry {
  managerId: number;
  teamName: string;
  managerName: string;

  // Ranking
  currentRank: number;
  previousRank: number;
  rankMovement: number; // positive = moved up, negative = moved down, 0 = no change

  // Points
  pointsBeforeGameweek: number;
  gameweekPoints: number;
  transferCost: number;
  netGameweekPoints: number; // gameweekPoints - transferCost
  totalPoints: number;

  // Gaps
  gapToLeader: number; // negative = behind leader
  gapToManagerAbove: number; // negative = behind manager above

  // Captain
  captainPlayerId?: number;
  captainContribution: number; // captain points with multiplier

  // Data
  dataStatus: 'live' | 'final' | 'snapshot' | 'upcoming';
  hasCompleteGameweekData: boolean;
}

/**
 * League race metrics summary
 */
export interface LeagueRaceMetrics {
  currentRank: number;
  previousRank: number;
  rankMovement: number;
  gameweekPoints: number;
  totalPoints: number;
  gapToLeader: number;
}

/**
 * League movers summary
 */
export interface LeagueMovers {
  biggestRiser: LeagueRaceEntry | null;
  biggestFaller: LeagueRaceEntry | null;
  bestGameweekScore: LeagueRaceEntry | null;
}

/**
 * Nearest rivals around current manager
 */
export interface NearestRivalsData {
  above: LeagueRaceEntry[];
  current: LeagueRaceEntry;
  below: LeagueRaceEntry[];
}

/**
 * Captain race entry for visualization
 */
export interface CaptainRaceEntry {
  managerId: number;
  managerName: string;
  teamName: string;
  captainPlayerId?: number;
  captainPlayerName?: string;
  captainContribution: number;
  currentRank: number;
}
