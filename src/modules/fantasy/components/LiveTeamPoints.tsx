/**
 * Live Team Points Component
 * Displays current live/provisional points vs official points
 * Shows game status (upcoming/live/finished)
 */

import React from 'react';
import { Box, Card, Stack, Typography, Chip, Alert, CircularProgress } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { LiveGameweekPerformance } from '@shared/services';

export interface LiveTeamPointsProps {
  performance: LiveGameweekPerformance | null;
  isLoading?: boolean;
  error?: string | null;
  showTransferCost?: boolean;
  compact?: boolean;
}

export const LiveTeamPoints: React.FC<LiveTeamPointsProps> = ({
  performance,
  isLoading = false,
  error = null,
  showTransferCost = true,
  compact = false,
}) => {
  if (isLoading) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="textSecondary">
            Loading live performance...
          </Typography>
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Alert severity="error">{error}</Alert>
      </Card>
    );
  }

  if (!performance) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Typography color="textSecondary">No performance data available</Typography>
      </Card>
    );
  }

  const gameStatusColor = {
    upcoming: '#90caf9',
    live: '#fff59d',
    finished: '#c8e6c9',
  }[performance.gameStatus];

  const gameStatusLabel = {
    upcoming: 'Upcoming',
    live: 'Live',
    finished: 'Finished',
  }[performance.gameStatus];

  if (compact) {
    return (
      <Box sx={{ padding: ThemeTokens.spacing.sm }}>
        <Stack sx={{ direction: 'row', spacing: 2, alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Gameweek {performance.eventId}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, marginTop: 0.5 }}>
              <Chip
                label={gameStatusLabel}
                size="small"
                sx={{
                  backgroundColor: gameStatusColor,
                  height: '24px',
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            {performance.isFinished && performance.officialGameweekPoints !== null ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {performance.officialGameweekPoints} pts
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Official
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {performance.provisionalGameweekPoints} pts
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {performance.isLive ? 'Live' : 'Provisional'}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Card sx={{ padding: ThemeTokens.spacing.md }}>
      <Stack sx={{ spacing: 2 }}>
        {/* Header with game status */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Gameweek {performance.eventId}
              </Typography>
            </Box>
            <Chip
              label={gameStatusLabel}
              size="small"
              sx={{
                backgroundColor: gameStatusColor,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Points display */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: ThemeTokens.spacing.md,
          }}
        >
          {/* Official points (if finished) */}
          {performance.isFinished && performance.officialGameweekPoints !== null && (
            <Box
              sx={{ padding: ThemeTokens.spacing.md, backgroundColor: '#f1f8e9', borderRadius: 1 }}
            >
              <Typography variant="caption" color="textSecondary">
                Official Points
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#4caf50',
                  marginTop: 0.5,
                }}
              >
                {performance.officialGameweekPoints}
              </Typography>
            </Box>
          )}

          {/* Provisional/Live points */}
          <Box
            sx={{
              padding: ThemeTokens.spacing.md,
              backgroundColor: performance.isLive ? '#fff8e1' : '#f3f3f3',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="textSecondary">
              {performance.isLive ? 'Live Points' : 'Provisional'}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: performance.isLive ? '#f57c00' : '#666',
                marginTop: 0.5,
              }}
            >
              {performance.provisionalGameweekPoints}
            </Typography>
          </Box>
        </Box>

        {/* Breakdown */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: ThemeTokens.spacing.sm }}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Starters
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, marginTop: 0.25 }}>
              {performance.starters.totalFinalPoints}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="textSecondary">
              Captain Bonus
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, marginTop: 0.25 }}>
              +{performance.captainPoints}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="textSecondary">
              Bench Points
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, marginTop: 0.25 }}>
              {performance.benchPoints}
            </Typography>
          </Box>

          {showTransferCost && performance.transfersCost > 0 && (
            <Box>
              <Typography variant="caption" color="textSecondary">
                Transfer Cost
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, marginTop: 0.25, color: '#d32f2f' }}
              >
                -{performance.transfersCost}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Active chip indicator */}
        {performance.activeChip && (
          <Box
            sx={{
              padding: ThemeTokens.spacing.sm,
              backgroundColor: getChipBackgroundColor(performance.activeChip),
              borderRadius: 1,
              border: `1px solid ${getChipBorderColor(performance.activeChip)}`,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {getChipLabel(performance.activeChip)} Chip Active
            </Typography>
          </Box>
        )}

        {/* Status message */}
        {performance.isLive && (
          <Alert severity="info" sx={{ marginTop: 1 }}>
            Points are updating live. Refresh for latest data.
          </Alert>
        )}

        {performance.isFinished && (
          <Alert severity="success">Gameweek finished. Points are official.</Alert>
        )}
      </Stack>
    </Card>
  );
};

/**
 * Helper: Get chip background color
 */
function getChipBackgroundColor(chip: string): string {
  switch (chip.toUpperCase()) {
    case 'TC':
      return '#ffe0b2'; // Triple Captain
    case 'BB':
      return '#c8e6c9'; // Bench Boost
    case 'FH':
      return '#b3e5fc'; // Free Hit
    case 'WC':
      return '#f8bbd0'; // Wildcard
    default:
      return '#f5f5f5';
  }
}

/**
 * Helper: Get chip border color
 */
function getChipBorderColor(chip: string): string {
  switch (chip.toUpperCase()) {
    case 'TC':
      return '#ff6f00';
    case 'BB':
      return '#388e3c';
    case 'FH':
      return '#0277bd';
    case 'WC':
      return '#c2185b';
    default:
      return '#bdbdbd';
  }
}

/**
 * Helper: Get chip label
 */
function getChipLabel(chip: string): string {
  switch (chip.toUpperCase()) {
    case 'TC':
      return '🎯 Triple Captain';
    case 'BB':
      return '🔄 Bench Boost';
    case 'FH':
      return '🆓 Free Hit';
    case 'WC':
      return '🃏 Wildcard';
    default:
      return chip;
  }
}
