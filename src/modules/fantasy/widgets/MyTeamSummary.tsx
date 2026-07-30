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
      py: 1,
      borderBottom: '1px solid #e0e0e0',
      '&:last-child': {
        borderBottom: 'none',
      },
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>

    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

export const MyTeamSummary: React.FC<MyTeamSummaryProps> = ({ manager, onViewTeam }) => {
  const overallPoints =
    manager.overallPoints == null ? '—' : manager.overallPoints.toLocaleString('en-US');

  const overallRank =
    manager.overallRank == null ? 'Not Ranked' : `#${manager.overallRank.toLocaleString('en-US')}`;

  const teamValue = manager.teamValue == null ? '—' : `£${manager.teamValue.toFixed(1)}m`;

  const bank = manager.bank == null ? '—' : `£${manager.bank.toFixed(1)}m`;

  return (
    <DashboardWidget title="My Team" subtitle="Team information & stats" icon={<PersonIcon />}>
      <Stack spacing={3}>
        {/* Team Header */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            {manager.teamName || 'Unnamed Team'}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {manager.name || 'Unknown Manager'}
          </Typography>
        </Box>

        {/* Stats */}
        <Stack spacing={0}>
          <StatRow label="Overall Points" value={overallPoints} />

          <StatRow label="Overall Rank" value={overallRank} />

          <StatRow label="Team Value" value={teamValue} />

          <StatRow label="Bank" value={bank} />
        </Stack>

        {/* Action */}
        <Button
          variant="contained"
          size="small"
          onClick={onViewTeam}
          sx={{
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#d97706',
            },
            textTransform: 'none',
            fontWeight: 600,
            mt: 1,
          }}
        >
          View My Team
        </Button>
      </Stack>
    </DashboardWidget>
  );
};
