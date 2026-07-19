/**
 * Fantasy Game Fixture Types
 * Temporary local data structures for manager/team/league development
 * These will be replaced with real API data later
 */

/**
 * Fixture data for a Fantasy Game manager and team
 * Used for UI development before real FPL entry connection
 */
export interface FantasyGameManagerFixture {
  id: number;
  name: string;
  teamName: string;
  overallPoints: number;
  overallRank: number;
  teamValue: number;
  bank: number;
  primaryLeagueId: number;
}

/**
 * Fixture data for a single gameweek in the manager's history
 */
export interface FantasyGameweekFixture {
  gameweek: number;
  points: number;
  averagePoints: number;
  highestPoints: number;
  transfers: number;
  transferCost: number;
  benchPoints: number;
  rank: number;
}

/**
 * Fixture data for a league membership
 */
export interface FantasyLeagueFixture {
  id: number;
  name: string;
  rank: number;
  previousRank: number;
  members: number;
}

/**
 * Squad pick fixture - represents a selected player for the squad
 * References real player data by playerId
 */
export interface FantasySquadPick {
  playerId: number;
  position: number; // FPL position in squad (1-15)
  isStarter: boolean; // True for starting XI, false for bench
  benchOrder?: number; // 0-3 for bench players
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  gameweekPoints?: number;
}

/**
 * League standing entry - represents one manager's position in a league
 */
export interface LeagueStandingEntry {
  managerId: number;
  managerName: string;
  teamName: string;
  currentRank: number;
  previousRank: number;
  totalPoints: number;
  gameweekPoints: number;
}

/**
 * League standings - all manager entries for a league
 */
export interface LeagueStandings {
  leagueId: number;
  entries: LeagueStandingEntry[];
}

/**
 * Complete Fantasy Game fixture set
 */
export interface FantasyGameFixtures {
  manager: FantasyGameManagerFixture;
  currentGameweek: FantasyGameweekFixture;
  leagues: FantasyLeagueFixture[];
  squad?: FantasySquadPick[];
}
