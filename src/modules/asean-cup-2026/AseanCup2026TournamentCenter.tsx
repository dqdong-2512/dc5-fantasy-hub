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
type PlayerSortField = 'name' | 'goals' | 'assists' | 'minutes' | 'cards';

interface StatisticCardMeta {
  id: string;
  icon: React.ReactNode;
  iconColor: string;
}

const STAT_CARD_META: StatisticCardMeta[] = [
  { id: 'top-scorer', icon: <MilitaryTechIcon />, iconColor: '#ef6c00' },
  { id: 'top-assists', icon: <TimelineIcon />, iconColor: '#1565c0' },
  { id: 'clean-sheets', icon: <FlagIcon />, iconColor: '#2e7d32' },
  { id: 'most-goals', icon: <SportsSoccerIcon />, iconColor: '#00897b' },
  { id: 'most-minutes', icon: <TimelineIcon />, iconColor: '#5d4037' },
  { id: 'golden-boot', icon: <WorkspacePremiumIcon />, iconColor: '#6a1b9a' },
];

function formatKickoff(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
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
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatKickoffTime(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
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

function renderKnockoutTeamRow(team: KnockoutTeam): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <CountryFlag code={team.team?.countryCode ?? 'TBD'} size={18} showTooltip />
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {team.team?.name ?? team.label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
        {team.score ?? '-'}
      </Typography>
    </Box>
  );
}

function renderSemiFinalRoadCard(match: KnockoutMatch): React.ReactElement {
  const status = resolveKnockoutStatus(match);
  const winner = resolveKnockoutWinner(match);

  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: ThemeTokens.borderRadius.md }}>
      <CardContent sx={{ p: ThemeTokens.spacing.md }}>
        <Stack spacing={1.25}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {match.title}
            </Typography>
            <StatusChip status={status.status} label={status.label} />
          </Box>

          <Stack spacing={0.75}>
            {renderKnockoutTeamRow(match.home)}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                vs
              </Typography>
            </Box>
            {renderKnockoutTeamRow(match.away)}
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              pt: 0.5,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body2">{match.legDates}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Aggregate
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {resolveAggregateDisplay(match)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              p: 1,
              borderRadius: ThemeTokens.borderRadius.sm,
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Winner:
            </Typography>
            {winner ? (
              <>
                <CountryFlag code={winner.team?.countryCode ?? 'TBD'} size={16} showTooltip />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {winner.team?.name ?? winner.label}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                To be decided
              </Typography>
            )}
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
                <TableCell sx={{ fontWeight: 700 }}>Pos</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  P
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  W
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  D
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  L
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
                  Pts
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {group.standings.map((row) => (
                <TableRow key={`${group.id}-${row.team.id}`} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{row.position}</TableCell>
                  <TableCell>{renderTeamWithFlag(row.team, 'md')}</TableCell>
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
      </CardContent>
    </Card>
  );
}

function renderFixtureList(title: string, fixtures: TournamentFixture[]): React.ReactElement {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          {title}
        </Typography>

        {fixtures.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No fixtures in this section.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {fixtures.map((fixture) => (
              <Box
                key={fixture.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: ThemeTokens.borderRadius.sm,
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
                  Kickoff: {formatKickoff(fixture.kickoff)}
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
    const leftCards = left.yellowCards + left.redCards * 2;
    const rightCards = right.yellowCards + right.redCards * 2;

    if (sortBy === 'name') {
      const result = left.name.localeCompare(right.name);
      return sortOrder === 'asc' ? result : -result;
    }
    if (sortBy === 'goals') {
      return sortOrder === 'asc' ? left.goals - right.goals : right.goals - left.goals;
    }
    if (sortBy === 'assists') {
      return sortOrder === 'asc' ? left.assists - right.assists : right.assists - left.assists;
    }
    if (sortBy === 'minutes') {
      return sortOrder === 'asc' ? left.minutes - right.minutes : right.minutes - left.minutes;
    }

    return sortOrder === 'asc' ? leftCards - rightCards : rightCards - leftCards;
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

  const allKnockoutFixtures = [
    ...data.fixtures.today,
    ...data.fixtures.upcoming,
    ...data.fixtures.completed,
  ];
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

  return (
    <PageContent>
      <PageHeader sx={{ mb: ThemeTokens.spacing.xxxl }}>
        <Card
          sx={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #0d47a1 0%, #00695c 100%)',
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
                  src="/2026_ASEAN_Championship-logo.svg"
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
            borderRadius: ThemeTokens.borderRadius.lg,
            background:
              'linear-gradient(180deg, rgba(25,118,210,0.05) 0%, rgba(46,125,50,0.02) 60%, rgba(255,255,255,1) 100%)',
          }}
        >
          <CardContent sx={{ p: { xs: ThemeTokens.spacing.md, md: ThemeTokens.spacing.lg } }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr minmax(360px, 1.2fr) 1fr' },
                gridTemplateAreas: {
                  xs: '"semi1" "final" "semi2" "champion"',
                  md: '"semi1 final semi2" ". champion ."',
                },
                alignItems: 'center',
                columnGap: ThemeTokens.spacing.lg,
                rowGap: ThemeTokens.spacing.md,
              }}
            >
              <Box sx={{ gridArea: 'semi1' }}>
                {renderSemiFinalRoadCard(data.knockout.semiFinal1)}
              </Box>

              <Box sx={{ gridArea: 'final' }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderWidth: 2,
                    borderColor: 'primary.main',
                    borderRadius: ThemeTokens.borderRadius.lg,
                    boxShadow: '0 10px 26px rgba(13, 71, 161, 0.18)',
                    overflow: 'hidden',
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
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmojiEventsIcon color="warning" sx={{ fontSize: 28 }} />
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            FINAL
                          </Typography>
                        </Box>
                        <StatusChip status={finalStatus.status} label={finalStatus.label} />
                      </Box>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
                          alignItems: 'center',
                          gap: 1,
                          p: ThemeTokens.spacing.sm,
                          borderRadius: ThemeTokens.borderRadius.sm,
                          bgcolor: 'action.hover',
                        }}
                      >
                        {renderTeamWithFlag(
                          {
                            name:
                              data.knockout.final.home.team?.name ?? data.knockout.final.home.label,
                            countryCode: data.knockout.final.home.team?.countryCode ?? 'TBD',
                          },
                          'lg'
                        )}
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ textAlign: 'center', fontWeight: 700 }}
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
                          display: 'grid',
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
                              ? `${formatKickoffTime(finalFixture.kickoff)} UTC`
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
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
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
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ gridArea: 'semi2' }}>
                {renderSemiFinalRoadCard(data.knockout.semiFinal2)}
              </Box>

              <Box sx={{ gridArea: 'champion' }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderWidth: 2,
                    borderColor: 'success.main',
                    borderRadius: ThemeTokens.borderRadius.lg,
                    background:
                      'linear-gradient(135deg, rgba(46,125,50,0.18) 0%, rgba(46,125,50,0.06) 100%)',
                    textAlign: 'center',
                    boxShadow: '0 10px 24px rgba(46, 125, 50, 0.16)',
                  }}
                >
                  <CardContent sx={{ py: ThemeTokens.spacing.lg }}>
                    <Stack spacing={1.25} sx={{ alignItems: 'center' }}>
                      <EmojiEventsIcon color="warning" sx={{ fontSize: 44 }} />
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ letterSpacing: 1.2 }}
                      >
                        CHAMPION
                      </Typography>
                      <CountryFlag
                        code={championTeam?.countryCode ?? 'TBD'}
                        size={36}
                        showTooltip
                      />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {championName}
                      </Typography>
                      <Chip
                        size="small"
                        label={championTeam ? 'Crowned' : 'To Be Decided'}
                        color={championTeam ? 'success' : 'default'}
                        variant={championTeam ? 'filled' : 'outlined'}
                      />
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
        subtitle="Today, upcoming, and completed fixtures"
        sx={{ mb: ThemeTokens.spacing.xxxl }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: ThemeTokens.spacing.md,
          }}
        >
          {renderFixtureList("Today's Fixtures", data.fixtures.today)}
          {renderFixtureList('Upcoming Fixtures', data.fixtures.upcoming)}
          {renderFixtureList('Completed Fixtures', data.fixtures.completed)}
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
                  <TableCell>Nation</TableCell>
                  <TableCell>Club</TableCell>
                  <TableCell>Position</TableCell>
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
                      active={sortBy === 'minutes'}
                      direction={sortBy === 'minutes' ? sortOrder : 'desc'}
                      onClick={() => handleSort('minutes')}
                    >
                      Minutes
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'cards'}
                      direction={sortBy === 'cards' ? sortOrder : 'desc'}
                      onClick={() => handleSort('cards')}
                    >
                      Cards
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
                    <TableCell align="right">{player.goals}</TableCell>
                    <TableCell align="right">{player.assists}</TableCell>
                    <TableCell align="right">{player.minutes}</TableCell>
                    <TableCell align="right">
                      {player.yellowCards}Y/{player.redCards}R
                    </TableCell>
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
