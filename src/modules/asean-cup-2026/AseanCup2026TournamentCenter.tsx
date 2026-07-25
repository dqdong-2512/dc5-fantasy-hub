import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
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
  TableSortLabel,
  Typography,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import FlagIcon from '@mui/icons-material/Flag';
import TimelineIcon from '@mui/icons-material/Timeline';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import {
  CountryFlag,
  DataSyncIndicator,
  ErrorState,
  FilterBar,
  LoadingState,
  PageContent,
  PageHeader,
  PageSection,
  SearchInput,
  StatCard,
  StatusChip,
} from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { ASEAN_CUP_2026_TOURNAMENT_CONFIG } from './config/tournament.config';
import type {
  KnockoutMatch,
  KnockoutTeam,
  TournamentCenterData,
  TournamentFixture,
  TournamentFixtureStatus,
  TournamentPlayer,
  TournamentPlayerPosition,
} from './models';
import { useTournamentCenter } from './hooks';

type SortOrder = 'asc' | 'desc';
type PlayerSortField =
  'name' | 'appearances' | 'goals' | 'assists' | 'yellowCards' | 'redCards' | 'minutes' | 'age';

interface StatisticCardMeta {
  id: string;
  icon: React.ReactNode;
  iconColor: string;
}

const STAT_CARD_META: StatisticCardMeta[] = [
  { id: 'top-scorer', icon: <MilitaryTechIcon />, iconColor: '#ef6c00' },
  { id: 'top-assists', icon: <TimelineIcon />, iconColor: '#1565c0' },
  { id: 'most-clean-sheets', icon: <FlagIcon />, iconColor: '#2e7d32' },
  { id: 'most-goals', icon: <SportsSoccerIcon />, iconColor: '#00897b' },
  { id: 'most-yellow-cards', icon: <FlagIcon />, iconColor: '#f9a825' },
  { id: 'most-red-cards', icon: <FlagIcon />, iconColor: '#c62828' },
  { id: 'best-attack', icon: <SportsSoccerIcon />, iconColor: '#2e7d32' },
  { id: 'best-defence', icon: <WorkspacePremiumIcon />, iconColor: '#1565c0' },
  { id: 'highest-scoring-match', icon: <SportsSoccerIcon />, iconColor: '#8e24aa' },
  { id: 'average-goals-per-match', icon: <TimelineIcon />, iconColor: '#5d4037' },
  { id: 'total-goals', icon: <SportsSoccerIcon />, iconColor: '#00897b' },
  { id: 'completed-matches', icon: <WorkspacePremiumIcon />, iconColor: '#455a64' },
  { id: 'remaining-matches', icon: <WorkspacePremiumIcon />, iconColor: '#6d4c41' },
];

const TOURNAMENT_TIMEZONE = ASEAN_CUP_2026_TOURNAMENT_CONFIG.timezone;
const TOURNAMENT_HERO_GRADIENT = `linear-gradient(135deg, #0d47a1 0%, ${ASEAN_CUP_2026_TOURNAMENT_CONFIG.brandColor} 100%)`;

function formatKickoff(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TOURNAMENT_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function formatScore(homeScore: number | null, awayScore: number | null): string {
  if (homeScore === null || awayScore === null) {
    return 'vs';
  }
  return `${homeScore} - ${awayScore}`;
}

function getFixtureStatusColor(
  status: TournamentFixtureStatus
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  if (status === 'live') {
    return 'error';
  }
  if (status === 'half-time') {
    return 'warning';
  }
  if (status === 'finished') {
    return 'success';
  }
  if (status === 'upcoming') {
    return 'info';
  }
  return 'default';
}

function getFixtureStatusLabel(fixture: TournamentFixture): string {
  if (fixture.status === 'half-time') {
    return 'Half Time';
  }
  if (fixture.status === 'live') {
    if (fixture.minute !== null) {
      if (fixture.addedTime !== null && fixture.addedTime > 0) {
        return `${fixture.minute}+${fixture.addedTime}'`;
      }
      return `${fixture.minute}'`;
    }
    return 'Live';
  }
  if (fixture.status === 'finished') {
    return 'Finished';
  }
  if (fixture.status === 'postponed') {
    return 'Postponed';
  }
  if (fixture.status === 'cancelled') {
    return 'Cancelled';
  }
  return 'Upcoming';
}

function renderTeamWithFlag(
  team: { name: string; countryCode: string },
  flagSize: 'sm' | 'md' | 'lg' | number,
  textVariant: 'body2' | 'caption' = 'body2'
): React.ReactElement {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
      <CountryFlag code={team.countryCode} size={flagSize} showTooltip />
      <Typography variant={textVariant} sx={{ lineHeight: 1.2 }}>
        {team.name}
      </Typography>
    </Box>
  );
}

function formatMatchDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TOURNAMENT_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatKickoffTime(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TOURNAMENT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function resolveKnockoutStatus(match: KnockoutMatch): {
  label: string;
  status: 'default' | 'success' | 'warning' | 'error' | 'info';
} {
  const teamStates = [match.home.status, match.away.status];
  if (teamStates.includes('champion')) {
    return { label: 'Champion Confirmed', status: 'success' };
  }
  if (teamStates.includes('qualified')) {
    return { label: 'Finished', status: 'success' };
  }
  return { label: 'Upcoming', status: 'info' };
}

function resolveKnockoutWinner(match: KnockoutMatch): KnockoutTeam | null {
  const statusWinner = [match.home, match.away].find(
    (team) => team.status === 'qualified' || team.status === 'champion'
  );
  if (statusWinner) {
    return statusWinner;
  }

  if (match.home.score !== null && match.away.score !== null) {
    if (match.home.score === match.away.score) {
      return null;
    }
    return match.home.score > match.away.score ? match.home : match.away;
  }

  return null;
}

function resolveAggregateDisplay(match: KnockoutMatch): string {
  if (match.home.aggregate !== '-' && match.home.aggregate === match.away.aggregate) {
    return match.home.aggregate;
  }
  if (match.home.aggregate !== '-' || match.away.aggregate !== '-') {
    return `${match.home.aggregate} / ${match.away.aggregate}`;
  }
  return 'TBD';
}

function resolveCurrentScoreDisplay(match: KnockoutMatch): string {
  if (match.home.score === null || match.away.score === null) {
    return 'TBD';
  }
  return `${match.home.score} - ${match.away.score}`;
}

function findPreferredFinalFixture(fixtures: TournamentFixture[]): TournamentFixture | null {
  const finals = fixtures.filter((fixture) => /final/i.test(fixture.stage));
  if (finals.length === 0) {
    return null;
  }

  const active = finals.find(
    (fixture) => fixture.status === 'live' || fixture.status === 'half-time'
  );
  if (active) {
    return active;
  }

  const upcoming = finals
    .filter((fixture) => fixture.status === 'upcoming')
    .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime());
  if (upcoming.length > 0) {
    return upcoming[0];
  }

  return finals.sort(
    (left, right) => new Date(right.kickoff).getTime() - new Date(left.kickoff).getTime()
  )[0];
}

function getSemiFinalSlotLabels(fixture: TournamentFixture): [string, string] {
  const isSecondLeg = /Leg 2/i.test(fixture.stage);

  if (fixture.stage.includes('Semi-final 1')) {
    return isSecondLeg
      ? ['TBD (1st Group B)', 'TBD (2nd Group A)']
      : ['TBD (2nd Group A)', 'TBD (1st Group B)'];
  }

  return isSecondLeg
    ? ['TBD (1st Group A)', 'TBD (2nd Group B)']
    : ['TBD (2nd Group B)', 'TBD (1st Group A)'];
}

function renderScheduledTeamRow(label: string, score: number | null): React.ReactElement {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>
        {score ?? '-'}
      </Typography>
    </Box>
  );
}

