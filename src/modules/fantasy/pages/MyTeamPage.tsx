import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import { useNavigate } from 'react-router-dom';
import { getBootstrapRepository } from '@repositories/index';
import { Bench, FootballPitch, PlayerDetailsDialog } from '../components';
import { getStoredLeagueId } from '../components/FplConnectionGate';
import { useGameweekHubState } from '../context';
import { useEnrichedManagerPicks, useManagerLeagues } from '../hooks';

interface WorkspaceSquadPlayer {
  playerId: number;
  isStarter: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  gameweekPoints: number;
  benchOrder?: number;
}

function formatChipName(chip: string | null): string | null {
  if (!chip) return null;
  const labels: Record<string, string> = {
    bboost: 'Bench Boost',
    '3xc': 'Triple Captain',
    freehit: 'Free Hit',
    wildcard: 'Wildcard',
  };
  return labels[chip.toLowerCase()] ?? chip;
}

function formatChipShort(chip: string | null | undefined): string | null {
  if (!chip) return null;
  const labels: Record<string, string> = {
    bboost: 'BB',
    '3xc': 'TC',
    freehit: 'FH',
    wildcard: 'WC',
  };
  return labels[chip.toLowerCase()] ?? chip.toUpperCase();
}

function toWorkspaceSquad(
  picks: ReturnType<typeof useEnrichedManagerPicks>
): WorkspaceSquadPlayer[] {
  return (
    picks.enrichedPicks?.picks.map((pick) => ({
      playerId: pick.element,
      isStarter: pick.position <= 11,
      isCaptain: pick.isCaptain,
      isViceCaptain: pick.isViceCaptain,
      gameweekPoints: pick.playerEffectivePoints,
      benchOrder: pick.position > 11 ? pick.position - 12 : undefined,
    })) ?? []
  );
}

