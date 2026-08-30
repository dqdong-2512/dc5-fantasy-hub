import React, { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { ThemeTokens } from '@shared/theme/tokens';
import {
  CaptainBadge,
  ClubLogo,
  DataFreshnessIndicator,
  LiveStatusBadge as GameweekStatusBadge,
  PageContainer,
  PlayerAvatar,
  PointsChangeIndicator,
} from '@shared/components';
import { useNavigate } from 'react-router-dom';
import { useGameweekHubState } from '../context';
import { useLiveMatchCenter } from '../hooks';
import type {
  LiveLeagueRow,
  LiveStatusBadge,
  MatchCenterFixture,
  MatchOwnedPlayerLive,
  MatchTimelineEvent,
} from '../services';

const BADGE_CONFIG: Record<
  LiveStatusBadge,
  {
    label: string;
    color: string;
    textColor: string;
  }
> = {
  upcoming: { label: 'Upcoming', color: '#dbeafe', textColor: '#1d4ed8' },
  live: { label: 'Live', color: '#fee2e2', textColor: '#b91c1c' },
  ht: { label: 'HT', color: '#fef3c7', textColor: '#92400e' },
  ft: { label: 'FT', color: '#dcfce7', textColor: '#166534' },
  postponed: { label: 'Postponed', color: '#f3f4f6', textColor: '#374151' },
  suspended: { label: 'Suspended', color: '#fce7f3', textColor: '#9d174d' },
};

const TIMELINE_ICONS: Record<MatchTimelineEvent['type'], string> = {
  goal: '⚽',
  assist: '🅰',
  yellow: '🟨',
  red: '🟥',
  substitution: '🔄',
  own_goal: '❌',
  penalty_scored: '⚽',
  penalty_missed: '❌',
  var: 'VAR',
  bonus_change: '⭐',
};

export const LiveMatchCenterPage: React.FC<{ gameweekId?: number }> = ({ gameweekId }) => {
  const gameState = useGameweekHubState();
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  const connectedLeagueId = useMemo(() => {
    if (!gameState.entry || !gameState.entry.joinedLeaguesIds.length) {
      return null;
    }
    return gameState.entry.joinedLeaguesIds[0];
  }, [gameState.entry]);

  const {
    snapshot,
    selectedClubPanel,
    selectedPlayerPanel,
    selectedClubId,
    selectedPlayerId,
    isLoading,
    isRefreshing,
    error,
    refresh,
    selectClub,
    selectPlayer,
  } = useLiveMatchCenter({
    gameweekId: gameweekId ?? gameState.displayGameweek ?? undefined,
    connectedEntryId: gameState.connectedEntryId,
    connectedLeagueId,
    autoRefresh,
  });

  const fixtureGroups = useMemo(() => {
    if (!snapshot) return [];
    const groups = new Map<string, MatchCenterFixture[]>();
    snapshot.fixtures.forEach((fixture) => {
      const timestamp = new Date(fixture.kickoffTime);
      const key = Number.isNaN(timestamp.getTime())
        ? 'Schedule pending'
        : timestamp.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          });
      groups.set(key, [...(groups.get(key) ?? []), fixture]);
    });
    return [...groups.entries()];
  }, [snapshot]);

  if (isLoading && !snapshot) {
    return <LiveMatchCenterSkeleton />;
  }

  if (!snapshot) {
    return (
      <Box sx={{ p: ThemeTokens.spacing.md }}>
        <Alert
          severity="error"
          action={
            <Button onClick={() => void refresh()} color="inherit" size="small">
              Retry
            </Button>
          }
        >
          {error ?? 'Live gameweek data is temporarily unavailable.'}
        </Alert>
      </Box>
    );
  }

  return (
    <PageContainer sx={{ py: ThemeTokens.spacing.md }}>
      <Stack spacing={ThemeTokens.spacing.lg}>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '14px',
            p: { xs: 2.5, md: 3.5 },
            color: '#fff',
            background: 'linear-gradient(125deg, #37003c 0%, #6d0875 50%, #087cc1 125%)',
            boxShadow: '0 18px 42px rgba(55, 0, 60, 0.18)',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 240,
              height: 240,
              borderRadius: '50%',
              right: -70,
              top: -140,
              bgcolor: 'rgba(255,255,255,.10)',
            },
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ position: 'relative', zIndex: 1, justifyContent: 'space-between' }}
          >
            <Box>
              <GameweekStatusBadge status={snapshot.header.phase} />
              <Typography variant="overline" sx={{ display: 'block', mt: 1.5, opacity: 0.78 }}>
                Fantasy Premier League · Matchday
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 900, fontSize: { xs: '2.2rem', md: '3.2rem' } }}
              >
                Gameweek {snapshot.header.currentGameweek}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.86 }}>
                Deadline {formatDateTime(snapshot.header.deadlineIso)}
              </Typography>
            </Box>
            <Stack
              sx={{
                alignItems: { xs: 'flex-start', md: 'flex-end' },
                justifyContent: 'space-between',
              }}
            >
              <DataFreshnessIndicator
                updatedAt={snapshot.header.lastSyncIso}
                delayed={Boolean(error) || snapshot.liveLeague.dataStatus === 'STALE'}
              />
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RefreshIcon />}
                onClick={() => void refresh()}
                disabled={isRefreshing}
                sx={{ mt: 2 }}
              >
                {isRefreshing ? 'Refreshing…' : 'Refresh live data'}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {error && <Alert severity="warning">{error}</Alert>}
        <GameweekPhaseMessage
          phase={snapshot.header.phase}
          matchesLive={snapshot.header.matchesLive}
        />

        {snapshot.manager && (
          <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ justifyContent: 'space-between' }}
              >
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    My Team live
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {snapshot.manager.teamName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {snapshot.manager.managerName}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(4, minmax(100px, 1fr))',
                    },
                    gap: 2,
                  }}
                >
                  <ManagerMetric
                    label="Live points"
                    value={<PointsChangeIndicator value={snapshot.manager.gameweekPoints} />}
                  />
                  <ManagerMetric label="Total points" value={snapshot.manager.overallPoints} />
                  <ManagerMetric
                    label="Overall rank"
                    value={formatRank(snapshot.manager.overallRank)}
                  />
                  <ManagerMetric label="Live rank" value={formatRank(snapshot.manager.liveRank)} />
                  <ManagerMetric
                    label="Transfer cost"
                    value={
                      snapshot.manager.transferCost ? `-${snapshot.manager.transferCost}` : '0'
                    }
                  />
                  <ManagerMetric
                    label="Active chip"
                    value={formatChip(snapshot.manager.activeChip)}
                  />
                  <ManagerMetric
                    label="Team value"
                    value={formatMoney(snapshot.manager.teamValue)}
                  />
                  <ManagerMetric label="Bank" value={formatMoney(snapshot.manager.bank)} />
                  <ManagerMetric
                    label="Captain"
                    value={snapshot.manager.captainName ?? 'Unavailable'}
                  />
                  <ManagerMetric
                    label="Vice captain"
                    value={snapshot.manager.viceCaptainName ?? 'Unavailable'}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent sx={{ p: ThemeTokens.spacing.sm }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={ThemeTokens.spacing.sm}
              sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
            >
              <Stack
                direction="row"
                spacing={ThemeTokens.spacing.sm}
                sx={{ alignItems: 'center', flexWrap: 'wrap' }}
              >
                <HeaderStat label="GW" value={`${snapshot.header.currentGameweek}`} />
                <HeaderStat label="Finished" value={`${snapshot.header.matchesFinished}`} />
                <HeaderStat
                  label="Live"
                  value={`${snapshot.header.matchesLive}`}
                  accent="#dc2626"
                />
                <HeaderStat label="Remaining" value={`${snapshot.header.matchesRemaining}`} />
                <HeaderStat
                  label="Avg"
                  value={
                    snapshot.header.averageScore !== null
                      ? snapshot.header.averageScore.toFixed(1)
                      : '—'
                  }
                />
                <HeaderStat
                  label="High"
                  value={
                    snapshot.header.highestScore !== null ? `${snapshot.header.highestScore}` : '—'
                  }
                />
                <HeaderStat label="Deadline" value={snapshot.header.deadlineCountdownLabel} />
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Tooltip title="Adaptive background refresh while matches are live">
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Auto
                    </Typography>
                    <Switch
                      size="small"
                      checked={autoRefresh}
                      onChange={(_event, value) => setAutoRefresh(value)}
                    />
                  </Stack>
                </Tooltip>
              </Stack>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Last sync{' '}
              {new Date(snapshot.header.lastSyncIso).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
              {snapshot.changedResources.length > 0
                ? ` • Updated: ${snapshot.changedResources.length}`
                : ''}
            </Typography>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.55fr 1fr' },
            gap: ThemeTokens.spacing.md,
          }}
        >
          <Stack spacing={ThemeTokens.spacing.sm}>
            {fixtureGroups.length === 0 ? (
              <Alert severity="info">No fixtures are currently available for this gameweek.</Alert>
            ) : (
              fixtureGroups.map(([date, fixtures]) => (
                <Box key={date}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                    {date}
                  </Typography>
                  <Stack spacing={1.25}>
                    {fixtures.map((fixture) => (
                      <FixtureCard
                        key={fixture.id}
                        fixture={fixture}
                        onSelectClub={selectClub}
                        onSelectPlayer={selectPlayer}
                        selectedClubId={selectedClubId}
                        selectedPlayerId={selectedPlayerId}
                      />
                    ))}
                  </Stack>
                </Box>
              ))
            )}
          </Stack>

          <Stack spacing={ThemeTokens.spacing.sm}>
            <Card>
              <CardContent sx={{ p: ThemeTokens.spacing.sm }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Live Team View
                </Typography>
                {!snapshot.liveTeam ? (
                  <Alert severity="info">
                    {gameState.isConnected
                      ? 'Manager picks are not available for this gameweek yet. They normally appear after the deadline.'
                      : 'Connect your team to see live points, captaincy and bench impact.'}
                  </Alert>
                ) : (
                  <LiveTeamPanel
                    liveTeam={snapshot.liveTeam}
                    onSelectPlayer={selectPlayer}
                    selectedPlayerId={selectedPlayerId}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: ThemeTokens.spacing.sm }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Live League Race
                </Typography>
                {snapshot.liveLeague.rows.length === 0 ? (
                  <Alert severity="info">
                    Connect a mini-league to view live ranking movement.
                  </Alert>
                ) : (
                  <LiveLeagueTable rows={snapshot.liveLeague.rows.slice(0, 5)} />
                )}
                {snapshot.liveLeague.rows.length > 0 && (
                  <Button
                    size="small"
                    sx={{ mt: 1, textTransform: 'none' }}
                    onClick={() => navigate('/premier-league/gameweek/league')}
                  >
                    View Full League
                  </Button>
                )}
              </CardContent>
            </Card>

            {selectedClubPanel && (
              <Card>
                <CardContent sx={{ p: ThemeTokens.spacing.sm }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    {selectedClubPanel.clubName} Live
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Formation {selectedClubPanel.formation} • Form {selectedClubPanel.form} • Pos{' '}
                    {selectedClubPanel.leaguePosition ?? '—'}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Upcoming
                  </Typography>
                  <Typography variant="body2">
                    {selectedClubPanel.upcomingFixtures.join(' • ') || 'No data'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    Possession {selectedClubPanel.matchStats.possession ?? '—'}% • Shots{' '}
                    {selectedClubPanel.matchStats.shots ?? '—'} • xG{' '}
                    {selectedClubPanel.matchStats.xg ?? '—'} • Corners{' '}
                    {selectedClubPanel.matchStats.corners ?? '—'} • Cards{' '}
                    {selectedClubPanel.matchStats.cards}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {selectedPlayerPanel && (
              <Card>
                <CardContent sx={{ p: ThemeTokens.spacing.sm }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <PlayerAvatar
                      playerCode={selectedPlayerPanel.playerCode}
                      name={selectedPlayerPanel.playerName}
                      size="small"
                    />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {selectedPlayerPanel.playerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedPlayerPanel.teamShortName}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    Live {selectedPlayerPanel.livePoints} • Season{' '}
                    {selectedPlayerPanel.seasonPoints} • Ownership{' '}
                    {selectedPlayerPanel.ownership.toFixed(1)}% • Price{' '}
                    {selectedPlayerPanel.price.toFixed(1)}m
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    Form {selectedPlayerPanel.recentForm.toFixed(1)} • Transfer trend{' '}
                    {selectedPlayerPanel.transferTrend ?? '—'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    Fixtures{' '}
                    {selectedPlayerPanel.upcomingFixtures.join(' • ') || 'No upcoming fixtures'}
                  </Typography>
                  {selectedPlayerPanel.captainOwnership && (
                    <Chip
                      label={selectedPlayerPanel.captainOwnership}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </Stack>
        </Box>
      </Stack>
    </PageContainer>
  );
};

function HeaderStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}): React.ReactElement {
  return (
    <Box
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: 1,
        px: 1,
        py: 0.5,
        minWidth: 72,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: accent ?? 'inherit' }}>
        {value}
      </Typography>
    </Box>
  );
}

function ManagerMetric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}): React.ReactElement {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ fontWeight: 850, overflowWrap: 'anywhere' }}>{value}</Box>
    </Box>
  );
}

function GameweekPhaseMessage({
  phase,
  matchesLive,
}: {
  phase: 'PRESEASON' | 'PRE_DEADLINE' | 'LOCKED' | 'LIVE' | 'PROVISIONAL' | 'FINAL';
  matchesLive: number;
}): React.ReactElement | null {
  if (phase === 'LIVE' && matchesLive > 0) return null;
  const messages = {
    PRESEASON:
      'The season has not started yet. Fixtures and squad information are ready for planning.',
    PRE_DEADLINE: 'Gameweek has not started yet. Live scores will appear after the deadline.',
    LOCKED:
      'The deadline has passed. Team selections are locked while the first matches prepare to start.',
    LIVE: 'No matches are currently live.',
    PROVISIONAL:
      'All matches are finished. Points and ranks remain provisional while FPL completes checks.',
    FINAL: 'This gameweek is complete and the displayed scores are final.',
  } as const;
  return <Alert severity={phase === 'FINAL' ? 'success' : 'info'}>{messages[phase]}</Alert>;
}

function formatDateTime(value: string | null): string {
  if (!value) return 'to be confirmed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'to be confirmed';
  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatKickoff(value: string | null): string {
  if (!value) return 'Kickoff TBC';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Kickoff TBC';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatRank(value: number | null): string {
  return value === null || !Number.isFinite(value) ? 'Not ranked' : `#${value.toLocaleString()}`;
}

function formatChip(value: string | null): string {
  if (!value) return 'None';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMoney(value: number | null): string {
  return value === null || !Number.isFinite(value) ? 'Unavailable' : `£${(value / 10).toFixed(1)}m`;
}

function FixtureCard({
  fixture,
  onSelectClub,
  onSelectPlayer,
  selectedClubId,
  selectedPlayerId,
}: {
  fixture: MatchCenterFixture;
  onSelectClub: (clubId: number | null) => void;
  onSelectPlayer: (playerId: number | null) => void;
  selectedClubId: number | null;
  selectedPlayerId: number | null;
}): React.ReactElement {
  const badge = BADGE_CONFIG[fixture.status];
  const isClubSelected =
    selectedClubId === fixture.homeTeamId || selectedClubId === fixture.awayTeamId;

  return (
    <Card sx={{ border: isClubSelected ? '1px solid #2563eb' : '1px solid transparent' }}>
      <CardContent sx={{ p: ThemeTokens.spacing.sm }}>
        <Stack spacing={1}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                label={badge.label}
                size="small"
                sx={{ backgroundColor: badge.color, color: badge.textColor, fontWeight: 700 }}
              />
              <Typography variant="caption" color="text.secondary">
                {formatKickoff(fixture.kickoffTime)}
              </Typography>
              {fixture.elapsedMinute !== null && fixture.elapsedMinute > 0 && (
                <Chip
                  icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />}
                  label={`${fixture.elapsedMinute}${fixture.stoppageTime ? `+${fixture.stoppageTime}` : ''}'`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button size="small" onClick={() => onSelectClub(fixture.homeTeamId)}>
                {selectedClubId === fixture.homeTeamId ? 'Home Selected' : 'Home Club'}
              </Button>
              <Button size="small" onClick={() => onSelectClub(fixture.awayTeamId)}>
                {selectedClubId === fixture.awayTeamId ? 'Away Selected' : 'Away Club'}
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <ClubBlock
              code={fixture.homeTeamCode}
              name={fixture.homeTeamName}
              shortName={fixture.homeTeamShortName}
            />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {fixture.homeScore ?? '—'} : {fixture.awayScore ?? '—'}
            </Typography>
            <ClubBlock
              code={fixture.awayTeamCode}
              name={fixture.awayTeamName}
              shortName={fixture.awayTeamShortName}
              align="right"
            />
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Match status · {fixture.period}
          </Typography>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Match activity
            </Typography>
            {fixture.timeline.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No events yet.
              </Typography>
            ) : (
              <Stack spacing={0.5}>
                {fixture.timeline.slice(0, 6).map((event) => (
                  <Stack key={event.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ width: 34, fontWeight: 700 }}>
                      {event.minute !== null ? `${event.minute}'` : '—'}
                    </Typography>
                    <Typography variant="caption" sx={{ width: 22 }}>
                      {TIMELINE_ICONS[event.type]}
                    </Typography>
                    <Typography variant="caption" sx={{ minWidth: 60, color: 'text.secondary' }}>
                      {event.teamShortName}
                    </Typography>
                    <Typography variant="body2">
                      {event.playerName} • {event.label}
                      {event.quantity > 1 ? ` x${event.quantity}` : ''}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Your Players In This Match
            </Typography>
            {fixture.ownedPlayers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No owned players in this fixture.
              </Typography>
            ) : (
              <Stack spacing={0.5}>
                {fixture.ownedPlayers.map((owned) => (
                  <OwnedPlayerRow
                    key={owned.playerId}
                    row={owned}
                    onSelectPlayer={onSelectPlayer}
                    selected={selectedPlayerId === owned.playerId}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ClubBlock({
  code,
  name,
  shortName,
  align = 'left',
}: {
  code: number;
  name: string;
  shortName: string;
  align?: 'left' | 'right';
}): React.ReactElement {
  return (
    <Stack
      direction={align === 'right' ? 'row-reverse' : 'row'}
      spacing={1}
      sx={{ alignItems: 'center', minWidth: { xs: 0, sm: 150 }, maxWidth: '42%' }}
    >
      <ClubLogo teamCode={code} clubName={name} size="medium" />
      <Box sx={{ textAlign: align }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {shortName}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          {name}
        </Typography>
      </Box>
    </Stack>
  );
}

function OwnedPlayerRow({
  row,
  onSelectPlayer,
  selected,
}: {
  row: MatchOwnedPlayerLive;
  onSelectPlayer: (playerId: number | null) => void;
  selected: boolean;
}): React.ReactElement {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        p: 0.5,
        borderRadius: 1,
        backgroundColor: selected ? '#eff6ff' : 'transparent',
      }}
    >
      <Button
        size="small"
        sx={{ minWidth: 0, px: 0.5 }}
        onClick={() => onSelectPlayer(row.playerId)}
      >
        {row.playerName}
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 38 }}>
        {row.teamShortName}
      </Typography>
      {(row.isCaptain || row.isViceCaptain) && (
        <Chip label={row.isCaptain ? 'C' : 'VC'} size="small" sx={{ height: 20 }} />
      )}
      {row.isBench && <Chip label="Bench" size="small" variant="outlined" sx={{ height: 20 }} />}
      <Typography variant="caption" color="text.secondary">
        Min {row.minutes}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        {row.currentPoints} pts
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Proj {row.projectedPoints}
      </Typography>
      {row.bonusPending > 0 && (
        <Chip label={`+${row.bonusPending} bonus`} size="small" sx={{ height: 20 }} />
      )}
    </Stack>
  );
}

function LiveTeamPanel({
  liveTeam,
  onSelectPlayer,
  selectedPlayerId,
}: {
  liveTeam: NonNullable<ReturnType<typeof useLiveMatchCenter>['snapshot']>['liveTeam'];
  onSelectPlayer: (playerId: number | null) => void;
  selectedPlayerId: number | null;
}): React.ReactElement {
  if (!liveTeam) {
    return <Alert severity="info">No live team data</Alert>;
  }

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <HeaderStat label="Current" value={`${liveTeam.currentPoints}`} />
        <HeaderStat label="Projected" value={`${liveTeam.projectedPoints}`} />
        <HeaderStat label="Bonus Pending" value={`${liveTeam.bonusPending}`} />
        <HeaderStat label="Captain" value={`${liveTeam.captainMultiplierPoints}`} />
        <HeaderStat label="Bench" value={`${liveTeam.benchPoints}`} />
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Autosub prediction:{' '}
        {liveTeam.autosubPrediction.length > 0
          ? liveTeam.autosubPrediction.join(' • ')
          : 'No autosubs predicted'}
      </Typography>

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Starters
      </Typography>
      <CompactPlayerGrid
        players={liveTeam.starters}
        onSelectPlayer={onSelectPlayer}
        selectedPlayerId={selectedPlayerId}
      />

      <Typography variant="caption" color="text.secondary">
        Bench
      </Typography>
      <CompactPlayerGrid
        players={liveTeam.bench}
        onSelectPlayer={onSelectPlayer}
        selectedPlayerId={selectedPlayerId}
      />
    </Stack>
  );
}

function CompactPlayerGrid({
  players,
  onSelectPlayer,
  selectedPlayerId,
}: {
  players: Array<{
    playerId: number;
    playerName: string;
    playerCode: number;
    teamShortName: string;
    positionLabel: string;
    isCaptain: boolean;
    isViceCaptain: boolean;
    isBench: boolean;
    multiplier: number;
    minutes: number;
    livePoints: number;
    expectedPoints: number;
    bonusPending: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    status: LiveStatusBadge;
    currentFixture: string;
    remainingFixture: string;
  }>;
  onSelectPlayer: (playerId: number | null) => void;
  selectedPlayerId: number | null;
}): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 0.75,
      }}
    >
      {players.map((player) => (
        <Stack
          key={player.playerId}
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            border:
              selectedPlayerId === player.playerId ? '1px solid #2563eb' : '1px solid #e5e7eb',
            borderRadius: 1,
            px: 1,
            py: 0.75,
          }}
        >
          <PlayerAvatar playerCode={player.playerCode} name={player.playerName} size="small" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Button
              size="small"
              sx={{ minWidth: 0, px: 0, justifyContent: 'flex-start', textTransform: 'none' }}
              onClick={() => onSelectPlayer(player.playerId)}
            >
              {player.playerName}
            </Button>
            <Typography variant="caption" color="text.secondary" noWrap>
              {player.positionLabel} • {player.teamShortName} • {player.currentFixture}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {player.status === 'ft'
                ? 'FT'
                : player.status === 'ht'
                  ? 'HT'
                  : player.status === 'live'
                    ? 'LIVE'
                    : 'Upcoming'}{' '}
              • x{player.multiplier} • Min {player.minutes}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              G/A {player.goals}/{player.assists} • Cards {player.yellowCards + player.redCards} •{' '}
              {player.remainingFixture}
            </Typography>
          </Box>
          <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
            <CaptainBadge captain={player.isCaptain} viceCaptain={player.isViceCaptain} />
            {player.isBench && (
              <Chip
                label={player.multiplier > 0 ? 'Bench Boost' : 'Bench'}
                size="small"
                variant="outlined"
                sx={{ height: 22 }}
              />
            )}
            <PointsChangeIndicator value={player.livePoints} />
          </Stack>
        </Stack>
      ))}
    </Box>
  );
}

function LiveLeagueTable({ rows }: { rows: LiveLeagueRow[] }): React.ReactElement {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell>Manager</TableCell>
            <TableCell align="right">GW</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="center">Move</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.slice(0, 25).map((row) => (
            <TableRow
              key={row.entryId}
              sx={{ backgroundColor: row.isConnectedManager ? '#eff6ff' : 'transparent' }}
            >
              <TableCell>
                #{row.liveRank}
                {row.isHighestScorer && (
                  <Tooltip title="Highest current gameweek scorer">
                    <EmojiEventsIcon sx={{ ml: 0.5, fontSize: 14, color: '#ca8a04' }} />
                  </Tooltip>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: row.isConnectedManager ? 700 : 500 }}>
                  {row.managerName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.teamName}
                </Typography>
              </TableCell>
              <TableCell align="right">{row.gameweekPoints}</TableCell>
              <TableCell align="right">{row.totalPoints}</TableCell>
              <TableCell align="center">
                {row.rankMovement > 0 && (
                  <Chip
                    icon={<ArrowUpwardIcon />}
                    label={`+${row.rankMovement}`}
                    size="small"
                    color="success"
                  />
                )}
                {row.rankMovement < 0 && (
                  <Chip
                    icon={<ArrowDownwardIcon />}
                    label={`${row.rankMovement}`}
                    size="small"
                    color="error"
                  />
                )}
                {row.rankMovement === 0 && (
                  <Chip icon={<DragHandleIcon />} label="0" size="small" variant="outlined" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function LiveMatchCenterSkeleton(): React.ReactElement {
  return (
    <Stack spacing={ThemeTokens.spacing.md} sx={{ p: ThemeTokens.spacing.sm }}>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={1}>
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={`header-skeleton-${index}`} variant="rounded" width={90} height={48} />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.55fr 1fr' },
          gap: ThemeTokens.spacing.md,
        }}
      >
        <Stack spacing={ThemeTokens.spacing.sm}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={`fixture-skeleton-${index}`}>
              <CardContent>
                <Skeleton variant="text" width="35%" />
                <Skeleton variant="text" width="75%" />
                <Skeleton variant="rounded" height={90} />
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Stack spacing={ThemeTokens.spacing.sm}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="rounded" height={140} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="45%" />
              <Skeleton variant="rounded" height={220} />
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
