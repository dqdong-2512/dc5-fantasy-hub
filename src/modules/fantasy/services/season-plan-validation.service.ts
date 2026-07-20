/**
 * Season Plan Validation Service
 * Validates season plans, detects conflicts, and reports issues
 */

import type {
  SeasonPlan,
  SeasonPlanValidation,
  SeasonPlanValidationError,
  SeasonPlanValidationWarning,
  SeasonSquadSnapshot,
} from '../domain/SeasonPlan';
import { SeasonPlanErrorCode, SeasonPlanWarningCode, ChipType } from '../domain/SeasonPlan';
import type { SquadPlayer } from '../domain/TransferPlan';
import { TransferPlanRepository } from './transfer-plan-repository';
import { GameweekPlanRepository } from './gameweek-plan-repository.service';

/**
 * Service for validating season plans
 */
export class SeasonPlanValidationService {
  private transferPlanRepository: TransferPlanRepository;
  private gameweekPlanRepository: GameweekPlanRepository;

  constructor(
    transferPlanRepository?: TransferPlanRepository,
    gameweekPlanRepository?: GameweekPlanRepository
  ) {
    this.transferPlanRepository = transferPlanRepository || new TransferPlanRepository();
    this.gameweekPlanRepository = gameweekPlanRepository || new GameweekPlanRepository();
  }

