/**
 * Season Squad Simulation Service
 * Handles sequential squad simulation across multiple gameweeks
 * Each gameweek uses the previous gameweek's simulated squad as input
 */

import type {
  SeasonPlan,
  SeasonPlanEntry,
  SeasonSquadSnapshot,
  SeasonPlanValidation,
  SeasonPlanConflict,
} from '../domain/SeasonPlan';
import type { SquadPlayer, TransferPlan } from '../domain/TransferPlan';
import { SquadSimulationService } from './squad-simulation.service';
import { SquadValidationService } from './squad-validation.service';
import { TransferPlanRepository } from './transfer-plan-repository';
import { SeasonPlanErrorCode } from '../domain/SeasonPlan';

/**
 * Service for simulating squad evolution across a season plan
 */
export class SeasonSquadSimulationService {
  private squadSimulationService: SquadSimulationService;
  private validationService: SquadValidationService;
  private transferPlanRepository: TransferPlanRepository;

  constructor(
    squadSimulationService?: SquadSimulationService,
    validationService?: SquadValidationService,
    transferPlanRepository?: TransferPlanRepository
  ) {
    this.squadSimulationService = squadSimulationService || new SquadSimulationService();
    this.validationService = validationService || new SquadValidationService();
    this.transferPlanRepository = transferPlanRepository || new TransferPlanRepository();
  }

  /**
   * Simulate squad evolution across all gameweeks in a season plan
   * Each gameweek uses the previous gameweek's squad
   *
   * @param seasonPlan - Season plan to simulate
   * @param baseSquad - Starting squad (current or planned)
   * @param baseBank - Starting bank
   * @returns Map of gameweekId to squad snapshot
   */
  simulateSeasonSquadEvolution(
    seasonPlan: SeasonPlan,
    baseSquad: SquadPlayer[],
    baseBank: number
  ): { snapshots: Map<number, SeasonSquadSnapshot>; conflicts: SeasonPlanConflict[] } {
    const snapshots = new Map<number, SeasonSquadSnapshot>();
    const conflicts: SeasonPlanConflict[] = [];

    let currentSquad = this.deepCopySquad(baseSquad);
    let currentBank = baseBank;

    // Sort entries by gameweek for sequential processing
    const sortedEntries = [...seasonPlan.entries].sort((a, b) => a.gameweekId - b.gameweekId);

    // Simulate each gameweek in sequence
    for (const entry of sortedEntries) {
      const snapshot = this.simulateGameweekSquadState(entry, currentSquad, currentBank);

      snapshots.set(entry.gameweekId, snapshot);

      // If squad is valid, use it as input for next gameweek
      // If invalid, keep previous squad and track conflict
      if (snapshot.isValid) {
        currentSquad = this.deepCopySquad(snapshot.squad);
        currentBank = snapshot.bank;
      } else {
        // Track transfer conflict
        if (entry.transferPlanId) {
          conflicts.push({
            gameweekId: entry.gameweekId,
            type: 'TRANSFER_CONFLICT',
            message: `Transfer plan is invalid at GW${entry.gameweekId}`,
            suggestedAction: 'Review or remove transfer plan',
          });
        }
      }
    }

    return { snapshots, conflicts };
  }

  /**
   * Simulate squad state for a single gameweek entry
   * Applies transfers if present, returns squad snapshot
   *
   * @param entry - Season plan entry
   * @param incomingSquad - Squad entering this gameweek
   * @param incomingBank - Bank entering this gameweek
   * @param seasonPlan - Full season plan context
   * @returns Squad snapshot for this gameweek
   */
  private simulateGameweekSquadState(
    entry: SeasonPlanEntry,
    incomingSquad: SquadPlayer[],
    incomingBank: number
  ): SeasonSquadSnapshot {
    let resultSquad = this.deepCopySquad(incomingSquad);
    let resultBank = incomingBank;

    // If transfer plan is referenced, try to apply it
    if (entry.transferPlanId) {
      const transferPlan = this.transferPlanRepository.loadPlan(entry.transferPlanId);

      if (!transferPlan) {
        // Referenced plan is missing
        return {
          gameweekId: entry.gameweekId,
          squad: resultSquad,
          bank: resultBank,
          totalValue: this.calculateSquadValue(resultSquad),
          isValid: false,
          validation: {
            errors: [
              {
                message: `Transfer plan "${entry.transferPlanId}" not found`,
                warnings: [],
              },
            ],
            warnings: [],
          },
        };
      }

      // Validate transfers against current squad
      const transferValidation = this.validateTransfersForSquad(
        transferPlan,
        incomingSquad,
        incomingBank
      );

      if (!transferValidation.isValid) {
        // Transfers are invalid for this squad state
        return {
          gameweekId: entry.gameweekId,
          squad: resultSquad,
          bank: resultBank,
          totalValue: this.calculateSquadValue(resultSquad),
          isValid: false,
          validation: transferValidation,
        };
      }

      // Apply transfers
      const plannedSquad = this.squadSimulationService.applyTransfers(
        resultSquad,
        transferPlan.transfers,
        incomingBank
      );

      resultSquad = this.deepCopySquad(plannedSquad.players);
      resultBank = plannedSquad.bank;
    }

    // Validate final squad
    const validation = this.validationService.validateSquad(resultSquad);

    return {
      gameweekId: entry.gameweekId,
      squad: resultSquad,
      bank: resultBank,
      totalValue: this.calculateSquadValue(resultSquad),
      isValid: validation.isValid,
      validation,
    };
  }

  /**
   * Validate if transfers are valid for a given squad and bank
   *
   * @param transferPlan - Transfer plan to validate
   * @param currentSquad - Current squad state
   * @param currentBank - Current bank
   * @returns Validation result
   */
  private validateTransfersForSquad(
    transferPlan: TransferPlan,
    currentSquad: SquadPlayer[],
    currentBank: number
  ): SeasonPlanValidation {
    const errors: any[] = [];

    for (const transfer of transferPlan.transfers) {
      // Check if outgoing player is in current squad
      const outPlayer = currentSquad.find((p) => p.playerId === transfer.playerOutId);
      if (!outPlayer) {
        errors.push({
          code: SeasonPlanErrorCode.PLAYER_NOT_OWNED_AT_GAMEWEEK,
          message: `Player ${transfer.playerOutId} not in squad for transfer`,
        });
      }

      // Check if bank is sufficient
      const budget = outPlayer ? outPlayer.price / 10 + currentBank : currentBank;
      const incomingPrice = transfer.purchasePriceIn;
      if (budget < incomingPrice) {
        errors.push({
          code: SeasonPlanErrorCode.INSUFFICIENT_BUDGET,
          message: `Insufficient budget for transfer`,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Calculate total squad value
   */
  private calculateSquadValue(squad: SquadPlayer[]): number {
    return squad.reduce((sum, player) => sum + player.price, 0) / 10;
  }

  /**
   * Deep copy a squad array
   */
  private deepCopySquad(squad: SquadPlayer[]): SquadPlayer[] {
    return JSON.parse(JSON.stringify(squad));
  }
}
