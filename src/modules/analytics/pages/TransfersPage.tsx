import React from 'react';
import { Alert, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';
import { RankingTable } from '../components';
import { useAnalyticsDecision } from '../context';

export function TransfersPage(): React.ReactElement {
  const {
    topBuyCandidates,
    topSellCandidates,
    topWatchlistCandidates,
    connectedEntryId,
    managerBankInMillions,
  } = useAnalyticsDecision();

  const columns = [
    {
      id: 'score',
      label: 'Score',
      align: 'right' as const,
      sortable: true,
      sortValue: (row: (typeof topBuyCandidates)[number]) => row.transferTargetScore,
      render: (row: (typeof topBuyCandidates)[number]) => row.transferTargetScore.toFixed(1),
    },
    {
      id: 'price',
      label: 'Price',
      align: 'right' as const,
      sortable: true,
      sortValue: (row: (typeof topBuyCandidates)[number]) => row.price,
      render: (row: (typeof topBuyCandidates)[number]) => `${row.price.toFixed(1)}m`,
    },
    {
      id: 'trend',
      label: 'Price Trend',
      align: 'right' as const,
      sortable: true,
      sortValue: (row: (typeof topBuyCandidates)[number]) => row.priceTrend,
      render: (row: (typeof topBuyCandidates)[number]) =>
        `${row.priceTrend > 0 ? '+' : ''}${row.priceTrend.toFixed(1)}`,
    },
    {
      id: 'fixture',
      label: 'Fixtures',
      sortable: false,
      render: (row: (typeof topBuyCandidates)[number]) => row.fixtureSummary,
    },
    {
      id: 'form',
      label: 'Form',
      sortable: false,
      render: (row: (typeof topBuyCandidates)[number]) => row.formSummary,
    },
  ];

  return (
    <Stack spacing={ThemeTokens.spacing.md}>
      <Alert severity="info">
        Recommendations are deterministic and categorized as Buy, Sell, Hold, or Watchlist.
      </Alert>

      {connectedEntryId ? (
        <Alert severity="success">
          Connected entry detected. Budget context: {managerBankInMillions?.toFixed(1) ?? 'N/A'}m in
          bank.
        </Alert>
      ) : (
        <Alert
          severity="warning"
          action={
            <Button component={RouterLink} to="/premier-league/gameweek/overview">
              Connect Entry
            </Button>
          }
        >
          Connect your entry to tailor transfer options to your squad context.
        </Alert>
      )}

      <RankingTable
        title="Buy Targets"
        rows={topBuyCandidates}
        columns={columns}
        initialSortColumn="score"
        rowMeta={{
          key: (row) => `buy-${row.playerId}`,
          title: (row) => row.playerName,
          subtitle: (row) => `${row.club} • ${row.position}`,
          badges: () => ['Buy'],
          trend: (row) => (row.transferTargetScore >= 75 ? 'up' : 'flat'),
        }}
      />

      <RankingTable
        title="Sell Candidates"
        rows={topSellCandidates}
        columns={columns}
        initialSortColumn="score"
        rowMeta={{
          key: (row) => `sell-${row.playerId}`,
          title: (row) => row.playerName,
          subtitle: (row) => `${row.club} • ${row.position}`,
          badges: () => ['Sell'],
          trend: () => 'down',
        }}
      />

      <RankingTable
        title="Watchlist"
        rows={topWatchlistCandidates}
        columns={columns}
        initialSortColumn="score"
        rowMeta={{
          key: (row) => `watch-${row.playerId}`,
          title: (row) => row.playerName,
          subtitle: (row) => `${row.club} • ${row.position}`,
          badges: () => ['Watchlist'],
          trend: () => 'flat',
        }}
      />

      <Button
        component={RouterLink}
        to="/premier-league/gameweek/transfers"
        variant="outlined"
        size="small"
      >
        Open Transfer Planner
      </Button>
    </Stack>
  );
}
