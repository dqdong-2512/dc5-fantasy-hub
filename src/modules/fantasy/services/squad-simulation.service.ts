/**
 * Squad Simulation Service
 * Simulates applying transfers to derive planned squad state
 */

import type {
  TransferMove,
  SquadPlayer,
  PlannedSquad,
  SquadComparisonMetrics,
} from '../domain/TransferPlan';
import { SquadValidationService } from './squad-validation.service';
import { PlayerRepository } from '@repositories/players';

/**
 * Service for simulating squad changes via transfers
 * Always recalculates from scratch (current squad + all transfers in order)
 */
export class SquadSimulationService {
  private validationService: SquadValidationService;
  private playerRepo: PlayerRepository;

  constructor(validationService?: SquadValidationService, playerRepo?: PlayerRepository) {
    this.validationService = validationService || new SquadValidationService();
    this.playerRepo = playerRepo || new PlayerRepository();
  }

  /**
   * Simulate applying all transfers to current squad
   * Recalculates from original squad + all transfers
   *
   * @param currentSquad - Current squad
   * @param transfers - Transfer moves to apply in order
   * @param currentBank - Current manager bank
   * @returns Planned squad with validation
   */
  applyTransfers(
    currentSquad: SquadPlayer[],
    transfers: TransferMove[],
    currentBank: number
  ): PlannedSquad {
    // Start with copy of current squad
    let plannedSquad = this.deepCopySquad(currentSquad);
    let bank = currentBank;

    // Apply each transfer in order
    for (const transfer of transfers) {
      // Find and remove outgoing player
      const outIndex = plannedSquad.findIndex((p) => p.playerId === transfer.playerOutId);
      if (outIndex === -1) {
        // Outgoing player not in squad - this is invalid
        // Continue but mark as error
        continue;
      }

      const outPlayer = plannedSquad[outIndex];

      // Get incoming player full data
      const inPlayer = this.playerRepo.getById(transfer.playerInId);
      if (!inPlayer) {
        // Incoming player not found - skip
        continue;
      }

      // Create incoming squad player with inherited starter/bench status
      const incomingSquadPlayer: SquadPlayer = {
        playerId: transfer.playerInId,
        position: this.getPositionNumber(inPlayer.position),
        isStarter: outPlayer.isStarter, // Inherit starter/bench status
        benchOrder: outPlayer.benchOrder, // Inherit bench order
        isCaptain: outPlayer.isCaptain, // Inherit captain if applicable
        isViceCaptain: outPlayer.isViceCaptain, // Inherit VC if applicable
        price: inPlayer.price,
        teamId: 0, // Will be inherited from player data
        totalPoints: inPlayer.totalPoints,
        form: inPlayer.form,
        isTransferredIn: true,
        isTransferredOut: false,
      };

      // Remove outgoing, add incoming
      plannedSquad[outIndex] = incomingSquadPlayer;
      plannedSquad[outIndex].isTransferredOut = true;

      // Update bank
      bank = transfer.bankAfter;
    }

    // Validate planned squad
    const validation = this.validationService.validateSquad(plannedSquad);

    // Calculate metrics
    const totalValue = this.calculateSquadValue(plannedSquad);

    return {
      players: plannedSquad,
      totalValue,
      bank,
      isValid: validation.isValid,
      validation,
    };
  }

  /**
   * Calculate squad comparison metrics: before vs after transfers
   *
   * @param currentSquad - Current squad
   * @param plannedSquad - Planned squad after transfers
   * @param currentBank - Current bank
   * @param plannedBank - Planned bank
   * @returns Comparison metrics
   */
  calculateComparisonMetrics(
    currentSquad: SquadPlayer[],
    plannedSquad: SquadPlayer[],
    currentBank: number,
    plannedBank: number
  ): SquadComparisonMetrics {
    return {
      squadValueBefore: this.calculateSquadValue(currentSquad),
      squadValueAfter: this.calculateSquadValue(plannedSquad),
      bankBefore: currentBank,
      bankAfter: plannedBank,
      totalPointsBefore: this.calculateSquadTotalPoints(currentSquad),
      totalPointsAfter: this.calculateSquadTotalPoints(plannedSquad),
      avgFormBefore: this.calculateAverageForm(currentSquad),
      avgFormAfter: this.calculateAverageForm(plannedSquad),
      avgFixtureBefore: this.calculateAverageFixtureScore(currentSquad),
      avgFixtureAfter: this.calculateAverageFixtureScore(plannedSquad),
      valueScoreChanges: {
        before: this.calculateAverageValueScore(currentSquad),
        after: this.calculateAverageValueScore(plannedSquad),
      },
    };
  }

  /**
   * Deep copy a squad
   *
   * @param squad - Squad to copy
   * @returns Copy of squad
   */
  private deepCopySquad(squad: SquadPlayer[]): SquadPlayer[] {
    return squad.map((p) => ({ ...p }));
  }

  /**
   * Calculate total squad value (sum of all player prices)
   *
   * @param squad - Squad
   * @returns Total value in millions
   */
  private calculateSquadValue(squad: SquadPlayer[]): number {
    return squad.reduce((sum, p) => sum + p.price / 10, 0);
  }

  /**
   * Calculate total squad points
   *
   * @param squad - Squad
   * @returns Total points
   */
  private calculateSquadTotalPoints(squad: SquadPlayer[]): number {
    return squad.reduce((sum, p) => sum + (p.totalPoints ?? 0), 0);
  }

  /**
   * Calculate average form score
   *
   * @param squad - Squad
   * @returns Average form
   */
  private calculateAverageForm(squad: SquadPlayer[]): number {
    if (squad.length === 0) return 0;
    const sum = squad.reduce((acc, p) => acc + (p.form ?? 0), 0);
    return sum / squad.length;
  }

  /**
   * Calculate average fixture score
   *
   * @param squad - Squad
   * @returns Average fixture score
   */
  private calculateAverageFixtureScore(squad: SquadPlayer[]): number {
    if (squad.length === 0) return 0;
    const sum = squad.reduce((acc, p) => acc + (p.fixtureScore ?? 0), 0);
    return sum / squad.length;
  }

  /**
   * Calculate average value score
   *
   * @param squad - Squad
   * @returns Average value score
   */
  private calculateAverageValueScore(squad: SquadPlayer[]): number {
    if (squad.length === 0) return 0;
    const sum = squad.reduce((acc, p) => acc + (p.valueScore ?? 0), 0);
    return sum / squad.length;
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
