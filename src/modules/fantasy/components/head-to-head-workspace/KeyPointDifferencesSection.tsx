/**
 * Key Point Differences Section
 * Breakdown of major point differences without double-counting
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { ManagerHeadToHeadComparison } from '@domain/models';

export interface KeyPointDifferencesProps {
  comparison: ManagerHeadToHeadComparison;
}

export const KeyPointDifferencesSection: React.FC<KeyPointDifferencesProps> = ({ comparison }) => {
  const differential = comparison.differentialAnalysis;
  const captain = comparison.captainComparison;
  const transfer = comparison.transferComparison;
  const bench = comparison.benchComparison;

  const differences = [
    {
      label: 'Differential Advantage',
      value: differential.differentialSwing,
      winner: differential.differentialSwing > 0 ? 'current' : 'opponent',
    },
    {
      label: 'Captain Advantage',
      value: captain.captainSwing,
      winner: captain.captainSwing > 0 ? 'current' : 'opponent',
    },
    {
      label: 'Transfer Advantage',
      value: transfer.transferCostSwing,
      winner: transfer.transferCostSwing > 0 ? 'current' : 'opponent',
    },
    {
      label: 'Bench Difference',
      value: bench.benchPointsSwing,
      winner: bench.benchPointsSwing > 0 ? 'current' : 'opponent',
    },
  ];

  const currentTotal = differences
    .filter((d) => d.winner === 'current')
    .reduce((sum, d) => sum + d.value, 0);

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
        Key Point Differences
      </Typography>

      <Paper sx={{ p: ThemeTokens.spacing.md, backgroundColor: '#fafafa' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: ThemeTokens.spacing.sm }}>
          {differences.map((diff, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '1rem',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#666',
                }}
              >
                {diff.label}
              </Typography>
              <Box sx={{ textAlign: 'right' }}>
                {diff.winner === 'current' ? (
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#4caf50',
                    }}
                  >
                    YOU
                  </Typography>
                ) : (
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#f44336',
                    }}
                  >
                    RIVAL
                  </Typography>
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: diff.value > 0 ? '#4caf50' : diff.value < 0 ? '#f44336' : '#999',
                  textAlign: 'right',
                  minWidth: '50px',
                }}
              >
                {diff.value > 0 ? '+' : ''}
                {Math.abs(diff.value)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Total Swing */}
        <Box
          sx={{
            mt: ThemeTokens.spacing.md,
            pt: ThemeTokens.spacing.md,
            borderTop: '2px solid #e0e0e0',
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#333',
            }}
          >
            Calculated Total
          </Typography>
          <Typography
            sx={{ fontSize: '0.85rem', fontWeight: 700, textAlign: 'right', color: '#4caf50' }}
          >
            YOU
          </Typography>
          <Typography
            sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: currentTotal > 0 ? '#4caf50' : '#999',
              textAlign: 'right',
              minWidth: '50px',
            }}
          >
            +{currentTotal}
          </Typography>
        </Box>
      </Paper>

      {/* Note */}
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: '#999',
          mt: ThemeTokens.spacing.sm,
          fontStyle: 'italic',
        }}
      >
        Note: Captain contribution is included in differentials. Transfer cost is tracked
        separately.
      </Typography>
    </Box>
  );
};
