import React from 'react';
import {
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { useAnalyticsDecision } from '../context';

const RUN_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  excellent: 'success',
  good: 'success',
  mixed: 'warning',
  tough: 'error',
};

export function FixturesPage(): React.ReactElement {
  const { fixtureRuns } = useAnalyticsDecision();

  return (
    <Stack spacing={ThemeTokens.spacing.md}>
      <Alert severity="info">
        Fixture run scores are based on official fixture difficulty values over the next 5
        gameweeks.
      </Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Team Fixture Runs
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Team</TableCell>
                <TableCell align="right">Avg FDR</TableCell>
                <TableCell>Run Quality</TableCell>
                <TableCell>Next 5</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fixtureRuns.map((run) => (
                <TableRow key={run.teamId} hover>
                  <TableCell>{run.teamName}</TableCell>
                  <TableCell align="right">{run.averageDifficulty.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={run.runLabel} size="small" color={RUN_COLOR[run.runLabel]} />
                  </TableCell>
                  <TableCell>
                    {run.upcoming
                      .map(
                        (fixture) =>
                          `${fixture.opponentCode}(${fixture.homeAway}) ${fixture.difficulty}`
                      )
                      .join(' • ')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}
