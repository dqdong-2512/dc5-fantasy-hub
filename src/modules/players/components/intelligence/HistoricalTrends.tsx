/**
 * Historical Trends Component
 * Displays placeholder containers for historical analysis charts
 */

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { ComingSoonCard } from '@shared/components';

export interface HistoricalTrendsProps {
  playerName: string;
}

/**
 * Historical Trends
 * Prepares chart containers for future trend analysis
 */
export function HistoricalTrends({ playerName }: HistoricalTrendsProps): React.ReactElement {
  return (
    <Box>
      <Typography
        variant={ThemeTokens.typography.subsectionTitleVariant}
        sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
      >
        Historical Trends
      </Typography>

      <Stack spacing={ThemeTokens.spacing.md}>
        <ComingSoonCard
          title="Points Trend"
          subtitle={`${playerName}'s historical points by gameweek`}
        />

        <ComingSoonCard title="Form Trend" subtitle={`Form rating progression over the season`} />

        <ComingSoonCard title="Minutes Trend" subtitle={`Playing time and availability pattern`} />

        <ComingSoonCard
          title="Price Evolution"
          subtitle={`Market value changes throughout the season`}
        />
      </Stack>
    </Box>
  );
}