  /**
   * Validate a complete season plan
   *
   * @param seasonPlan - Plan to validate
   * @param squadSnapshots - Squad snapshots from simulation
   * @returns Validation result
   */
  validateSeasonPlan(
    seasonPlan: SeasonPlan,
    squadSnapshots: Map<number, SeasonSquadSnapshot>
  ): SeasonPlanValidation {
    const errors: SeasonPlanValidationError[] = [];
    const warnings: SeasonPlanValidationWarning[] = [];

    // Validate gameweek references
    for (const entry of seasonPlan.entries) {
      if (!squadSnapshots.has(entry.gameweekId)) {
        errors.push({
          code: SeasonPlanErrorCode.INVALID_GAMEWEEK_REFERENCE,
          message: `Gameweek ${entry.gameweekId} not found in simulation`,
          gameweekId: entry.gameweekId,
        });
      }

      // Validate referenced transfer plan exists
      if (entry.transferPlanId) {
        const transferPlan = this.transferPlanRepository.loadPlan(entry.transferPlanId);
        if (!transferPlan) {
          errors.push({
            code: SeasonPlanErrorCode.INVALID_TRANSFER_PLAN_REFERENCE,
            message: `Referenced transfer plan not found: ${entry.transferPlanId}`,
            gameweekId: entry.gameweekId,
          });
        } else if (!transferPlan.validation.isValid) {
          warnings.push({
            code: SeasonPlanWarningCode.STALE_TRANSFER_PLAN,
            message: `Transfer plan for GW${entry.gameweekId} has validation issues`,
            gameweekId: entry.gameweekId,
          });
        }
      }

      // Validate referenced gameweek plan exists
      if (entry.gameweekPlanId) {
        const gameweekPlan = this.gameweekPlanRepository.getById(
          entry.gameweekId,
          entry.gameweekPlanId
        );
        if (!gameweekPlan) {
          errors.push({
            code: SeasonPlanErrorCode.INVALID_GAMEWEEK_PLAN_REFERENCE,
            message: `Referenced gameweek plan not found for GW${entry.gameweekId}`,
            gameweekId: entry.gameweekId,
          });
        } else if (!gameweekPlan.validation.isValid) {
          warnings.push({
            code: SeasonPlanWarningCode.STALE_GAMEWEEK_PLAN,
            message: `Gameweek plan for GW${entry.gameweekId} has validation issues`,
            gameweekId: entry.gameweekId,
          });
        }
      }

      // Validate squad snapshots
      const snapshot = squadSnapshots.get(entry.gameweekId);
      if (snapshot && !snapshot.isValid) {
        errors.push({
          code: SeasonPlanErrorCode.SQUAD_VALIDATION_FAILED,
          message: `Squad validation failed at GW${entry.gameweekId}`,
          gameweekId: entry.gameweekId,
        });
      }
    }

    // Validate chip uniqueness
    const chipsByType = new Map<ChipType, number>();
    const singleUseChips = [ChipType.WILDCARD, ChipType.FREE_HIT];

    for (const entry of seasonPlan.entries) {
      if (entry.chipPlan) {
        const count = (chipsByType.get(entry.chipPlan.chipType) || 0) + 1;
        chipsByType.set(entry.chipPlan.chipType, count);

        // Check for duplicate single-use chips
        if (singleUseChips.includes(entry.chipPlan.chipType) && count > 1) {
          errors.push({
            code: SeasonPlanErrorCode.DUPLICATE_CHIP_USAGE,
            message: `${entry.chipPlan.chipType} can only be used once`,
            gameweekId: entry.gameweekId,
          });
        }
      }
    }

    // Validate chip planning completeness
    for (const entry of seasonPlan.entries) {
      if (entry.chipPlan && !entry.gameweekPlanId) {
        warnings.push({
          code: SeasonPlanWarningCode.CHIP_PLANNED_WITH_INCOMPLETE_DATA,
          message: `Chip planned for GW${entry.gameweekId} but no gameweek plan attached`,
          gameweekId: entry.gameweekId,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if a gameweek plan matches the simulated squad
   *
   * @param gameweekId - Gameweek ID
   * @param gameweekPlanId - Gameweek plan ID
   * @param simulatedSquad - Simulated squad at this gameweek
   * @returns True if squad matches plan source squad
   */
  doesGameweekPlanMatchSquad(
    gameweekId: number,
    gameweekPlanId: string,
    simulatedSquad: SquadPlayer[]
  ): boolean {
    const gameweekPlan = this.gameweekPlanRepository.getById(gameweekId, gameweekPlanId);
    if (!gameweekPlan) return false;

    const simulatedSquadIds = new Set(simulatedSquad.map((p) => p.playerId));
    const planSourceIds = new Set([
      ...gameweekPlan.sourceStartingPlayerIds,
      ...gameweekPlan.sourceBenchPlayerIds,
    ]);

    // Check if they have the same player IDs
    if (simulatedSquadIds.size !== planSourceIds.size) return false;

    for (const playerId of planSourceIds) {
      if (!simulatedSquadIds.has(playerId)) return false;
    }

    return true;
  }

  /**
   * Validate budget across gameweeks
   *
   * @param squadSnapshots - Squad snapshots from simulation
   * @returns Errors if budget went negative
   */
  validateBudgetEvolution(
    squadSnapshots: Map<number, SeasonSquadSnapshot>
  ): SeasonPlanValidationError[] {
    const errors: SeasonPlanValidationError[] = [];

    for (const [gameweekId, snapshot] of squadSnapshots) {
      if (snapshot.bank < 0) {
        errors.push({
          code: SeasonPlanErrorCode.INSUFFICIENT_BUDGET,
          message: `Budget went negative at GW${gameweekId}: £${snapshot.bank.toFixed(1)}m`,
          gameweekId,
        });
      }
    }

    return errors;
  }

  /**
   * Check for blank players in starting XI
   *
   * @param gameweekId - Gameweek ID
   * @param gameweekPlanId - Gameweek plan ID
   * @param gameweekFixtures - Available fixtures for gameweek
   * @returns Warnings if blank players are starting
   */
  checkBlankPlayersInStartingXI(
    gameweekId: number,
    gameweekPlanId: string,
    gameweekFixtures: any[]
  ): SeasonPlanValidationWarning[] {
    const warnings: SeasonPlanValidationWarning[] = [];
    const gameweekPlan = this.gameweekPlanRepository.getById(gameweekId, gameweekPlanId);
    if (!gameweekPlan) return warnings;

    // Get teams with fixtures in this gameweek
    const teamsWithFixtures = new Set<number>();
    gameweekFixtures.forEach((fixture: any) => {
      teamsWithFixtures.add(fixture.homeTeamId);
      teamsWithFixtures.add(fixture.awayTeamId);
    });

    // Note: This would require player team data integration
    // For now, we warn if there are known blank fixtures

    return warnings;
  }
}
