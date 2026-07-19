/**
 * Gameweek Plan Domain Model
 * Represents planning decisions for a specific gameweek
 * Separate from current squad and transfer plans
 */

/**
 * Validation error for gameweek plan
 */
export interface GameweekPlanValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validation result for gameweek plan
 */
export interface GameweekPlanValidation {
  isValid: boolean;
  errors: GameweekPlanValidationError[];
  warnings: GameweekPlanValidationError[];
}

/**
 * Squad source type
 */
export type SquadSourceType = 'current' | 'planned';

/**
 * Gameweek Plan - represents lineup decisions for a specific gameweek
 */
export interface GameweekPlan {
  // Metadata
  id: string;
  name: string;
  gameweekId: number;
  sourceType: SquadSourceType;
  sourceTransferPlanId?: string; // If sourceType is 'planned'
  createdAt: Date;
  updatedAt: Date;

  // Lineup selections
  startingPlayerIds: number[]; // Exactly 11
  benchPlayerIds: number[]; // Exactly 4 (ordered: GK, outfield 1, outfield 2, outfield 3)
  captainPlayerId: number | null;
  viceCaptainPlayerId: number | null;

  // Validation
  validation: GameweekPlanValidation;

  // Original source lineup (for comparison)
  sourceStartingPlayerIds: number[];
  sourceBenchPlayerIds: number[];
  sourceCaptainPlayerId: number | null;
  sourceViceCaptainPlayerId: number | null;
}

/**
 * Player in gameweek plan context
 */
export interface GameweekPlanPlayer {
  playerId: number;
  position: number; // 1=GK, 2=DEF, 6=MID, 9=FWD
  isStarter: boolean;
  isBench: boolean;
  benchOrder?: number; // Order among bench (1-3 for outfield, or undefined for GK)
  isCaptain: boolean;
  isViceCaptain: boolean;

  // Fixture context
  fixture?: {
    opponent: string;
    homeAway: 'H' | 'A';
    difficulty: number;
  };
  fixtures?: Array<{
    opponent: string;
    homeAway: 'H' | 'A';
    difficulty: number;
  }>;
  hasBlank: boolean;
  doubleFixture: boolean;

  // Player analytics
  form: number;
  totalPoints: number;
  pointsPerGame: number;
  fixtureScore: number;
  ownership: number;

  // Change status
  changedFromStarting?: boolean; // Was in starting XI in source
  changedFromBench?: boolean; // Was on bench in source
  changedPositionInBench?: boolean; // Moved in bench order
}

/**
 * Gameweek plan comparison metrics
 */
export interface GameweekPlanComparison {
  // Lineup changes
  playersMovedToStarting: GameweekPlanPlayer[];
  playersMovedToBench: GameweekPlanPlayer[];
  benchOrderChanges: Array<{ playerId: number; oldOrder: number; newOrder: number }>;

  // Captain/VC changes
  captainChanged: boolean;
  oldCaptainId: number | null;
  newCaptainId: number | null;
  viceCaptainChanged: boolean;
  oldViceCaptainId: number | null;
  newViceCaptainId: number | null;

  // Analytics
  avgFormBefore: number;
  avgFormAfter: number;
  avgFixtureScoreBefore: number;
  avgFixtureScoreAfter: number;
  totalPointsBefore: number;
  totalPointsAfter: number;

  // Fixture risk
  playersWithBlankBefore: number;
  playersWithBlankAfter: number;
  playersWithDoubleFixtureBefore: number;
  playersWithDoubleFixtureAfter: number;
}

/**
 * Lineup insight - transparent, deterministic observation
 */
export interface LineupInsight {
  type:
    | 'strong_bench_option'
    | 'difficult_fixture_starting'
    | 'easier_bench_fixture'
    | 'high_form_bench'
    | 'blank_gameweek_starting'
    | 'double_gameweek_bench'
    | 'captain_has_blank'
    | 'low_form_captain';
  message: string;
  playerId?: number;
  playerName?: string;
  severity: 'info' | 'warning' | 'consideration';
}

/**
 * Captain candidate with scoring
 */
export interface CaptainCandidate {
  playerId: number;
  playerName: string;
  position: string;
  club: string;
  form: number;
  pointsPerGame: number;
  fixtureScore: number;
  fixture?: {
    opponent: string;
    homeAway: 'H' | 'A';
    difficulty: number;
  };
  fixtures?: Array<{
    opponent: string;
    homeAway: 'H' | 'A';
    difficulty: number;
  }>;
  captainSuitabilityScore: number; // Normalized 0-10
  ownership: number;
}

/**
 * Squad fixture outlook
 */
export interface SquadFixtureOutlook {
  playersWithFixture: number;
  playersWithBlank: number;
  playersWithDoubleFixture: number;
  avgFixtureDifficulty: number;
  startingXiAvgDifficulty: number;
  benchAvgDifficulty: number;
  blankGameweekPlayers: number[];
  doubleGameweekPlayers: number[];
}
