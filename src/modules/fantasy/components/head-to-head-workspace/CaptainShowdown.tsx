/**
 * Captain Showdown Component
 * Displays captain comparison with impact
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { CaptainComparison } from '@domain/models';

export interface CaptainShowdownProps {
  comparison: CaptainComparison;
}

export const CaptainShowdown: React.FC<CaptainShowdownProps> = ({ comparison }) => {
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
        Captain Showdown
      </Typography>

      {comparison.sameCaptain ? (
        <Paper
          sx={{
            p: ThemeTokens.spacing.md,
            backgroundColor: '#fafafa',
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#999',
              mb: 0.5,
            }}
          >
            Same Captain
          </Typography>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 700,
            }}
          >
            {comparison.currentManagerCaptainName || 'Unknown'}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: '#666',
              mt: 0.5,
            }}
          >
            {comparison.currentManagerCaptainContribution} pts (×2)
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: ThemeTokens.spacing.md,
          }}
        >
          {/* Current Manager Captain */}
          <Paper
            sx={{ p: ThemeTokens.spacing.md, backgroundColor: '#fafafa', textAlign: 'center' }}
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
              YOU
            </Typography>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {comparison.currentManagerCaptainName || 'Unknown'}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#666',
              }}
            >
              {comparison.currentManagerCaptainContribution} pts
            </Typography>
          </Paper>

          {/* Opponent Manager Captain */}
          <Paper
            sx={{ p: ThemeTokens.spacing.md, backgroundColor: '#fafafa', textAlign: 'center' }}
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
              RIVAL
            </Typography>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {comparison.opponentManagerCaptainName || 'Unknown'}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#666',
              }}
            >
              {comparison.opponentManagerCaptainContribution} pts
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Captain Swing */}
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
          Captain Advantage
        </Typography>
        <Typography
          sx={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color:
              comparison.captainSwing > 0
                ? '#4caf50'
                : comparison.captainSwing < 0
                  ? '#f44336'
                  : '#666',
          }}
        >
          {comparison.captainSwing > 0 ? 'YOU +' : comparison.captainSwing < 0 ? 'RIVAL +' : ''}
          {Math.abs(comparison.captainSwing)}
        </Typography>
      </Box>
    </Box>
  );
};
