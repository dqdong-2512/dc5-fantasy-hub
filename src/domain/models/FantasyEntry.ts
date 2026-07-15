/**
 * Fantasy Domain Models
 * Typed representations of personal FPL Entry data
 */

/**
 * Manager information
 */
export interface FantasyManager {
  id: number;
  name: string;
  totalPoints: number;
  overallRank: number | null;
  currentGameweekPoints?: number;
  region?: string;
  joinedDate?: string;
}

/**
 * Personal team information
 */
export interface FantasyTeam {
  id: number;
  entryId: number;
  name: string;
  kit?: string;
  value?: number;
  bank?: number;
  bankCents?: number;
  valueCents?: number;
  transfersMade: number;
  transfersBudget: number;
  waiverPicks?: number;
  limitedTransfers?: boolean;
}

/**
 * Main Entry model combining manager and team
 */
export interface FantasyEntry {
  id: number;
  manager: FantasyManager;
  team: FantasyTeam;
  joinedLeaguesIds: number[];
  gameweekData?: {
    currentGameweek: number;
    currentGameweekPoints: number;
    bankValue: number;
    teamValue: number;
  };
}

/**
 * Entry history per gameweek
 */
export interface FantasyGameweekHistory {
  event: number;
  points: number;
  totalPoints: number;
  rank: number | null;
  prevRank: number | null;
  rankSort: number | null;
  transfers: number;
  transfersCost: number;
  benchPoints: number;
  eventTransfers?: number;
  eventTransfersCost?: number;
}

/**
 * Gameweek picks
 */
export interface FantasyPick {
  element: number; // Player ID
  position: number; // Squad position 1-15
  multiplier: number; // Captain=2, Vice=1, others=1
  isCaptain: boolean;
  isViceCaptain: boolean;
  isBench: boolean;
  benchOrder?: number; // For bench: 0-3
}

/**
 * Gameweek entry picks
 */
export interface FantasyGameweekPicks {
  eventId: number;
  entryId: number;
  picks: FantasyPick[];
  transfersMade: number;
  transfersCost: number;
  bankValue: number;
  teamValue: number;
  status: string;
  activeChip?: string | null;
  autoSubs: Array<{
    elementIn: number;
    elementOut: number;
    subOrder: number;
  }>;
}

/**
 * Classic League information
 */
export interface FantasyLeague {
  id: number;
  name: string;
  leagueType: 'x' | 's'; // x=classic, s=h2h
  scoringType: string;
  startEvent: number;
  maxAbleToJoin: number;
  adminEntry: number;
  created: string;
}

/**
 * League standing entry
 */
export interface FantasyLeagueStanding {
  rank: number;
  prevRank: number | null;
  entryId: number;
  entryName: string;
  playerName: string;
  teamName: string;
  points: number;
  eventPoints: number;
  totalPoints: number;
  lastRank?: number;
}

/**
 * League standings response
 */
export interface FantasyLeagueStandings {
  leagueId: number;
  leagueName: string;
  standings: FantasyLeagueStanding[];
  pageStandings: FantasyLeagueStanding[];
  leagueType: string;
  results: FantasyLeagueStanding[];
  hasNext: boolean;
  pageNumber: number;
  pageSize: number;
}
