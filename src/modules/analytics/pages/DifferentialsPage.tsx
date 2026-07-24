import React from 'react';
import { Alert, Stack } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { RankingTable } from '../components';
import { useAnalyticsDecision } from '../context';

export function DifferentialsPage(): React.ReactElement {
  const { differentialPicks } = useAnalyticsDecision();

  return (
    <Stack spacing={ThemeTokens.spacing.md}>
      <Alert severity="info">
        Differential Finder flags low-owned, in-form, fixture-ready players with strong minutes
        reliability.
      </Alert>

      <RankingTable
        title="Top 20 Differentials"
        rows={differentialPicks}
        initialSortColumn="score"
        columns={[
          {
            id: 'score',
            label: 'Score',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.score,
            render: (row) => row.score.toFixed(1),
          },
          {
            id: 'ownership',
            label: 'Own %',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.ownership,
            render: (row) => row.ownership.toFixed(1),
          },
          {
            id: 'form',
            label: 'Form',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.formScore,
            render: (row) => row.formScore.toFixed(2),
          },
          {
            id: 'fixture',
            label: 'Fixture',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.fixtureScore,
            render: (row) => row.fixtureScore.toFixed(2),
          },
          {
            id: 'value',
            label: 'Value',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.valueScore,
            render: (row) => row.valueScore.toFixed(2),
          },
        ]}
        rowMeta={{
          key: (row) => row.playerId,
          title: (row) => row.playerName,
          subtitle: (row) => `${row.club} • ${row.position}`,
          badges: () => ['Differential'],
          trend: (row) => (row.score >= 75 ? 'up' : 'flat'),
          positionChip: (row) => row.position,
        }}
      />
    </Stack>
  );
}
