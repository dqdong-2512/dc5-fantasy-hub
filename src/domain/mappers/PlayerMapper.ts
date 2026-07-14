import type { NormalizedPlayer } from '../../repositories/types';
import { Position } from '../enums';
import type { Player } from '../models';

/**
 * Maps normalized player data to domain player model
 * Hides FPL-specific field names and transforms data to business concepts
 */
export class PlayerMapper {
  static toDomain(player: NormalizedPlayer, teamName: string, elementTypeId: number): Player {
    return {
      id: player.id,
      firstName: player.firstName,
      lastName: player.secondName,
      displayName: player.webName,
      position: this.elementTypeIdToPosition(elementTypeId),
      club: teamName,
      price: player.nowCost,
      ownership: parseFloat(player.selectedByPercent),
      form: parseFloat(player.form),
      minutesPlayed: player.minutes,
    };
  }

  private static elementTypeIdToPosition(elementTypeId: number): Position {
    switch (elementTypeId) {
      case 1:
        return Position.Goalkeeper;
      case 2:
        return Position.Defender;
      case 3:
        return Position.Midfielder;
      case 4:
        return Position.Forward;
      default:
        throw new Error(`Unknown element type ID: ${elementTypeId}`, { cause: elementTypeId });
    }
  }
}
