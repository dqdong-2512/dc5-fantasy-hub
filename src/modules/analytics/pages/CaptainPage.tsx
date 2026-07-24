import React from 'react';
import { Alert, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';
import { RankingTable } from '../components';
import { useAnalyticsDecision } from '../context';
import { getPlayerHeadshotUrl } from '@shared/assets';

export function CaptainPage(): React.ReactElement {
  const { captainCandidates, managerCaptainCandidates, connectedEntryId } = useAnalyticsDecision();

  const columns = [
    {
      id: 'score',
      label: 'Captain Score',
      align: 'right' as const,
      sortable: true,
      sortValue: (row: (typeof captainCandidates)[number]) => row.score,
      render: (row: (typeof captainCandidates)[number]) => row.score,
    },
    {
      id: 'confidence',
      label: 'Confidence',
      sortable: true,
      sortValue: (row: (typeof captainCandidates)[number]) => row.confidence,
      render: (row: (typeof captainCandidates)[number]) => row.confidence,
    },
    {
      id: 'ownership',
      label: 'Own %',
      align: 'right' as const,
      sortable: true,
      sortValue: (row: (typeof captainCandidates)[number]) => row.ownership,
      render: (row: (typeof captainCandidates)[number]) => row.ownership.toFixed(1),
    },
    {
      id: 'fixture',
      label: 'Next Fixtures',
      sortable: false,
      render: (row: (typeof captainCandidates)[number]) => row.fixtureSummary,
    },
    {
      id: 'reason',
      label: 'Reason',
      sortable: false,
      render: (row: (typeof captainCandidates)[number]) => row.reason,
    },
  ];

  return (
    <Stack spacing={ThemeTokens.spacing.md}>
      <Alert severity="info">
        Captain scores are deterministic (0-100), balancing form, fixtures, home/away, reliability,
        involvement, and ownership profile.
      </Alert>

      {!connectedEntryId && (
        <Alert
          severity="warning"
          action={
            <Button component={RouterLink} to="/premier-league/gameweek/overview">
              Connect
            </Button>
          }
        >
          Connect your FPL entry to unlock captain candidates from your own squad.
        </Alert>
      )}

      {connectedEntryId && (
        <RankingTable
          title="Your Squad Captain Matrix"
          rows={managerCaptainCandidates}
          columns={columns}
          initialSortColumn="score"
          rowMeta={{
            key: (row) => `captain-squad-${row.playerId}`,
            title: (row) => row.playerName,
            subtitle: (row) => row.club,
            badges: (row) => [row.confidence],
            trend: (row) => (row.score >= 75 ? 'up' : row.score <= 50 ? 'down' : 'flat'),
            avatar: {
              src: () => getPlayerHeadshotUrl(),
              alt: (row) => row.playerName,
            },
          }}
        />
      )}

      <RankingTable
        title="Public Captain Shortlist"
        rows={captainCandidates}
        columns={columns}
        initialSortColumn="score"
        rowMeta={{
          key: (row) => `captain-global-${row.playerId}`,
          title: (row) => row.playerName,
          subtitle: (row) => row.club,
          badges: (row) => [row.confidence],
          trend: (row) => (row.score >= 75 ? 'up' : row.score <= 50 ? 'down' : 'flat'),
          avatar: {
            src: () => getPlayerHeadshotUrl(),
            alt: (row) => row.playerName,
          },
        }}
      />
    </Stack>
  );
}
