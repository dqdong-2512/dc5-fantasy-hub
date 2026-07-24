import React from 'react';
import { Alert, Stack } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { RankingTable } from '../components';
import { useAnalyticsDecision } from '../context';

export function ValuePage(): React.ReactElement {
  const { valueIndex } = useAnalyticsDecision();

  return (
    <Stack spacing={ThemeTokens.spacing.md}>
      <Alert severity="info">
        Value Index combines points-per-million, expected value, and minutes-per-price for stable
        efficiency ranking.
      </Alert>

      <RankingTable
        title="Value Index"
        rows={valueIndex}
        initialSortColumn="ppm"
        columns={[
          {
            id: 'ppm',
            label: 'Points / M',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.pointsPerMillion,
            render: (row) => row.pointsPerMillion.toFixed(2),
          },
          {
            id: 'expected',
            label: 'Expected Value',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.expectedValue,
            render: (row) => row.expectedValue.toFixed(2),
          },
          {
            id: 'minutesPrice',
            label: 'Minutes / Price',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.minutesPerPrice,
            render: (row) => row.minutesPerPrice.toFixed(2),
          },
          {
            id: 'price',
            label: 'Price',
            align: 'right',
            sortable: true,
            sortValue: (row) => row.price,
            render: (row) => `${row.price.toFixed(1)}m`,
          },
        ]}
        rowMeta={{
          key: (row) => row.playerId,
          title: (row) => row.playerName,
          subtitle: (row) => row.club,
          badges: () => ['Value'],
          trend: (row) => (row.pointsPerMillion >= 15 ? 'up' : 'flat'),
          positionChip: (row) => row.position,
        }}
      />
    </Stack>
  );
}