export const MyTeamPage: React.FC = () => {
  const navigate = useNavigate();
  const gameState = useGameweekHubState();
  const [manualGameweek, setManualGameweek] = useState<number | null>(null);
  const [selectedOpponentId, setSelectedOpponentId] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [standingSort, setStandingSort] = useState<{
    key: 'gw' | 'total';
    direction: 'asc' | 'desc';
  }>({ key: 'gw', direction: 'desc' });
  const displayGameweek = manualGameweek ?? gameState.displayGameweek;
  const myPicks = useEnrichedManagerPicks(gameState.connectedEntryId, displayGameweek);

  const leagueIds = useMemo(() => {
    const joined = gameState.entry?.joinedLeaguesIds ?? [];
    const preferred = getStoredLeagueId();
    return preferred ? [preferred, ...joined.filter((id) => id !== preferred)] : joined;
  }, [gameState.entry?.joinedLeaguesIds]);
  const league = useManagerLeagues(
    gameState.connectedEntryId,
    leagueIds,
    displayGameweek,
    gameState.entry?.joinedLeagues
  );
  const opponents =
    league.standings?.filter((row) => row.entryId !== gameState.connectedEntryId) ?? [];
  const myStanding =
    league.standings?.find((row) => row.entryId === gameState.connectedEntryId) ?? null;
  const opponent =
    opponents.find((row) => row.entryId === selectedOpponentId) ?? opponents[0] ?? null;
  const rivalPicks = useEnrichedManagerPicks(opponent?.entryId ?? null, displayGameweek);

  const bootstrapRepo = useMemo(() => getBootstrapRepository(), []);
  const gameweeks = useMemo(() => {
    try {
      return bootstrapRepo.getBootstrap().gameweeks;
    } catch {
      return [];
    }
  }, [bootstrapRepo]);
  const selectedGameweekFinished =
    gameweeks.find((gameweek) => gameweek.id === displayGameweek)?.finished ?? false;
  const mySquad = toWorkspaceSquad(myPicks);
  const rivalSquad = toWorkspaceSquad(rivalPicks);
  const visiblePicks = [
    ...(myPicks.enrichedPicks?.picks ?? []),
    ...(rivalPicks.enrichedPicks?.picks ?? []),
  ];
  const selectedPick = visiblePicks.find((pick) => pick.element === selectedPlayerId) ?? null;
  const sortedStandings = useMemo(() => {
    const multiplier = standingSort.direction === 'asc' ? 1 : -1;
    return [...(league.standings ?? [])].sort((left, right) => {
      const leftValue = standingSort.key === 'gw' ? left.eventPoints : left.totalPoints;
      const rightValue = standingSort.key === 'gw' ? right.eventPoints : right.totalPoints;
      return (leftValue - rightValue) * multiplier || left.rank - right.rank;
    });
  }, [league.standings, standingSort]);

  const toggleStandingSort = (key: 'gw' | 'total') => {
    setStandingSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const moveGameweek = (offset: number) => {
    if (!displayGameweek) return;
    const ids = gameweeks.map((gameweek) => gameweek.id).sort((a, b) => a - b);
    const next = ids[ids.indexOf(displayGameweek) + offset];
    if (next) setManualGameweek(next);
  };

  if (gameState.isLoading)
    return (
      <Box sx={{ minHeight: 420, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ width: '100%', minWidth: 0, py: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            color: '#fff',
            background: 'linear-gradient(115deg, #37003c, #6d0875 58%, #007a57)',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/premier-league/home')}
                sx={{ color: 'rgba(255,255,255,.76)', p: 0, mb: 1, textTransform: 'none' }}
              >
                Back to Home
              </Button>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                Squad & league live room
              </Typography>
              <Typography sx={{ opacity: 0.76 }}>
                Compare your Gameweek team with any manager in one compact workspace.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <IconButton
                aria-label="Previous gameweek"
                onClick={() => moveGameweek(-1)}
                sx={{ color: '#fff' }}
              >
                <KeyboardArrowLeftIcon />
              </IconButton>
              <FormControl size="small" sx={{ minWidth: 136 }}>
                <Select
                  value={displayGameweek ?? ''}
                  onChange={(event) => setManualGameweek(Number(event.target.value))}
                  sx={{ bgcolor: '#fff', fontWeight: 800 }}
                >
                  {gameweeks.map((gw) => (
                    <MenuItem key={gw.id} value={gw.id}>
                      Gameweek {gw.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton
                aria-label="Next gameweek"
                onClick={() => moveGameweek(1)}
                sx={{ color: '#fff' }}
              >
                <KeyboardArrowRightIcon />
              </IconButton>
              <Button
                variant="outlined"
                startIcon={<SwapCallsIcon />}
                onClick={() => navigate('/premier-league/gameweek/transfers')}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,.45)',
                  textTransform: 'none',
                }}
              >
                Transfers
              </Button>
            </Stack>
          </Stack>
        </Box>

        {(myPicks.error || league.error) && (
          <Alert severity="warning">{myPicks.error ?? league.error}</Alert>
        )}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '480px minmax(0, 1fr)' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              position: { lg: 'sticky' },
              top: { lg: 16 },
            }}
          >
            <Box sx={{ p: 1.5, bgcolor: '#151d35', color: '#fff' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <FormControl size="small" fullWidth>
                  <Select
                    value={league.currentLeagueId ?? ''}
                    displayEmpty
                    onChange={(event) => void league.selectLeague(Number(event.target.value))}
                    sx={{
                      color: '#fff',
                      fontWeight: 800,
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,.24)' },
                      '.MuiSvgIcon-root': { color: '#fff' },
                    }}
                  >
                    {(league.leagues ?? []).map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {league.dataStatus && (
                  <Chip
                    size="small"
                    label={
                      league.dataStatus !== 'LIVE'
                        ? 'Cached ranking'
                        : selectedGameweekFinished
                          ? 'Final ranking'
                          : 'Live ranking'
                    }
                    sx={{
                      flexShrink: 0,
                      bgcolor: league.dataStatus === 'LIVE' ? '#00ff87' : '#ffd166',
                      fontWeight: 800,
                    }}
                  />
                )}
              </Stack>
            </Box>
            <Box sx={{ maxHeight: { xs: 320, lg: 650 }, overflowY: 'auto' }}>
              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  display: 'grid',
                  gridTemplateColumns: '36px minmax(0, 1fr) 58px 66px',
                  gap: 1,
                  alignItems: 'center',
                  px: 1.25,
                  py: 0.75,
                  bgcolor: '#f1f4f9',
                  borderBottom: '1px solid #dce2ea',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  #
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  Manager
                </Typography>
                <Button
                  size="small"
                  onClick={() => toggleStandingSort('gw')}
                  sx={{ minWidth: 0, p: 0, fontSize: 11, fontWeight: 900 }}
                >
                  GW{' '}
                  {standingSort.key === 'gw' ? (standingSort.direction === 'desc' ? '↓' : '↑') : ''}
                </Button>
                <Button
                  size="small"
                  onClick={() => toggleStandingSort('total')}
                  sx={{ minWidth: 0, p: 0, fontSize: 11, fontWeight: 900 }}
                >
                  Total{' '}
                  {standingSort.key === 'total'
                    ? standingSort.direction === 'desc'
                      ? '↓'
                      : '↑'
                    : ''}
                </Button>
              </Box>
              {league.isLoadingStandings && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              {sortedStandings.map((row, rowIndex) => {
                const mine = row.entryId === gameState.connectedEntryId;
                const selected = row.entryId === opponent?.entryId;
                return (
                  <Box
                    key={row.entryId}
                    component="button"
                    type="button"
                    disabled={mine}
                    onClick={() => setSelectedOpponentId(row.entryId)}
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '36px minmax(0, 1fr) 58px 66px',
                      gap: 1,
                      alignItems: 'center',
                      p: 1.1,
                      border: 0,
                      borderBottom: '1px solid #e6eaf0',
                      textAlign: 'left',
                      bgcolor: mine ? '#e6fff3' : selected ? '#eef4ff' : '#fff',
                      cursor: mine ? 'default' : 'pointer',
                      color: 'inherit',
                      '&:hover': { bgcolor: mine ? '#e6fff3' : '#f3f6fb' },
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: 900, color: mine ? '#007a57' : 'text.secondary' }}
                    >
                      {rowIndex + 1}
                    </Typography>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ fontSize: 13, fontWeight: 800 }}>
                        {row.entryName}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <Typography noWrap variant="caption" color="text.secondary">
                          {mine ? 'You' : row.playerName}
                        </Typography>
                        {formatChipShort(row.activeChip) && (
                          <Tooltip title={`${formatChipName(row.activeChip ?? null)} used in this Gameweek`} arrow>
                            <Chip
                              size="small"
                              label={formatChipShort(row.activeChip)}
                              sx={{ height: 17, fontSize: 9, bgcolor: '#e90052', color: '#fff', fontWeight: 900 }}
                            />
                          </Tooltip>
                        )}
                      </Stack>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 900 }}>
                        {row.eventPoints}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 900 }}>
                        {row.totalPoints}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', p: 1 }}>
              <Button
                size="small"
                disabled={league.pageNumber <= 1}
                onClick={() => void league.previousPage()}
              >
                Previous
              </Button>
              <Button
                size="small"
                disabled={!league.hasNextPage}
                onClick={() => void league.nextPage()}
              >
                Next
              </Button>
            </Stack>
          </Card>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <TeamPitchCard
              title={gameState.entry?.team.name ?? 'My Team'}
              subtitle={gameState.entry?.manager.name ?? 'You'}
              points={myStanding?.eventPoints ?? myPicks.totalPoints}
              transfers={myPicks.transfersMade}
              transferCost={myPicks.transfersCost}
              activeChip={myPicks.activeChip}
              loading={myPicks.isLoading}
              squad={mySquad}
              gameweek={displayGameweek}
              onPlayerClick={setSelectedPlayerId}
              accent="#00ff87"
            />
            <TeamPitchCard
              title={opponent?.entryName ?? 'Select a rival'}
              subtitle={
                opponent
                  ? `${opponent.playerName} · rank #${opponent.rank}`
                  : 'Choose a manager from the standings'
              }
              points={opponent?.eventPoints ?? rivalPicks.totalPoints}
              transfers={rivalPicks.transfersMade}
              transferCost={rivalPicks.transfersCost}
              activeChip={rivalPicks.activeChip}
              loading={rivalPicks.isLoading}
              squad={rivalSquad}
              gameweek={displayGameweek}
              onPlayerClick={setSelectedPlayerId}
              accent="#04f5ff"
            />
          </Box>
        </Box>
      </Stack>
      <PlayerDetailsDialog
        key={selectedPlayerId ?? 'closed'}
        playerId={selectedPlayerId}
        pick={selectedPick}
        gameweekId={displayGameweek}
        open={selectedPlayerId !== null}
        onClose={() => setSelectedPlayerId(null)}
      />
    </Box>
  );
};

const TeamPitchCard: React.FC<{
  title: string;
  subtitle: string;
  points: number;
  transfers: number;
  transferCost: number;
  activeChip: string | null;
  loading: boolean;
  squad: WorkspaceSquadPlayer[];
  gameweek: number | null;
  accent: string;
  onPlayerClick: (playerId: number) => void;
}> = ({ title, subtitle, points, transfers, transferCost, activeChip, loading, squad, gameweek, accent, onPlayerClick }) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 3,
      overflow: 'hidden',
      minWidth: 0,
      boxShadow: '0 14px 34px rgba(15,23,42,.10)',
    }}
  >
    <CardContent
      sx={{
        p: '13px 15px !important',
        color: '#fff',
        background: 'linear-gradient(120deg, #20283a, #303b52)',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 900 }}>
            {title}
          </Typography>
          <Typography noWrap variant="caption" sx={{ opacity: 0.66 }}>
            {subtitle}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Tooltip title="Gameweek points before transfer deductions" arrow>
            <Chip
              size="small"
              label={`${points} pts`}
              sx={{ bgcolor: accent, color: '#09111f', fontWeight: 900 }}
            />
          </Tooltip>
          <Tooltip title={`${transfers} transfer${transfers === 1 ? '' : 's'} made${transferCost ? ` · ${transferCost} point hit` : ' · no point hit'}`} arrow>
            <Chip
              size="small"
              label={`${transfers} tr`}
              sx={{ bgcolor: 'rgba(255,255,255,.1)', color: '#fff' }}
            />
          </Tooltip>
          {formatChipName(activeChip) && (
            <Tooltip title="Chip active for this Gameweek" arrow>
              <Chip size="small" label={formatChipName(activeChip)} sx={{ bgcolor: '#e90052', color: '#fff', fontWeight: 800 }} />
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </CardContent>
    {loading ? (
      <Box sx={{ minHeight: 440, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    ) : squad.length > 0 ? (
      <>
        <FootballPitch
          squad={squad}
          gameweekId={gameweek ?? undefined}
          compact
          onPlayerClick={onPlayerClick}
        />
        <Bench
          squad={squad}
          gameweekId={gameweek ?? undefined}
          compact
          onPlayerClick={onPlayerClick}
        />
      </>
    ) : (
      <Box
        sx={{
          minHeight: 440,
          p: 3,
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          bgcolor: '#f7f9fc',
        }}
      >
        <Typography color="text.secondary">
          Squad data becomes public after the Gameweek deadline.
        </Typography>
      </Box>
    )}
  </Card>
);
