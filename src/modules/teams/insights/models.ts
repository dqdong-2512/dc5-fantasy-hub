/**
 * Club Intelligence Models
 * Type definitions for club analysis and intelligence
 */

import type { Team, Fixture } from '@domain/models';

/**
 * Key player for a club with fantasy metrics
 */
export interface ClubKeyPlayer {
  id: number;
  name: string;
  position: string;
  price: number;
  totalPoints: number;
  form: number;
  ownership: number;
}

/**
 * Club fixture run information
 */
export interface ClubFixtureRun {
  upcomingCount: number;
  averageFdr: number;
  homeCount: number;
  awayCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

/**
 * Club strength overview
 */
export interface ClubStrengthOverview {
  overall: number;
  overallHome: number;
  overallAway: number;
  attackHome: number;
  attackAway: number;
  defenceHome: number;
  defenceAway: number;
}

/**
 * Club fantasy metrics - aggregate statistics
 */
export interface ClubFantasyMetrics {
  totalPlayerPoints: number;
  averagePlayerForm: number;
  averageOwnership: number;
  highestOwnedPlayer: ClubKeyPlayer | null;
  highestScoringPlayer: ClubKeyPlayer | null;
  squadPlayerCount: number;
  activePlayerCount: number;
}

/**
 * Complete club intelligence profile
 */
export interface ClubIntelligence {
  team: Team;
  strengthOverview: ClubStrengthOverview;
  fixtureRun: ClubFixtureRun;
  keyPlayers: ClubKeyPlayer[];
  fantasyMetrics: ClubFantasyMetrics;
  nextFixture: Fixture | null;
  allUpcomingFixtures: Fixture[];
}
