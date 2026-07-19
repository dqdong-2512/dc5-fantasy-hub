/**
 * My Race Summary Component
 * Displays current manager's key metrics in the league race
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { LeagueRaceMetrics } from '@domain/models';

export interface MyRaceSummaryProps {
  metrics: LeagueRaceMetrics | null;
}

interface MetricItemProps {
  label: string;
  value: string | number;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value }) => (
  <Box>
    <Typography
      variant="caption"
      sx={{ color: '#666', fontWeight: 500, display: 'block', mb: 0.5 }}
    >
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1rem' }}>
      {value}
    </Typography>
  </Box>
);

export const MyRaceSummary: React.FC<MyRaceSummaryProps> = ({ metrics }) => {
  if (!metrics) {
    return null;
  }

  const movementDisplay =
    metrics.rankMovement > 0
      ? `↑${metrics.rankMovement}`
      : metrics.rankMovement < 0
        ? `↓${Math.abs(metrics.rankMovement)}`
        : '—';

  const movementColor =
    metrics.rankMovement > 0 ? '#4caf50' : metrics.rankMovement < 0 ? '#f44336' : '#666';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
        gap: ThemeTokens.spacing.md,
        mb: ThemeTokens.spacing.lg,
        pb: ThemeTokens.spacing.md,
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Box>
        <MetricItem label="Current Rank" value={`#${metrics.currentRank}`} />
      </Box>
      <Box>
        <MetricItem label="Previous Rank" value={`#${metrics.previousRank}`} />
      </Box>
      <Box>
        <Box>
          <Typography
            variant="caption"
            sx={{ color: '#666', fontWeight: 500, display: 'block', mb: 0.5 }}
          >
            Movement
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, fontSize: '1rem', color: movementColor }}
          >
            {movementDisplay}
          </Typography>
        </Box>
      </Box>
      <Box>
        <MetricItem label="GW Points" value={metrics.gameweekPoints} />
      </Box>
      <Box>
        <MetricItem label="Total Points" value={metrics.totalPoints} />
      </Box>
      <Box>
        <MetricItem
          label="Gap to Leader"
          value={metrics.gapToLeader < 0 ? `${metrics.gapToLeader}` : '—'}
        />
      </Box>
    </Box>
  );
};
