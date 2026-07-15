/**
 * Live League Standings Models
 * Calculated live league performance for managers
 */

/**
 * Individual manager's calculated live score for a gameweek
 */
export interface LiveManagerScore {
  entryId: number;
  playerName: string;
  teamName: string;

  // Live Gameweek Metrics
  liveGameweekPoints: number;
  captainName?: string;
  captainRawPoints?: number;
  captainEffectivePoints?: number;
  benchPoints: number;
  playersPlayed: number;
  playersLive: number;
  playersRemaining: number;

  // Calculated Total
  calculatedLiveTotal: number;

  // Rank & Movement
  officialRank: number;
  officialPrevRank: number | null;
  calculatedLiveRank?: number;
  rankMovement?: number; // Positive = improved, negative = worsened

  // State
  isLoaded: boolean;
  error?: string | null;
}

/**
 * Live league standing with both official and calculated values
 */
export interface LiveLeagueStanding {
  officialRank: number;
  officialPrevRank: number | null;
  entryId: number;
  playerName: string;
  teamName: string;

  // Official FPL Values
  officialGameweekPoints: number;
  officialTotalPoints: number;

  // Calculated Live Values
  liveGameweekPoints: number;
  calculatedLiveTotal: number;
  calculatedLiveRank?: number;
  rankMovement?: number;

  // Details
  captainName?: string;
  captainRawPoints?: number;
  captainEffectivePoints?: number;
  benchPoints: number;
  playersPlayed: number;
  playersLive: number;
  playersRemaining: number;

  // Metadata
  isConnectedUser: boolean;
  isLoaded: boolean;
  error?: string | null;
}

/**
 * Live league standings response
 */
export interface LiveLeagueStandingsResult {
  leagueId: number;
  leagueName: string;
  gameweekId: number;

  // Standings
  standings: LiveLeagueStanding[];

  // Summary metrics (page-scoped)
  pageAverage: number;
  pageHighest: number;
  pageLowest: number;

  // Scope information
  totalManagersOnPage: number;
  successfullyLoadedManagers: number;

  // Metadata
  dataState: 'live' | 'completed' | 'unknown';
  lastUpdated: Date;
  isCompleted: boolean;
}