function renderSemiFinalLegCard(fixture: TournamentFixture): React.ReactElement {
  const kickoffDate = formatMatchDate(fixture.kickoff);
  const kickoffTime = formatKickoffTime(fixture.kickoff);
  const [homeLabel, awayLabel] = getSemiFinalSlotLabels(fixture);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '8px',
        borderColor: 'rgba(148, 163, 184, 0.36)',
        boxShadow: '0 5px 16px rgba(15, 23, 42, 0.045)',
        backgroundColor: '#ffffff',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, md: ThemeTokens.spacing.md } }}>
        <Stack spacing={1.1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {fixture.stage}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              color: 'text.secondary',
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
            }}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption">{kickoffDate}</Typography>
            </Box>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption">{kickoffTime} (VN Time)</Typography>
            </Box>
            <StatusChip
              status={getFixtureStatusColor(fixture.status)}
              label={getFixtureStatusLabel(fixture)}
            />
          </Box>

          <Stack spacing={0.7}>
            {renderScheduledTeamRow(homeLabel, fixture.homeScore)}
            {renderScheduledTeamRow(awayLabel, fixture.awayScore)}
          </Stack>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              pt: 0.25,
            }}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <LocationOnOutlinedIcon
                sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }}
              />
              <Typography variant="caption" color="text.secondary" noWrap>
                Sân vận động: {fixture.venue}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function renderGroupTable(group: TournamentCenterData['groups'][number]): React.ReactElement {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: ThemeTokens.spacing.sm }}>
          {group.name}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Flag</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Played
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Won
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Draw
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Lost
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  GF
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  GA
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  GD
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Points
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {group.standings.map((row) => (
                <TableRow
                  key={`${group.id}-${row.team.id}`}
                  hover
                  sx={
                    row.position <= 2
                      ? {
                          backgroundColor: 'rgba(46, 125, 50, 0.08)',
                          '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.14)' },
                        }
                      : undefined
                  }
                >
                  <TableCell sx={{ fontWeight: 700 }}>{row.position}</TableCell>
                  <TableCell>
                    <CountryFlag code={row.team.countryCode} size="md" showTooltip />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: row.position <= 2 ? 700 : 500 }}>
                      {row.team.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{row.played}</TableCell>
                  <TableCell align="right">{row.won}</TableCell>
                  <TableCell align="right">{row.draw}</TableCell>
                  <TableCell align="right">{row.lost}</TableCell>
                  <TableCell align="right">{row.gf}</TableCell>
                  <TableCell align="right">{row.ga}</TableCell>
                  <TableCell align="right">
                    {row.gd > 0 ? '+' : ''}
                    {row.gd}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {row.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Top 2 teams qualify for the knockout stage.
        </Typography>
      </CardContent>
    </Card>
  );
}

