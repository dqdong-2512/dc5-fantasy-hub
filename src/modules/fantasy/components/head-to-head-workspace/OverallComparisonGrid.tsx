/**
 * Overall Comparison Grid Component
 * Displays key metrics comparing two managers
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { OverallComparison } from '@domain/models';

export interface OverallComparisonGridProps {
  comparison: OverallComparison;
}

interface ComparisonRow {
  label: string;
  current: string | number;
  opponent: string | number;
  highlight?: 'current' | 'opponent' | 'neither';
}

export const OverallComparisonGrid: React.FC<OverallComparisonGridProps> = ({ comparison }) => {
  const rows: ComparisonRow[] = [
    {
      label: 'Rank',
      current: `#${comparison.currentManagerRank}`,
      opponent: `#${comparison.opponentManagerRank}`,
      highlight:
        comparison.currentManagerRank < comparison.opponentManagerRank
          ? 'current'
          : comparison.opponentManagerRank < comparison.currentManagerRank
            ? 'opponent'
            : 'neither',
    },
    {
      label: 'Total Points',
      current: comparison.currentManagerTotalPoints,
      opponent: comparison.opponentManagerTotalPoints,
      highlight:
        comparison.currentManagerTotalPoints > comparison.opponentManagerTotalPoints
          ? 'current'
          : comparison.opponentManagerTotalPoints > comparison.currentManagerTotalPoints
            ? 'opponent'
            : 'neither',
    },
  ];

  return (
    <Box sx={{ mb: ThemeTokens.spacing.lg }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: '0.95rem',
          mb: ThemeTokens.spacing.md,
        }}
      >
        Overall Comparison
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr 1fr',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        {rows.map((row, idx) => (
          <React.Fragment key={idx}>
            {/* Label */}
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#666',
              }}
            >
              {row.label}
            </Typography>

            {/* Current Value */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: row.highlight === 'current' ? 700 : 600,
                  color:
                    row.highlight === 'current'
                      ? '#4caf50'
                      : row.highlight === 'opponent'
                        ? '#999'
                        : '#333',
                }}
              >
                {row.current}
              </Typography>
            </Box>

            {/* Opponent Value */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: row.highlight === 'opponent' ? 700 : 600,
                  color:
                    row.highlight === 'opponent'
                      ? '#4caf50'
                      : row.highlight === 'current'
                        ? '#999'
                        : '#333',
                }}
              >
                {row.opponent}
              </Typography>
            </Box>
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};
