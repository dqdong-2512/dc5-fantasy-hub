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
 * Complete Fantasy Game fixture set
 */
export interface FantasyGameFixtures {
  manager: FantasyGameManagerFixture;
  currentGameweek: FantasyGameweekFixture;
  leagues: FantasyLeagueFixture[];
}
