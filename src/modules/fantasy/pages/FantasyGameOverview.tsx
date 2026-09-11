import React, { useMemo } from 'react';
import { Alert, Box, Button, Card, CardContent, Divider, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PlayerAvatar } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { getBootstrapRepository, getPlayerRepository } from '@repositories/index';
import { FplConnectionGate, HomeHonoursGrid, PlayerOfWeekStrip } from '../components';
import { getStoredLeagueId } from '../components/FplConnectionGate';
import { useGameweekHubState } from '../context';
import { useEnrichedManagerPicks, useManagerLeagues, useWeeklyHonours } from '../hooks';
import { QuickActions } from '../widgets';
import type { Player } from '@domain/models';

const surface = {
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
  backgroundColor: '#fff',
};

function PlayerSignalList({ title, subtitle, players, mode }: {
  title: string;
  subtitle: string;
  players: Player[];
  mode: 'in' | 'out';
}): React.ReactElement {
  return (
    <Card sx={surface}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Typography variant="h6" sx={{ fontWeight: 850 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{subtitle}</Typography>
        <Stack divider={<Divider flexItem />}>
          {players.map((player) => {
            const transferValue = mode === 'in' ? player.transfersInEvent : player.transfersOutEvent;
            return (
              <Stack key={player.id} direction="row" spacing={1.25} sx={{ py: 1.15, alignItems: 'center' }}>
                <PlayerAvatar playerCode={player.clubCode} photo={player.photo} name={player.displayName} size="small" />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.88rem' }} noWrap>{player.displayName}</Typography>
                  <Typography variant="caption" color="text.secondary">{player.club} · £{player.price.toFixed(1)}m</Typography>
                </Box>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  {mode === 'in' ? <TrendingUpRoundedIcon color="success" fontSize="small" /> : <TrendingDownRoundedIcon color="error" fontSize="small" />}
                  <Typography sx={{ fontWeight: 800, fontSize: '0.82rem' }}>{(transferValue ?? 0).toLocaleString()}</Typography>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, tone = '#0f172a' }: { label: string; value: React.ReactNode; tone?: string }): React.ReactElement {
  return (
    <Box sx={{ p: 1.4, borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ color: tone, fontWeight: 900, fontSize: { xs: '1rem', md: '1.15rem' }, mt: 0.15 }}>{value}</Typography>
    </Box>
  );
}

export const FantasyGameOverview: React.FC = () => {
  const gameState = useGameweekHubState();
  const navigate = useNavigate();
  const bootstrapRepository = useMemo(() => getBootstrapRepository(), []);
  const players = useMemo(() => getPlayerRepository().getAll(), []);
  const latestHistory = gameState.history?.[gameState.history.length - 1] ?? null;
  const leagueIds = useMemo(() => {
    const connected = getStoredLeagueId();
    const joined = gameState.entry?.joinedLeaguesIds ?? [];
    return connected ? [connected, ...joined.filter((id) => id !== connected)] : joined;
  }, [gameState.entry?.joinedLeaguesIds]);
  const performanceGameweek = latestHistory?.event ?? gameState.displayGameweek ?? 1;
  const picks = useEnrichedManagerPicks(gameState.connectedEntryId, performanceGameweek);
  const leagueState = useManagerLeagues(
    gameState.connectedEntryId,
    leagueIds,
    gameState.displayGameweek,
    gameState.entry?.joinedLeagues
  );
  const publicGameweek = gameState.runtimeGameweeks?.find((event) => event.id === performanceGameweek);
  const topTransfersIn = useMemo(() => [...players].sort((a, b) => (b.transfersInEvent ?? 0) - (a.transfersInEvent ?? 0)).slice(0, 5), [players]);
  const topTransfersOut = useMemo(() => [...players].sort((a, b) => (b.transfersOutEvent ?? 0) - (a.transfersOutEvent ?? 0)).slice(0, 5), [players]);
  const upcomingGameweeks = useMemo(() => bootstrapRepository.getBootstrap().gameweeks.filter((gw) => !gw.finished).slice(0, 4), [bootstrapRepository]);
  const currentGameweek = gameState.displayGameweek ?? bootstrapRepository.getCurrentGameweek()?.id ?? 1;
  const weeklyHonours = useWeeklyHonours(performanceGameweek || currentGameweek);

  if (!gameState.isConnected) {
    return (
      <PageContainer>
        <FplConnectionGate title="Connect your FPL team" description="Connect inline to unlock My Team, League, transfers, and personalized gameweek insights." />
        <Alert severity="info" sx={{ mt: ThemeTokens.spacing.sm }}>Your Entry ID identifies your FPL team. You can find it in your FPL URL when viewing your team.</Alert>
      </PageContainer>
    );
  }

  const openGameweek = (): void => {
    void navigate(`/premier-league/gameweek/gameweeks/${currentGameweek}`);
  };

  return (
    <PageContainer sx={{ py: { xs: 2, md: 3 } }}>
      <Stack spacing={{ xs: 2, md: 3 }}>
        <Box sx={{ overflow: 'hidden', borderRadius: '14px', p: { xs: 2.5, md: 3.5 }, color: '#fff', background: 'linear-gradient(120deg, #37003c 0%, #6d0875 55%, #2474c6 120%)', boxShadow: '0 18px 42px rgba(55, 0, 60, 0.22)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.72, letterSpacing: 1.4 }}>FPL command centre</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>{gameState.entry?.team.name}</Typography>
              <Typography sx={{ opacity: 0.82 }}>{gameState.entry?.manager.name} · Gameweek {currentGameweek}</Typography>
            </Box>
            <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={openGameweek} sx={{ alignSelf: { xs: 'flex-start', md: 'center' }, color: '#37003c', backgroundColor: '#fff', fontWeight: 800, textTransform: 'none', '&:hover': { backgroundColor: '#f8fafc' } }}>Open Gameweek Live</Button>
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 0.9fr) minmax(0, 1.1fr)' }, gap: 3, alignItems: 'stretch' }}>
          <Card sx={surface}>
            <Box sx={{ p: 2.25, color: '#fff', background: 'linear-gradient(115deg, #00a8e8, #6634db)' }}>
              <Typography variant="overline" sx={{ opacity: 0.82 }}>Team & Gameweek {performanceGameweek}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>{gameState.entry?.team.name}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.82 }}>{gameState.entry?.manager.name}</Typography>
            </Box>
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, gap: 1.25 }}>
                <Metric label="GW points" value={latestHistory?.points ?? picks.totalPoints} tone="#059669" />
                <Metric label="Average" value={publicGameweek?.average_entry_score ?? '—'} tone="#0878ce" />
                <Metric label="Highest" value={publicGameweek?.highest_score ?? '—'} tone="#7c3aed" />
                <Metric label="Your GW rank" value={latestHistory?.rank ? `#${latestHistory.rank.toLocaleString()}` : '—'} tone="#0878ce" />
                <Metric label="Transfers" value={latestHistory?.transfers ?? picks.transfersMade} />
                <Metric label="Transfer cost" value={(latestHistory?.transfersCost ?? picks.transfersCost) > 0 ? `-${latestHistory?.transfersCost ?? picks.transfersCost}` : '0'} tone={(latestHistory?.transfersCost ?? picks.transfersCost) > 0 ? '#dc2626' : '#0f172a'} />
                <Metric label="Bench points" value={latestHistory?.benchPoints ?? picks.benchPoints} />
                <Metric label="Squad / bank" value={`£${((picks.teamValue || latestHistory?.teamValue || 0) / 10).toFixed(1)}m · £${((picks.bankValue || latestHistory?.bankValue || 0) / 10).toFixed(1)}m`} />
              </Box>
              <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Overall: <b>{gameState.entry?.manager.totalPoints.toLocaleString()} pts</b> · <b>#{gameState.entry?.manager.overallRank?.toLocaleString() ?? '—'}</b></Typography>
                <Button onClick={() => navigate('/premier-league/gameweek/my-team')} endIcon={<ArrowForwardRoundedIcon />} sx={{ textTransform: 'none', fontWeight: 800 }}>Open live room</Button>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={surface}>
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <EmojiEventsRoundedIcon sx={{ color: '#f59e0b' }} />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>League race & deadlines</Typography>
              </Stack>
              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <Select value={leagueState.currentLeagueId ?? ''} onChange={(event) => void leagueState.selectLeague(Number(event.target.value))}>
                  {(leagueState.leagues ?? []).map((league) => <MenuItem key={league.id} value={league.id}>{league.name}</MenuItem>)}
                </Select>
              </FormControl>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.25, mb: 1.25 }}>
                <Metric label="Your league rank" value={leagueState.managerRankInLeague ? `#${leagueState.managerRankInLeague}` : '—'} tone="#0878ce" />
                <Metric label="Managers loaded" value={leagueState.standings?.length ?? 0} />
              </Box>
              <Stack divider={<Divider flexItem />}>
                {upcomingGameweeks.slice(0, 3).map((gw) => <Stack key={gw.id} direction="row" sx={{ py: 1, justifyContent: 'space-between', gap: 2 }}><Typography sx={{ fontWeight: 800, fontSize: '0.86rem' }}>Gameweek {gw.id}</Typography><Typography variant="caption" color="text.secondary">{new Date(gw.deadline).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Typography></Stack>)}
              </Stack>
              <Button fullWidth variant="contained" onClick={() => navigate('/premier-league/gameweek/my-team')} sx={{ mt: 1.5, textTransform: 'none', fontWeight: 800, backgroundColor: '#f59e0b', '&:hover': { backgroundColor: '#d97706' } }}>View league race</Button>
            </CardContent>
          </Card>
        </Box>

        <QuickActions onViewTeam={() => navigate('/premier-league/gameweek/my-team')} onViewGameweek={() => navigate('/premier-league/gameweek/fixtures')} onViewTransfers={() => navigate('/premier-league/gameweek/transfers')} />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>Transfer market pulse</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Live FPL transfer activity from the latest synchronized season data.</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
            <PlayerSignalList title="Most transferred in" subtitle={`Gameweek ${currentGameweek} arrivals`} players={topTransfersIn} mode="in" />
            <PlayerSignalList title="Most transferred out" subtitle={`Gameweek ${currentGameweek} departures`} players={topTransfersOut} mode="out" />
          </Box>
        </Box>

        <PlayerOfWeekStrip
          entries={weeklyHonours.playerOfWeek}
          isLoading={weeklyHonours.isLoading}
          error={weeklyHonours.error}
        />

        <HomeHonoursGrid
          team={weeklyHonours.teamOfWeek}
          availability={weeklyHonours.availability}
          isLoading={weeklyHonours.isLoading}
          error={weeklyHonours.error}
          onOpenTeam={() => navigate('/premier-league/gameweek/fixtures')}
        />

      </Stack>
    </PageContainer>
  );
};
