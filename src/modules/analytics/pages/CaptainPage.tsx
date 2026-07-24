import React from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';
import { useAnalyticsDecision } from '../context';

export function CaptainPage(): React.ReactElement {
  const { captainCandidates, managerCaptainCandidates, connectedEntryId } = useAnalyticsDecision();

  return (
    <Stack spacing={ThemeTokens.spacing.md}>
      <Alert severity="info">
        Captain score = form + fixtures + reliability. Use this as decision support, not prediction.
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
        <CaptainTable
          title="Your Squad Captain Matrix"
          rows={managerCaptainCandidates}
          emptyMessage="No eligible players from your current squad."
        />
      )}

      <CaptainTable
        title="Public Captain Shortlist"
        rows={captainCandidates}
        emptyMessage="No captain candidates available in the current dataset."
      />
    </Stack>
  );
}

function CaptainTable({
  title,
  rows,
  emptyMessage,
}: {
  title: string;
  rows: Array<{
    playerId: number;
    playerName: string;
    club: string;
    score: number;
    reason: string;
  }>;
  emptyMessage: string;
}): React.ReactElement {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell>Club</TableCell>
              <TableCell align="right">Captain Score</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>{emptyMessage}</TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={`${title}-${row.playerId}`} hover>
                  <TableCell>{row.playerName}</TableCell>
                  <TableCell>{row.club}</TableCell>
                  <TableCell align="right">{row.score.toFixed(2)}</TableCell>
                  <TableCell>{row.reason}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
