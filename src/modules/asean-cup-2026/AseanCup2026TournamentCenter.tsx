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
import {
  FilterBar,
  PageContent,
  PageHeader,
  PageSection,
  SearchInput,
  StatCard,
} from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';

type FixtureStatus = 'upcoming' | 'completed';
type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';
type SortOrder = 'asc' | 'desc';
type PlayerSortField = 'name' | 'goals' | 'assists' | 'minutes' | 'cards';

interface GroupStandingRow {
  position: number;
  team: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

interface TournamentFixture {
  id: string;
  stage: string;
  kickoff: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: FixtureStatus;
}

interface TournamentPlayer {
  id: number;
  name: string;
  nation: string;
  club: string;
  position: PlayerPosition;
  goals: number;
  assists: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
}

interface BracketTeam {
  name: string;
  logoText: string;
  score: number | null;
  aggregate: string;
  status: 'qualified' | 'pending' | 'champion';
}

interface BracketMatch {
  title: string;
  legDates: string;
  home: BracketTeam;
  away: BracketTeam;
}

const GROUP_A: GroupStandingRow[] = [
  {
    position: 1,
    team: 'Vietnam',
    played: 2,
    won: 2,
    draw: 0,
    lost: 0,
    gf: 5,
    ga: 1,
    gd: 4,
    points: 6,
  },
  {
    position: 2,
    team: 'Indonesia',
    played: 2,
    won: 1,
    draw: 1,
    lost: 0,
    gf: 3,
    ga: 2,
    gd: 1,
    points: 4,
  },
  {
    position: 3,
    team: 'Singapore',
    played: 2,
    won: 0,
    draw: 1,
    lost: 1,
    gf: 2,
    ga: 3,
    gd: -1,
    points: 1,
  },
  {
    position: 4,
    team: 'Cambodia',
    played: 2,
    won: 0,
    draw: 1,
    lost: 1,
    gf: 1,
    ga: 3,
    gd: -2,
    points: 1,
  },
  {
    position: 5,
    team: 'Timor-Leste',
    played: 2,
    won: 0,
    draw: 0,
    lost: 2,
    gf: 1,
    ga: 3,
    gd: -2,
    points: 0,
  },
];

const GROUP_B: GroupStandingRow[] = [
  {
    position: 1,
    team: 'Thailand',
    played: 2,
    won: 2,
    draw: 0,
    lost: 0,
    gf: 6,
    ga: 1,
    gd: 5,
    points: 6,
  },
  {
    position: 2,
    team: 'Malaysia',
    played: 2,
    won: 1,
    draw: 0,
    lost: 1,
    gf: 3,
    ga: 3,
    gd: 0,
    points: 3,
  },
  {
    position: 3,
    team: 'Philippines',
    played: 2,
    won: 1,
    draw: 0,
    lost: 1,
    gf: 2,
    ga: 3,
    gd: -1,
    points: 3,
  },
  {
    position: 4,
    team: 'Myanmar',
    played: 2,
    won: 0,
    draw: 1,
    lost: 1,
    gf: 2,
    ga: 4,
    gd: -2,
    points: 1,
  },
  {
    position: 5,
    team: 'Laos',
    played: 2,
    won: 0,
    draw: 1,
    lost: 1,
    gf: 1,
    ga: 3,
    gd: -2,
    points: 1,
  },
];

const FIXTURES: TournamentFixture[] = [
  {
    id: 'A1',
    stage: 'Group A',
    kickoff: '2026-08-01T19:00:00',
    venue: 'My Dinh National Stadium',
    homeTeam: 'Vietnam',
    awayTeam: 'Singapore',
    homeScore: 2,
    awayScore: 1,
    status: 'completed',
  },
  {
    id: 'A2',
    stage: 'Group A',
    kickoff: '2026-08-02T19:30:00',
    venue: 'Gelora Bung Karno Stadium',
    homeTeam: 'Indonesia',
    awayTeam: 'Cambodia',
    homeScore: 1,
    awayScore: 0,
    status: 'completed',
  },
  {
    id: 'B1',
    stage: 'Group B',
    kickoff: '2026-08-03T19:30:00',
    venue: 'Rajamangala Stadium',
    homeTeam: 'Thailand',
    awayTeam: 'Laos',
    homeScore: 3,
    awayScore: 1,
    status: 'completed',
  },
  {
    id: 'B2',
    stage: 'Group B',
    kickoff: '2026-08-04T19:00:00',
    venue: 'Bukit Jalil National Stadium',
    homeTeam: 'Malaysia',
    awayTeam: 'Myanmar',
    homeScore: 2,
    awayScore: 1,
    status: 'completed',
  },
  {
    id: 'A3',
    stage: 'Group A',
    kickoff: '2026-08-05T19:00:00',
    venue: 'National Olympic Stadium',
    homeTeam: 'Cambodia',
    awayTeam: 'Timor-Leste',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
  },
  {
    id: 'A4',
    stage: 'Group A',
    kickoff: '2026-08-05T20:00:00',
    venue: 'Jalan Besar Stadium',
    homeTeam: 'Singapore',
    awayTeam: 'Indonesia',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
  },
  {
    id: 'B3',
    stage: 'Group B',
    kickoff: '2026-08-06T19:30:00',
    venue: 'Rizal Memorial Stadium',
    homeTeam: 'Philippines',
    awayTeam: 'Thailand',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
  },
  {
    id: 'B4',
    stage: 'Group B',
    kickoff: '2026-08-06T20:00:00',
    venue: 'Thuwunna Stadium',
    homeTeam: 'Myanmar',
    awayTeam: 'Malaysia',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
  },
  {
    id: 'SF1-L1',
    stage: 'Semi-final 1 (Leg 1)',
    kickoff: '2026-08-15T20:00:00',
    venue: 'Winner A Home Venue',
    homeTeam: 'Winner Group A',
    awayTeam: 'Runner-up Group B',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
  },
  {
    id: 'SF2-L1',
    stage: 'Semi-final 2 (Leg 1)',
    kickoff: '2026-08-16T20:00:00',
    venue: 'Winner B Home Venue',
    homeTeam: 'Winner Group B',
    awayTeam: 'Runner-up Group A',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
  },
  {
    id: 'SF1-L2',
    stage: 'Semi-final 1 (Leg 2)',
    kickoff: '2026-08-19T20:00:00',
    venue: 'Runner-up B Home Venue',
    homeTeam: 'Runner-up Group B',
    awayTeam: 'Winner Group A',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
  },
  {
    id: 'SF2-L2',
    stage: 'Semi-final 2 (Leg 2)',
    kickoff: '2026-08-19T20:30:00',
    venue: 'Runner-up A Home Venue',
    homeTeam: 'Runner-up Group A',
    awayTeam: 'Winner Group B',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
  },
  {
    id: 'F-L1',
    stage: 'Final (Leg 1)',
    kickoff: '2026-08-22T20:00:00',
    venue: 'Finalist 1 Home Venue',
    homeTeam: 'Semi-final 1 Winner',
    awayTeam: 'Semi-final 2 Winner',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
  },
  {
    id: 'F-L2',
    stage: 'Final (Leg 2)',
    kickoff: '2026-08-26T20:00:00',
    venue: 'Finalist 2 Home Venue',
    homeTeam: 'Semi-final 2 Winner',
    awayTeam: 'Semi-final 1 Winner',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
  },
];

const TOURNAMENT_PLAYERS: TournamentPlayer[] = [
  {
    id: 1,
    name: 'Nguyen Tien Linh',
    nation: 'Vietnam',
    club: 'Becamex Binh Duong',
    position: 'FWD',
    goals: 3,
    assists: 1,
    minutes: 180,
    yellowCards: 1,
    redCards: 0,
  },
  {
    id: 2,
    name: 'Supachok Sarachat',
    nation: 'Thailand',
    club: 'Hokkaido Consadole Sapporo',
    position: 'MID',
    goals: 2,
    assists: 2,
    minutes: 176,
    yellowCards: 0,
    redCards: 0,
  },
  {
    id: 3,
    name: 'Rafael Struick',
    nation: 'Indonesia',
    club: 'ADO Den Haag',
    position: 'FWD',
    goals: 2,
    assists: 0,
    minutes: 170,
    yellowCards: 1,
    redCards: 0,
  },
  {
    id: 4,
    name: 'Dion Cools',
    nation: 'Malaysia',
    club: 'Buriram United',
    position: 'DEF',
    goals: 1,
    assists: 1,
    minutes: 180,
    yellowCards: 0,
    redCards: 0,
  },
  {
    id: 5,
    name: 'Stephan Schrock',
    nation: 'Philippines',
    club: 'Mendiola FC',
    position: 'MID',
    goals: 1,
    assists: 1,
    minutes: 168,
    yellowCards: 1,
    redCards: 0,
  },
  {
    id: 6,
    name: 'Ikhsan Fandi',
    nation: 'Singapore',
    club: 'BG Pathum United',
    position: 'FWD',
    goals: 1,
    assists: 0,
    minutes: 155,
    yellowCards: 0,
    redCards: 0,
  },
  {
    id: 7,
    name: 'Aung Kaung Mann',
    nation: 'Myanmar',
    club: 'Lamphun Warriors',
    position: 'MID',
    goals: 1,
    assists: 0,
    minutes: 171,
    yellowCards: 2,
    redCards: 0,
  },
  {
    id: 8,
    name: 'Keo Sokpheng',
    nation: 'Cambodia',
    club: 'Visakha FC',
    position: 'FWD',
    goals: 0,
    assists: 1,
    minutes: 166,
    yellowCards: 1,
    redCards: 0,
  },
  {
    id: 9,
    name: 'Soukaphone Vongchiengkham',
    nation: 'Laos',
    club: 'Ezra FC',
    position: 'MID',
    goals: 0,
    assists: 1,
    minutes: 180,
    yellowCards: 0,
    redCards: 0,
  },
  {
    id: 10,
    name: 'Paulo Gali',
    nation: 'Timor-Leste',
    club: 'Karketu Dili',
    position: 'MID',
    goals: 0,
    assists: 0,
    minutes: 180,
    yellowCards: 1,
    redCards: 0,
  },
  {
    id: 11,
    name: 'Dang Van Lam',
    nation: 'Vietnam',
    club: 'Quy Nhon Binh Dinh',
    position: 'GK',
    goals: 0,
    assists: 0,
    minutes: 180,
    yellowCards: 0,
    redCards: 0,
  },
  {
    id: 12,
    name: 'Nadeo Argawinata',
    nation: 'Indonesia',
    club: 'Borneo FC',
    position: 'GK',
    goals: 0,
    assists: 0,
    minutes: 180,
    yellowCards: 0,
    redCards: 0,
  },
];

const BRACKET_DATA: {
  semiFinal1: BracketMatch;
  semiFinal2: BracketMatch;
  final: BracketMatch;
  champion: BracketTeam;
} = {
  semiFinal1: {
    title: 'Semi-final 1',
    legDates: 'Aug 15-19, 2026 (Two-legged)',
    home: {
      name: 'Winner Group A',
      logoText: 'A1',
      score: null,
      aggregate: '-',
      status: 'pending',
    },
    away: {
      name: 'Runner-up Group B',
      logoText: 'B2',
      score: null,
      aggregate: '-',
      status: 'pending',
    },
  },
  semiFinal2: {
    title: 'Semi-final 2',
    legDates: 'Aug 15-19, 2026 (Two-legged)',
    home: {
      name: 'Winner Group B',
      logoText: 'B1',
      score: null,
      aggregate: '-',
      status: 'pending',
    },
    away: {
      name: 'Runner-up Group A',
      logoText: 'A2',
      score: null,
      aggregate: '-',
      status: 'pending',
    },
  },
  final: {
    title: 'Final',
    legDates: 'Aug 22-26, 2026 (Two-legged)',
    home: {
      name: 'SF1 Winner',
      logoText: 'W1',
      score: null,
      aggregate: '-',
      status: 'pending',
    },
    away: {
      name: 'SF2 Winner',
      logoText: 'W2',
      score: null,
      aggregate: '-',
      status: 'pending',
    },
  },
  champion: {
    name: 'To Be Decided',
    logoText: 'C',
    score: null,
    aggregate: '-',
    status: 'champion',
  },
};

const TOURNAMENT_STATS = [
  {
    id: 'top-scorer',
    title: 'Top Scorer',
    value: 'Nguyen Tien Linh (3)',
    subtitle: 'Vietnam',
    icon: <MilitaryTechIcon />,
    iconColor: '#ef6c00',
  },
  {
    id: 'top-assists',
    title: 'Top Assists',
    value: 'Supachok Sarachat (2)',
    subtitle: 'Thailand',
    icon: <TimelineIcon />,
    iconColor: '#1565c0',
  },
  {
    id: 'clean-sheets',
    title: 'Most Clean Sheets',
    value: 'Dang Van Lam (2)',
    subtitle: 'Vietnam',
    icon: <FlagIcon />,
    iconColor: '#2e7d32',
  },
  {
    id: 'most-goals',
    title: 'Most Goals Team',
    value: 'Thailand (6)',
    subtitle: 'After 2 matches',
    icon: <SportsSoccerIcon />,
    iconColor: '#00897b',
  },
  {
    id: 'most-minutes',
    title: 'Most Minutes',
    value: '3 Players (180)',
    subtitle: 'Full match leaders',
    icon: <TimelineIcon />,
    iconColor: '#5d4037',
  },
  {
    id: 'golden-boot',
    title: 'Golden Boot Leader',
    value: 'Nguyen Tien Linh',
    subtitle: 'Current leader',
    icon: <WorkspacePremiumIcon />,
    iconColor: '#6a1b9a',
  },
];

function formatKickoff(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function toDayKey(dateValue: Date): string {
  return `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, '0')}-${String(
    dateValue.getDate()
  ).padStart(2, '0')}`;
}

function isSameDay(left: Date, right: Date): boolean {
  return toDayKey(left) === toDayKey(right);
}

function isAfterToday(dateValue: Date, now: Date): boolean {
  const dateAtMidnight = new Date(
    dateValue.getFullYear(),
    dateValue.getMonth(),
    dateValue.getDate()
  );
  const nowAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return dateAtMidnight.getTime() > nowAtMidnight.getTime();
}

function formatScore(homeScore: number | null, awayScore: number | null): string {
  if (homeScore === null || awayScore === null) {
    return 'vs';
  }

  return `${homeScore} - ${awayScore}`;
}

function getFixtureStatusLabel(fixture: TournamentFixture): string {
  if (fixture.status === 'completed') {
    return 'Completed';
  }

  if (isSameDay(new Date(fixture.kickoff), new Date())) {
    return 'Today';
  }

  return 'Upcoming';
}

function getFixtureStatusColor(label: string): 'success' | 'warning' | 'info' {
  if (label === 'Completed') {
    return 'success';
  }

  if (label === 'Today') {
    return 'warning';
  }

  return 'info';
}

function getTeamStatusChipColor(status: BracketTeam['status']): 'success' | 'warning' | 'default' {
  if (status === 'champion') {
    return 'success';
  }

  if (status === 'qualified') {
    return 'warning';
  }

  return 'default';
}

function renderGroupTable(groupName: string, rows: GroupStandingRow[]): React.ReactElement {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: ThemeTokens.spacing.sm }}>
          {groupName}
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
              {rows.map((row) => (
                <TableRow key={`${groupName}-${row.team}`} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{row.position}</TableCell>
                  <TableCell>{row.team}</TableCell>
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

function renderBracketMatch(match: BracketMatch): React.ReactElement {
  const rows: BracketTeam[] = [match.home, match.away];

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {match.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {match.legDates}
        </Typography>

        <Stack spacing={1}>
          {rows.map((team) => (
            <Box
              key={`${match.title}-${team.name}`}
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
              <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>{team.logoText}</Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {team.name}
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
                  label={
                    team.status === 'pending'
                      ? 'Pending'
                      : team.status === 'qualified'
                        ? 'Qualified'
                        : 'Champion'
                  }
                  color={getTeamStatusChipColor(team.status)}
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
          ))}
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
            {fixtures.map((fixture) => {
              const statusLabel = getFixtureStatusLabel(fixture);
              return (
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
                        {fixture.homeTeam} {formatScore(fixture.homeScore, fixture.awayScore)}{' '}
                        {fixture.awayTeam}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      color={getFixtureStatusColor(statusLabel)}
                      label={statusLabel}
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
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export const AseanCup2026TournamentCenter: React.FC = (): React.ReactElement => {
  const today = useMemo(() => new Date(), []);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<'ALL' | PlayerPosition>('ALL');
  const [nationFilter, setNationFilter] = useState<'ALL' | string>('ALL');
  const [sortBy, setSortBy] = useState<PlayerSortField>('goals');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const completedFixtures = useMemo(
    () =>
      FIXTURES.filter((fixture) => fixture.status === 'completed').sort(
        (a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime()
      ),
    []
  );

  const todayFixtures = useMemo(
    () => FIXTURES.filter((fixture) => isSameDay(new Date(fixture.kickoff), today)),
    [today]
  );

  const upcomingFixtures = useMemo(
    () =>
      FIXTURES.filter(
        (fixture) =>
          fixture.status !== 'completed' && isAfterToday(new Date(fixture.kickoff), today)
      ).sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()),
    [today]
  );

  const nextFixture = upcomingFixtures[0] ?? null;
  const latestResult = completedFixtures[0] ?? null;

  const currentStage = useMemo(() => {
    const hasSemiStarted = FIXTURES.some(
      (fixture) =>
        fixture.stage.toLowerCase().includes('semi-final') && fixture.status === 'completed'
    );

    if (hasSemiStarted) {
      return 'Knockout Stage';
    }

    return 'Group Stage';
  }, []);

  const currentMatchday = 2;
  const matchesCompleted = completedFixtures.length;
  const matchesRemaining = FIXTURES.length - completedFixtures.length;

  const nations = useMemo(() => {
    const allNations = TOURNAMENT_PLAYERS.map((player) => player.nation);
    return Array.from(new Set(allNations)).sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    const filtered = TOURNAMENT_PLAYERS.filter((player) => {
      if (positionFilter !== 'ALL' && player.position !== positionFilter) {
        return false;
      }

      if (nationFilter !== 'ALL' && player.nation !== nationFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        player.name.toLowerCase().includes(normalizedQuery) ||
        player.nation.toLowerCase().includes(normalizedQuery) ||
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
  }, [nationFilter, positionFilter, search, sortBy, sortOrder]);

  const handleSort = (field: PlayerSortField): void => {
    if (sortBy === field) {
      setSortOrder((current) => (current === 'desc' ? 'asc' : 'desc'));
      return;
    }

    setSortBy(field);
    setSortOrder(field === 'name' ? 'asc' : 'desc');
  };

  return (
    <PageContent>
      <PageHeader>
        <Card
          sx={{
            borderRadius: ThemeTokens.borderRadius.md,
            background: 'linear-gradient(135deg, #0d47a1 0%, #00695c 100%)',
            color: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <CardContent>
            <Stack spacing={ThemeTokens.spacing.md}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'flex-start', md: 'center' },
                  gap: ThemeTokens.spacing.md,
                }}
              >
                <Avatar
                  src="/asean-cup-2026-logo.svg"
                  alt="ASEAN Cup 2026"
                  variant="rounded"
                  sx={{ width: 84, height: 84, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)' }}
                >
                  AC
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ASEAN Cup 2026
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.86)', mt: 0.5 }}>
                    Tournament Center
                  </Typography>
                </Box>

                <Chip
                  icon={<EmojiEventsIcon />}
                  label={currentStage}
                  sx={{
                    color: '#ffffff',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '& .MuiChip-icon': { color: '#ffffff' },
                  }}
                  variant="outlined"
                />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(5, minmax(0, 1fr))',
                  },
                  gap: ThemeTokens.spacing.sm,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Current Matchday
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    MD {currentMatchday}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Matches Completed
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {matchesCompleted}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Matches Remaining
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {matchesRemaining}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 2' } }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Next Fixture
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {nextFixture
                      ? `${nextFixture.homeTeam} vs ${nextFixture.awayTeam} • ${formatKickoff(nextFixture.kickoff)}`
                      : 'To be announced'}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Latest Result
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {latestResult
                      ? `${latestResult.homeTeam} ${formatScore(latestResult.homeScore, latestResult.awayScore)} ${latestResult.awayTeam}`
                      : 'No completed match yet'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </PageHeader>

      <PageSection title="Tournament Bracket" subtitle="Knockout stage path (fixed layout)">
        <Card variant="outlined">
          <CardContent>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' },
                gap: ThemeTokens.spacing.md,
                alignItems: 'stretch',
              }}
            >
              <Box>{renderBracketMatch(BRACKET_DATA.semiFinal1)}</Box>

              <Stack spacing={ThemeTokens.spacing.md}>
                {renderBracketMatch(BRACKET_DATA.final)}
                <Card variant="outlined">
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
                        borderColor: 'divider',
                        borderRadius: ThemeTokens.borderRadius.sm,
                        p: ThemeTokens.spacing.sm,
                      }}
                    >
                      <Avatar
                        sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'success.main' }}
                      >
                        {BRACKET_DATA.champion.logoText}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {BRACKET_DATA.champion.name}
                      </Typography>
                      <Chip size="small" label="Pending" color="default" variant="outlined" />
                    </Box>
                  </CardContent>
                </Card>
              </Stack>

              <Box>{renderBracketMatch(BRACKET_DATA.semiFinal2)}</Box>
            </Box>
          </CardContent>
        </Card>
      </PageSection>

      <PageSection title="Group Standings" subtitle="Group A and Group B">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: ThemeTokens.spacing.md,
          }}
        >
          {renderGroupTable('Group A', GROUP_A)}
          {renderGroupTable('Group B', GROUP_B)}
        </Box>
      </PageSection>

      <PageSection title="Fixtures" subtitle="Today, upcoming, and completed matches">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: ThemeTokens.spacing.md,
          }}
        >
          {renderFixtureList("Today's Fixtures", todayFixtures)}
          {renderFixtureList('Upcoming Fixtures', upcomingFixtures)}
          {renderFixtureList('Completed Fixtures', completedFixtures)}
        </Box>
      </PageSection>

      <PageSection title="Players" subtitle="Search, sort, and filter player performance">
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
                  setPositionFilter(event.target.value as 'ALL' | PlayerPosition)
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
                    <TableCell>{player.nation}</TableCell>
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
          {TOURNAMENT_STATS.map((stat) => (
            <StatCard
              key={stat.id}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              iconColor={stat.iconColor}
            />
          ))}
        </Box>
      </PageSection>
    </PageContent>
  );
};
