/**
 * Gameweek Summary Component
 * Displays compact gameweek metrics
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { ManagerGameweekSnapshot } from '@domain/models';

export interface GameweekSummaryProps {
  snapshot: ManagerGameweekSnapshot;
}

interface MetricProps {
  label: string;
  value: string | number;
  color?: string;
}

const Metric: React.FC<MetricProps> = ({ label, value, color = '#1976d2' }) => (
  <Box>
    <Typography
      variant="caption"
      sx={{
        display: 'block',
        marginBottom: 0.5,
        color: '#666',
        fontWeight: 500,
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="h6"
      sx={{
        fontWeight: 700,
        color,
        fontSize: '1.1rem',
      }}
    >
      {value}
    </Typography>
  </Box>
);

export const GameweekSummary: React.FC<GameweekSummaryProps> = ({ snapshot }) => {
  const pointsColor =
    snapshot.totalPoints > snapshot.averagePoints
      ? '#4caf50'
      : snapshot.totalPoints < snapshot.averagePoints
        ? '#f44336'
        : '#1976d2';

  return (
    <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: ThemeTokens.spacing.md,
        }}
      >
        {/* My Points */}
        <Box>
          <Metric label="My Points" value={snapshot.totalPoints} color={pointsColor} />
        </Box>

        {/* Average */}
        <Box>
          <Metric label="Average" value={snapshot.averagePoints} />
        </Box>

        {/* Highest */}
        <Box>
          <Metric label="Highest" value={snapshot.highestPoints} color="#4caf50" />
        </Box>

        {/* Rank */}
        <Box>
          <Metric label="GW Rank" value={`#${snapshot.rank.toLocaleString()}`} />
        </Box>

        {/* Transfers */}
        <Box>
          <Metric label="Transfers" value={snapshot.transfers} />
        </Box>

        {/* Transfer Cost */}
        <Box>
          <Metric
            label="Transfer Cost"
            value={`-${snapshot.transferCost}`}
            color={snapshot.transferCost > 0 ? '#f44336' : '#757575'}
          />
        </Box>

        {/* Bench Points */}
        <Box>
          <Metric label="Bench Points" value={snapshot.benchPoints} />
        </Box>

        {/* Captain Info */}
        <Box>
          <Metric label="Captain Multiplier" value="x2" />
        </Box>
      </Box>
    </Box>
  );
};
