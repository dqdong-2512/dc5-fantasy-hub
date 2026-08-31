import React, { useMemo } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PlayerAvatar } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { getBootstrapRepository, getPlayerRepository } from '@repositories/index';
import { FplConnectionGate } from '../components';
import { getStoredLeagueId } from '../components/FplConnectionGate';
import { FantasyGameDataAdapter } from '../services';
import { useGameweekHubState } from '../context';
import { useManagerLeagues } from '../hooks';
import { CurrentGameweekSummary, LeagueSnapshot, MyTeamSummary, QuickActions } from '../widgets';
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
  mode: 'in' | 'out' | 'news';
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
                {mode === 'news' ? (
                  <Chip size="small" icon={<WarningAmberRoundedIcon />} label={player.status === 'i' ? 'Injured' : 'Doubtful'} sx={{ color: '#9a3412', backgroundColor: '#ffedd5' }} />
                ) : (
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    {mode === 'in' ? <TrendingUpRoundedIcon color="success" fontSize="small" /> : <TrendingDownRoundedIcon color="error" fontSize="small" />}
                    <Typography sx={{ fontWeight: 800, fontSize: '0.82rem' }}>{(transferValue ?? 0).toLocaleString()}</Typography>
                  </Stack>
                )}
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

export const FantasyGameOverview: React.FC = () => {
  const gameState = useGameweekHubState();
  const navigate = useNavigate();
  const bootstrapRepository = useMemo(() => getBootstrapRepository(), []);
  const players = useMemo(() => getPlayerRepository().getAll(), []);
  const managerData = useMemo(() => gameState.entry ? FantasyGameDataAdapter.entryToManagerFixture(gameState.entry) : null, [gameState.entry]);
  const gameweekData = useMemo(() => {
    if (gameState.history?.length) return FantasyGameDataAdapter.getLatestGameweekFromHistory(gameState.history);
    const current = bootstrapRepository.getCurrentGameweek();
    return current ? FantasyGameDataAdapter.gameweekToFixture(current) : null;
  }, [bootstrapRepository, gameState.history]);
  const leagueIds = useMemo(() => {
    const connected = getStoredLeagueId();
    const joined = gameState.entry?.joinedLeaguesIds ?? [];
    return connected ? [connected, ...joined.filter((id) => id !== connected)] : joined;
  }, [gameState.entry?.joinedLeaguesIds]);
  const leagueState = useManagerLeagues(gameState.connectedEntryId, leagueIds);
  const leagueSnapshot = useMemo(() => ({
    joinedLeagues: (leagueState.leagues ?? []).map((league) => ({ ...league, totalMembers: league.id === leagueState.currentLeagueId ? leagueState.pageSize : 0, rank: league.rank ?? undefined })),
    primaryLeagueId: leagueState.currentLeagueId ?? leagueIds[0],
  }), [leagueIds, leagueState.currentLeagueId, leagueState.leagues, leagueState.pageSize]);
  const topTransfersIn = useMemo(() => [...players].sort((a, b) => (b.transfersInEvent ?? 0) - (a.transfersInEvent ?? 0)).slice(0, 5), [players]);
  const topTransfersOut = useMemo(() => [...players].sort((a, b) => (b.transfersOutEvent ?? 0) - (a.transfersOutEvent ?? 0)).slice(0, 5), [players]);
  const availability = useMemo(() => players.filter((player) => player.status && !['a', 'u'].includes(player.status)).sort((a, b) => b.ownership - a.ownership).slice(0, 5), [players]);
  const upcomingGameweeks = useMemo(() => bootstrapRepository.getBootstrap().gameweeks.filter((gw) => !gw.finished).slice(0, 4), [bootstrapRepository]);

  if (!gameState.isConnected) {
    return (
      <PageContainer>
        <FplConnectionGate title="Connect your FPL team" description="Connect inline to unlock My Team, League, transfers, and personalized gameweek insights." />
        <Alert severity="info" sx={{ mt: ThemeTokens.spacing.sm }}>Your Entry ID identifies your FPL team. You can find it in your FPL URL when viewing your team.</Alert>
      </PageContainer>
    );
  }

  const currentGameweek = gameState.displayGameweek ?? bootstrapRepository.getCurrentGameweek()?.id ?? 1;
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
          {managerData && <MyTeamSummary manager={managerData} onViewTeam={() => navigate('/premier-league/gameweek/my-team')} />}
          {gameweekData && <CurrentGameweekSummary gameweek={gameweekData} onViewGameweek={openGameweek} />}
        </Box>

        <QuickActions onViewTeam={() => navigate('/premier-league/gameweek/my-team')} onViewGameweek={openGameweek} onViewLeagues={() => navigate('/premier-league/gameweek/league')} onViewTransfers={() => navigate('/premier-league/gameweek/transfers')} onViewHistory={() => navigate('/premier-league/gameweek/my-team')} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.8fr 1.2fr' }, gap: 3 }}>
          <Card sx={surface}>
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}><CalendarMonthRoundedIcon sx={{ color: '#7c3aed' }} /><Typography variant="h6" sx={{ fontWeight: 850 }}>Upcoming deadlines</Typography></Stack>
              <Stack divider={<Divider flexItem />}>
                {upcomingGameweeks.map((gw) => <Stack key={gw.id} direction="row" sx={{ py: 1.25, justifyContent: 'space-between' }}><Typography sx={{ fontWeight: 800 }}>Gameweek {gw.id}</Typography><Typography variant="body2" color="text.secondary">{new Date(gw.deadline).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Typography></Stack>)}
              </Stack>
            </CardContent>
          </Card>
          <LeagueSnapshot leagues={leagueSnapshot} onLeagueClick={(id) => navigate(`/premier-league/gameweek/league/${id}`)} />
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>Transfer market pulse</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Live FPL transfer activity from the latest synchronized season data.</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
            <PlayerSignalList title="Most transferred in" subtitle={`Gameweek ${currentGameweek} arrivals`} players={topTransfersIn} mode="in" />
            <PlayerSignalList title="Most transferred out" subtitle={`Gameweek ${currentGameweek} departures`} players={topTransfersOut} mode="out" />
          </Box>
        </Box>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>Latest player updates</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Availability signals from the latest FPL data sync — no editorial placeholders.</Typography>
          <PlayerSignalList title="Availability watch" subtitle="Popular players currently flagged by FPL" players={availability} mode="news" />
        </Box>
      </Stack>
    </PageContainer>
  );
};
