/**
 * Player Fixture Types
 * Type definitions for player fixture analysis and presentation
 */

import type { Fixture, Team } from '@domain/models';

/**
 * Single fixture for a player's upcoming schedule
 */
export interface PlayerUpcomingFixture {
  fixture: Fixture;
  gameweek: number;
  opponent: Team;
  opponentBadge: string;
  homeAway: 'H' | 'A';
  kickoffTime: string;
  difficulty: number;
  difficultyLabel: string;
}

/**
 * Summary of player's upcoming fixture run
 */
export interface PlayerFixtureSummary {
  avgDifficulty: number;
  homeFixtures: number;
  awayFixtures: number;
  easiestDifficulty: number;
  hardestDifficulty: number;
  upcomingFixtures: PlayerUpcomingFixture[];
  hasUpcomingFixtures: boolean;
}

/**
 * Fixture outlook classification
 */
export enum FixtureOutlook {
  VeryFavorable = 'very_favorable',
  Favorable = 'favorable',
  Neutral = 'neutral',
  Difficult = 'difficult',
  VeryDifficult = 'very_difficult',
  NoUpcoming = 'no_upcoming',
}

/**
 * Player with fixture intelligence
 */
export interface PlayerWithFixtureIntelligence {
  playerId: number;
  playerName: string;
  club: Team;
  price: number;
  form: number;
  minutesPlayed: number;
  avgFdr: number;
  fixtureOutlook: FixtureOutlook;
  nextFixtures: PlayerUpcomingFixture[];
}
