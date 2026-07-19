/**
 * Gameweek Plan Service
 * Orchestrates gameweek planning operations
 */

import type { GameweekPlan, SquadSourceType } from '../domain/GameweekPlan';
import { GameweekPlanValidationService } from './gameweek-plan-validation.service';

/**
 * Generate a unique ID (simple UUID-like string)
 */
function generatePlanId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export class GameweekPlanService {
  private validationService: GameweekPlanValidationService;

  constructor() {
    this.validationService = new GameweekPlanValidationService();
  }

  /**
   * Create a new gameweek plan
   */
  createPlan(
    gameweekId: number,
    sourceType: SquadSourceType,
    sourceTransferPlanId: string | undefined,
    startingPlayerIds: number[],
    benchPlayerIds: number[],
    playerPositions: Map<number, number>,
    name: string = `GW ${gameweekId} Plan`
  ): GameweekPlan {
    const captainPlayerId = null;
    const viceCaptainPlayerId = null;

    const validation = this.validationService.validatePlan(
      startingPlayerIds,
      benchPlayerIds,
      captainPlayerId,
      viceCaptainPlayerId,
      playerPositions
    );

    const now = new Date();

    return {
      id: generatePlanId(),
      name,
      gameweekId,
      sourceType,
      sourceTransferPlanId,
      createdAt: now,
      updatedAt: now,
      startingPlayerIds: [...startingPlayerIds],
      benchPlayerIds: [...benchPlayerIds],
      captainPlayerId,
      viceCaptainPlayerId,
      validation,
      sourceStartingPlayerIds: [...startingPlayerIds],
      sourceBenchPlayerIds: [...benchPlayerIds],
      sourceCaptainPlayerId: captainPlayerId,
      sourceViceCaptainPlayerId: viceCaptainPlayerId,
    };
  }

  /**
   * Swap a player from starting XI to bench (or vice versa)
   */
  swapPlayers(
    plan: GameweekPlan,
    fromPlayerId: number,
    toPlayerId: number,
    playerPositions: Map<number, number>
  ): { success: boolean; plan?: GameweekPlan; error?: string } {
    // Validate swap first
    const swapValidation = this.validationService.validateSwap(
      plan.startingPlayerIds,
      plan.benchPlayerIds,
      fromPlayerId,
      toPlayerId,
      playerPositions
    );

    if (swapValidation) {
      return {
        success: false,
        error: swapValidation.errors[0]?.message || 'Invalid swap',
      };
    }

    // Apply swap
    const newStarting = [...plan.startingPlayerIds];
    const newBench = [...plan.benchPlayerIds];

    // Move fromPlayer to opposite location
    if (newStarting.includes(fromPlayerId)) {
      newStarting.splice(newStarting.indexOf(fromPlayerId), 1);
      newBench.push(fromPlayerId);
    } else {
      newBench.splice(newBench.indexOf(fromPlayerId), 1);
      newStarting.push(fromPlayerId);
    }

    // Move toPlayer to opposite location
    if (newStarting.includes(toPlayerId)) {
      newStarting.splice(newStarting.indexOf(toPlayerId), 1);
      newBench.push(toPlayerId);
    } else {
      newBench.splice(newBench.indexOf(toPlayerId), 1);
      newStarting.push(toPlayerId);
    }

    // Validate new plan
    let captainId = plan.captainPlayerId;
    let viceCaptainId = plan.viceCaptainPlayerId;

    // Clear captain if moved to bench
    if (!newStarting.includes(fromPlayerId) && fromPlayerId === captainId) {
      captainId = null;
    }
    if (!newStarting.includes(toPlayerId) && toPlayerId === captainId) {
      captainId = null;
    }

    // Clear vice captain if moved to bench
    if (!newStarting.includes(fromPlayerId) && fromPlayerId === viceCaptainId) {
      viceCaptainId = null;
    }
    if (!newStarting.includes(toPlayerId) && toPlayerId === viceCaptainId) {
      viceCaptainId = null;
    }

    const validation = this.validationService.validatePlan(
      newStarting,
      newBench,
      captainId,
      viceCaptainId,
      playerPositions
    );

    const updatedPlan: GameweekPlan = {
      ...plan,
      startingPlayerIds: newStarting,
      benchPlayerIds: newBench,
      captainPlayerId: captainId,
      viceCaptainPlayerId: viceCaptainId,
      validation,
      updatedAt: new Date(),
    };

    return { success: true, plan: updatedPlan };
  }

  /**
   * Move a player up in bench order (1 position towards top)
   */
  moveBenchPlayerUp(plan: GameweekPlan, playerId: number): GameweekPlan {
    const benchIndex = plan.benchPlayerIds.indexOf(playerId);

    if (benchIndex <= 0) {
      return plan; // Already at top or not in bench
    }

    const newBench = [...plan.benchPlayerIds];
    [newBench[benchIndex - 1], newBench[benchIndex]] = [
      newBench[benchIndex],
      newBench[benchIndex - 1],
    ];

    return {
      ...plan,
      benchPlayerIds: newBench,
      updatedAt: new Date(),
    };
  }

  /**
   * Move a player down in bench order (1 position towards bottom)
   */
  moveBenchPlayerDown(plan: GameweekPlan, playerId: number): GameweekPlan {
    const benchIndex = plan.benchPlayerIds.indexOf(playerId);

    if (benchIndex < 0 || benchIndex >= plan.benchPlayerIds.length - 1) {
      return plan; // Not in bench or already at bottom
    }

    const newBench = [...plan.benchPlayerIds];
    [newBench[benchIndex + 1], newBench[benchIndex]] = [
      newBench[benchIndex],
      newBench[benchIndex + 1],
    ];

    return {
      ...plan,
      benchPlayerIds: newBench,
      updatedAt: new Date(),
    };
  }

  /**
   * Set captain
   */
  setCaptain(plan: GameweekPlan, captainPlayerId: number | null): GameweekPlan {
    // Validate captain is in starting XI
    if (captainPlayerId && !plan.startingPlayerIds.includes(captainPlayerId)) {
      return plan;
    }

    // If captain is same as vice captain, clear vice captain
    let viceCaptainId = plan.viceCaptainPlayerId;
    if (captainPlayerId === viceCaptainId) {
      viceCaptainId = null;
    }

    return {
      ...plan,
      captainPlayerId,
      viceCaptainPlayerId: viceCaptainId,
      updatedAt: new Date(),
    };
  }

  /**
   * Set vice captain
   */
  setViceCaptain(plan: GameweekPlan, viceCaptainPlayerId: number | null): GameweekPlan {
    // Validate vice captain is in starting XI
    if (viceCaptainPlayerId && !plan.startingPlayerIds.includes(viceCaptainPlayerId)) {
      return plan;
    }

    // If vice captain is same as captain, clear captain
    let captainId = plan.captainPlayerId;
    if (viceCaptainPlayerId === captainId) {
      captainId = null;
    }

    return {
      ...plan,
      captainPlayerId: captainId,
      viceCaptainPlayerId,
      updatedAt: new Date(),
    };
  }

  /**
   * Reset lineup to source
   */
  resetLineup(plan: GameweekPlan): GameweekPlan {
    return {
      ...plan,
      startingPlayerIds: [...plan.sourceStartingPlayerIds],
      benchPlayerIds: [...plan.sourceBenchPlayerIds],
      captainPlayerId: plan.sourceCaptainPlayerId,
      viceCaptainPlayerId: plan.sourceViceCaptainPlayerId,
      updatedAt: new Date(),
    };
  }

  /**
   * Rename plan
   */
  renamePlan(plan: GameweekPlan, newName: string): GameweekPlan {
    return {
      ...plan,
      name: newName,
      updatedAt: new Date(),
    };
  }

  /**
   * Duplicate plan with new ID
   */
  duplicatePlan(plan: GameweekPlan, newName?: string): GameweekPlan {
    const now = new Date();
    return {
      ...plan,
      id: generatePlanId(),
      name: newName || `${plan.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    };
  }
}
