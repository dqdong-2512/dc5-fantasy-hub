import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
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
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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
  StatusChip,
} from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { ASEAN_CUP_2026_TOURNAMENT_CONFIG } from './config/tournament.config';
import { ASEAN_CUP_2026_RAW_DATA } from './data/asean-cup-2026.raw';
import type {
  KnockoutMatch,
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
  { id: 'best-attack', icon: <SportsSoccerIcon />, iconColor: '#2e7d32' },
  { id: 'highest-scoring-match', icon: <SportsSoccerIcon />, iconColor: '#8e24aa' },
];
const PLAYER_PAGE_SIZE = 10;
const TOURNAMENT_STATISTIC_IDS = new Set(STAT_CARD_META.map((item) => item.id));
const RAW_KNOCKOUT_FIXTURES = ASEAN_CUP_2026_RAW_DATA.fixtures.filter((fixture) =>
  /Semi-final|Final/i.test(fixture.stage)
);

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';
const TOURNAMENT_HERO_GRADIENT = `linear-gradient(135deg, #0d47a1 0%, ${ASEAN_CUP_2026_TOURNAMENT_CONFIG.brandColor} 100%)`;

function formatKickoff(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
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
    return 'Hết hiệp một';
  }
  if (fixture.status === 'live') {
    if (fixture.minute !== null) {
      if (fixture.addedTime !== null && fixture.addedTime > 0) {
        return `${fixture.minute}+${fixture.addedTime}'`;
      }
      return `${fixture.minute}'`;
    }
    return 'Đang diễn ra';
  }
  if (fixture.status === 'finished') {
    return 'Đã kết thúc';
  }
  if (fixture.status === 'postponed') {
    return 'Tạm hoãn';
  }
  if (fixture.status === 'cancelled') {
    return 'Đã hủy';
  }
  return 'Sắp diễn ra';
}

function translateStage(stage: string): string {
  return stage
    .replace(/Group Stage Round/gi, 'Vòng bảng - Lượt')
    .replace(/Group ([AB])/gi, 'Bảng $1')
    .replace(/Semi-final/gi, 'Bán kết')
    .replace(/Final/gi, 'Chung kết')
    .replace(/Leg 1/gi, 'Lượt đi')
    .replace(/Leg 2/gi, 'Lượt về');
}

function translateStatisticTitle(id: string, fallback: string): string {
  const titles: Record<string, string> = {
    'top-scorer': 'Vua phá lưới',
    'top-assists': 'Vua Kiến tạo',
    'most-clean-sheets': 'Giữ sạch lưới nhiều nhất',
    'most-goals': 'Đội ghi nhiều bàn nhất',
    'best-attack': 'Hàng công xuất sắc nhất',
    'highest-scoring-match': 'Trận đấu nhiều bàn thắng nhất',
  };
  return titles[id] ?? fallback;
}

function translateTeamName(name: string): string {
  const teams: Record<string, string> = {
    Vietnam: 'Việt Nam',
    Thailand: 'Thái Lan',
    Singapore: 'Singapore',
    Malaysia: 'Malaysia',
    Indonesia: 'Indonesia',
    Myanmar: 'Myanmar',
    Cambodia: 'Campuchia',
    Laos: 'Lào',
    'Timor-Leste': 'Đông Timor',
    Philippines: 'Philippines',
  };
  return (
    teams[name] ??
    name
      .replace(/Winner Semi-final 1/gi, 'Đội thắng bán kết 1')
      .replace(/Winner Semi-final 2/gi, 'Đội thắng bán kết 2')
      .replace(/Winner SF1/gi, 'Đội thắng bán kết 1')
      .replace(/Winner SF2/gi, 'Đội thắng bán kết 2')
      .replace(/^Champion$/gi, 'Nhà vô địch')
      .replace(/^TBD$/gi, 'Chưa xác định')
  );
}

function translateVenue(venue: string): string {
  return venue
    .replace(/Winner Group A Home Venue/gi, 'Sân nhà đội nhất bảng A')
    .replace(/Winner Group B Home Venue/gi, 'Sân nhà đội nhất bảng B')
    .replace(/Runner-up Group A Home Venue/gi, 'Sân nhà đội nhì bảng A')
    .replace(/Runner-up Group B Home Venue/gi, 'Sân nhà đội nhì bảng B')
    .replace(/Finalist 1 Home Venue/gi, 'Sân nhà đội vào chung kết 1')
    .replace(/Finalist 2 Home Venue/gi, 'Sân nhà đội vào chung kết 2');
}

