/**
 * Fixture Explorer
 * Professional fixture analysis workspace for Fantasy Premier League
 * Displays fixture schedule with difficulty analysis and team fixture runs
 */

import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { PageContent, PageHeader } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { useSeasonLabel } from '@shared/hooks';
import { BootstrapRepository } from '@repositories/bootstrap';
import { FixtureRepository } from '@repositories/fixtures';
import { getTeamBadgeUrl } from '@shared/assets';
import {
  formatKickoffDate,
  formatFixtureDisplay,
  formatDifficulty,
  getDifficultyColor,
} from '@shared/presentation/fixture-formats';
import {
  findEasiestFixtureRuns,
  findHardestFixtureRuns,
  getNextGameweekWithFixtures,
} from './insights/fixture-intelligence.service';
import type { FixtureRunSummary } from './insights/models';
import type { Fixture } from '@domain/models';

export const FixtureExplorer: React.FC = () => {
  const seasonLabel = useSeasonLabel();
  const bootstrapRepository = useMemo(() => new BootstrapRepository(), []);
  const fixtureRepository = useMemo(() => new FixtureRepository(), []);

  // Get all data
  const gameweeks = useMemo(
    () => bootstrapRepository.getBootstrap().gameweeks,
    [bootstrapRepository]
  );
  const teams = useMemo(() => bootstrapRepository.getBootstrap().teams, [bootstrapRepository]);
  const allFixtures = useMemo(() => fixtureRepository.getAll(), [fixtureRepository]);

  // Determine default gameweek
  const defaultGameweek = useMemo(() => {
    const nextGW = getNextGameweekWithFixtures(allFixtures);
    return nextGW || gameweeks[0]?.id || 1;
  }, [allFixtures, gameweeks]);

  // State
  const [selectedGameweek, setSelectedGameweek] = useState<number>(defaultGameweek);
  const [selectedTeam, setSelectedTeam] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'upcoming' | 'finished'>('upcoming');

  // Filter fixtures
  const filteredFixtures = useMemo(() => {
    let result = allFixtures;

    // Filter by gameweek
    result = result.filter((f) => f.gameweek === selectedGameweek);

    // Filter by team
    if (selectedTeam !== 0) {
      result = result.filter(
        (f) => f.homeTeam.id === selectedTeam || f.awayTeam.id === selectedTeam
      );
    }

    // Filter by status
    if (selectedStatus === 'upcoming') {
      result = result.filter((f) => !f.finished);
    } else if (selectedStatus === 'finished') {
      result = result.filter((f) => f.finished);
    }

    // Group by date
    const grouped = new Map<string, Fixture[]>();
    result.forEach((fixture) => {
      const date = formatKickoffDate(fixture.kickoffTime);
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(fixture);
    });

    return Array.from(grouped.entries());
  }, [allFixtures, selectedGameweek, selectedTeam, selectedStatus]);

  // Fixture intelligence
  const upcomingFixtures = useMemo(() => fixtureRepository.getUpcoming(), [fixtureRepository]);
  const easiestRuns = useMemo(
    () => findEasiestFixtureRuns(teams, upcomingFixtures, 5),
    [teams, upcomingFixtures]
  );
  const hardestRuns = useMemo(
    () => findHardestFixtureRuns(teams, upcomingFixtures, 5),
    [teams, upcomingFixtures]
  );

  const totalFixtures = filteredFixtures.reduce((sum, [, fixtures]) => sum + fixtures.length, 0);

  return (
    <Box>
      <PageContent>
        <PageHeader>
          <Stack spacing={ThemeTokens.spacing.md}>
            <Typography variant={ThemeTokens.typography.pageTitleVariant} sx={{ fontWeight: 700 }}>
              Fixture Explorer
            </Typography>
            <Stack
              direction="row"
              spacing={ThemeTokens.spacing.xxl}
              sx={{
                flexWrap: 'wrap',
                '& > div': { minWidth: 150 },
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Competition
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Fantasy Premier League
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Season
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {seasonLabel}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Gameweek
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  GW {selectedGameweek}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Fixtures
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {totalFixtures}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </PageHeader>

        {/* Fixture Intelligence Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: ThemeTokens.spacing.md,
            marginBottom: ThemeTokens.spacing.md,
          }}
        >
          {/* Easiest Runs */}
          <Card>
            <CardHeader
              title="Easiest Fixture Runs"
              subheader="Next 5 fixtures with lowest average FDR"
              titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 700 } }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={ThemeTokens.spacing.xs}>
                {easiestRuns.length === 0 ? (
                  <Typography variant="caption" color="textSecondary">
                    No upcoming fixtures available
                  </Typography>
                ) : (
                  easiestRuns.map((run: FixtureRunSummary) => (
                    <Box
                      key={run.team.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: ThemeTokens.spacing.sm,
                        backgroundColor: '#fafafa',
                        borderRadius: ThemeTokens.borderRadius.sm,
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.sm }}
                      >
                        <Avatar
                          src={getTeamBadgeUrl(run.team.code)}
                          sx={{ width: 32, height: 32 }}
                        />
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                            {run.team.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ fontSize: '0.7rem', display: 'block' }}
                          >
                            Avg FDR: {run.averageDifficulty.toFixed(1)}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={`${run.fixtures} fixtures`}
                        size="small"
                        variant="outlined"
                        sx={{ backgroundColor: '#f0f0f0' }}
                      />
                    </Box>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Hardest Runs */}
          <Card>
            <CardHeader
              title="Hardest Fixture Runs"
              subheader="Next 5 fixtures with highest average FDR"
              titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 700 } }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={ThemeTokens.spacing.xs}>
                {hardestRuns.length === 0 ? (
                  <Typography variant="caption" color="textSecondary">
                    No upcoming fixtures available
                  </Typography>
                ) : (
                  hardestRuns.map((run: FixtureRunSummary) => (
                    <Box
                      key={run.team.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: ThemeTokens.spacing.sm,
                        backgroundColor: '#fafafa',
                        borderRadius: ThemeTokens.borderRadius.sm,
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.sm }}
                      >
                        <Avatar
                          src={getTeamBadgeUrl(run.team.code)}
                          sx={{ width: 32, height: 32 }}
                        />
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                            {run.team.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ fontSize: '0.7rem', display: 'block' }}
                          >
                            Avg FDR: {run.averageDifficulty.toFixed(1)}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={`${run.fixtures} fixtures`}
                        size="small"
                        variant="outlined"
                        sx={{ backgroundColor: '#f0f0f0' }}
                      />
                    </Box>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Filters */}
        <Card sx={{ marginBottom: ThemeTokens.spacing.xxxl }}>
          <CardContent>
            <Stack direction="row" spacing={ThemeTokens.spacing.md} sx={{ flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <Typography
                  variant="caption"
                  sx={{ marginBottom: ThemeTokens.spacing.xs, fontWeight: 600 }}
                >
                  Gameweek
                </Typography>
                <Select
                  value={selectedGameweek}
                  onChange={(e) => {
                    setSelectedGameweek(e.target.value as number);
                  }}
                  size="small"
                >
                  {gameweeks.map((gw) => (
                    <MenuItem key={gw.id} value={gw.id}>
                      {gw.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200 }}>
                <Typography
                  variant="caption"
                  sx={{ marginBottom: ThemeTokens.spacing.xs, fontWeight: 600 }}
                >
                  Club
                </Typography>
                <Select
                  value={selectedTeam}
                  onChange={(e) => {
                    setSelectedTeam(e.target.value as number);
                  }}
                  size="small"
                >
                  <MenuItem value={0}>All Clubs</MenuItem>
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200 }}>
                <Typography
                  variant="caption"
                  sx={{ marginBottom: ThemeTokens.spacing.xs, fontWeight: 600 }}
                >
                  Status
                </Typography>
                <Select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as 'all' | 'upcoming' | 'finished');
                  }}
                  size="small"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="finished">Finished</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Fixtures by Date */}
        {filteredFixtures.length === 0 ? (
          <Alert severity="info">No fixtures match your filters.</Alert>
        ) : (
          <Stack spacing={ThemeTokens.spacing.xl}>
            {filteredFixtures.map(([date, dateFixtures]) => (
              <Box key={date}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md, color: '#666' }}
                >
                  {date}
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{ borderRadius: ThemeTokens.borderRadius.sm }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Home</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Time
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Away</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dateFixtures.map((fixture) => (
                        <TableRow
                          key={fixture.id}
                          sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                        >
                          <TableCell>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: ThemeTokens.spacing.sm,
                              }}
                            >
                              <Avatar
                                src={getTeamBadgeUrl(fixture.homeTeam.code)}
                                sx={{ width: 28, height: 28 }}
                              />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {fixture.homeTeam.shortName}
                                </Typography>
                                <Chip
                                  label={formatDifficulty(fixture.homeDifficulty)}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    backgroundColor: getDifficultyColor(fixture.homeDifficulty),
                                    color: 'white',
                                  }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatFixtureDisplay(fixture)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: ThemeTokens.spacing.sm,
                                justifyContent: 'flex-end',
                              }}
                            >
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {fixture.awayTeam.shortName}
                                </Typography>
                                <Chip
                                  label={formatDifficulty(fixture.awayDifficulty)}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    backgroundColor: getDifficultyColor(fixture.awayDifficulty),
                                    color: 'white',
                                  }}
                                />
                              </Box>
                              <Avatar
                                src={getTeamBadgeUrl(fixture.awayTeam.code)}
                                sx={{ width: 28, height: 28 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color: fixture.finished
                                  ? '#999'
                                  : fixture.started
                                    ? '#ff9800'
                                    : '#1976d2',
                              }}
                            >
                              {fixture.finished ? 'FT' : fixture.started ? 'LIVE' : 'TBD'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Stack>
        )}
      </PageContent>
    </Box>
  );
};
