/**
 * Gameweek Plan Validation Service
 * Validates gameweek plan against FPL formation rules
 */

import type { GameweekPlanValidation, GameweekPlanValidationError } from '../domain/GameweekPlan';

/**
 * Formation constraints
 */
const FORMATION_CONSTRAINTS = {
  TOTAL_STARTERS: 11,
  TOTAL_BENCH: 4,
  MIN_DEFENDERS: 3,
  MAX_DEFENDERS: 5,
  MIN_MIDFIELDERS: 2,
  MAX_MIDFIELDERS: 5,
  MIN_FORWARDS: 1,
  MAX_FORWARDS: 3,
  EXACTLY_ONE_GK: 1,
};

/**
 * Position constants
 */
const POSITION_GK = 1;
const POSITION_DEF = 2;
const POSITION_MID = 6;
const POSITION_FWD = 9;

export class GameweekPlanValidationService {
  /**
   * Validate complete gameweek plan
   */
  validatePlan(
    startingPlayerIds: number[],
    benchPlayerIds: number[],
    captainPlayerId: number | null,
    viceCaptainPlayerId: number | null,
    playerPositions: Map<number, number>
  ): GameweekPlanValidation {
    const errors: GameweekPlanValidationError[] = [];
    const warnings: GameweekPlanValidationError[] = [];

    // Count validations
    if (startingPlayerIds.length !== FORMATION_CONSTRAINTS.TOTAL_STARTERS) {
      errors.push({
        code: 'INVALID_STARTING_XI_COUNT',
        message: `Starting XI must have exactly ${FORMATION_CONSTRAINTS.TOTAL_STARTERS} players`,
        severity: 'error',
      });
    }

    if (benchPlayerIds.length !== FORMATION_CONSTRAINTS.TOTAL_BENCH) {
      errors.push({
        code: 'INVALID_BENCH_COUNT',
        message: `Bench must have exactly ${FORMATION_CONSTRAINTS.TOTAL_BENCH} players`,
        severity: 'error',
      });
    }

    // Duplicate validation
    const allIds = [...startingPlayerIds, ...benchPlayerIds];
    if (new Set(allIds).size !== allIds.length) {
      errors.push({
        code: 'DUPLICATE_PLAYER',
        message: 'Duplicate player in starting XI or bench',
        severity: 'error',
      });
    }

    // Position validations only if counts are valid
    if (startingPlayerIds.length === FORMATION_CONSTRAINTS.TOTAL_STARTERS) {
      const positionCounts = this.countPositions(startingPlayerIds, playerPositions);

      // GK validation
      if (positionCounts.gk !== 1) {
        errors.push({
          code: 'INVALID_GOALKEEPER_COUNT',
          message: 'Starting XI must have exactly 1 goalkeeper',
          severity: 'error',
        });
      }

      // DEF validation
      if (positionCounts.def < FORMATION_CONSTRAINTS.MIN_DEFENDERS) {
        errors.push({
          code: 'MIN_DEFENDERS_NOT_MET',
          message: `Starting XI must have at least ${FORMATION_CONSTRAINTS.MIN_DEFENDERS} defenders`,
          severity: 'error',
        });
      }

      if (positionCounts.def > FORMATION_CONSTRAINTS.MAX_DEFENDERS) {
        errors.push({
          code: 'MAX_DEFENDERS_EXCEEDED',
          message: `Starting XI can have maximum ${FORMATION_CONSTRAINTS.MAX_DEFENDERS} defenders`,
          severity: 'error',
        });
      }

      // MID validation
      if (positionCounts.mid < FORMATION_CONSTRAINTS.MIN_MIDFIELDERS) {
        errors.push({
          code: 'MIN_MIDFIELDERS_NOT_MET',
          message: `Starting XI must have at least ${FORMATION_CONSTRAINTS.MIN_MIDFIELDERS} midfielders`,
          severity: 'error',
        });
      }

      if (positionCounts.mid > FORMATION_CONSTRAINTS.MAX_MIDFIELDERS) {
        errors.push({
          code: 'MAX_MIDFIELDERS_EXCEEDED',
          message: `Starting XI can have maximum ${FORMATION_CONSTRAINTS.MAX_MIDFIELDERS} midfielders`,
          severity: 'error',
        });
      }

      // FWD validation
      if (positionCounts.fwd < FORMATION_CONSTRAINTS.MIN_FORWARDS) {
        errors.push({
          code: 'MIN_FORWARDS_NOT_MET',
          message: `Starting XI must have at least ${FORMATION_CONSTRAINTS.MIN_FORWARDS} forward`,
          severity: 'error',
        });
      }

      if (positionCounts.fwd > FORMATION_CONSTRAINTS.MAX_FORWARDS) {
        errors.push({
          code: 'MAX_FORWARDS_EXCEEDED',
          message: `Starting XI can have maximum ${FORMATION_CONSTRAINTS.MAX_FORWARDS} forwards`,
          severity: 'error',
        });
      }
    }

    // GK bench validation
    if (benchPlayerIds.length === FORMATION_CONSTRAINTS.TOTAL_BENCH) {
      const benchGkCount = benchPlayerIds.filter(
        (id) => playerPositions.get(id) === POSITION_GK
      ).length;

      if (benchGkCount !== 1) {
        errors.push({
          code: 'INVALID_BENCH_GK_COUNT',
          message: 'Bench must have exactly 1 goalkeeper',
          severity: 'error',
        });
      }
    }

    // Captain validation
    if (startingPlayerIds.length === FORMATION_CONSTRAINTS.TOTAL_STARTERS) {
      if (!captainPlayerId) {
        errors.push({
          code: 'CAPTAIN_NOT_SELECTED',
          message: 'Captain must be selected',
          severity: 'error',
        });
      } else if (!startingPlayerIds.includes(captainPlayerId)) {
        errors.push({
          code: 'CAPTAIN_NOT_IN_STARTING_XI',
          message: 'Captain must be in Starting XI',
          severity: 'error',
        });
      }

      // Vice Captain validation
      if (!viceCaptainPlayerId) {
        errors.push({
          code: 'VICE_CAPTAIN_NOT_SELECTED',
          message: 'Vice Captain must be selected',
          severity: 'error',
        });
      } else if (!startingPlayerIds.includes(viceCaptainPlayerId)) {
        errors.push({
          code: 'VICE_CAPTAIN_NOT_IN_STARTING_XI',
          message: 'Vice Captain must be in Starting XI',
          severity: 'error',
        });
      }

      // Captain equals Vice Captain
      if (captainPlayerId && viceCaptainPlayerId && captainPlayerId === viceCaptainPlayerId) {
        errors.push({
          code: 'CAPTAIN_EQUALS_VICE_CAPTAIN',
          message: 'Captain and Vice Captain cannot be the same player',
          severity: 'error',
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
   * Validate a player swap
   * Returns null if valid, otherwise returns validation result
   */
  validateSwap(
    startingPlayerIds: number[],
    benchPlayerIds: number[],
    fromPlayerId: number,
    toPlayerId: number,
    playerPositions: Map<number, number>
  ): GameweekPlanValidation | null {
    const fromPos = playerPositions.get(fromPlayerId);
    const toPos = playerPositions.get(toPlayerId);

    if (!fromPos || !toPos) {
      return {
        isValid: false,
        errors: [
          {
            code: 'INVALID_PLAYER',
            message: 'Invalid player position',
            severity: 'error',
          },
        ],
        warnings: [],
      };
    }

    // Create test lineup
    const newStarting = startingPlayerIds.includes(fromPlayerId)
      ? startingPlayerIds.filter((id) => id !== fromPlayerId)
      : startingPlayerIds;
    const newBench = benchPlayerIds.includes(fromPlayerId)
      ? benchPlayerIds.filter((id) => id !== fromPlayerId)
      : benchPlayerIds;

    if (startingPlayerIds.includes(fromPlayerId) && !benchPlayerIds.includes(toPlayerId)) {
      newBench.push(fromPlayerId);
    } else if (benchPlayerIds.includes(fromPlayerId) && !startingPlayerIds.includes(toPlayerId)) {
      newStarting.push(fromPlayerId);
    }

    // Remove toPlayer from old list and add to new list
    if (startingPlayerIds.includes(toPlayerId)) {
      newStarting.splice(newStarting.indexOf(toPlayerId), 1);
      newBench.push(toPlayerId);
    } else if (benchPlayerIds.includes(toPlayerId)) {
      newBench.splice(newBench.indexOf(toPlayerId), 1);
      newStarting.push(toPlayerId);
    }

    // Validate new lineup
    const validation = this.validatePlan(newStarting, newBench, null, null, playerPositions);

    return validation.isValid ? null : validation;
  }

  /**
   * Count players by position
   */
  private countPositions(
    playerIds: number[],
    playerPositions: Map<number, number>
  ): {
    gk: number;
    def: number;
    mid: number;
    fwd: number;
  } {
    let gk = 0,
      def = 0,
      mid = 0,
      fwd = 0;

    playerIds.forEach((id) => {
      const pos = playerPositions.get(id);
      if (pos === POSITION_GK) gk++;
      else if (pos === POSITION_DEF) def++;
      else if (pos === POSITION_MID) mid++;
      else if (pos === POSITION_FWD) fwd++;
    });

    return { gk, def, mid, fwd };
  }

  /**
   * Generate formation label from players
   */
  getFormationLabel(startingPlayerIds: number[], playerPositions: Map<number, number>): string {
    if (startingPlayerIds.length !== FORMATION_CONSTRAINTS.TOTAL_STARTERS) {
      return 'Invalid';
    }

    const counts = this.countPositions(startingPlayerIds, playerPositions);
    return `${counts.def}-${counts.mid}-${counts.fwd}`;
  }

  /**
   * Check if formation is valid
   */
  isValidFormation(startingPlayerIds: number[], playerPositions: Map<number, number>): boolean {
    const counts = this.countPositions(startingPlayerIds, playerPositions);

    return (
      startingPlayerIds.length === FORMATION_CONSTRAINTS.TOTAL_STARTERS &&
      counts.gk === 1 &&
      counts.def >= FORMATION_CONSTRAINTS.MIN_DEFENDERS &&
      counts.def <= FORMATION_CONSTRAINTS.MAX_DEFENDERS &&
      counts.mid >= FORMATION_CONSTRAINTS.MIN_MIDFIELDERS &&
      counts.mid <= FORMATION_CONSTRAINTS.MAX_MIDFIELDERS &&
      counts.fwd >= FORMATION_CONSTRAINTS.MIN_FORWARDS &&
      counts.fwd <= FORMATION_CONSTRAINTS.MAX_FORWARDS
    );
  }
}
