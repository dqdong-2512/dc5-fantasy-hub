import type { Position } from '../enums';

/**
 * Domain model for a player
 * Represents business concepts instead of FPL fields
 */
export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
  position: Position;
  club: string;
  price: number;
  ownership: number;
  form: number;
  minutesPlayed: number;
}
