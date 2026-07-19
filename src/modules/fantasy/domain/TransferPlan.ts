/**
 * Transfer Plan Domain Models
 * Core types for transfer planning and squad optimization
 */

/**
 * Single transfer move: one player out, one player in
 */
export interface TransferMove {
  playerOutId: number;
  playerInId: number;
  playerOutName?: string;
  playerInName?: string;
  sellingPriceOut: number; // Estimated or actual selling value in tenths
  purchasePriceIn: number; // Current price of incoming player in tenths
  bankBefore: number; // Bank before this transfer
  bankAfter: number; // Bank after this transfer
}

/**
 * Validation error code for transfer/squad validation
 */
export enum ValidationErrorCode {
  INSUFFICIENT_BUDGET = 'INSUFFICIENT_BUDGET',
  CLUB_LIMIT_EXCEEDED = 'CLUB_LIMIT_EXCEEDED',
  INVALID_POSITION = 'INVALID_POSITION',
  PLAYER_ALREADY_OWNED = 'PLAYER_ALREADY_OWNED',
  PLAYER_NOT_IN_SQUAD = 'PLAYER_NOT_IN_SQUAD',
  DUPLICATE_TRANSFER = 'DUPLICATE_TRANSFER',
  INVALID_SQUAD_SIZE = 'INVALID_SQUAD_SIZE',
  INVALID_POSITION_COMPOSITION = 'INVALID_POSITION_COMPOSITION',
}

/**
 * Validation error detail
 */
export interface ValidationError {
  code: ValidationErrorCode;
  message: string;
  playerIds?: number[];
  details?: Record<string, any>;
}

/**
 * Complete transfer plan validation result
 */
export interface TransferPlanValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Squad comparison metrics: before and after a plan
 */
export interface SquadComparisonMetrics {
  squadValueBefore: number; // Sum of all player prices
  squadValueAfter: number;
  bankBefore: number;
  bankAfter: number;
  totalPointsBefore: number; // Sum of all season points
  totalPointsAfter: number;
  avgFormBefore: number; // Average form score
  avgFormAfter: number;
  avgFixtureBefore: number; // Average fixture score
  avgFixtureAfter: number;
  valueScoreChanges?: {
    before: number;
    after: number;
  };
}

/**
 * Complete transfer plan with all moves
 */
export interface TransferPlan {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  gameweekId: number;
  transfers: TransferMove[];
  originalBank: number;
  projectedBank: number;
  validation: TransferPlanValidation;
  metrics?: SquadComparisonMetrics;
}

/**
 * Planned squad snapshot: current squad + all transfers applied
 */
export interface PlannedSquad {
  players: SquadPlayer[];
  totalValue: number;
  bank: number;
  isValid: boolean;
  validation: TransferPlanValidation;
}

/**
 * Squad player with all necessary fields for planning
 */
export interface SquadPlayer {
  playerId: number;
  position: number; // FPL position (1=GK, 2-5=DEF, 6-8=MID, 9-11=FWD)
  isStarter: boolean;
  benchOrder?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  price: number;
  teamId: number;
  totalPoints: number;
  form: number;
  valueScore?: number;
  fixtureScore?: number;
  transferTargetScore?: number;
  isTransferredIn?: boolean; // Mark if this player was just transferred in
  isTransferredOut?: boolean; // Mark if this player was just transferred out
}
