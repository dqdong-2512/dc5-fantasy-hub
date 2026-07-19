/**
 * Head-to-Head Hero Component
 * Displays compact VS view with overall and gameweek metrics
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { ManagerHeadToHeadComparison } from '@domain/models';

export interface ManagerHeadToHeadHeroProps {
  comparison: ManagerHeadToHeadComparison;
  currentManagerName: string;
  opponentManagerName: string;
}

export const ManagerHeadToHeadHero: React.FC<ManagerHeadToHeadHeroProps> = ({
  comparison,
  currentManagerName,
  opponentManagerName,
}) => {
  const overall = comparison.overallComparison;
  const gameweek = comparison.gameweekComparison;

  return (
    <Paper
      sx={{
        p: ThemeTokens.spacing.md,
        mb: ThemeTokens.spacing.lg,
        backgroundColor: '#fafafa',
      }}
    >
      {/* Overall Score */}
      <Box sx={{ mb: ThemeTokens.spacing.md }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: ThemeTokens.spacing.md,
          }}
        >
          {/* You */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
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
                fontSize: '1.75rem',
                fontWeight: 700,
              }}
            >
              {overall.currentManagerTotalPoints}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                fontSize: '0.75rem',
                mt: 0.25,
              }}
            >
              {currentManagerName}
            </Typography>
          </Box>

          {/* VS */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#666',
              }}
            >
              VS
            </Typography>
          </Box>

          {/* Rival */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
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
                fontSize: '1.75rem',
                fontWeight: 700,
              }}
            >
              {overall.opponentManagerTotalPoints}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                fontSize: '0.75rem',
                mt: 0.25,
              }}
            >
              {opponentManagerName}
            </Typography>
          </Box>
        </Box>

        {/* Overall Gap */}
        <Box
          sx={{
            mt: ThemeTokens.spacing.sm,
            pt: ThemeTokens.spacing.sm,
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
            Overall Gap
          </Typography>
          <Typography
            sx={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: overall.pointsGap > 0 ? '#4caf50' : overall.pointsGap < 0 ? '#f44336' : '#666',
            }}
          >
            {overall.pointsGap > 0 ? '+' : ''}
            {overall.pointsGap}
          </Typography>
        </Box>
      </Box>

      {/* Gameweek Result */}
      <Box>
        <Typography
          sx={{
            fontSize: '0.85rem',
            fontWeight: 600,
            mb: ThemeTokens.spacing.sm,
            color: '#666',
          }}
        >
          GW {comparison.gameweekId}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: ThemeTokens.spacing.sm,
          }}
        >
          {/* You Points */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: '1.3rem',
                fontWeight: 700,
              }}
            >
              {gameweek.currentManagerNetPoints}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                color: '#999',
              }}
            >
              pts
            </Typography>
          </Box>

          {/* Vs */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#666',
              }}
            >
              —
            </Typography>
          </Box>

          {/* Rival Points */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: '1.3rem',
                fontWeight: 700,
              }}
            >
              {gameweek.opponentManagerNetPoints}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                color: '#999',
              }}
            >
              pts
            </Typography>
          </Box>
        </Box>

        {/* GW Gap */}
        <Box
          sx={{
            mt: ThemeTokens.spacing.sm,
            pt: ThemeTokens.spacing.sm,
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
            GW Advantage
          </Typography>
          <Typography
            sx={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color:
                gameweek.gameweekPointsGap > 0
                  ? '#4caf50'
                  : gameweek.gameweekPointsGap < 0
                    ? '#f44336'
                    : '#666',
            }}
          >
            {gameweek.gameweekPointsGap > 0 ? '+' : ''}
            {gameweek.gameweekPointsGap}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