function translateSummary(value: string): string {
  let translated = value
    .replace('No upcoming fixture', 'Chưa có trận đấu sắp tới')
    .replace('No finished fixture yet', 'Chưa có trận đấu kết thúc')
    .replace('Schedule unavailable', 'Chưa có lịch thi đấu');
  Object.entries({
    Vietnam: 'Việt Nam',
    Thailand: 'Thái Lan',
    Cambodia: 'Campuchia',
    Laos: 'Lào',
    'Timor-Leste': 'Đông Timor',
    'Brunei Darussalam': 'Brunei',
  }).forEach(([english, vietnamese]) => {
    translated = translated.replaceAll(english, vietnamese);
  });
  return translated.replaceAll(' vs ', ' - ');
}

function translatePosition(position: TournamentPlayerPosition): string {
  const positions: Record<TournamentPlayerPosition, string> = {
    GK: 'Thủ môn',
    DEF: 'Hậu vệ',
    MID: 'Tiền vệ',
    FWD: 'Tiền đạo',
  };
  return positions[position];
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
        {translateTeamName(team.name)}
      </Typography>
    </Box>
  );
}

function formatMatchDate(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'Chưa xác định';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatKickoffTime(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'Chưa xác định';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function resolveAggregateDisplay(match: KnockoutMatch): string {
  if (match.home.aggregate !== '-' && match.home.aggregate === match.away.aggregate) {
    return match.home.aggregate;
  }
  if (match.home.aggregate !== '-' || match.away.aggregate !== '-') {
    return `${match.home.aggregate} / ${match.away.aggregate}`;
  }
  return 'Chưa xác định';
}

function getSemiFinalSlotLabels(fixture: TournamentFixture): [string, string] {
  const isSecondLeg = /Leg 2/i.test(fixture.stage);

  if (fixture.stage.includes('Semi-final 1')) {
    return isSecondLeg ? ['Nhất bảng B', 'Nhì bảng A'] : ['Nhì bảng A', 'Nhất bảng B'];
  }

  return isSecondLeg ? ['Nhất bảng A', 'Nhì bảng B'] : ['Nhì bảng B', 'Nhất bảng A'];
}

function ensureTwoLegFixtures(
  fixtures: TournamentFixture[],
  stageName: string,
  homeTeam: { id: number; name: string; countryCode: string },
  awayTeam: { id: number; name: string; countryCode: string }
): TournamentFixture[] {
  return [1, 2].map((leg) => {
    const existing = fixtures.find((fixture) => new RegExp(`Leg ${leg}`, 'i').test(fixture.stage));
    const isSecondLeg = leg === 2;
    const scheduledFixture = RAW_KNOCKOUT_FIXTURES.find(
      (fixture) =>
        fixture.stage.toLowerCase().includes(stageName.toLowerCase()) &&
        new RegExp(`Leg ${leg}`, 'i').test(fixture.stage)
    );
    if (existing) {
      return {
        ...existing,
        kickoff: existing.kickoff || scheduledFixture?.kickoff || '',
        venue: existing.venue || scheduledFixture?.venue || '',
        homeTeam:
          existing.homeTeam.id === 0 ? (isSecondLeg ? awayTeam : homeTeam) : existing.homeTeam,
        awayTeam:
          existing.awayTeam.id === 0 ? (isSecondLeg ? homeTeam : awayTeam) : existing.awayTeam,
      };
    }

    return {
      id: scheduledFixture?.id ?? `${stageName.toLowerCase().replaceAll(' ', '-')}-leg-${leg}`,
      stage: scheduledFixture?.stage ?? `${stageName} Leg ${leg}`,
      kickoff: scheduledFixture?.kickoff ?? '',
      venue: scheduledFixture?.venue ?? '',
      homeTeam: isSecondLeg ? awayTeam : homeTeam,
      awayTeam: isSecondLeg ? homeTeam : awayTeam,
      homeScore: null,
      awayScore: null,
      status: 'upcoming',
      minute: null,
      addedTime: null,
      note: null,
    };
  });
}

function renderScheduledTeamRow(label: string, score: number | null): React.ReactElement {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {translateTeamName(label)}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>
        {score ?? '-'}
      </Typography>
    </Box>
  );
}

function renderKnockoutLegCard(
  fixture: TournamentFixture,
  aggregateScore: string
): React.ReactElement {
  const kickoffDate = formatMatchDate(fixture.kickoff);
  const kickoffTime = formatKickoffTime(fixture.kickoff);
  const [fallbackHomeLabel, fallbackAwayLabel] = getSemiFinalSlotLabels(fixture);
  const homeLabel = fixture.homeTeam?.name || fallbackHomeLabel;
  const awayLabel = fixture.awayTeam?.name || fallbackAwayLabel;

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
            {translateStage(fixture.stage)}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
              <Typography variant="caption">{kickoffTime} (giờ Việt Nam)</Typography>
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
                Sân vận động: {fixture.venue ? translateVenue(fixture.venue) : 'Sẽ được công bố'}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{ textAlign: 'center', pt: 0.75, borderTop: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="caption" color="text.secondary">
              Tổng tỷ số
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {aggregateScore}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function renderFinalTieCard(
  fixtures: TournamentFixture[],
  aggregateScore: string
): React.ReactElement {
  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        borderWidth: 2,
        borderColor: '#F59E0B',
        borderRadius: '16px',
        boxShadow: '0 12px 28px rgba(245, 158, 11, 0.18)',
        background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(255,255,255,1) 38%)',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, md: ThemeTokens.spacing.md } }}>
        <Stack spacing={1.5}>
          {fixtures.map((fixture, index) => (
            <React.Fragment key={fixture.id}>
              {index > 0 && <Divider />}
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {index === 0 ? 'Lượt đi' : 'Lượt về'}
                  </Typography>
                  <StatusChip
                    status={getFixtureStatusColor(fixture.status)}
                    label={getFixtureStatusLabel(fixture)}
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1.5,
                    flexWrap: 'wrap',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="caption">{formatMatchDate(fixture.kickoff)}</Typography>
                  <Typography variant="caption">
                    {formatKickoffTime(fixture.kickoff)} (giờ Việt Nam)
                  </Typography>
                </Box>
                <Stack spacing={0.7}>
                  {renderScheduledTeamRow(
                    translateTeamName(fixture.homeTeam?.name || 'Đội vào chung kết 1'),
                    fixture.homeScore
                  )}
                  {renderScheduledTeamRow(
                    translateTeamName(fixture.awayTeam?.name || 'Đội vào chung kết 2'),
                    fixture.awayScore
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Sân vận động: {fixture.venue ? translateVenue(fixture.venue) : 'Sẽ được công bố'}
                </Typography>
              </Stack>
            </React.Fragment>
          ))}
          <Divider />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Tổng tỷ số
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 850 }}>
              {aggregateScore}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

type MatchFormResult = 'W' | 'D' | 'L';

function getLastFiveResults(teamId: number, fixtures: TournamentFixture[]): MatchFormResult[] {
  return fixtures
    .filter(
      (fixture) =>
        fixture.status === 'finished' &&
        fixture.homeScore !== null &&
        fixture.awayScore !== null &&
        (fixture.homeTeam.id === teamId || fixture.awayTeam.id === teamId)
    )
    .sort((left, right) => new Date(right.kickoff).getTime() - new Date(left.kickoff).getTime())
    .slice(0, 5)
    .map((fixture) => {
      if (fixture.homeScore === fixture.awayScore) {
        return 'D';
      }
      const isHome = fixture.homeTeam.id === teamId;
      const won = isHome
        ? (fixture.homeScore ?? 0) > (fixture.awayScore ?? 0)
        : (fixture.awayScore ?? 0) > (fixture.homeScore ?? 0);
      return won ? 'W' : 'L';
    })
    .reverse();
}

function renderMatchForm(results: MatchFormResult[]): React.ReactElement {
  const colors: Record<MatchFormResult, string> = {
    W: '#16A34A',
    D: '#CBD5E1',
    L: '#DC2626',
  };
  const labels: Record<MatchFormResult, string> = {
    W: 'Thắng',
    D: 'Hòa',
    L: 'Thua',
  };

  return (
    <Box
      sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}
    >
      {results.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          —
        </Typography>
      ) : (
        results.map((result, index) => (
          <Box
            key={`${result}-${index}`}
            role="img"
            aria-label={labels[result]}
            title={labels[result]}
            sx={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              bgcolor: colors[result],
              border: result === 'D' ? '1px solid #94A3B8' : 'none',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.18)',
            }}
          />
        ))
      )}
    </Box>
  );
}

