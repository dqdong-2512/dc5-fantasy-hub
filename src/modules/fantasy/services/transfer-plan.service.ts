/**
 * Transfer Plan Service
 * Orchestrates building and managing transfer plans
 */

import type {
  TransferPlan,
  TransferMove,
  SquadPlayer,
  TransferPlanValidation,
} from '../domain/TransferPlan';
import { ValidationErrorCode } from '../domain/TransferPlan';
import { SquadValidationService } from './squad-validation.service';
import { SquadSimulationService } from './squad-simulation.service';
import { PlayerRepository } from '@repositories/players';

/**
 * Service for building and managing transfer plans
 */
export class TransferPlanService {
  private validationService: SquadValidationService;
  private simulationService: SquadSimulationService;
  private playerRepo: PlayerRepository;

  constructor(
    validationService?: SquadValidationService,
    simulationService?: SquadSimulationService,
    playerRepo?: PlayerRepository
  ) {
    this.validationService = validationService || new SquadValidationService();
    this.simulationService = simulationService || new SquadSimulationService();
    this.playerRepo = playerRepo || new PlayerRepository();
  }

  /**
   * Build a new transfer plan
   *
   * @param gameweekId - Current gameweek
   * @param name - Plan name
   * @returns Empty transfer plan
   */
  buildTransferPlan(gameweekId: number, name: string = ''): TransferPlan {
    return {
      id: this.generatePlanId(),
      name: name || `GW${gameweekId} Plan`,
      createdAt: new Date(),
      updatedAt: new Date(),
      gameweekId,
      transfers: [],
      originalBank: 0,
      projectedBank: 0,
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
      },
    };
  }

  /**
   * Add a transfer move to a plan
   * Validates and recalculates
   *
   * @param plan - Current plan
   * @param transfer - Transfer move to add
   * @param currentSquad - Current squad
   * @param currentBank - Current bank
   * @returns Updated plan
   */
  addTransfer(
    plan: TransferPlan,
    transfer: TransferMove,
    currentSquad: SquadPlayer[],
    currentBank: number
  ): TransferPlan {
    // Validate this transfer is not a duplicate
    const duplicate = plan.transfers.some(
      (t) => t.playerOutId === transfer.playerOutId && t.playerInId === transfer.playerInId
    );
    if (duplicate) {
      plan.validation.errors.push({
        code: ValidationErrorCode.DUPLICATE_TRANSFER,
        message: `Transfer ${transfer.playerOutId} → ${transfer.playerInId} already in plan`,
      });
      plan.validation.isValid = false;
      return plan;
    }

    // Add transfer
    const newTransfers = [...plan.transfers, transfer];

    // Recalculate entire plan
    return this.recalculatePlan(plan, newTransfers, currentSquad, currentBank);
  }

  /**
   * Remove a transfer from a plan
   * Recalculates all remaining transfers
   *
   * @param plan - Current plan
   * @param transferIndex - Index of transfer to remove
   * @param currentSquad - Current squad
   * @param currentBank - Current bank
   * @returns Updated plan
   */
  removeTransfer(
    plan: TransferPlan,
    transferIndex: number,
    currentSquad: SquadPlayer[],
    currentBank: number
  ): TransferPlan {
    if (transferIndex < 0 || transferIndex >= plan.transfers.length) {
      return plan;
    }

    // Remove transfer
    const newTransfers = plan.transfers.filter((_, i) => i !== transferIndex);

    // Recalculate entire plan
    return this.recalculatePlan(plan, newTransfers, currentSquad, currentBank);
  }

  /**
   * Clear all transfers from a plan
   *
   * @param plan - Current plan
   * @returns Reset plan
   */
  clearPlan(plan: TransferPlan): TransferPlan {
    return {
      ...plan,
      transfers: [],
      projectedBank: plan.originalBank,
      updatedAt: new Date(),
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
      },
      metrics: undefined,
    };
  }

  /**
   * Validate a replacement candidate for transfer eligibility
   *
   * @param outgoingPlayerId - Player being removed
   * @param incomingPlayerId - Player being added
   * @param currentSquad - Current squad
   * @param availableBudget - Available budget in millions
   * @returns Validation result
   */
  validateReplacementCandidate(
    outgoingPlayerId: number,
    incomingPlayerId: number,
    currentSquad: SquadPlayer[],
    availableBudget: number
  ): TransferPlanValidation {
    // Validate transfer is valid
    const transferValidation = this.validationService.validateTransfer(
      currentSquad,
      outgoingPlayerId,
      incomingPlayerId
    );

    if (!transferValidation.isValid) {
      return transferValidation;
    }

    // Check budget
    const incomingPlayer = this.playerRepo.getById(incomingPlayerId);
    if (!incomingPlayer) {
      return {
        isValid: false,
        errors: [
          {
            code: ValidationErrorCode.INVALID_POSITION,
            message: `Player ${incomingPlayerId} not found`,
          },
        ],
        warnings: [],
      };
    }

    const incomingPriceInMm = incomingPlayer.price / 10;
    if (incomingPriceInMm > availableBudget) {
      return {
        isValid: false,
        errors: [
          {
            code: ValidationErrorCode.INSUFFICIENT_BUDGET,
            message: `Player ${incomingPlayer.displayName} costs £${incomingPriceInMm.toFixed(1)}m (available: £${availableBudget.toFixed(1)}m)`,
            details: {
              playerPrice: incomingPriceInMm,
              availableBudget,
              shortfall: incomingPriceInMm - availableBudget,
            },
          },
        ],
        warnings: [],
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Filter replacement candidates by eligibility
   * Private because used internally
   *
   * @param currentSquad - Current squad
   * @param plannedSquadIds - IDs already in planned squad
   * @param outgoingPlayerId - Player being removed
   * @param availableBudget - Available budget in millions
   * @returns Array of eligible player IDs
   */
  filterEligibleCandidates(
    currentSquad: SquadPlayer[],
    plannedSquadIds: Set<number>,
    outgoingPlayerId: number,
    availableBudget: number
  ): number[] {
    const outPlayer = currentSquad.find((p) => p.playerId === outgoingPlayerId);
    if (!outPlayer) return [];

    const allPlayers = this.playerRepo.getAll();
    const eligible: number[] = [];

    for (const player of allPlayers) {
      // Must be same position
      if (this.getPositionNumber(player.position) !== outPlayer.position) continue;

      // Must not be already owned
      if (plannedSquadIds.has(player.id)) continue;

      // Must be within budget
      if (player.price / 10 > availableBudget) continue;

      // Check club limits if applicable
      // This would be checked when adding; for now just add to list

      eligible.push(player.id);
    }

    return eligible;
  }

  /**
   * Recalculate plan after changes
   * Re-validates and recalculates all metrics
   *
   * @param plan - Current plan
   * @param newTransfers - New transfer list
   * @param currentSquad - Current squad
   * @param currentBank - Current bank
   * @returns Updated plan with recalculations
   */
  private recalculatePlan(
    plan: TransferPlan,
    newTransfers: TransferMove[],
    currentSquad: SquadPlayer[],
    currentBank: number
  ): TransferPlan {
    // Simulate planned squad
    const plannedSquadResult = this.simulationService.applyTransfers(
      currentSquad,
      newTransfers,
      currentBank
    );

    // Calculate metrics
    const metrics = this.simulationService.calculateComparisonMetrics(
      currentSquad,
      plannedSquadResult.players,
      currentBank,
      plannedSquadResult.bank
    );

    return {
      ...plan,
      transfers: newTransfers,
      projectedBank: plannedSquadResult.bank,
      originalBank: currentBank,
      updatedAt: new Date(),
      validation: plannedSquadResult.validation,
      metrics,
    };
  }

  /**
   * Generate unique plan ID
   *
   * @returns Plan ID
   */
  private generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert domain Position to FPL position number
   *
   * @param position - Domain position
   * @returns FPL position number
   */
  private getPositionNumber(position: string): number {
    switch (position) {
      case 'GOALKEEPER':
        return 1;
      case 'DEFENDER':
        return 2;
      case 'MIDFIELDER':
        return 6;
      case 'FORWARD':
        return 9;
      default:
        return 0;
    }
  }
}
