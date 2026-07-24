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
  DataSyncIndicator,
  ErrorState,
  FilterBar,
  LoadingState,
  PageContent,
  PageHeader,
  PageSection,
  SearchInput,
  StatCard,
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

function getKnockoutChipProps(status: KnockoutTeam['status']): {
  label: string;
  color: 'default' | 'success' | 'warning';
} {
  if (status === 'champion') {
    return { label: 'Champion', color: 'success' };
  }
  if (status === 'qualified') {
    return { label: 'Qualified', color: 'warning' };
  }
  return { label: 'Pending', color: 'default' };
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
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                        {row.team.shortName}
                      </Avatar>
                      <Typography variant="body2">{row.team.name}</Typography>
                    </Box>
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
      </CardContent>
    </Card>
  );
}

function renderKnockoutMatch(match: KnockoutMatch, emphasize = false): React.ReactElement {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderWidth: emphasize ? 2 : 1,
        borderColor: emphasize ? 'primary.main' : 'divider',
        backgroundColor: emphasize ? 'action.hover' : 'background.paper',
      }}
    >
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {match.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
          {match.legDates}
        </Typography>

        <Stack spacing={1}>
          {[match.home, match.away].map((team) => {
            const chip = getKnockoutChipProps(team.status);
            return (
              <Box
                key={`${match.title}-${team.label}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: ThemeTokens.borderRadius.sm,
                  p: ThemeTokens.spacing.sm,
                }}
              >
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                  {team.team?.shortName ?? 'TBD'}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {team.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Aggregate: {team.aggregate}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {team.score ?? '-'}
                  </Typography>
                  <Chip
                    size="small"
                    label={chip.label}
                    color={chip.color}
                    variant="outlined"
                    sx={{ mt: 0.5, fontWeight: 500, opacity: chip.label === 'Pending' ? 0.8 : 1 }}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
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
                      {fixture.homeTeam.name} {formatScore(fixture.homeScore, fixture.awayScore)}{' '}
                      {fixture.awayTeam.name}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color={getFixtureStatusColor(fixture.status)}
                    label={getFixtureStatusLabel(fixture)}
                    variant={
                      fixture.status === 'live' || fixture.status === 'half-time'
                        ? 'filled'
                        : 'outlined'
                    }
                  />
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
        title="Tournament Bracket"
        subtitle="Semi-finals and final path (fixed layout)"
        sx={{ mb: ThemeTokens.spacing.xxxl }}
      >
        <Card variant="outlined">
          <CardContent>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr 1fr' },
                gap: ThemeTokens.spacing.md,
              }}
            >
              {renderKnockoutMatch(data.knockout.semiFinal1)}

              <Stack spacing={ThemeTokens.spacing.md}>
                {renderKnockoutMatch(data.knockout.final, true)}
                <Card
                  variant="outlined"
                  sx={{
                    borderWidth: 2,
                    borderColor: 'success.main',
                    background:
                      'linear-gradient(135deg, rgba(46,125,50,0.12) 0%, rgba(46,125,50,0.02) 100%)',
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                      Champion
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        alignItems: 'center',
                        gap: 1,
                        border: '1px solid',
                        borderColor: 'success.light',
                        borderRadius: ThemeTokens.borderRadius.sm,
                        p: ThemeTokens.spacing.sm,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Avatar
                        sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'success.main' }}
                      >
                        C
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {data.knockout.champion.label}
                      </Typography>
                      <Chip
                        size="small"
                        label="Pending"
                        color="default"
                        variant="outlined"
                        sx={{ opacity: 0.8 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Stack>

              {renderKnockoutMatch(data.knockout.semiFinal2)}
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
                    <TableCell>{player.nation.name}</TableCell>
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
