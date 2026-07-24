import React from 'react';
import { Alert, Stack } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { RankingTable } from '../components';
import { useAnalyticsDecision } from '../context';

export function FormPage(): React.ReactElement {
  const { formProfiles } = useAnalyticsDecision();

  return (
    <Stack spacing={ThemeTokens.spacing.md}>
      <Alert severity="info">
        Form windows are calculated for last 3, 5, and 8 gameweeks using deterministic projections
        from official player metrics.
      </Alert>

      <RankingTable
        title="Player Form Engine"
        rows={formProfiles}
        initialSortColumn="last5"
        columns={[
          {
            id: 'last3',
            label: 'Last 3 Avg',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.last3.averagePoints,
            render: (row) => row.last3.averagePoints.toFixed(2),
          },
          {
            id: 'last5',
            label: 'Last 5 Avg',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.last5.averagePoints,
            render: (row) => row.last5.averagePoints.toFixed(2),
          },
          {
            id: 'last8',
            label: 'Last 8 Avg',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.last8.averagePoints,
            render: (row) => row.last8.averagePoints.toFixed(2),
          },
          {
            id: 'mins',
            label: 'Minutes (L8)',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.last8.minutesPlayed,
            render: (row) => row.last8.minutesPlayed,
          },
          {
            id: 'starts',
            label: 'Starts (L8)',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.last8.starts,
            render: (row) => row.last8.starts,
          },
          {
            id: 'returns',
            label: 'G/A (L8)',
            align: 'right',
            sortable: false,
            render: (row) => `${row.last8.goals.toFixed(1)} / ${row.last8.assists.toFixed(1)}`,
          },
          {
            id: 'cs',
            label: 'CS + Bonus',
            align: 'right',
            sortable: false,
            render: (row) => `${row.last8.cleanSheets.toFixed(1)} + ${row.last8.bonus.toFixed(1)}`,
          },
        ]}
        rowMeta={{
          key: (row) => row.playerId,
          title: (row) => row.playerName,
          subtitle: (row) => `${row.trend} trend`,
          badges: (row) => [row.band],
          trend: (row) =>
            row.trend === 'rising' ? 'up' : row.trend === 'falling' ? 'down' : 'flat',
        }}
      />
    </Stack>
  );
}
