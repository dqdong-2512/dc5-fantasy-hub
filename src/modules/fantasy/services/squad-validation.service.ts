/**
 * Squad Validation Service
 * Validates FPL squad rules and constraints
 */

import type { SquadPlayer } from '../domain/TransferPlan';
import {
  ValidationErrorCode,
  type ValidationError,
  type TransferPlanValidation,
} from '../domain/TransferPlan';
import { PlayerRepository } from '@repositories/players';
import { Position } from '@domain/enums';

/**
 * Centralized FPL squad composition rules
 */
export const SQUAD_RULES = {
  TOTAL_PLAYERS: 15,
  GOALKEEPERS: 2,
  DEFENDERS: 5,
  MIDFIELDERS: 5,
  FORWARDS: 3,
  MAX_PER_CLUB: 3,
};

/**
 * Service for validating FPL squad rules
 */
export class SquadValidationService {
  private playerRepo: PlayerRepository;

  constructor(playerRepo?: PlayerRepository) {
    this.playerRepo = playerRepo || new PlayerRepository();
  }

  /**
   * Validate complete squad composition
   *
   * @param squad - Squad players
   * @returns Validation result
   */
  validateSquad(squad: SquadPlayer[]): TransferPlanValidation {
    const errors: ValidationError[] = [];

    // Rule 1: Exactly 15 players
    if (squad.length !== SQUAD_RULES.TOTAL_PLAYERS) {
      errors.push({
        code: ValidationErrorCode.INVALID_SQUAD_SIZE,
        message: `Squad must have exactly ${SQUAD_RULES.TOTAL_PLAYERS} players (current: ${squad.length})`,
      });
    }

    // Rule 2: Correct positional composition
    const positionCounts = this.countByPosition(squad);
    const positionErrors = this.validatePositionalComposition(positionCounts);
    errors.push(...positionErrors);

    // Rule 3: Maximum 3 players per club
    const clubLimitErrors = this.validateClubLimits(squad);
    errors.push(...clubLimitErrors);

    // Rule 4: Budget non-negative (will be checked separately with transfers)
    // Not applicable for squad validation alone

    // Rule 5: No duplicate player IDs
    const duplicateErrors = this.validateNoDuplicates(squad);
    errors.push(...duplicateErrors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Validate a single transfer move
   * Checks if adding the target player is valid
   *
   * @param currentSquad - Current squad
   * @param outgoingPlayerId - Player being removed
   * @param incomingPlayerId - Player being added
   * @returns Validation result
   */
  validateTransfer(
    currentSquad: SquadPlayer[],
    outgoingPlayerId: number,
    incomingPlayerId: number
  ): TransferPlanValidation {
    const errors: ValidationError[] = [];

    // Check: outgoing player in squad
    const outPlayer = currentSquad.find((p) => p.playerId === outgoingPlayerId);
    if (!outPlayer) {
      errors.push({
        code: ValidationErrorCode.PLAYER_NOT_IN_SQUAD,
        message: `Player ${outgoingPlayerId} not in squad`,
        playerIds: [outgoingPlayerId],
      });
      return { isValid: false, errors, warnings: [] };
    }

    // Check: incoming player not already in squad (unless it's the same player)
    if (incomingPlayerId !== outgoingPlayerId) {
      const incomingAlreadyOwned = currentSquad.some((p) => p.playerId === incomingPlayerId);
      if (incomingAlreadyOwned) {
        errors.push({
          code: ValidationErrorCode.PLAYER_ALREADY_OWNED,
          message: `Player ${incomingPlayerId} already in squad`,
          playerIds: [incomingPlayerId],
        });
        return { isValid: false, errors, warnings: [] };
      }
    }

    // Check: same position transfer
    const incomingPlayer = this.playerRepo.getById(incomingPlayerId);
    if (!incomingPlayer) {
      errors.push({
        code: ValidationErrorCode.INVALID_POSITION,
        message: `Incoming player ${incomingPlayerId} not found`,
        playerIds: [incomingPlayerId],
      });
      return { isValid: false, errors, warnings: [] };
    }

    if (outPlayer.position !== this.getPositionNumber(incomingPlayer.position)) {
      errors.push({
        code: ValidationErrorCode.INVALID_POSITION,
        message: `Position mismatch: ${outPlayer.position} → ${this.getPositionNumber(incomingPlayer.position)}`,
        playerIds: [outgoingPlayerId, incomingPlayerId],
      });
      return { isValid: false, errors, warnings: [] };
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Validate position constraints
   *
   * @param position - FPL position (1=GK, 2-5=DEF, 6-8=MID, 9-11=FWD)
   * @param currentCount - Current count of this position
   * @param maxAllowed - Maximum allowed
   * @returns Validation errors if any
   */
  private validatePositionalComposition(positionCounts: Record<string, number>): ValidationError[] {
    const errors: ValidationError[] = [];

    if ((positionCounts['GK'] ?? 0) !== SQUAD_RULES.GOALKEEPERS) {
      errors.push({
        code: ValidationErrorCode.INVALID_POSITION_COMPOSITION,
        message: `Squad must have ${SQUAD_RULES.GOALKEEPERS} goalkeepers (current: ${positionCounts['GK'] ?? 0})`,
        details: { position: 'GK' },
      });
    }

    if ((positionCounts['DEF'] ?? 0) !== SQUAD_RULES.DEFENDERS) {
      errors.push({
        code: ValidationErrorCode.INVALID_POSITION_COMPOSITION,
        message: `Squad must have ${SQUAD_RULES.DEFENDERS} defenders (current: ${positionCounts['DEF'] ?? 0})`,
        details: { position: 'DEF' },
      });
    }

    if ((positionCounts['MID'] ?? 0) !== SQUAD_RULES.MIDFIELDERS) {
      errors.push({
        code: ValidationErrorCode.INVALID_POSITION_COMPOSITION,
        message: `Squad must have ${SQUAD_RULES.MIDFIELDERS} midfielders (current: ${positionCounts['MID'] ?? 0})`,
        details: { position: 'MID' },
      });
    }

    if ((positionCounts['FWD'] ?? 0) !== SQUAD_RULES.FORWARDS) {
      errors.push({
        code: ValidationErrorCode.INVALID_POSITION_COMPOSITION,
        message: `Squad must have ${SQUAD_RULES.FORWARDS} forwards (current: ${positionCounts['FWD'] ?? 0})`,
        details: { position: 'FWD' },
      });
    }

    return errors;
  }

  /**
   * Validate club limits
   *
   * @param squad - Squad players
   * @returns Validation errors if any
   */
  private validateClubLimits(squad: SquadPlayer[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const clubCounts = new Map<number, number>();

    squad.forEach((player) => {
      const count = (clubCounts.get(player.teamId) ?? 0) + 1;
      clubCounts.set(player.teamId, count);
    });

    clubCounts.forEach((count, clubId) => {
      if (count > SQUAD_RULES.MAX_PER_CLUB) {
        const clubName = this.getClubName(clubId);
        const playersFromClub = squad.filter((p) => p.teamId === clubId).map((p) => p.playerId);

        errors.push({
          code: ValidationErrorCode.CLUB_LIMIT_EXCEEDED,
          message: `Maximum ${SQUAD_RULES.MAX_PER_CLUB} players per club (${clubName}: ${count})`,
          playerIds: playersFromClub,
          details: { clubId, clubName, count },
        });
      }
    });

    return errors;
  }

  /**
   * Validate no duplicate player IDs
   *
   * @param squad - Squad players
   * @returns Validation errors if any
   */
  private validateNoDuplicates(squad: SquadPlayer[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const seen = new Set<number>();

    squad.forEach((player) => {
      if (seen.has(player.playerId)) {
        errors.push({
          code: ValidationErrorCode.DUPLICATE_TRANSFER,
          message: `Duplicate player ID: ${player.playerId}`,
          playerIds: [player.playerId],
        });
      }
      seen.add(player.playerId);
    });

    return errors;
  }

  /**
   * Count players by position
   *
   * @param squad - Squad players
   * @returns Count by position
   */
  private countByPosition(squad: SquadPlayer[]): Record<string, number> {
    const counts: Record<string, number> = {
      GK: 0,
      DEF: 0,
      MID: 0,
      FWD: 0,
    };

    squad.forEach((player) => {
      if (player.position === 1) counts['GK']++;
      else if (player.position >= 2 && player.position <= 5) counts['DEF']++;
      else if (player.position >= 6 && player.position <= 8) counts['MID']++;
      else if (player.position >= 9 && player.position <= 11) counts['FWD']++;
    });

    return counts;
  }

  /**
   * Convert domain Position to FPL position number
   *
   * @param position - Domain position
   * @returns FPL position number
   */
  private getPositionNumber(position: Position): number {
    switch (position) {
      case Position.Goalkeeper:
        return 1;
      case Position.Defender:
        return 2; // Can be 2-5
      case Position.Midfielder:
        return 6; // Can be 6-8
      case Position.Forward:
        return 9; // Can be 9-11
      default:
        return 0;
    }
  }

  /**
   * Get club name by ID
   *
   * @param clubId - Club ID
   * @returns Club name
   */
  private getClubName(clubId: number): string {
    const team = new TeamRepository().getAll().find((t) => t.id === clubId);
    return team?.name ?? `Club ${clubId}`;
  }
}

// Helper import
import { TeamRepository } from '@repositories/teams';
