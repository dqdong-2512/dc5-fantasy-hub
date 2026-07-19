/**
 * Player Analytics Domain Models
 * Derived metrics for player analytics and transfer intelligence
 */

import type { Position } from '../enums';

/**
 * Raw player metrics (from FPL)
 */
export interface RawPlayerMetrics {
  totalPoints: number;
  form: number;
  price: number;
  ownership: number;
  pointsPerGame: number;
  minutesPlayed: number;
}

/**
 * Ownership category for classification
 */
export enum OwnershipCategory {
  HighlyOwned = 'highly_owned', // > 50%
  Popular = 'popular', // 20-50%
  Differential = 'differential', // 5-20%
  UltraDifferential = 'ultra_differential', // < 5%
}

/**
 * Value Score - Points per unit price
 */
export interface ValueMetrics {
  valueScore: number; // totalPoints / normalizedPrice
  ownershipCategory: OwnershipCategory;
  isUnderperfoming: boolean; // Low ownership but decent performance
}

/**
 * Form analysis metrics
 */
export interface FormMetrics {
  formScore: number; // Normalized form (0-10)
  isInForm: boolean;
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * Differential potential analysis
 */
export interface DifferentialMetrics {
  differentialScore: number; // Combines performance + low ownership
  differentialPotential: 'high' | 'medium' | 'low';
  performanceVsOwnership: number; // How much better they perform than expected for ownership
}

/**
 * Fixture analysis metrics
 */
export interface FixtureMetrics {
  fixtureScore: number; // Normalized fixture difficulty (0-10, higher is better)
  averageFdrNext3: number;
  averageFdrNext5: number;
  fixtureOutlook: 'very_favorable' | 'favorable' | 'neutral' | 'difficult' | 'very_difficult';
}

/**
 * Complete player analytics record
 */
export interface PlayerAnalyticsRecord {
  playerId: number;
  playerName: string;
  position: Position;
  club: string;
  price: number;

  // Raw metrics
  totalPoints: number;
  form: number;
  ownership: number;
  pointsPerGame: number;
  minutesPlayed: number;

  // Derived metrics
  valueScore: number;
  ownershipCategory: OwnershipCategory;
  formScore: number;
  differentialScore: number;
  fixtureScore: number;
  fixtureOutlook: string;

  // Composite scores
  overallScore: number;
  transferTargetScore: number;

  // Flags
  isInMyTeam?: boolean;
  isDifferential: boolean;
  isValuePick: boolean;
  hasGoodFixtures: boolean;
}

/**
 * Player comparison row
 */
export interface PlayerComparisonRecord {
  playerId: number;
  playerName: string;
  position: Position;
  club: string;
  price: number;
  totalPoints: number;
  form: number;
  ownership: number;
  pointsPerGame: number;
  minutesPlayed: number;
  valueScore: number;
  differentialScore: number;
  fixtureScore: number;
  isInMyTeam?: boolean;
}

/**
 * Transfer target ranking
 */
export interface TransferTarget {
  playerId: number;
  playerName: string;
  position: Position;
  club: string;
  price: number;
  category: 'form' | 'value' | 'differential' | 'fixtures';
  score: number;
  reasoning: string;
  isInMyTeam?: boolean;
}

/**
 * Shortlist entry
 */
export interface ShortlistEntry {
  playerId: number;
  addedAt: number; // timestamp
}
