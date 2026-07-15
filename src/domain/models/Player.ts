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
  clubCode?: number;
  price: number;
  ownership: number;
  form: number;
  pointsPerGame: number;
  totalPoints: number;
  minutesPlayed: number;
  squadNumber: number | null;
  photo?: string;
  status?: string;
  goalsScored?: number;
  assists?: number;
  cleanSheets?: number;
  goalsConceded?: number;
  ownGoals?: number;
  penaltiesSaved?: number;
  penaltiesMissed?: number;
  yellowCards?: number;
  redCards?: number;
  influence?: number;
  creativity?: number;
  threat?: number;
  ictIndex?: number;
}
