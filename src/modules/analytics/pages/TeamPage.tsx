import React from 'react';
import {
  Alert,
  Button,
  Box,
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

export function TeamPage(): React.ReactElement {
  const { connectedEntryId, teamSummary, teamRiskFlags } = useAnalyticsDecision();

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

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Risk Flags
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamRiskFlags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2}>No immediate risk flags detected.</TableCell>
                </TableRow>
              ) : (
                teamRiskFlags.map((flag, index) => (
                  <TableRow key={`${flag.playerId}-${index}`} hover>
                    <TableCell>
                      <Button
                        size="small"
                        component={RouterLink}
                        to={`/premier-league/players/${flag.playerId}`}
                      >
                        {flag.playerName}
                      </Button>
                    </TableCell>
                    <TableCell>{flag.reason}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <Card>
      <CardContent>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
