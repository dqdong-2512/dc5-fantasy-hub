/**
 * Formation calculation utilities
 */

import type { Position } from '@domain/enums';

export interface FormationInfo {
  formation: string; // e.g., "4-4-2"
  gk: number;
  def: number;
  mid: number;
  fwd: number;
}

/**
 * Calculate formation from player positions
 * @param players - Array of players with position info
 * @returns Formation info
 */
export function calculateFormation(
  players: Array<{ position: string | Position | undefined; isStarter: boolean }>
): FormationInfo {
  const starters = players.filter((p) => p.isStarter);

  const gk = starters.filter((p) => p.position === 'GOALKEEPER').length;
  const def = starters.filter((p) => p.position === 'DEFENDER').length;
  const mid = starters.filter((p) => p.position === 'MIDFIELDER').length;
  const fwd = starters.filter((p) => p.position === 'FORWARD').length;

  return {
    formation: `${def}-${mid}-${fwd}`,
    gk,
    def,
    mid,
    fwd,
  };
}

/**
 * Group players by position for pitch display
 * @param players - Array of players with position and starter status
 * @returns Grouped players by row (GK, DEF, MID, FWD)
 */
export function groupPlayersByPosition(
  players: Array<{ id: number; position: string | Position | undefined; isStarter: boolean }>
): {
  gk: Array<{ id: number; position: string | Position | undefined }>;
  def: Array<{ id: number; position: string | Position | undefined }>;
  mid: Array<{ id: number; position: string | Position | undefined }>;
  fwd: Array<{ id: number; position: string | Position | undefined }>;
} {
  const starters = players.filter((p) => p.isStarter);

  return {
    gk: starters.filter((p) => p.position === 'GOALKEEPER'),
    def: starters.filter((p) => p.position === 'DEFENDER'),
    mid: starters.filter((p) => p.position === 'MIDFIELDER'),
    fwd: starters.filter((p) => p.position === 'FORWARD'),
  };
}
