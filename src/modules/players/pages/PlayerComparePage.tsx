import React, { useMemo } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmptyState, PageContent } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { getPlayerImageUrl, getTeamBadgeUrl } from '@shared/assets';
import {
  formatDifficulty,
  formatKickoffDate,
  formatKickoffTime,
  getDifficultyLabel,
} from '@shared/presentation/fixture-formats';
import { PlayerFixtureIntelligenceService } from '../services';
import { usePlayerResearchData } from '../context';

function formatPrice(value: number): string {
  return `£${(value / 10).toFixed(1)}m`;
}

export function PlayerComparePage(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { players, playerById, totalPlayers, errorMessage } = usePlayerResearchData();

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [players]
  );

  const parsedIds = useMemo(() => {
    const raw = searchParams.get('players');
    if (!raw) {
      return [] as number[];
    }

    return raw
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((id) => Number.isFinite(id));
  }, [searchParams]);

  const validSelectedIds = useMemo(
    () => parsedIds.filter((id) => playerById.has(id)).slice(0, 2),
    [parsedIds, playerById]
  );

  const selectedPlayerA = validSelectedIds[0]
    ? (playerById.get(validSelectedIds[0]) ?? null)
    : null;
  const selectedPlayerB = validSelectedIds[1]
    ? (playerById.get(validSelectedIds[1]) ?? null)
    : null;

  const invalidIds = useMemo(
    () => parsedIds.filter((id) => !playerById.has(id)),
    [parsedIds, playerById]
  );

  const fixtureService = useMemo(() => new PlayerFixtureIntelligenceService(), []);

  const fixtureA = useMemo(
    () => (selectedPlayerA ? fixtureService.getPlayerFixtureSummary(selectedPlayerA) : null),
    [fixtureService, selectedPlayerA]
  );
  const fixtureB = useMemo(
    () => (selectedPlayerB ? fixtureService.getPlayerFixtureSummary(selectedPlayerB) : null),
    [fixtureService, selectedPlayerB]
  );

  const comparisonRows = useMemo(() => {
    if (!selectedPlayerA || !selectedPlayerB) {
      return [] as Array<{ label: string; a: string; b: string }>;
    }

    return [
      {
        label: 'Price',
        a: formatPrice(selectedPlayerA.price),
        b: formatPrice(selectedPlayerB.price),
      },
      {
        label: 'Total Points',
        a: `${selectedPlayerA.totalPoints}`,
        b: `${selectedPlayerB.totalPoints}`,
      },
      { label: 'Form', a: selectedPlayerA.form.toFixed(1), b: selectedPlayerB.form.toFixed(1) },
      {
        label: 'Ownership',
        a: `${selectedPlayerA.ownership.toFixed(1)}%`,
        b: `${selectedPlayerB.ownership.toFixed(1)}%`,
      },
      {
        label: 'Minutes',
        a: `${selectedPlayerA.minutesPlayed}`,
        b: `${selectedPlayerB.minutesPlayed}`,
      },
      {
        label: 'Goals',
        a: `${selectedPlayerA.goalsScored ?? 0}`,
        b: `${selectedPlayerB.goalsScored ?? 0}`,
      },
      {
        label: 'Assists',
        a: `${selectedPlayerA.assists ?? 0}`,
        b: `${selectedPlayerB.assists ?? 0}`,
      },
      { label: 'Bonus', a: 'Unavailable', b: 'Unavailable' },
    ];
  }, [selectedPlayerA, selectedPlayerB]);

  const fixtureRows = useMemo(() => {
    if (!fixtureA || !fixtureB) {
      return [] as Array<{
        gameweek: number;
        playerA: string;
        playerB: string;
      }>;
    }

    const fixturesA = fixtureA.upcomingFixtures.slice(0, 5);
    const fixturesB = fixtureB.upcomingFixtures.slice(0, 5);

    const gameweeks = new Set<number>();
    fixturesA.forEach((fixture) => gameweeks.add(fixture.gameweek));
    fixturesB.forEach((fixture) => gameweeks.add(fixture.gameweek));

    const sortedGameweeks = Array.from(gameweeks)
      .sort((a, b) => a - b)
      .slice(0, 5);

    return sortedGameweeks.map((gameweek) => {
      const aFixture = fixturesA.find((fixture) => fixture.gameweek === gameweek);
      const bFixture = fixturesB.find((fixture) => fixture.gameweek === gameweek);

      const formatFixtureCell = (
        fixture:
          | {
              opponent: { shortName: string };
              homeAway: 'H' | 'A';
              difficulty: number;
            }
          | undefined
      ): string => {
        if (!fixture) {
          return '-';
        }

        return `${fixture.opponent.shortName} (${fixture.homeAway}) ${formatDifficulty(
          fixture.difficulty
        )}`;
      };

      return {
        gameweek,
        playerA: formatFixtureCell(aFixture),
        playerB: formatFixtureCell(bFixture),
      };
    });
  }, [fixtureA, fixtureB]);

  const updatePlayersQuery = (nextA: number | null, nextB: number | null): void => {
    const ids: number[] = [];

    if (nextA !== null) {
      ids.push(nextA);
    }

    if (nextB !== null && nextB !== nextA) {
      ids.push(nextB);
    }

    if (ids.length === 0) {
      setSearchParams({});
      return;
    }

    setSearchParams({ players: ids.join(',') });
  };

  if (errorMessage) {
    return (
      <PageContent>
        <EmptyState
          title="Data unavailable"
          description={errorMessage}
          actionLabel="Back to Player Explorer"
          onAction={() => navigate('/premier-league/players')}
        />
      </PageContent>
    );
  }

  if (totalPlayers === 0) {
    return (
      <PageContent>
        <EmptyState
          title="No players available"
          description="Compare requires active-season players, but none are currently loaded."
          actionLabel="Back to Player Explorer"
          onAction={() => navigate('/premier-league/players')}
        />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <Stack spacing={ThemeTokens.spacing.md}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/premier-league/players')}
            sx={{ textTransform: 'none' }}
          >
            Back to Explorer
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Player Compare
          </Typography>
        </Box>

        {invalidIds.length > 0 && (
          <Alert severity="warning">
            Some player IDs in the URL are invalid for this season and were ignored.
          </Alert>
        )}

        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.3 }}>
              Select 2 players
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 1.2,
              }}
            >
              <FormControl size="small" fullWidth>
                <Select
                  value={selectedPlayerA ? String(selectedPlayerA.id) : ''}
                  displayEmpty
                  onChange={(event) => {
                    const value = event.target.value as string;
                    const nextA = value === '' ? null : Number(value);
                    updatePlayersQuery(nextA, selectedPlayerB?.id ?? null);
                  }}
                >
                  <MenuItem value="">Player A</MenuItem>
                  {sortedPlayers.map((player) => (
                    <MenuItem key={`a-${player.id}`} value={String(player.id)}>
                      {player.displayName} - {player.club}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <Select
                  value={selectedPlayerB ? String(selectedPlayerB.id) : ''}
                  displayEmpty
                  onChange={(event) => {
                    const value = event.target.value as string;
                    const nextB = value === '' ? null : Number(value);
                    updatePlayersQuery(selectedPlayerA?.id ?? null, nextB);
                  }}
                >
                  <MenuItem value="">Player B</MenuItem>
                  {sortedPlayers
                    .filter((player) => player.id !== selectedPlayerA?.id)
                    .map((player) => (
                      <MenuItem key={`b-${player.id}`} value={String(player.id)}>
                        {player.displayName} - {player.club}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {!selectedPlayerA || !selectedPlayerB ? (
          <Alert severity="info">
            Choose two players to compare price, output, ownership, and fixture outlook side by
            side.
          </Alert>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gap: 1.2,
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              }}
            >
              {[selectedPlayerA, selectedPlayerB].map((player) => (
                <Card key={player.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Avatar src={getPlayerImageUrl(player.clubCode)} alt={player.displayName}>
                        {player.displayName.charAt(0)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                          {player.displayName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Avatar
                            src={getTeamBadgeUrl(player.teamCode)}
                            sx={{ width: 18, height: 18 }}
                          />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {player.club} · {player.position}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<OpenInNewIcon fontSize="small" />}
                      sx={{ textTransform: 'none', mt: 1 }}
                      onClick={() => navigate(`/premier-league/players/${player.id}`)}
                    >
                      Open Detail
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.2 }}>
                  Comparison Metrics
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell>{selectedPlayerA.displayName}</TableCell>
                        <TableCell>{selectedPlayerB.displayName}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisonRows.map((row) => (
                        <TableRow key={row.label}>
                          <TableCell sx={{ fontWeight: 700 }}>{row.label}</TableCell>
                          <TableCell>{row.a}</TableCell>
                          <TableCell>{row.b}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  This comparison is for research only and does not auto-select a winner.
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.2 }}>
                  Fixture Outlook (Next 5)
                </Typography>

                {(fixtureA?.upcomingFixtures.length ?? 0) === 0 &&
                (fixtureB?.upcomingFixtures.length ?? 0) === 0 ? (
                  <Alert severity="info">
                    No upcoming fixtures are available for either player.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>GW</TableCell>
                          <TableCell>{selectedPlayerA.displayName}</TableCell>
                          <TableCell>{selectedPlayerB.displayName}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fixtureRows.map((row) => (
                          <TableRow key={`gw-${row.gameweek}`}>
                            <TableCell sx={{ fontWeight: 700 }}>{row.gameweek}</TableCell>
                            <TableCell>{row.playerA}</TableCell>
                            <TableCell>{row.playerB}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Alert severity="info" sx={{ mt: 1.2 }}>
                  Fixture difficulty uses official synced values ({'team_h_difficulty'} and{' '}
                  {'team_a_difficulty'}).
                </Alert>
              </CardContent>
            </Card>

            {(fixtureA?.upcomingFixtures[0] || fixtureB?.upcomingFixtures[0]) && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.2 }}>
                    Next Kickoff Snapshot
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      gap: 1.2,
                    }}
                  >
                    {[fixtureA?.upcomingFixtures[0], fixtureB?.upcomingFixtures[0]].map(
                      (fixture, index) => (
                        <Box
                          key={`kickoff-${index}`}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 1.2,
                          }}
                        >
                          {fixture ? (
                            <>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                GW {fixture.gameweek} · {fixture.opponent.shortName} (
                                {fixture.homeAway})
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatKickoffDate(fixture.kickoffTime)}{' '}
                                {formatKickoffTime(fixture.kickoffTime)} ·{' '}
                                {getDifficultyLabel(fixture.difficulty)}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No kickoff scheduled.
                            </Typography>
                          )}
                        </Box>
                      )
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Stack>
    </PageContent>
  );
}
