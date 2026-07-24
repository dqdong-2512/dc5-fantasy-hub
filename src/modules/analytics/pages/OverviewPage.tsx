import React, { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
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
import { Link as RouterLink } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';
import { useAnalyticsDecision } from '../context';

export function OverviewPage(): React.ReactElement {
  const { analytics, isPreSeason, isLoading, error } = useAnalyticsDecision();

  const topOverall = useMemo(
    () => [...analytics].sort((a, b) => b.overallScore - a.overallScore).slice(0, 12),
    [analytics]
  );

  const formLeaders = useMemo(
    () => [...analytics].sort((a, b) => b.formScore - a.formScore).slice(0, 3),
    [analytics]
  );

  const valueLeaders = useMemo(
    () => [...analytics].sort((a, b) => b.valueScore - a.valueScore).slice(0, 3),
    [analytics]
  );

  const differentialLeaders = useMemo(
    () =>
      analytics
        .filter((record) => record.isDifferential)
        .sort((a, b) => b.differentialScore - a.differentialScore)
        .slice(0, 3),
    [analytics]
  );

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={ThemeTokens.spacing.md}>
      <Alert severity="info">
        This hub is deterministic. Rankings use current dataset metrics only and do not guarantee
        outcomes.
      </Alert>

      {isPreSeason && (
        <Alert severity="info">
          Pre-season mode is active. Form and points can be sparse; use price, role, and fixture
          context together.
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={ThemeTokens.spacing.sm}>
        <InsightCard title="Form Leaders" players={formLeaders.map((p) => p.playerName)} />
        <InsightCard title="Value Leaders" players={valueLeaders.map((p) => p.playerName)} />
        <InsightCard
          title="Differential Leaders"
          players={differentialLeaders.map((p) => p.playerName)}
        />
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: ThemeTokens.spacing.sm, fontWeight: 700 }}>
            Top Overall Targets
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Club</TableCell>
                <TableCell align="right">Form</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell align="right">Fixtures</TableCell>
                <TableCell align="right">Overall</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>Loading analytics...</TableCell>
                </TableRow>
              ) : (
                topOverall.map((record) => (
                  <TableRow key={record.playerId} hover>
                    <TableCell>
                      {record.playerName}{' '}
                      {record.isDifferential && (
                        <Chip label="Diff" color="success" size="small" sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                    <TableCell>{record.club}</TableCell>
                    <TableCell align="right">{record.formScore.toFixed(1)}</TableCell>
                    <TableCell align="right">{record.valueScore.toFixed(1)}</TableCell>
                    <TableCell align="right">{record.fixtureScore.toFixed(1)}</TableCell>
                    <TableCell align="right">{record.overallScore.toFixed(1)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        component={RouterLink}
                        to={`/premier-league/players/${record.playerId}`}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Box>
        <Button component={RouterLink} to="/premier-league/players" variant="outlined" size="small">
          Go To Player Research
        </Button>
      </Box>
    </Stack>
  );
}

function InsightCard({ title, players }: { title: string; players: string[] }): React.ReactElement {
  return (
    <Card sx={{ flex: 1 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
        <Stack spacing={0.5}>
          {players.map((name) => (
            <Typography key={`${title}-${name}`} variant="body2" color="text.secondary">
              {name}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
