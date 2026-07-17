/**
 * My Team Summary Widget
 * Displays manager and team information for Fantasy Game
 */

import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { DashboardWidget } from '../../dashboard/components';
import type { FantasyGameManagerFixture } from '../types';

export interface MyTeamSummaryProps {
  manager: FantasyGameManagerFixture;
  onViewTeam?: () => void;
}

interface StatRowProps {
  label: string;
  value: string | number;
}

const StatRow: React.FC<StatRowProps> = ({ label, value }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      paddingY: 1,
      borderBottom: '1px solid #e0e0e0',
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    <Typography variant="body2" color="textSecondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

export const MyTeamSummary: React.FC<MyTeamSummaryProps> = ({ manager, onViewTeam }) => {
  return (
    <DashboardWidget title="My Team" subtitle="Team information & stats" icon={<PersonIcon />}>
      <Stack spacing={3}>
        {/* Team Header */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
            {manager.teamName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {manager.name}
          </Typography>
        </Box>

        {/* Stats */}
        <Stack spacing={0}>
          <StatRow label="Overall Points" value={manager.overallPoints.toLocaleString()} />
          <StatRow label="Overall Rank" value={`#${manager.overallRank.toLocaleString()}`} />
          <StatRow label="Team Value" value={`£${manager.teamValue.toFixed(1)}m`} />
          <StatRow label="Bank" value={`£${manager.bank.toFixed(1)}m`} />
        </Stack>

        {/* Action */}
        <Button
          variant="contained"
          size="small"
          onClick={onViewTeam}
          sx={{
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#d97706' },
            textTransform: 'none',
            fontWeight: 600,
            marginTop: 1,
          }}
        >
          View My Team
        </Button>
      </Stack>
    </DashboardWidget>
  );
};
