/**
 * Gameweek Summary Card
 * Displays key gameweek statistics including points, transfers, and chip usage
 */

import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface GameweekSummaryCardProps {
  gameweekNumber: number;
  totalPoints: number;
  gameweekRank?: number | null;
  transfers: number;
  transferCost: number;
  captainPoints: number;
  benchPoints: number;
  activeChip?: string | null;
  isHistorical?: boolean;
}

const getChipLabel = (chip: string | null | undefined): string | null => {
  if (!chip) return null;
  switch (chip.toLowerCase()) {
    case 'bb':
      return 'Bench Boost';
    case 'tc':
      return 'Triple Captain';
    case 'fh':
      return 'Free Hit';
    case 'wc':
      return 'Wildcard';
    default:
      return chip;
  }
};

export const GameweekSummaryCard: React.FC<GameweekSummaryCardProps> = ({
  gameweekNumber,
  totalPoints,
  gameweekRank,
  transfers,
  transferCost,
  captainPoints,
  benchPoints,
  activeChip,
  isHistorical,
}) => {
  const chipLabel = getChipLabel(activeChip);

  return (
    <Card sx={{ marginBottom: ThemeTokens.spacing.lg }}>
      <CardContent>
        <Stack spacing={ThemeTokens.spacing.md}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Gameweek {gameweekNumber}
              {isHistorical && (
                <Typography variant="caption" color="textSecondary">
                  {' '}
                  (Historical)
                </Typography>
              )}
            </Typography>
            {chipLabel && (
              <Chip
                label={chipLabel}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>

          {/* Points Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: ThemeTokens.spacing.md,
            }}
          >
            {/* Total Points (Gross) */}
            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block', marginBottom: 0.5 }}
              >
                Gross Points
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: '#4caf50', fontSize: '1.5rem' }}
              >
                {totalPoints}
              </Typography>
            </Box>

            {/* Net Points (After Transfer Cost) */}
            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block', marginBottom: 0.5 }}
              >
                Net Points
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: '#2196f3', fontSize: '1.5rem' }}
              >
                {totalPoints - transferCost}
              </Typography>
            </Box>

            {/* Rank */}
            {gameweekRank !== null && gameweekRank !== undefined && (
              <Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block', marginBottom: 0.5 }}
                >
                  Gameweek Rank
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
                  #{gameweekRank.toLocaleString()}
                </Typography>
              </Box>
            )}

            {/* Captain Points */}
            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block', marginBottom: 0.5 }}
              >
                Captain (C)
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: '#ff9800', fontSize: '1.5rem' }}
              >
                {captainPoints}
              </Typography>
            </Box>

            {/* Bench Points */}
            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block', marginBottom: 0.5 }}
              >
                Bench
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: '#2196f3', fontSize: '1.5rem' }}
              >
                {benchPoints}
              </Typography>
            </Box>
          </Box>

          {/* Transfers Row */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' },
              gap: ThemeTokens.spacing.md,
              paddingTop: ThemeTokens.spacing.sm,
              borderTop: '1px solid #eee',
            }}
          >
            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block', marginBottom: 0.5 }}
              >
                Transfers Made
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {transfers}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block', marginBottom: 0.5 }}
              >
                Transfer Cost
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: transferCost > 0 ? '#d32f2f' : '#4caf50' }}
              >
                {transferCost > 0 ? `-${transferCost}` : '—'}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
