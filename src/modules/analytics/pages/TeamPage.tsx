import React from 'react';
import { Alert, Button, Box, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';
import { RankingTable } from '../components';
import { useAnalyticsDecision } from '../context';

export function TeamPage(): React.ReactElement {
  const { connectedEntryId, teamSummary, teamRiskFlags, injuryWatch } = useAnalyticsDecision();

  if (!connectedEntryId) {
    return (
      <Alert
        severity="warning"
        action={
          <Button component={RouterLink} to="/premier-league/gameweek/overview" size="small">
            Connect Entry
          </Button>
        }
      >
        Connect your entry to view personalized squad insights.
      </Alert>
    );
  }

  return (
    <Stack spacing={ThemeTokens.spacing.md}>
      <Alert severity="info">
        Team insights highlight potential risk signals. They are not automatic actions.
      </Alert>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: ThemeTokens.spacing.sm }}>
        <Box sx={{ flex: '1 1 140px' }}>
          <SummaryCard label="Squad Size" value={teamSummary.squadSize.toString()} />
        </Box>
        <Box sx={{ flex: '1 1 140px' }}>
          <SummaryCard label="Avg Form" value={teamSummary.averageForm.toFixed(2)} />
        </Box>
        <Box sx={{ flex: '1 1 140px' }}>
          <SummaryCard label="Avg Fixture" value={teamSummary.averageFixtureScore.toFixed(2)} />
        </Box>
        <Box sx={{ flex: '1 1 140px' }}>
          <SummaryCard label="At Risk" value={teamSummary.playersAtRisk.toString()} />
        </Box>
        <Box sx={{ flex: '1 1 140px' }}>
          <SummaryCard label="Good Runs" value={teamSummary.playersWithGoodRuns.toString()} />
        </Box>
      </Box>

      <RankingTable
        title="Risk Flags"
        rows={teamRiskFlags}
        columns={[
          {
            id: 'reason',
            label: 'Reason',
            sortable: false,
            render: (row: (typeof teamRiskFlags)[number]) => row.reason,
          },
        ]}
        rowMeta={{
          key: (row) => `${row.playerId}-${row.reason}`,
          title: (row) => row.playerName,
          subtitle: () => 'Squad Risk',
          trend: () => 'down',
          badges: () => ['Risk'],
        }}
      />

      <RankingTable
        title="Injury Watch"
        rows={injuryWatch}
        columns={[
          {
            id: 'status',
            label: 'Status',
            sortable: true,
            sortValue: (row: (typeof injuryWatch)[number]) => row.status,
            render: (row: (typeof injuryWatch)[number]) => row.status,
          },
          {
            id: 'club',
            label: 'Club',
            sortable: true,
            sortValue: (row: (typeof injuryWatch)[number]) => row.club,
            render: (row: (typeof injuryWatch)[number]) => row.club,
          },
        ]}
        rowMeta={{
          key: (row) => row.playerId,
          title: (row) => row.playerName,
          subtitle: (row) => row.club,
          trend: () => 'down',
          badges: (row) => [row.status.toUpperCase()],
        }}
      />
    </Stack>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: ThemeTokens.spacing.sm }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );
}
