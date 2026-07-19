/**
 * Gameweek Comparison Grid Component
 * Displays gameweek-specific metrics
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { GameweekComparison } from '@domain/models';

export interface GameweekComparisonGridProps {
  comparison: GameweekComparison;
}

export const GameweekComparisonGrid: React.FC<GameweekComparisonGridProps> = ({ comparison }) => {
  const rows = [
    {
      label: 'Raw Points',
      current: comparison.currentManagerRawPoints,
      opponent: comparison.opponentManagerRawPoints,
    },
    {
      label: 'Transfer Cost',
      current: -comparison.currentManagerTransferCost,
      opponent: -comparison.opponentManagerTransferCost,
    },
    {
      label: 'Net Points',
      current: comparison.currentManagerNetPoints,
      opponent: comparison.opponentManagerNetPoints,
      bold: true,
    },
    {
      label: 'Bench Points',
      current: comparison.currentManagerBenchPoints,
      opponent: comparison.opponentManagerBenchPoints,
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
        Gameweek {comparison.gameweekPointsGap !== undefined ? 'Breakdown' : 'Comparison'}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr 1fr',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        {rows.map((row, idx) => {
          const isBold = (row as any).bold;
          return (
            <React.Fragment key={idx}>
              {/* Label */}
              <Typography
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: isBold ? 700 : 600,
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
                    fontWeight: isBold ? 700 : 600,
                    color: '#333',
                  }}
                >
                  {row.current > 0 ? '+' : ''}
                  {row.current}
                </Typography>
              </Box>

              {/* Opponent Value */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontSize: '0.95rem',
                    fontWeight: isBold ? 700 : 600,
                    color: '#333',
                  }}
                >
                  {row.opponent > 0 ? '+' : ''}
                  {row.opponent}
                </Typography>
              </Box>
            </React.Fragment>
          );
        })}
      </Box>

      {/* Result */}
      <Box
        sx={{
          mt: ThemeTokens.spacing.md,
          pt: ThemeTokens.spacing.md,
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: '#999',
            fontWeight: 600,
            mb: 0.5,
            textTransform: 'uppercase',
          }}
        >
          Gameweek Result
        </Typography>
        <Typography
          sx={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color:
              comparison.gameweekWinner === 'current'
                ? '#4caf50'
                : comparison.gameweekWinner === 'opponent'
                  ? '#f44336'
                  : '#666',
          }}
        >
          {comparison.gameweekWinner === 'current'
            ? `YOU WON BY ${comparison.gameweekPointsGap}`
            : comparison.gameweekWinner === 'opponent'
              ? `RIVAL WON BY ${Math.abs(comparison.gameweekPointsGap)}`
              : 'DRAW'}
        </Typography>
      </Box>
    </Box>
  );
};
