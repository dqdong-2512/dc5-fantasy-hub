/**
 * Season Plan Domain Model
 * Long-term planning structure connecting multiple gameweeks
 * Orchestrates Transfer Plans, Gameweek Plans, and Chip Plans
 */

import type { SquadPlayer } from './TransferPlan';

/**
 * Chip type enumeration
 */
export enum ChipType {
  WILDCARD = 'wildcard',
  FREE_HIT = 'free_hit',
  BENCH_BOOST = 'bench_boost',
  TRIPLE_CAPTAIN = 'triple_captain',
}

/**
 * Chip plan status (planning only, not official)
 */
export type ChipPlanStatus = 'planned';

/**
 * Chip plan - hypothetical chip usage within a season plan
 */
export interface ChipPlan {
  chipType: ChipType;
  status: ChipPlanStatus; // Always 'planned' for season planning
  notes?: string;
}

/**
 * Season Plan Entry - planning details for a single gameweek
 */
export interface SeasonPlanEntry {
  gameweekId: number;
  transferPlanId?: string; // Reference to saved Transfer Plan (not duplicated)
  gameweekPlanId?: string; // Reference to saved Gameweek Plan (not duplicated)
  chipPlan?: ChipPlan; // Planned chip for this gameweek
  notes?: string; // Lightweight notes per gameweek
}

/**
 * Base squad source type
 */
export type BaseSquadSourceType = 'current' | 'active_planned';

/**
 * Season plan validation error code
 */
export enum SeasonPlanErrorCode {
  INVALID_TRANSFER_SEQUENCE = 'INVALID_TRANSFER_SEQUENCE',
  PLAYER_NOT_OWNED_AT_GAMEWEEK = 'PLAYER_NOT_OWNED_AT_GAMEWEEK',
  DUPLICATE_CHIP_USAGE = 'DUPLICATE_CHIP_USAGE',
  INVALID_GAMEWEEK_REFERENCE = 'INVALID_GAMEWEEK_REFERENCE',
  INVALID_TRANSFER_PLAN_REFERENCE = 'INVALID_TRANSFER_PLAN_REFERENCE',
  INVALID_GAMEWEEK_PLAN_REFERENCE = 'INVALID_GAMEWEEK_PLAN_REFERENCE',
  SQUAD_VALIDATION_FAILED = 'SQUAD_VALIDATION_FAILED',
  INSUFFICIENT_BUDGET = 'INSUFFICIENT_BUDGET',
  CLUB_LIMIT_EXCEEDED = 'CLUB_LIMIT_EXCEEDED',
  INVALID_BASE_SQUAD = 'INVALID_BASE_SQUAD',
}

/**
 * Season plan validation warning code
 */
export enum SeasonPlanWarningCode {
  BLANK_PLAYER_IN_STARTING_XI = 'BLANK_PLAYER_IN_STARTING_XI',
  CHIP_PLANNED_WITH_INCOMPLETE_DATA = 'CHIP_PLANNED_WITH_INCOMPLETE_DATA',
  GAMEWEEK_PLAN_SOURCE_MISMATCH = 'GAMEWEEK_PLAN_SOURCE_MISMATCH',
  STALE_TRANSFER_PLAN = 'STALE_TRANSFER_PLAN',
  STALE_GAMEWEEK_PLAN = 'STALE_GAMEWEEK_PLAN',
  STALE_BASE_SQUAD = 'STALE_BASE_SQUAD',
}

/**
 * Season plan validation error detail
 */
export interface SeasonPlanValidationError {
  code: SeasonPlanErrorCode;
  message: string;
  gameweekId?: number;
  details?: Record<string, any>;
}

/**
 * Season plan validation warning detail
 */
export interface SeasonPlanValidationWarning {
  code: SeasonPlanWarningCode;
  message: string;
  gameweekId?: number;
  details?: Record<string, any>;
}

/**
 * Complete season plan validation result
 */
export interface SeasonPlanValidation {
  isValid: boolean;
  errors: SeasonPlanValidationError[];
  warnings: SeasonPlanValidationWarning[];
}

/**
 * Squad snapshot at a specific gameweek (result of sequential simulation)
 */
export interface SeasonSquadSnapshot {
  gameweekId: number;
  squad: SquadPlayer[];
  bank: number;
  totalValue: number;
  isValid: boolean;
  validation?: {
    errors: any[];
    warnings: any[];
  };
}

/**
 * BGW/DGW Analysis result
 */
export interface BGWDGWAnalysis {
  gameweekId: number;
  potentialBGW: boolean;
  blankPlayerIds: number[];
  potentialDGW: boolean;
  dgwPlayerIds: number[];
}

/**
 * Fixture difficulty for a team in a gameweek
 */
export interface TeamFixtureLook {
  teamId: number;
  gameweekId: number;
  fixtures: Array<{
    opponentTeamId: number;
    isHome: boolean;
    difficulty: number;
  }>;
  isBlank: boolean;
  isDouble: boolean;
}

/**
 * Main Season Plan domain model
 */
export interface SeasonPlan {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  startGameweekId: number;
  endGameweekId: number;
  baseSquadSource: BaseSquadSourceType;
  baseSquadSourceTransferPlanId?: string; // If base is 'active_planned'
  entries: SeasonPlanEntry[];
  validation?: SeasonPlanValidation;
}

/**
 * Simulation result for a complete season plan
 */
export interface SeasonPlanSimulationResult {
  seasonPlan: SeasonPlan;
  gameweeks: BGWDGWAnalysis[];
  squadSnapshots: Map<number, SeasonSquadSnapshot>;
  validation: SeasonPlanValidation;
  conflicts: SeasonPlanConflict[];
  summary: SeasonPlanSummary;
}

/**
 * Planning conflict detail
 */
export interface SeasonPlanConflict {
  gameweekId: number;
  type: string;
  message: string;
  suggestedAction?: string;
}

/**
 * Season plan summary metrics
 */
export interface SeasonPlanSummary {
  planningHorizon: {
    startGameweekId: number;
    endGameweekId: number;
    totalGameweeks: number;
  };
  plannedTransfers: number;
  gameweekPlans: number;
  plannedChips: Array<{
    chipType: ChipType;
    gameweekId: number;
  }>;
  potentialBGWs: number;
  potentialDGWs: number;
  validationIssues: number;
}

/**
 * Next action item in a season plan
 */
export interface NextAction {
  gameweekId: number;
  type: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
}

/**
 * Season plan comparison metrics
 */
export interface SeasonPlanComparisonMetrics {
  planA: {
    name: string;
    planningHorizon: number;
    plannedTransfers: number;
    gameweekPlans: number;
    plannedChips: number;
    potentialBGWs: number;
    potentialDGWs: number;
    avgSquadFixtureDifficulty?: number;
  };
  planB: {
    name: string;
    planningHorizon: number;
    plannedTransfers: number;
    gameweekPlans: number;
    plannedChips: number;
    potentialBGWs: number;
    potentialDGWs: number;
    avgSquadFixtureDifficulty?: number;
  };
  byGameweek: Array<{
    gameweekId: number;
    planA: {
      transfers: number;
      hasGameweekPlan: boolean;
      chipType?: ChipType;
      blankPlayers: number;
    };
    planB: {
      transfers: number;
      hasGameweekPlan: boolean;
      chipType?: ChipType;
      blankPlayers: number;
    };
  }>;
}
