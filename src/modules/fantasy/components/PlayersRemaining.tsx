/**
 * Players Remaining Component
 * Shows how many players are still playing vs finished for live gameweeks
 */

import React from 'react';
import { Box, Card, CardContent, Stack, Typography, LinearProgress, Chip } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { LiveGameweekPerformance } from '@shared/services';

export interface PlayersRemainingProps {
  performance: LiveGameweekPerformance | null;
  compact?: boolean;
}

export const PlayersRemaining: React.FC<PlayersRemainingProps> = ({
  performance,
  compact = false,
}) => {
  if (!performance) {
    return null;
  }

  // Count players by match status
  const allPlayers = [...performance.starters.players, ...performance.bench.players];
  const finished = allPlayers.filter((p) => p.matchStatus === 'finished').length;
  const live = allPlayers.filter((p) => p.matchStatus === 'in_progress').length;
  const notStarted = allPlayers.filter((p) => p.matchStatus === 'not_started').length;
  const remaining = live + notStarted;
  const total = allPlayers.length;

  const finishedPercent = total > 0 ? (finished / total) * 100 : 0;

  if (compact) {
    return (
      <Box sx={{ padding: ThemeTokens.spacing.sm }}>
        <Stack spacing={ThemeTokens.spacing.xs}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Players Status
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {finished}/{total} Finished
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={finishedPercent}
            sx={{
              height: 4,
              borderRadius: ThemeTokens.borderRadius.sm,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#4caf50',
              },
            }}
          />
          <Box
            sx={{
              display: 'flex',
              gap: ThemeTokens.spacing.xs,
              justifyContent: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            {remaining > 0 && (
              <Chip
                label={`${remaining} Remaining`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
            {live > 0 && (
              <Chip
                label={`${live} Live`}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  backgroundColor: '#fff9c4',
                  color: '#f57f17',
                }}
              />
            )}
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}
        >
          Players Remaining
        </Typography>
        <Stack spacing={ThemeTokens.spacing.md}>
          {/* Progress Bar */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: ThemeTokens.spacing.sm,
              }}
            >
              <Typography variant="body2" color="textSecondary">
                Finished
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {finished}/{total}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={finishedPercent}
              sx={{
                height: 8,
                borderRadius: ThemeTokens.borderRadius.sm,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4caf50',
                },
              }}
            />
          </Box>

          {/* Status Summary */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: ThemeTokens.spacing.md,
              textAlign: 'center',
            }}
          >
            <Box>
              <Typography variant="body2" color="textSecondary">
                Finished
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {finished}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Live
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fbc02d' }}>
                {live}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Not Started
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                {notStarted}
              </Typography>
            </Box>
          </Box>

          {/* Status by position */}
          {live > 0 && (
            <Box
              sx={{
                padding: ThemeTokens.spacing.sm,
                backgroundColor: '#fff9c4',
                borderRadius: ThemeTokens.borderRadius.sm,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#f57f17' }}>
                ⚡ {live} player{live !== 1 ? 's' : ''} currently playing
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
