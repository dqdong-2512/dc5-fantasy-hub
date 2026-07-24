import React from 'react';
import { Alert, Stack } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { RankingTable } from '../components';
import { useAnalyticsDecision } from '../context';

export function FixturesPage(): React.ReactElement {
  const { fixtureRuns } = useAnalyticsDecision();

  const columns = [
    {
      id: 'avg3',
      label: 'Next 3',
      align: 'right' as const,
      sortable: true,
      sortValue: (row: (typeof fixtureRuns)[number]) => row.averageDifficulty3,
      render: (row: (typeof fixtureRuns)[number]) => row.averageDifficulty3.toFixed(2),
    },
    {
      id: 'avg5',
      label: 'Next 5',
      align: 'right' as const,
      sortable: true,
      sortValue: (row: (typeof fixtureRuns)[number]) => row.averageDifficulty5,
      render: (row: (typeof fixtureRuns)[number]) => row.averageDifficulty5.toFixed(2),
    },
    {
      id: 'avg8',
      label: 'Next 8',
      align: 'right' as const,
      sortable: true,
      sortValue: (row: (typeof fixtureRuns)[number]) => row.averageDifficulty8,
      render: (row: (typeof fixtureRuns)[number]) => row.averageDifficulty8.toFixed(2),
    },
    {
      id: 'rating',
      label: 'Fixture Rating',
      align: 'right' as const,
      sortable: true,
      sortValue: (row: (typeof fixtureRuns)[number]) => row.fixtureRating,
      render: (row: (typeof fixtureRuns)[number]) => row.fixtureRating,
    },
    {
      id: 'attack',
      label: 'Attack Run',
      align: 'right' as const,
      sortable: true,
      sortValue: (row: (typeof fixtureRuns)[number]) => row.attackingRunRating,
      render: (row: (typeof fixtureRuns)[number]) => row.attackingRunRating,
    },
    {
      id: 'defense',
      label: 'Defense Run',
      align: 'right' as const,
      sortable: true,
      sortValue: (row: (typeof fixtureRuns)[number]) => row.defensiveRunRating,
      render: (row: (typeof fixtureRuns)[number]) => row.defensiveRunRating,
    },
    {
      id: 'swing',
      label: 'Swing',
      align: 'right' as const,
      sortable: true,
      sortValue: (row: (typeof fixtureRuns)[number]) => row.swing,
      render: (row: (typeof fixtureRuns)[number]) =>
        `${row.swing > 0 ? '+' : ''}${row.swing.toFixed(2)}`,
    },
  ];

  return (
    <Stack spacing={ThemeTokens.spacing.md}>
      <Alert severity="info">
        Fixture analysis rates next 3/5/8 runs with dedicated attacking and defensive lenses.
      </Alert>

      <RankingTable
        title="Club Fixture Analyzer"
        rows={fixtureRuns}
        columns={columns}
        initialSortColumn="rating"
        rowMeta={{
          key: (row) => `fixture-run-${row.teamId}`,
          title: (row) => row.teamName,
          subtitle: (row) =>
            row.upcoming
              .slice(0, 5)
              .map((f) => `${f.opponentCode}(${f.homeAway})`)
              .join(' • '),
          badges: (row) => [row.runLabel],
          trend: (row) => (row.swing >= 0.2 ? 'up' : row.swing <= -0.2 ? 'down' : 'flat'),
        }}
      />
    </Stack>
  );
}
