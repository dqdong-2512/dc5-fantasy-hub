/**
 * Live Squad Performance Models
 * Represents merged pick + live stats data for gameweek squad performance
 */

/**
 * Individual player match status
 */
export enum PlayerMatchStatus {
  NotStarted = 'NOT_STARTED',
  Live = 'LIVE',
  Finished = 'FINISHED',
  NoFixture = 'NO_FIXTURE',
  Unknown = 'UNKNOWN',
}

/**
 * Individual player stats from live data
 */
export interface LivePlayerStats {
  playerId: number;
  minutes: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  ownGoals: number;
  penaltiesSaved: number;
  penaltiesMissed: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  bonus: number;
  bps: number;
  totalPoints: number;
}

/**
 * Live squad player - combination of pick data + live stats + enrichment
 */
export interface LiveSquadPlayer {
  // Pick data
  playerId: number;
  squadPosition: number; // 1-15, where > 11 is bench
  isCaptain: boolean;
  isViceCaptain: boolean;
  isBench: boolean;
  benchOrder?: number; // Order among bench players if on bench

  // Live performance
  matchStatus: PlayerMatchStatus;
  gameweekPoints: number; // Raw points from live data
  effectivePoints: number; // After multiplier (captain = 2x, vc = 1x normally but only if starter plays)

  // Live player stats
  minutes: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  ownGoals: number;
  penaltiesSaved: number;
  penaltiesMissed: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  bonus: number;
  bps: number;

  // Enrichment (optional, may not be available)
  playerName?: string;
  playerPosition?: string; // GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD
  clubCode?: string;
  clubName?: string;
  playerImage?: string;
}

/**
 * Live gameweek summary for squad
 */
export interface LiveGameweekSummary {
  gameweekId: number;
  isLive: boolean; // True if gameweek is currently active
  isCompleted: boolean; // True if gameweek has finished

  // Scoring summary
  totalPoints: number; // Live calculated total
  officialPoints: number | null; // Official FPL final points if available
  deductedPoints: number; // Transfer costs + other deductions

  // Squad breakdown
  playersPlayed: number;
  playersLive: number;
  playersRemaining: number;

  // Special scoring
  captainPoints: number;
  benchPoints: number;

  // Status tracking
  lastUpdated: Date;
  dataState: 'live' | 'completed' | 'unknown';
}

/**
 * Complete live squad performance for a gameweek
 */
export interface LiveSquadPerformance {
  entryId: number;
  gameweekId: number;

  summary: LiveGameweekSummary;

  starters: LiveSquadPlayer[]; // Position 1-11
  bench: LiveSquadPlayer[]; // Position 12-15

  // Highlights for deterministic summary
  highlights: {
    topScorer?: {
      playerId: number;
      playerName?: string;
      points: number;
    };
    captainContribution?: {
      playerId: number;
      playerName?: string;
      effectivePoints: number;
      basePoints: number;
    };
    benchHighlight?: {
      playerId: number;
      playerName?: string;
      points: number;
    };
    highestScoringDefender?: {
      playerId: number;
      playerName?: string;
      points: number;
    };
    highestScoringMidfielder?: {
      playerId: number;
      playerName?: string;
      points: number;
    };
  };
}
