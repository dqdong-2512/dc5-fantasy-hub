/**
 * Bench Impact Component
 * Displays bench points comparison
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { BenchComparison } from '@domain/models';

export interface BenchImpactProps {
  comparison: BenchComparison;
}

export const BenchImpact: React.FC<BenchImpactProps> = ({ comparison }) => {
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
        Bench Impact
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: ThemeTokens.spacing.md,
        }}
      >
        {/* Current Manager */}
        <Paper sx={{ p: ThemeTokens.spacing.md, backgroundColor: '#fafafa', textAlign: 'center' }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#999',
              fontWeight: 600,
              mb: 0.5,
              textTransform: 'uppercase',
            }}
          >
            YOU
          </Typography>
          <Typography
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {comparison.currentManagerBenchPoints}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#666',
              mt: 0.25,
            }}
          >
            bench pts
          </Typography>
        </Paper>

        {/* Opponent Manager */}
        <Paper sx={{ p: ThemeTokens.spacing.md, backgroundColor: '#fafafa', textAlign: 'center' }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#999',
              fontWeight: 600,
              mb: 0.5,
              textTransform: 'uppercase',
            }}
          >
            RIVAL
          </Typography>
          <Typography
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {comparison.opponentManagerBenchPoints}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#666',
              mt: 0.25,
            }}
          >
            bench pts
          </Typography>
        </Paper>
      </Box>

      {/* Bench Difference */}
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
            mb: 0.25,
            textTransform: 'uppercase',
          }}
        >
          Bench Difference
        </Typography>
        <Typography
          sx={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color:
              comparison.benchPointsSwing > 0
                ? '#4caf50'
                : comparison.benchPointsSwing < 0
                  ? '#f44336'
                  : '#666',
          }}
        >
          {comparison.benchPointsSwing > 0 ? '+' : ''}
          {comparison.benchPointsSwing}
        </Typography>
      </Box>
    </Box>
  );
};
