/**
 * Transfer Impact Component
 * Displays transfer cost comparison
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { TransferComparison } from '@domain/models';

export interface TransferImpactProps {
  comparison: TransferComparison;
}

export const TransferImpact: React.FC<TransferImpactProps> = ({ comparison }) => {
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
        Transfer Impact
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: ThemeTokens.spacing.md,
        }}
      >
        {/* Current Manager */}
        <Paper sx={{ p: ThemeTokens.spacing.md, backgroundColor: '#fafafa' }}>
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
              fontSize: '1rem',
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            {comparison.currentManagerTransfers}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: '#666',
            }}
          >
            transfers • {-comparison.currentManagerTransferCost} pts
          </Typography>
        </Paper>

        {/* Opponent Manager */}
        <Paper sx={{ p: ThemeTokens.spacing.md, backgroundColor: '#fafafa' }}>
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
              fontSize: '1rem',
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            {comparison.opponentManagerTransfers}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: '#666',
            }}
          >
            transfers • {-comparison.opponentManagerTransferCost} pts
          </Typography>
        </Paper>
      </Box>

      {/* Transfer Advantage */}
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
          Transfer Advantage
        </Typography>
        <Typography
          sx={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color:
              comparison.transferCostSwing > 0
                ? '#4caf50'
                : comparison.transferCostSwing < 0
                  ? '#f44336'
                  : '#666',
          }}
        >
          {comparison.transferCostSwing > 0
            ? 'YOU +'
            : comparison.transferCostSwing < 0
              ? 'RIVAL +'
              : ''}
          {Math.abs(comparison.transferCostSwing)}
        </Typography>
      </Box>
    </Box>
  );
};