function renderFixtureList(
  title: string,
  fixtures: TournamentFixture[],
  emptyMessage = 'No fixtures in this section.'
): React.ReactElement {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          {title}
        </Typography>

        {fixtures.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        ) : (
          <Stack spacing={1}>
            {fixtures.map((fixture) => (
              <Box
                key={fixture.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '4px',
                  p: ThemeTokens.spacing.sm,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {fixture.stage}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatScore(fixture.homeScore, fixture.awayScore)}
                    </Typography>
                  </Box>
                  <StatusChip
                    status={getFixtureStatusColor(fixture.status)}
                    label={getFixtureStatusLabel(fixture)}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    gap: 1,
                    mt: 0.75,
                  }}
                >
                  {renderTeamWithFlag(fixture.homeTeam, 20)}
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                    vs
                  </Typography>
                  <Box sx={{ justifySelf: 'end' }}>{renderTeamWithFlag(fixture.awayTeam, 20)}</Box>
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.75 }}
                >
                  Kickoff: {formatKickoff(fixture.kickoff)} (Vietnam Time)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Venue: {fixture.venue}
                </Typography>
                {fixture.note && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Note: {fixture.note}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function sortPlayers(
  players: TournamentPlayer[],
  search: string,
  positionFilter: 'ALL' | TournamentPlayerPosition,
  nationFilter: 'ALL' | string,
  sortBy: PlayerSortField,
  sortOrder: SortOrder
): TournamentPlayer[] {
  const normalizedQuery = search.trim().toLowerCase();
  const getNumericValue = (player: TournamentPlayer): number => {
    if (sortBy === 'goals') {
      return player.goals;
    }
    if (sortBy === 'assists') {
      return player.assists;
    }
    if (sortBy === 'minutes') {
      return player.minutes;
    }
    if (sortBy === 'yellowCards') {
      return player.yellowCards;
    }
    if (sortBy === 'redCards') {
      return player.redCards;
    }
    if (sortBy === 'appearances') {
      return player.appearances ?? -1;
    }
    if (sortBy === 'age') {
      return player.age ?? -1;
    }
    return 0;
  };

  const filtered = players.filter((player) => {
    if (positionFilter !== 'ALL' && player.position !== positionFilter) {
      return false;
    }

    if (nationFilter !== 'ALL' && player.nation.name !== nationFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      player.name.toLowerCase().includes(normalizedQuery) ||
      player.nation.name.toLowerCase().includes(normalizedQuery) ||
      player.club.toLowerCase().includes(normalizedQuery)
    );
  });

  return filtered.sort((left, right) => {
    if (sortBy === 'name') {
      const result = left.name.localeCompare(right.name);
      return sortOrder === 'asc' ? result : -result;
    }

    const leftValue = getNumericValue(left);
    const rightValue = getNumericValue(right);
    if (leftValue === rightValue) {
      return left.name.localeCompare(right.name);
    }

    return sortOrder === 'asc' ? leftValue - rightValue : rightValue - leftValue;
  });
}

export const AseanCup2026TournamentCenter: React.FC = (): React.ReactElement => {
  const { data, error, isLoading, isRefreshing, refresh } = useTournamentCenter({
    autoRefresh: true,
    refreshIntervalMs: 30000,
  });

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<'ALL' | TournamentPlayerPosition>('ALL');
  const [nationFilter, setNationFilter] = useState<'ALL' | string>('ALL');
  const [sortBy, setSortBy] = useState<PlayerSortField>('goals');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const nations = useMemo(() => {
    if (!data) {
      return [];
    }
    return Array.from(new Set(data.players.map((player) => player.nation.name))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [data]);

  const filteredPlayers = useMemo(() => {
    if (!data) {
      return [];
    }

    return sortPlayers(data.players, search, positionFilter, nationFilter, sortBy, sortOrder);
  }, [data, nationFilter, positionFilter, search, sortBy, sortOrder]);

  const statisticMetaMap = useMemo(
    () => new Map(STAT_CARD_META.map((item) => [item.id, item])),
    []
  );
  const completedFixturesPreview = useMemo(() => {
    if (!data) {
      return [];
    }

    return [...data.fixtures.completed]
      .sort((left, right) => new Date(right.kickoff).getTime() - new Date(left.kickoff).getTime())
      .slice(0, 2);
  }, [data]);
  const todaysFixturesPreview = useMemo(() => {
    if (!data) {
      return [];
    }

    return [...data.fixtures.today]
      .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime())
      .slice(0, 2);
  }, [data]);
  const upcomingFixturesPreview = useMemo(() => {
    if (!data) {
      return [];
    }

    return [...data.fixtures.upcoming]
      .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime())
      .slice(0, 2);
  }, [data]);

  const handleSort = (field: PlayerSortField): void => {
    if (sortBy === field) {
      setSortOrder((current) => (current === 'desc' ? 'asc' : 'desc'));
      return;
    }

    setSortBy(field);
    setSortOrder(field === 'name' ? 'asc' : 'desc');
  };

  if (isLoading && !data) {
    return (
      <PageContent>
        <LoadingState label="Loading ASEAN Cup 2026 data..." />
      </PageContent>
    );
  }

  if (error && !data) {
    return (
      <PageContent>
        <ErrorState
          title="Unable to load ASEAN Cup 2026"
          message={error}
          actionLabel="Retry"
          onRetry={() => {
            void refresh();
          }}
        />
      </PageContent>
    );
  }

  if (!data) {
    return (
      <PageContent>
        <ErrorState title="ASEAN Cup 2026" message="No tournament data available." />
      </PageContent>
    );
  }

  const highlightColor =
    data.hero.highlight.state === 'live'
      ? 'error'
      : data.hero.highlight.state === 'finished'
        ? 'success'
        : data.hero.highlight.state === 'upcoming'
          ? 'info'
          : 'default';

  // The bracket always needs the full published schedule, not only the next matchday.
  const allKnockoutFixtures = data.fixtures.all;
  const finalFixture = findPreferredFinalFixture(allKnockoutFixtures);
  const finalStatus = finalFixture
    ? {
        label: getFixtureStatusLabel(finalFixture),
        status: getFixtureStatusColor(finalFixture.status),
      }
    : resolveKnockoutStatus(data.knockout.final);
  const finalWinner = resolveKnockoutWinner(data.knockout.final);
  const championTeam = data.knockout.champion.team;
  const championName = championTeam?.name ?? data.knockout.champion.label;
  const semiFinal1Fixtures = allKnockoutFixtures
    .filter((fixture) => fixture.stage.includes('Semi-final 1'))
    .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime());
  const semiFinal2Fixtures = allKnockoutFixtures
    .filter((fixture) => fixture.stage.includes('Semi-final 2'))
    .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime());
  const finalFixtures = allKnockoutFixtures
    .filter((fixture) => /^Final \(Leg \d+\)$/i.test(fixture.stage))
    .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime());

  return (
    <PageContent>
      <PageHeader sx={{ mb: ThemeTokens.spacing.xxxl }}>
        <Card
          sx={{
            borderRadius: '24px',
            background: TOURNAMENT_HERO_GRADIENT,
            color: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ py: ThemeTokens.spacing.xxxl }}>
            <Stack spacing={ThemeTokens.spacing.md}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'flex-start', md: 'center' },
                  gap: ThemeTokens.spacing.md,
                }}
              >
                <Box
                  component="img"
                  src={ASEAN_CUP_2026_TOURNAMENT_CONFIG.logoSrc}
                  alt="ASEAN Cup 2026"
                  sx={{
                    width: 92,
                    height: 92,
                    objectFit: 'contain',
                    flexShrink: 0,
                    display: 'block',
                  }}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
                    {data.hero.tournamentName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.86)', mt: 0.75 }}>
                    {data.hero.subtitle}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip
                    icon={<EmojiEventsIcon />}
                    label={data.hero.currentStage}
                    variant="outlined"
                    sx={{
                      color: '#ffffff',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '& .MuiChip-icon': { color: '#ffffff' },
                    }}
                  />
                  <Chip
                    icon={<RefreshIcon />}
                    label={isRefreshing ? 'Refreshing' : 'Refresh'}
                    onClick={() => {
                      void refresh();
                    }}
                    variant="outlined"
                    sx={{
                      color: '#ffffff',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '& .MuiChip-icon': { color: '#ffffff' },
                    }}
                  />
                </Stack>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: ThemeTokens.spacing.md,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Current Matchday
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    MD {data.hero.currentMatchday}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Matches Completed
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {data.hero.matchesCompleted}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Matches Remaining
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {data.hero.matchesRemaining}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Last Updated
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatKickoff(data.hero.lastUpdated)}
                  </Typography>
                </Box>

                <Box sx={{ gridColumn: { xs: '1 / -1', lg: '1 / span 2' } }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Live Tournament Status
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 0.4,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Chip size="small" color={highlightColor} label={data.hero.highlight.label} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {data.hero.highlight.fixtureText}
                    </Typography>
                    {data.hero.highlight.minuteText && (
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.86)' }}>
                        {data.hero.highlight.minuteText}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Latest Result
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {data.hero.latestResult}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Next Fixture
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {data.hero.nextFixture}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <DataSyncIndicator compact={false} showWarning={false} />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </PageHeader>

      <PageSection
        title="🏆 Road To The Final"
        subtitle="Follow the knockout journey from the semi-finals to the championship."
        sx={{ mb: ThemeTokens.spacing.xxxl }}
      >
        <Card
          variant="outlined"
          sx={{
            borderRadius: '16px',
            background:
              'linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255,255,255,1) 100%)',
            borderColor: 'rgba(148, 163, 184, 0.32)',
          }}
        >
          <CardContent sx={{ p: { xs: ThemeTokens.spacing.md, md: ThemeTokens.spacing.lg } }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'minmax(220px, 1fr) minmax(360px, 1.18fr) minmax(220px, 1fr)',
                },
                gridTemplateAreas: {
                  xs: '"semi1" "final" "semi2" "champion"',
                  md: '"semi1 final semi2" ". champion ."',
                },
                alignItems: 'center',
                columnGap: ThemeTokens.spacing.lg,
                rowGap: ThemeTokens.spacing.md,
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  position: 'absolute',
                  pointerEvents: 'none',
                  left: '31%',
                  top: '18%',
                  width: '7.5%',
                  height: '27%',
                  borderRight: '2px solid #2563EB',
                  borderRadius: 0,
                  '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    width: '100%',
                    borderTop: '2px solid #2563EB',
                  },
                  '&::before': { top: 0 },
                  '&::after': { bottom: 0 },
                }}
              />
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  position: 'absolute',
                  pointerEvents: 'none',
                  right: '31%',
                  top: '18%',
                  width: '7.5%',
                  height: '27%',
                  borderLeft: '2px solid #2563EB',
                  borderRadius: 0,
                  '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    width: '100%',
                    borderTop: '2px solid #2563EB',
                  },
                  '&::before': { top: 0 },
                  '&::after': { bottom: 0 },
                }}
              />
              <Box sx={{ gridArea: 'semi1', zIndex: 1 }}>
                <Stack spacing={ThemeTokens.spacing.sm}>
                  <Chip
                    label="SEMI-FINAL 1"
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      fontWeight: 700,
                      bgcolor: 'rgba(37, 99, 235, 0.12)',
                      color: '#1E40AF',
                    }}
                  />
                  {semiFinal1Fixtures.length > 0 ? (
                    semiFinal1Fixtures.map((fixture) => (
                      <React.Fragment key={fixture.id}>
                        {renderSemiFinalLegCard(fixture)}
                      </React.Fragment>
                    ))
                  ) : (
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          No semi-final 1 fixtures available.
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              </Box>

              <Box sx={{ gridArea: 'final', zIndex: 1 }}>
                <Stack spacing={1.25} sx={{ alignItems: 'center' }}>
                  <EmojiEventsIcon
                    sx={{
                      color: '#D97706',
                      fontSize: 54,
                      filter: 'drop-shadow(0 7px 8px rgba(245, 158, 11, 0.28))',
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#B45309' }}>
                    <Box sx={{ width: 26, borderTop: '1px solid #FBBF24' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
                      THE FINAL
                    </Typography>
                    <Box sx={{ width: 26, borderTop: '1px solid #FBBF24' }} />
                  </Box>
                  <Card
                    variant="outlined"
                    sx={{
                      borderWidth: 2,
                      borderColor: '#F59E0B',
                      borderRadius: '16px',
                      boxShadow: '0 12px 28px rgba(245, 158, 11, 0.2)',
                      overflow: 'hidden',
                      background:
                        'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(255,255,255,1) 44%)',
                    }}
                  >
                    <CardContent
                      sx={{ p: { xs: ThemeTokens.spacing.md, md: ThemeTokens.spacing.lg } }}
                    >
                      <Stack spacing={ThemeTokens.spacing.md}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1.5,
                            color: 'text.secondary',
                            flexWrap: 'wrap',
                          }}
                        >
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption">
                              {finalFixture
                                ? formatMatchDate(finalFixture.kickoff)
                                : data.knockout.final.legDates}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeOutlinedIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption">
                              {finalFixture
                                ? `${formatKickoffTime(finalFixture.kickoff)} (VN Time)`
                                : 'TBD'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 0.75,
                          }}
                        >
                          {finalFixtures.map((fixture) => (
                            <Box
                              key={fixture.id}
                              sx={{
                                border: '1px solid rgba(245, 158, 11, 0.24)',
                                borderRadius: '4px',
                                px: 1,
                                py: 0.75,
                                backgroundColor: 'rgba(255,255,255,0.74)',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ display: 'block', fontWeight: 700 }}
                              >
                                {fixture.stage}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatMatchDate(fixture.kickoff)} /{' '}
                                {formatKickoffTime(fixture.kickoff)} (VN)
                              </Typography>
                            </Box>
                          ))}
                        </Box>

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
                            alignItems: 'center',
                            gap: 1,
                            p: ThemeTokens.spacing.sm,
                            borderRadius: '4px',
                            bgcolor: '#ffffff',
                            border: '1px solid',
                            borderColor: 'rgba(245, 158, 11, 0.32)',
                          }}
                        >
                          {renderTeamWithFlag(
                            {
                              name:
                                data.knockout.final.home.team?.name ??
                                data.knockout.final.home.label,
                              countryCode: data.knockout.final.home.team?.countryCode ?? 'TBD',
                            },
                            'lg'
                          )}
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ textAlign: 'center', fontWeight: 800 }}
                          >
                            vs
                          </Typography>
                          <Box sx={{ justifySelf: { xs: 'start', sm: 'end' } }}>
                            {renderTeamWithFlag(
                              {
                                name:
                                  data.knockout.final.away.team?.name ??
                                  data.knockout.final.away.label,
                                countryCode: data.knockout.final.away.team?.countryCode ?? 'TBD',
                              },
                              'lg'
                            )}
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: 'none',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 1,
                          }}
                        >
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Date
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {finalFixture
                                ? formatMatchDate(finalFixture.kickoff)
                                : data.knockout.final.legDates}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Kickoff
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {finalFixture
                                ? `${formatKickoffTime(finalFixture.kickoff)} (Vietnam Time)`
                                : 'TBD'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Venue
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {finalFixture?.venue ?? 'To be announced'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Aggregate Score
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {resolveAggregateDisplay(data.knockout.final)}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr auto' },
                            alignItems: 'end',
                            gap: 1,
                            pt: 0.5,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Current Score
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {finalFixture
                                ? formatScore(finalFixture.homeScore, finalFixture.awayScore)
                                : resolveCurrentScoreDisplay(data.knockout.final)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Winner
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {finalWinner?.team?.name ?? finalWinner?.label ?? 'To be decided'}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-end',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <StatusChip status={finalStatus.status} label={finalStatus.label} />
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Box>

              <Box sx={{ gridArea: 'semi2', zIndex: 1 }}>
                <Stack spacing={ThemeTokens.spacing.sm}>
                  <Chip
                    label="SEMI-FINAL 2"
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      fontWeight: 700,
                      bgcolor: 'rgba(37, 99, 235, 0.12)',
                      color: '#1E40AF',
                    }}
                  />
                  {semiFinal2Fixtures.length > 0 ? (
                    semiFinal2Fixtures.map((fixture) => (
                      <React.Fragment key={fixture.id}>
                        {renderSemiFinalLegCard(fixture)}
                      </React.Fragment>
                    ))
                  ) : (
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          No semi-final 2 fixtures available.
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              </Box>

              <Box
                sx={{
                  gridArea: 'champion',
                  position: 'relative',
                  zIndex: 1,
                  mt: { xs: 3, md: 6 },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    zIndex: -1,
                    inset: '-44px -76px -38px',
                    opacity: 0.9,
                    background:
                      'radial-gradient(circle at 10% 56%, #F59E0B 0 2px, transparent 3px), radial-gradient(circle at 18% 25%, #EF4444 0 2px, transparent 3px), radial-gradient(circle at 32% 72%, #2563EB 0 2px, transparent 3px), radial-gradient(circle at 68% 18%, #F59E0B 0 2px, transparent 3px), radial-gradient(circle at 84% 54%, #EF4444 0 2px, transparent 3px), radial-gradient(circle at 92% 28%, #2563EB 0 2px, transparent 3px)',
                  },
                }}
              >
                <Card
                  variant="outlined"
                  sx={{
                    borderWidth: 2,
                    borderColor: '#F59E0B',
                    borderRadius: '16px',
                    background:
                      'linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, rgba(255,255,255,1) 46%)',
                    textAlign: 'center',
                    boxShadow: '0 10px 24px rgba(245, 158, 11, 0.16)',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      position: 'absolute',
                      top: '-52px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      height: '44px',
                      borderLeft: '2px dashed #F59E0B',
                    }}
                  />
                  <CardContent sx={{ py: ThemeTokens.spacing.xl }}>
                    <Stack spacing={1.1} sx={{ alignItems: 'center' }}>
                      <img
                        src={ASEAN_CUP_2026_TOURNAMENT_CONFIG.championAssetSrc}
                        alt="Champion Trophy"
                        width={200}
                        height={200}
                        style={{ display: 'block' }}
                      />
                      <CountryFlag
                        code={championTeam?.countryCode ?? 'TBD'}
                        size={250}
                        showTooltip
                      />
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 850, letterSpacing: 0.5, textTransform: 'uppercase' }}
                      >
                        {championName}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </PageSection>

      <PageSection
        title="Group Standings"
        subtitle="Group A and Group B"
        sx={{ mb: ThemeTokens.spacing.xxxl }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: ThemeTokens.spacing.md,
          }}
        >
          {data.groups.map((group) => renderGroupTable(group))}
        </Box>
      </PageSection>

      <PageSection
        title="Fixtures"
        subtitle="Completed, today, and upcoming fixtures"
        sx={{ mb: ThemeTokens.spacing.xxxl }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: ThemeTokens.spacing.md,
          }}
        >
          {renderFixtureList(
            'Completed Fixtures',
            completedFixturesPreview,
            'No completed fixtures yet.'
          )}
          {renderFixtureList(
            "Today's Fixtures",
            todaysFixturesPreview,
            'No matches scheduled today.'
          )}
          {renderFixtureList('Upcoming Fixtures', upcomingFixturesPreview)}
        </Box>
      </PageSection>

      <PageSection
        title="Players"
        subtitle="Search, sort, and filter tournament players"
        sx={{ mb: ThemeTokens.spacing.xxxl }}
      >
        <Stack spacing={ThemeTokens.spacing.sm}>
          <FilterBar>
            <SearchInput
              size="small"
              value={search}
              onSearch={setSearch}
              placeholder="Search player, nation, or club"
              sx={{ minWidth: { xs: '100%', md: 280 } }}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={positionFilter}
                onChange={(event) =>
                  setPositionFilter(event.target.value as 'ALL' | TournamentPlayerPosition)
                }
                displayEmpty
              >
                <MenuItem value="ALL">All Positions</MenuItem>
                <MenuItem value="GK">Goalkeeper</MenuItem>
                <MenuItem value="DEF">Defender</MenuItem>
                <MenuItem value="MID">Midfielder</MenuItem>
                <MenuItem value="FWD">Forward</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 170 }}>
              <Select
                value={nationFilter}
                onChange={(event) => setNationFilter(event.target.value as 'ALL' | string)}
                displayEmpty
              >
                <MenuItem value="ALL">All Nations</MenuItem>
                {nations.map((nation) => (
                  <MenuItem key={nation} value={nation}>
                    {nation}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {filteredPlayers.length} players
            </Typography>
          </FilterBar>

          <TableContainer component={Card} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortBy === 'name' ? sortOrder : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Player
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>National Flag</TableCell>
                  <TableCell>Club</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'age'}
                      direction={sortBy === 'age' ? sortOrder : 'desc'}
                      onClick={() => handleSort('age')}
                    >
                      Age
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'appearances'}
                      direction={sortBy === 'appearances' ? sortOrder : 'desc'}
                      onClick={() => handleSort('appearances')}
                    >
                      Appearances
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'goals'}
                      direction={sortBy === 'goals' ? sortOrder : 'desc'}
                      onClick={() => handleSort('goals')}
                    >
                      Goals
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'assists'}
                      direction={sortBy === 'assists' ? sortOrder : 'desc'}
                      onClick={() => handleSort('assists')}
                    >
                      Assists
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'yellowCards'}
                      direction={sortBy === 'yellowCards' ? sortOrder : 'desc'}
                      onClick={() => handleSort('yellowCards')}
                    >
                      Yellow Cards
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'redCards'}
                      direction={sortBy === 'redCards' ? sortOrder : 'desc'}
                      onClick={() => handleSort('redCards')}
                    >
                      Red Cards
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'minutes'}
                      direction={sortBy === 'minutes' ? sortOrder : 'desc'}
                      onClick={() => handleSort('minutes')}
                    >
                      Minutes
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                          {player.name
                            .split(' ')
                            .slice(0, 2)
                            .map((part) => part.charAt(0))
                            .join('')}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {player.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <CountryFlag code={player.nation.countryCode} size="md" showTooltip />
                        <Typography variant="body2">{player.nation.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{player.club}</TableCell>
                    <TableCell>{player.position}</TableCell>
                    <TableCell align="right">{player.age ?? '-'}</TableCell>
                    <TableCell align="right">{player.appearances ?? '-'}</TableCell>
                    <TableCell align="right">{player.goals}</TableCell>
                    <TableCell align="right">{player.assists}</TableCell>
                    <TableCell align="right">{player.yellowCards}</TableCell>
                    <TableCell align="right">{player.redCards}</TableCell>
                    <TableCell align="right">{player.minutes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </PageSection>

      <PageSection
        title="Tournament Statistics"
        subtitle="Current leaders and tournament highlights"
        sx={{ mb: ThemeTokens.spacing.xxxl }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(3, minmax(0, 1fr))',
            },
            gap: ThemeTokens.spacing.md,
          }}
        >
          {data.statistics.map((stat) => {
            const meta = statisticMetaMap.get(stat.id);
            return (
              <StatCard
                key={stat.id}
                icon={meta?.icon ?? <SportsSoccerIcon />}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                iconColor={meta?.iconColor ?? '#1976d2'}
              />
            );
          })}
        </Box>
      </PageSection>
    </PageContent>
  );
};
