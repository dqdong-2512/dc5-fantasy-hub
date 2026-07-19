/**
 * Rank Movement Utilities
 * Helpers for calculating and displaying rank changes
 */

export interface RankMovementInfo {
  movement: number; // -n (dropped), 0 (unchanged), +n (improved)
  direction: 'up' | 'down' | 'unchanged';
  symbol: string; // '↑', '↓', '—'
}

/**
 * Calculate rank movement
 * @param previousRank - rank in previous period
 * @param currentRank - current rank
 * @returns RankMovementInfo with movement, direction, and symbol
 */
export function calculateRankMovement(previousRank: number, currentRank: number): RankMovementInfo {
  const movement = previousRank - currentRank;

  if (movement > 0) {
    return {
      movement,
      direction: 'up',
      symbol: '↑',
    };
  }

  if (movement < 0) {
    return {
      movement,
      direction: 'down',
      symbol: '↓',
    };
  }

  return {
    movement: 0,
    direction: 'unchanged',
    symbol: '—',
  };
}

/**
 * Format rank movement for display
 * @param rankMovement - RankMovementInfo
 * @returns formatted string, e.g., "↑ 1" or "↓ 3" or "—"
 */
export function formatRankMovement(rankMovement: RankMovementInfo): string {
  if (rankMovement.movement === 0) {
    return rankMovement.symbol;
  }
  return `${rankMovement.symbol} ${Math.abs(rankMovement.movement)}`;
}

/**
 * Get color for rank movement
 * @param rankMovement - RankMovementInfo
 * @returns color code for styling
 */
export function getRankMovementColor(rankMovement: RankMovementInfo): string {
  switch (rankMovement.direction) {
    case 'up':
      return '#4caf50'; // green
    case 'down':
      return '#ef5350'; // red
    default:
      return '#999'; // gray
  }
}
