/**
 * Player Fixture Intelligence Configuration
 * Centralized constants for fixture analysis
 */

// Default number of fixtures to analyze for a player
export const PLAYER_FIXTURE_HORIZON = 5;

// Fixture difficulty thresholds for outlook classification
// Average FDR ranges from 1-5
export const FIXTURE_OUTLOOK_THRESHOLDS = {
  VERY_FAVORABLE_MAX: 2.0, // 1.0-2.0
  FAVORABLE_MAX: 2.8, // 2.0-2.8
  NEUTRAL_MAX: 3.2, // 2.8-3.2
  DIFFICULT_MAX: 4.0, // 3.2-4.0
  // 4.0-5.0 is Very Difficult
};

// Favorable fixture filter thresholds
export const FIXTURE_FILTER_THRESHOLDS = {
  EASY_MAX: 2.5, // Average FDR <= 2.5
  NEUTRAL_MIN: 2.5,
  NEUTRAL_MAX: 3.5,
  DIFFICULT_MIN: 3.5, // Average FDR > 3.5
};

// Player fixture intelligence criteria
export const PLAYER_FIXTURE_CRITERIA = {
  MIN_FORM: 5.0, // Minimum form to be considered
  MIN_MINUTES: 500, // Minimum minutes played this season
  FAVORABLE_FIXTURE_RUN_THRESHOLD: 2.5, // Max avg FDR to be considered favorable
};