function renderGroupTable(
  group: TournamentCenterData['groups'][number],
  fixtures: TournamentFixture[]
): React.ReactElement {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: ThemeTokens.spacing.sm }}>
          {translateStage(group.name)}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Hạng</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Quốc kỳ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Đội tuyển</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Trận
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Thắng
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Hòa
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Thua
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  BT
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  BB
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  HS
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Điểm
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  5 trận gần nhất
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
                      {translateTeamName(row.team.name)}
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
                  <TableCell align="right">
                    {renderMatchForm(getLastFiveResults(row.team.id, fixtures))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Hai đội đứng đầu mỗi bảng giành quyền vào vòng loại trực tiếp.
        </Typography>
      </CardContent>
    </Card>
  );
}

function renderFixtureList(
  title: string,
  fixtures: TournamentFixture[],
  onExpandChange: (fixtureId: string | null) => void,
  expandedFixtureId: string | null,
  emptyMessage = 'Không có trận đấu trong mục này.'
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
              <Box key={fixture.id}>
                <Box
                  onClick={() =>
                    onExpandChange(expandedFixtureId === fixture.id ? null : fixture.id)
                  }
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px',
                    p: ThemeTokens.spacing.md,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {/* Stage badge */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      mb: 0.75,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {translateStage(fixture.stage)}
                    </Typography>
                    <StatusChip
                      status={
                        title === 'Các trận hôm nay'
                          ? 'info'
                          : getFixtureStatusColor(fixture.status)
                      }
                      label={
                        title === 'Các trận hôm nay' ? 'Hôm nay' : getFixtureStatusLabel(fixture)
                      }
                    />
                  </Box>

                  {/* Main fixture display */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      alignItems: 'center',
                      gap: ThemeTokens.spacing.md,
                    }}
                  >
                    {/* Home Team */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <CountryFlag code={fixture.homeTeam.countryCode} size={28} />
                      <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 0 }}>
                        {translateTeamName(fixture.homeTeam.name)}
                      </Typography>
                    </Box>

                    {/* Score */}
                    <Box sx={{ textAlign: 'center', minWidth: '70px' }}>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {formatScore(fixture.homeScore, fixture.awayScore)}
                      </Typography>
                    </Box>

                    {/* Away Team */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 0 }}>
                        {translateTeamName(fixture.awayTeam.name)}
                      </Typography>
                      <CountryFlag code={fixture.awayTeam.countryCode} size={28} />
                    </Box>
                  </Box>

                  {/* Time and Venue info */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: ThemeTokens.spacing.md,
                      mt: ThemeTokens.spacing.md,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.25 }}
                      >
                        Ngày và giờ
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatMatchDate(fixture.kickoff)} {formatKickoffTime(fixture.kickoff)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.25 }}
                      >
                        Sân vận động
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {fixture.venue ? translateVenue(fixture.venue) : 'Sẽ được công bố'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {expandedFixtureId === fixture.id && (
                  <Box
                    sx={{
                      mt: 1,
                      p: ThemeTokens.spacing.md,
                      backgroundColor: 'action.hover',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {fixture.status === 'finished'
                        ? 'Diễn biến, bàn thắng, thẻ phạt, thay người và đội hình có trong trang Lịch thi đấu và kết quả.'
                        : 'Thông tin trước trận và dữ liệu chính thức có trong trang Lịch thi đấu và kết quả.'}
                    </Typography>
                  </Box>
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

function renderPremiumStatisticCard(
  statistic: TournamentCenterData['statistics'][number],
  data: TournamentCenterData,
  meta?: StatisticCardMeta
): React.ReactElement {
  const completedFixtures = data.fixtures.all.filter(
    (fixture) =>
      fixture.status === 'finished' && fixture.homeScore !== null && fixture.awayScore !== null
  );
  const topPlayer =
    statistic.id === 'top-scorer'
      ? [...data.players].sort((left, right) => right.goals - left.goals)[0]
      : statistic.id === 'top-assists'
        ? [...data.players].sort((left, right) => right.assists - left.assists)[0]
        : undefined;
  const teamTotals = new Map<
    number,
    { team: TournamentFixture['homeTeam']; goals: number; cleanSheets: number; played: number }
  >();

  completedFixtures.forEach((fixture) => {
    const home = teamTotals.get(fixture.homeTeam.id) ?? {
      team: fixture.homeTeam,
      goals: 0,
      cleanSheets: 0,
      played: 0,
    };
    const away = teamTotals.get(fixture.awayTeam.id) ?? {
      team: fixture.awayTeam,
      goals: 0,
      cleanSheets: 0,
      played: 0,
    };
    home.goals += fixture.homeScore ?? 0;
    away.goals += fixture.awayScore ?? 0;
    home.played += 1;
    away.played += 1;
    if (fixture.awayScore === 0) home.cleanSheets += 1;
    if (fixture.homeScore === 0) away.cleanSheets += 1;
    teamTotals.set(home.team.id, home);
    teamTotals.set(away.team.id, away);
  });

  const rankedTeams = [...teamTotals.values()];
  const topTeam =
    statistic.id === 'most-clean-sheets'
      ? rankedTeams.sort((left, right) => right.cleanSheets - left.cleanSheets)[0]
      : statistic.id === 'best-attack'
        ? rankedTeams.sort(
            (left, right) =>
              right.goals / Math.max(1, right.played) - left.goals / Math.max(1, left.played)
          )[0]
        : statistic.id === 'most-goals'
          ? rankedTeams.sort((left, right) => right.goals - left.goals)[0]
          : undefined;
  const highestScoringMatch =
    statistic.id === 'highest-scoring-match'
      ? [...completedFixtures].sort(
          (left, right) =>
            (right.homeScore ?? 0) +
            (right.awayScore ?? 0) -
            (left.homeScore ?? 0) -
            (left.awayScore ?? 0)
        )[0]
      : undefined;

  return (
    <Card
      key={statistic.id}
      variant="outlined"
      sx={{
        minHeight: 190,
        borderRadius: '16px',
        overflow: 'hidden',
        borderColor: 'rgba(37, 99, 235, 0.2)',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
        background:
          'linear-gradient(145deg, rgba(239, 246, 255, 0.96) 0%, #ffffff 52%, rgba(255, 247, 237, 0.72) 100%)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, height: '100%' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: meta?.iconColor }}>
            {meta?.icon ?? <SportsSoccerIcon />}
            <Typography variant="h6" sx={{ fontWeight: 850, color: 'text.primary' }}>
              {translateStatisticTitle(statistic.id, statistic.title)}
            </Typography>
          </Box>

          {topPlayer && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 72, height: 72, bgcolor: meta?.iconColor, fontSize: '1.35rem' }}>
                {topPlayer.name
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {topPlayer.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                  <CountryFlag code={topPlayer.nation.countryCode} size="md" showTooltip />
                  <Typography variant="body2" color="text.secondary">
                    {translateTeamName(topPlayer.nation.name)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: meta?.iconColor }}>
                  {statistic.id === 'top-scorer' ? topPlayer.goals : topPlayer.assists}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {statistic.id === 'top-scorer' ? 'Bàn thắng' : 'Kiến tạo'}
                </Typography>
              </Box>
            </Box>
          )}

          {topTeam && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <CountryFlag code={topTeam.team.countryCode} size={76} showTooltip />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 850 }}>
                  {translateTeamName(topTeam.team.name)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đội tuyển quốc gia
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: meta?.iconColor }}>
                  {statistic.id === 'most-clean-sheets'
                    ? topTeam.cleanSheets
                    : statistic.id === 'best-attack'
                      ? (topTeam.goals / Math.max(1, topTeam.played)).toFixed(2)
                      : topTeam.goals}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {statistic.id === 'most-clean-sheets'
                    ? 'Trận sạch lưới'
                    : statistic.id === 'best-attack'
                      ? 'Bàn / trận'
                      : 'Bàn thắng'}
                </Typography>
              </Box>
            </Box>
          )}

          {highestScoringMatch && (
            <Stack spacing={1.25} sx={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  gap: 2,
                  width: '100%',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CountryFlag
                    code={highestScoringMatch.homeTeam.countryCode}
                    size={54}
                    showTooltip
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {translateTeamName(highestScoringMatch.homeTeam.name)}
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>
                  {highestScoringMatch.homeScore}–{highestScoringMatch.awayScore}
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <CountryFlag
                    code={highestScoringMatch.awayTeam.countryCode}
                    size={54}
                    showTooltip
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {translateTeamName(highestScoringMatch.awayTeam.name)}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {formatMatchDate(highestScoringMatch.kickoff)}
              </Typography>
            </Stack>
          )}

          {!topPlayer && !topTeam && !highestScoringMatch && (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 850 }}>
                  {statistic.value === 'N/A' ? 'Chưa có' : statistic.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chưa có dữ liệu thống kê.
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export const AseanCup2026TournamentCenter: React.FC = (): React.ReactElement => {
  const navigate = useNavigate();
  const { data, error, isLoading, isRefreshing, refresh } = useTournamentCenter({
    autoRefresh: true,
    refreshIntervalMs: 30000,
  });

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<'ALL' | TournamentPlayerPosition>('ALL');
  const [nationFilter, setNationFilter] = useState<'ALL' | string>('ALL');
  const [sortBy, setSortBy] = useState<PlayerSortField>('goals');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [playerPage, setPlayerPage] = useState(0);
  const [expandedFixtureId, setExpandedFixtureId] = useState<string | null>(null);

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
  const playerPageCount = Math.max(1, Math.ceil(filteredPlayers.length / PLAYER_PAGE_SIZE));
  const visiblePlayerPage = Math.min(playerPage, playerPageCount - 1);
  const paginatedPlayers = useMemo(
    () =>
      filteredPlayers.slice(
        visiblePlayerPage * PLAYER_PAGE_SIZE,
        (visiblePlayerPage + 1) * PLAYER_PAGE_SIZE
      ),
    [filteredPlayers, visiblePlayerPage]
  );

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
        <LoadingState label="Đang tải dữ liệu ASEAN Cup 2026..." />
      </PageContent>
    );
  }

  if (error && !data) {
    return (
      <PageContent>
        <ErrorState
          title="Không thể tải ASEAN Cup 2026"
          message={error}
          actionLabel="Thử lại"
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
        <ErrorState title="ASEAN Cup 2026" message="Chưa có dữ liệu giải đấu." />
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
  const championTeam = data.knockout.champion.team;
  const championName = championTeam?.name ?? data.knockout.champion.label;
  const semiFinal1Fixtures = allKnockoutFixtures
    .filter((fixture) => fixture.stage.includes('Semi-final 1'))
    .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime());
  const semiFinal2Fixtures = allKnockoutFixtures
    .filter((fixture) => fixture.stage.includes('Semi-final 2'))
    .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime());
  const finalFixtures = allKnockoutFixtures
    .filter((fixture) => /^Final(?: \()?Leg [12]\)?$/i.test(fixture.stage))
    .sort((left, right) => new Date(left.kickoff).getTime() - new Date(right.kickoff).getTime());
  const toDisplayTeam = (
    team: TournamentCenterData['knockout']['final']['home']
  ): TournamentFixture['homeTeam'] => ({
    id: team.team?.id ?? 0,
    name: team.team?.name ?? team.label,
    countryCode: team.team?.countryCode ?? 'TBD',
  });
  const semiFinal1Legs = ensureTwoLegFixtures(
    semiFinal1Fixtures,
    'Semi-final 1',
    toDisplayTeam(data.knockout.semiFinal1.home),
    toDisplayTeam(data.knockout.semiFinal1.away)
  );
  const semiFinal2Legs = ensureTwoLegFixtures(
    semiFinal2Fixtures,
    'Semi-final 2',
    toDisplayTeam(data.knockout.semiFinal2.home),
    toDisplayTeam(data.knockout.semiFinal2.away)
  );
  const finalLegs = ensureTwoLegFixtures(
    finalFixtures,
    'Final',
    toDisplayTeam(data.knockout.final.home),
    toDisplayTeam(data.knockout.final.away)
  );

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
                    Giải vô địch bóng đá Đông Nam Á 2026
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip
                    icon={<EmojiEventsIcon />}
                    label={translateStage(data.hero.currentStage)}
                    variant="outlined"
                    sx={{
                      color: '#ffffff',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '& .MuiChip-icon': { color: '#ffffff' },
                    }}
                  />
                  <Chip
                    icon={<RefreshIcon />}
                    label={isRefreshing ? 'Đang làm mới' : 'Làm mới'}
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
                    Lượt đấu hiện tại
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Lượt {data.hero.currentMatchday}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Trận đã hoàn thành
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {data.hero.matchesCompleted}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Trận còn lại
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {data.hero.matchesRemaining}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatKickoff(data.hero.lastUpdated)}
                  </Typography>
                </Box>

                <Box sx={{ gridColumn: { xs: '1 / -1', lg: '1 / span 2' } }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Trạng thái giải đấu
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
                    <Chip
                      size="small"
                      color={highlightColor}
                      label={
                        data.hero.highlight.state === 'live'
                          ? 'Đang diễn ra'
                          : data.hero.highlight.state === 'finished'
                            ? 'Đã kết thúc'
                            : data.hero.highlight.state === 'upcoming'
                              ? 'Sắp diễn ra'
                              : 'Chưa có trận đấu'
                      }
                    />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {translateSummary(data.hero.highlight.fixtureText)}
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
                    Kết quả gần nhất
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {translateSummary(data.hero.latestResult)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                    Trận tiếp theo
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {translateSummary(data.hero.nextFixture)}
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

      <PageSection title="🏆 Đường đến chung kết" sx={{ mb: ThemeTokens.spacing.xxxl }}>
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
                  left: '29%',
                  top: '42%',
                  width: '13%',
                  borderTop: '2px solid #2563EB',
                }}
              />
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  position: 'absolute',
                  pointerEvents: 'none',
                  right: '29%',
                  top: '42%',
                  width: '13%',
                  borderTop: '2px solid #2563EB',
                }}
              />
              <Box sx={{ gridArea: 'semi1', zIndex: 1 }}>
                <Stack spacing={ThemeTokens.spacing.sm}>
                  <Chip
                    label="BÁN KẾT 1"
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      fontWeight: 700,
                      bgcolor: 'rgba(37, 99, 235, 0.12)',
                      color: '#1E40AF',
                    }}
                  />
                  {semiFinal1Legs.length > 0 ? (
                    semiFinal1Legs.map((fixture) => (
                      <React.Fragment key={fixture.id}>
                        {renderKnockoutLegCard(
                          fixture,
                          resolveAggregateDisplay(data.knockout.semiFinal1)
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <Card variant="outlined">
                      <CardContent
                        sx={{ p: { xs: ThemeTokens.spacing.md, md: ThemeTokens.spacing.lg } }}
                      >
                        <Stack spacing={ThemeTokens.spacing.sm}>
                          <Typography variant="caption" color="text.secondary">
                            {data.knockout.semiFinal1.legDates}
                          </Typography>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '1fr auto 1fr',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {renderTeamWithFlag(
                              {
                                name: data.knockout.semiFinal1.home.label,
                                countryCode: 'TBD',
                              },
                              'md',
                              'caption'
                            )}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ textAlign: 'center' }}
                            >
                              vs
                            </Typography>
                            <Box sx={{ justifySelf: 'end' }}>
                              {renderTeamWithFlag(
                                {
                                  name: data.knockout.semiFinal1.away.label,
                                  countryCode: 'TBD',
                                },
                                'md',
                                'caption'
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                              Lịch thi đấu đang chờ công bố chính thức
                            </Typography>
                          </Box>
                        </Stack>
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
                      CHUNG KẾT
                    </Typography>
                    <Box sx={{ width: 26, borderTop: '1px solid #FBBF24' }} />
                  </Box>
                  {renderFinalTieCard(finalLegs, resolveAggregateDisplay(data.knockout.final))}
                </Stack>
              </Box>

              <Box sx={{ gridArea: 'semi2', zIndex: 1 }}>
                <Stack spacing={ThemeTokens.spacing.sm}>
                  <Chip
                    label="BÁN KẾT 2"
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      fontWeight: 700,
                      bgcolor: 'rgba(37, 99, 235, 0.12)',
                      color: '#1E40AF',
                    }}
                  />
                  {semiFinal2Legs.length > 0 ? (
                    semiFinal2Legs.map((fixture) => (
                      <React.Fragment key={fixture.id}>
                        {renderKnockoutLegCard(
                          fixture,
                          resolveAggregateDisplay(data.knockout.semiFinal2)
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <Card variant="outlined">
                      <CardContent
                        sx={{ p: { xs: ThemeTokens.spacing.md, md: ThemeTokens.spacing.lg } }}
                      >
                        <Stack spacing={ThemeTokens.spacing.sm}>
                          <Typography variant="caption" color="text.secondary">
                            {data.knockout.semiFinal2.legDates}
                          </Typography>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '1fr auto 1fr',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {renderTeamWithFlag(
                              {
                                name: data.knockout.semiFinal2.home.label,
                                countryCode: 'TBD',
                              },
                              'md',
                              'caption'
                            )}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ textAlign: 'center' }}
                            >
                              vs
                            </Typography>
                            <Box sx={{ justifySelf: 'end' }}>
                              {renderTeamWithFlag(
                                {
                                  name: data.knockout.semiFinal2.away.label,
                                  countryCode: 'TBD',
                                },
                                'md',
                                'caption'
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                              Lịch thi đấu đang chờ công bố chính thức
                            </Typography>
                          </Box>
                        </Stack>
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
                        alt="Cúp vô địch"
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
                        {translateTeamName(championName)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </PageSection>

      <Divider
        sx={{
          mt: ThemeTokens.spacing.xxxl,
          mb: ThemeTokens.spacing.xxxl,
        }}
      />

      <PageSection title="Bảng xếp hạng" sx={{ mb: ThemeTokens.spacing.xxxl }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: ThemeTokens.spacing.md,
          }}
        >
          {data.groups.map((group) => renderGroupTable(group, data.fixtures.all))}
        </Box>
      </PageSection>

      <Divider
        sx={{
          mt: ThemeTokens.spacing.xxxl,
          mb: ThemeTokens.spacing.xxxl,
        }}
      />

      <PageSection title="Lịch thi đấu" sx={{ mb: ThemeTokens.spacing.xxxl }}>
        <Stack spacing={ThemeTokens.spacing.md}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: ThemeTokens.spacing.md,
            }}
          >
            {renderFixtureList(
              'Các trận đã kết thúc',
              completedFixturesPreview,
              setExpandedFixtureId,
              expandedFixtureId,
              'Chưa có trận đấu nào kết thúc.'
            )}
            {renderFixtureList(
              'Các trận hôm nay',
              todaysFixturesPreview,
              setExpandedFixtureId,
              expandedFixtureId,
              'Hôm nay không có trận đấu.'
            )}
            {renderFixtureList(
              'Các trận sắp tới',
              upcomingFixturesPreview,
              setExpandedFixtureId,
              expandedFixtureId
            )}
          </Box>

          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/asean-cup-2026/fixtures')}
            sx={{ alignSelf: 'flex-start' }}
          >
            Xem toàn bộ lịch thi đấu
          </Button>
        </Stack>
      </PageSection>

      <Divider
        sx={{
          mt: ThemeTokens.spacing.xxxl,
          mb: ThemeTokens.spacing.xxxl,
        }}
      />

      <PageSection
        title="Cầu thủ"
        subtitle="Tìm kiếm, sắp xếp và lọc cầu thủ của giải"
        sx={{ mb: ThemeTokens.spacing.xxxl }}
      >
        <Stack spacing={ThemeTokens.spacing.sm}>
          <FilterBar>
            <SearchInput
              size="small"
              value={search}
              onSearch={(value) => {
                setSearch(value);
                setPlayerPage(0);
              }}
              placeholder="Tìm cầu thủ, đội tuyển hoặc câu lạc bộ"
              sx={{ minWidth: { xs: '100%', md: 280 } }}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={positionFilter}
                onChange={(event) => {
                  setPositionFilter(event.target.value as 'ALL' | TournamentPlayerPosition);
                  setPlayerPage(0);
                }}
                displayEmpty
              >
                <MenuItem value="ALL">Tất cả vị trí</MenuItem>
                <MenuItem value="GK">Thủ môn</MenuItem>
                <MenuItem value="DEF">Hậu vệ</MenuItem>
                <MenuItem value="MID">Tiền vệ</MenuItem>
                <MenuItem value="FWD">Tiền đạo</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 170 }}>
              <Select
                value={nationFilter}
                onChange={(event) => {
                  setNationFilter(event.target.value as 'ALL' | string);
                  setPlayerPage(0);
                }}
                displayEmpty
              >
                <MenuItem value="ALL">Tất cả đội tuyển</MenuItem>
                {nations.map((nation) => (
                  <MenuItem key={nation} value={nation}>
                    {nation}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {filteredPlayers.length} cầu thủ
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
                      Cầu thủ
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Quốc kỳ</TableCell>
                  <TableCell>Câu lạc bộ</TableCell>
                  <TableCell>Vị trí</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'age'}
                      direction={sortBy === 'age' ? sortOrder : 'desc'}
                      onClick={() => handleSort('age')}
                    >
                      Tuổi
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'appearances'}
                      direction={sortBy === 'appearances' ? sortOrder : 'desc'}
                      onClick={() => handleSort('appearances')}
                    >
                      Số trận
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'goals'}
                      direction={sortBy === 'goals' ? sortOrder : 'desc'}
                      onClick={() => handleSort('goals')}
                    >
                      Bàn thắng
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'assists'}
                      direction={sortBy === 'assists' ? sortOrder : 'desc'}
                      onClick={() => handleSort('assists')}
                    >
                      Kiến tạo
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'yellowCards'}
                      direction={sortBy === 'yellowCards' ? sortOrder : 'desc'}
                      onClick={() => handleSort('yellowCards')}
                    >
                      Thẻ vàng
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'redCards'}
                      direction={sortBy === 'redCards' ? sortOrder : 'desc'}
                      onClick={() => handleSort('redCards')}
                    >
                      Thẻ đỏ
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'minutes'}
                      direction={sortBy === 'minutes' ? sortOrder : 'desc'}
                      onClick={() => handleSort('minutes')}
                    >
                      Số phút
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPlayers.map((player) => (
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
                        <Typography variant="body2">
                          {translateTeamName(player.nation.name)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{player.club}</TableCell>
                    <TableCell>{translatePosition(player.position)}</TableCell>
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Trang {visiblePlayerPage + 1} / {playerPageCount}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              disabled={visiblePlayerPage === 0}
              onClick={() => setPlayerPage((page) => Math.max(0, page - 1))}
            >
              Trước
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={visiblePlayerPage >= playerPageCount - 1 || filteredPlayers.length === 0}
              onClick={() => setPlayerPage((page) => Math.min(playerPageCount - 1, page + 1))}
            >
              Sau
            </Button>
          </Box>
        </Stack>
      </PageSection>

      <Divider
        sx={{
          mt: ThemeTokens.spacing.xxxl,
          mb: ThemeTokens.spacing.xxxl,
        }}
      />

      <PageSection
        title="Thống kê giải đấu"
        subtitle="Các cá nhân dẫn đầu và điểm nhấn của giải"
        sx={{ mb: ThemeTokens.spacing.xxxl }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
            },
            gap: ThemeTokens.spacing.lg,
          }}
        >
          {data.statistics
            .filter((stat) => TOURNAMENT_STATISTIC_IDS.has(stat.id))
            .map((stat) => {
              const meta = statisticMetaMap.get(stat.id);
              return renderPremiumStatisticCard(stat, data, meta);
            })}
        </Box>
      </PageSection>
    </PageContent>
  );
};
