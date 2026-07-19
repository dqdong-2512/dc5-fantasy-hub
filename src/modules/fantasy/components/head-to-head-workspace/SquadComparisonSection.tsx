/**
 * Squad Comparison Component
 * Shows shared and differential players
 */

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface SquadComparisonProps {
  sharedPlayers: string[];
  currentDifferentials: string[];
  opponentDifferentials: string[];
}

export const SquadComparisonSection: React.FC<SquadComparisonProps> = ({
  sharedPlayers,
  currentDifferentials,
  opponentDifferentials,
}) => {
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
        Squad Comparison
      </Typography>

      {/* Shared Players */}
      <Box sx={{ mb: ThemeTokens.spacing.md }}>
        <Typography
          sx={{
            fontSize: '0.85rem',
            fontWeight: 600,
            mb: ThemeTokens.spacing.sm,
            color: '#666',
          }}
        >
          Shared Players ({sharedPlayers.length})
        </Typography>
        {sharedPlayers.length === 0 ? (
          <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>None</Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {sharedPlayers.map((player) => (
              <Chip
                key={player}
                label={player}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  height: 'auto',
                  '& .MuiChip-label': {
                    padding: '4px 8px',
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Your Differentials */}
      <Box sx={{ mb: ThemeTokens.spacing.md }}>
        <Typography
          sx={{
            fontSize: '0.85rem',
            fontWeight: 600,
            mb: ThemeTokens.spacing.sm,
            color: '#4caf50',
          }}
        >
          Your Differentials ({currentDifferentials.length})
        </Typography>
        {currentDifferentials.length === 0 ? (
          <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>None</Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {currentDifferentials.map((player) => (
              <Chip
                key={player}
                label={player}
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  height: 'auto',
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  '& .MuiChip-label': {
                    padding: '4px 8px',
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Rival Differentials */}
      <Box>
        <Typography
          sx={{
            fontSize: '0.85rem',
            fontWeight: 600,
            mb: ThemeTokens.spacing.sm,
            color: '#f44336',
          }}
        >
          Rival Differentials ({opponentDifferentials.length})
        </Typography>
        {opponentDifferentials.length === 0 ? (
          <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>None</Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {opponentDifferentials.map((player) => (
              <Chip
                key={player}
                label={player}
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  height: 'auto',
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  '& .MuiChip-label': {
                    padding: '4px 8px',
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
