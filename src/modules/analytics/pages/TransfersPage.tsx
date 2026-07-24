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

export function TransfersPage(): React.ReactElement {
  const { transferCandidates, connectedEntryId, managerBankInMillions } = useAnalyticsDecision();

  return (
    <Stack spacing={ThemeTokens.spacing.md}>
      <Alert severity="info">
        Transfer targets are ranked by deterministic score. No transfers are executed automatically.
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

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Transfer Watchlist
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Club</TableCell>
                <TableCell>Position</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell>Methodology Summary</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transferCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No transfer targets met the current criteria.</TableCell>
                </TableRow>
              ) : (
                transferCandidates.map((candidate) => (
                  <TableRow key={candidate.playerId} hover>
                    <TableCell>
                      <Button
                        component={RouterLink}
                        to={`/premier-league/players/${candidate.playerId}`}
                        size="small"
                      >
                        {candidate.playerName}
                      </Button>
                    </TableCell>
                    <TableCell>{candidate.club}</TableCell>
                    <TableCell>{candidate.position}</TableCell>
                    <TableCell align="right">{candidate.price.toFixed(1)}m</TableCell>
                    <TableCell align="right">{candidate.transferTargetScore.toFixed(2)}</TableCell>
                    <TableCell>{candidate.summary}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
