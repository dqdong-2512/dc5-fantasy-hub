/**
 * Current Gameweek Summary Widget
 * Fantasy Game-specific gameweek statistics
 */

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { DashboardWidget } from '../../dashboard/components';
import type { FantasyGameweekFixture } from '../types';

export interface CurrentGameweekSummaryProps {
  gameweek: FantasyGameweekFixture;
  onViewGameweek?: () => void;
}

interface StatBoxProps {
  label: string;
  value: string | number;
  color?: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, color = '#1976d2' }) => (
  <Box>
    <Typography
      variant="caption"
      color="textSecondary"
      sx={{ display: 'block', marginBottom: 0.5 }}
    >
      {label}
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: 700, color }}>
      {value}
    </Typography>
  </Box>
);

export const CurrentGameweekSummary: React.FC<CurrentGameweekSummaryProps> = ({
  gameweek,
  onViewGameweek,
}) => {
  const pointsColor =
    gameweek.points > gameweek.averagePoints
      ? '#4caf50'
      : gameweek.points < gameweek.averagePoints
        ? '#f44336'
        : '#1976d2';

  return (
    <DashboardWidget
      title={`Gameweek ${gameweek.gameweek}`}
      subtitle="Gameweek statistics"
      icon={<TrendingUpIcon />}
      action={
        onViewGameweek
          ? {
              label: 'View Gameweek',
              onClick: onViewGameweek,
            }
          : undefined
      }
    >
      <Stack spacing={3}>
        {/* Primary Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <StatBox label="Points" value={gameweek.points} color={pointsColor} />
          </Box>
          <Box>
            <StatBox label="Average" value={gameweek.averagePoints} />
          </Box>
          <Box>
            <StatBox label="Highest" value={gameweek.highestPoints} color="#4caf50" />
          </Box>
          <Box>
            <StatBox label="Your Rank" value={`#${gameweek.rank.toLocaleString()}`} />
          </Box>
        </Box>

        {/* Secondary Stats */}
        <Box sx={{ borderTop: '1px solid #e0e0e0', paddingTop: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 2 }}>
            <Box>
              <StatBox label="Transfers" value={gameweek.transfers} />
            </Box>
            <Box>
              <StatBox label="Transfer Cost" value={`-${gameweek.transferCost}`} color="#f44336" />
            </Box>
          </Box>
          <Box>
            <StatBox label="Bench Points" value={gameweek.benchPoints} />
          </Box>
        </Box>
      </Stack>
    </DashboardWidget>
  );
};
