/**
 * Fixture Intelligence Models
 * Type definitions for fixture analysis and insights
 */

import type { Team } from '@domain/models';

/**
 * Fixture run for a single gameweek fixture
 */
export interface FixtureRun {
  opponent: Team;
  difficulty: number;
  isHome: boolean;
}

/**
 * Team fixture difficulty analysis
 */
export interface TeamFixtureDifficultyAnalysis {
  team: Team;
  upcomingCount: number;
  averageDifficulty: number;
  homeFixtures: number;
  awayFixtures: number;
  runs: FixtureRun[];
}

/**
 * Fixture run summary with combined difficulty
 */
export interface FixtureRunSummary {
  team: Team;
  averageDifficulty: number;
  fixtures: number;
  homeFixtures: number;
  awayFixtures: number;
  sequenceLabel: string;
}
