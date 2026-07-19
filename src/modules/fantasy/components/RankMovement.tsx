/**
 * Rank Movement Display Component
 * Shows visual indicator of rank change (↑, ↓, —)
 */

import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import {
  calculateRankMovement,
  formatRankMovement,
  getRankMovementColor,
} from '../utils/rankMovementUtils';

export interface RankMovementProps {
  previousRank: number;
  currentRank: number;
  size?: 'small' | 'medium';
  showAbsoluteValue?: boolean; // if true, shows "↑ 1", if false shows just "↑"
}

export const RankMovement: React.FC<RankMovementProps> = ({
  previousRank,
  currentRank,
  size = 'medium',
  showAbsoluteValue = true,
}) => {
  const rankMovement = useMemo(
    () => calculateRankMovement(previousRank, currentRank),
    [previousRank, currentRank]
  );

  const color = useMemo(() => getRankMovementColor(rankMovement), [rankMovement]);
  const displayText = useMemo(
    () => (showAbsoluteValue ? formatRankMovement(rankMovement) : rankMovement.symbol),
    [rankMovement, showAbsoluteValue]
  );

  const fontSize = size === 'small' ? '0.875rem' : '1rem';

  return (
    <Typography
      sx={{
        fontSize,
        fontWeight: 600,
        color,
        textAlign: 'center',
        minWidth: '40px',
      }}
    >
      {displayText}
    </Typography>
  );
};
