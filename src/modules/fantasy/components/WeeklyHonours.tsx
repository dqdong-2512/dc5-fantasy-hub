import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { PlayerAvatar } from '@shared/components';
import { FootballPitch } from './FootballPitch';
import type { PlayerOfWeekEntry, WeeklyHonourPlayer } from '../hooks';

const availabilityUrl = 'https://fantasy.premierleague.com/en/the-scout/player-news';

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
}

function LoadingState({ isLoading, error }: LoadingStateProps): React.ReactElement | null {
  if (isLoading) {
    return (
      <Box sx={{ minHeight: 160, display: 'grid', placeItems: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }
  if (error) return <Alert severity="warning">{error}</Alert>;
  return null;
}

export function PlayerOfWeekStrip({
  entries,
  isLoading,
  error,
}: {
  entries: PlayerOfWeekEntry[];
  isLoading: boolean;
  error?: string | null;
}): React.ReactElement {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        color: '#fff',
        background: 'linear-gradient(125deg, #240028, #37003c 55%, #5a0862)',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
        2026/27 Player of the Week
      </Typography>
      <LoadingState isLoading={isLoading} error={error} />
      {!isLoading && !error && entries.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            gridAutoColumns: { xs: 112, sm: 126 },
            gap: 1,
            overflowX: 'auto',
            pb: 0.5,
          }}
        >
          {entries.map(({ gameweek, player }) => (
            <Box
              key={gameweek}
              sx={{
                overflow: 'hidden',
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,.08)',
                border: '1px solid rgba(255,255,255,.09)',
              }}
            >
              <Box sx={{ height: 96, display: 'grid', placeItems: 'end center', pt: 1 }}>
                {player ? (
                  <PlayerAvatar
                    playerCode={player.playerCode}
                    photo={player.photo}
                    name={player.name}
                    size="large"
                  />
                ) : (
                  <Box sx={{ width: 58, height: 72, borderRadius: '50% 50% 10px 10px', bgcolor: 'rgba(255,255,255,.2)' }} />
                )}
              </Box>
              <Typography noWrap sx={{ px: 1, py: 0.5, textAlign: 'center', fontSize: 12, fontWeight: 850 }}>
                {player?.name ?? 'To be decided'}
              </Typography>
              <Stack direction="row" sx={{ px: 1, py: 0.5, justifyContent: 'space-between', bgcolor: '#04f5ff', color: '#17213a' }}>
                <Typography variant="caption" sx={{ fontWeight: 900 }}>GW{gameweek}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 900 }}>{player ? `${player.points} pts` : '—'}</Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      )}
      {!isLoading && !error && entries.length === 0 && (
        <Alert severity="info">Player of the Week data is not available yet.</Alert>
      )}
    </Box>
  );
}

function PlayerRow({ player, availability = false }: { player: WeeklyHonourPlayer; availability?: boolean }): React.ReactElement {
  return (
    <Stack direction="row" spacing={1.25} sx={{ py: 1, alignItems: 'center' }}>
      {availability && <WarningAmberRoundedIcon sx={{ color: player.status === 'd' ? '#f59e0b' : '#ef4444', fontSize: 20 }} />}
      <PlayerAvatar playerCode={player.playerCode} photo={player.photo} name={player.name} size="small" />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 850, fontSize: '0.9rem' }}>{player.name}</Typography>
        <Typography noWrap variant="caption" color="text.secondary">{player.team} · {player.position}</Typography>
      </Box>
      {availability ? (
        <Typography sx={{ width: '46%', fontSize: '0.78rem', lineHeight: 1.3 }}>
          {player.news || (player.chanceOfPlaying === null ? 'Status unavailable' : `${player.chanceOfPlaying}% chance of playing`)}
        </Typography>
      ) : (
        <Typography sx={{ fontWeight: 900 }}>{player.points}</Typography>
      )}
    </Stack>
  );
}

export function HomeHonoursGrid({
  team,
  availability,
  isLoading,
  error,
  onOpenTeam,
}: {
  team: WeeklyHonourPlayer[];
  availability: WeeklyHonourPlayer[];
  isLoading: boolean;
  error?: string | null;
  onOpenTeam: () => void;
}): React.ReactElement {
  const cards = [
    { title: 'Team of the Week', players: team, availability: false },
    { title: 'Player Availability', players: availability, availability: true },
  ];
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
      {cards.map((card) => (
        <Card key={card.title} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 10px 28px rgba(15,23,42,.06)' }}>
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>{card.title}</Typography>
              <Button
                size="small"
                endIcon={card.availability ? <OpenInNewRoundedIcon /> : <ArrowForwardRoundedIcon />}
                onClick={card.availability ? undefined : onOpenTeam}
                component={card.availability ? 'a' : 'button'}
                href={card.availability ? availabilityUrl : undefined}
                target={card.availability ? '_blank' : undefined}
                rel={card.availability ? 'noreferrer' : undefined}
                sx={{ textTransform: 'none', fontWeight: 800 }}
              >
                View all
              </Button>
            </Stack>
            <LoadingState isLoading={isLoading} error={error} />
            {!isLoading && !error && (
              <Stack divider={<Divider flexItem />}>
                {card.players.map((player) => <PlayerRow key={player.id} player={player} availability={card.availability} />)}
              </Stack>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export function TeamOfWeekPitch({
  players,
  gameweek,
  isLoading,
  error,
}: {
  players: WeeklyHonourPlayer[];
  gameweek: number;
  isLoading: boolean;
  error?: string | null;
}): React.ReactElement {
  const total = players.reduce((sum, player) => sum + player.points, 0);
  const top = [...players].sort((left, right) => right.points - left.points)[0];
  return (
    <Card sx={{ overflow: 'hidden', borderRadius: 3, backgroundColor: '#37003c', color: '#fff' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Team of the Week</Typography>
            <Typography sx={{ opacity: 0.72 }}>Best-scoring valid XI · Gameweek {gameweek}</Typography>
          </Box>
          {players.length > 0 && (
            <Stack direction="row" spacing={1}>
              <Chip label={`${total} total pts`} sx={{ bgcolor: '#04f5ff', fontWeight: 900 }} />
              {top && <Chip label={`${top.name} · ${top.points} pts`} sx={{ bgcolor: '#00ff87', fontWeight: 900 }} />}
            </Stack>
          )}
        </Stack>
        <LoadingState isLoading={isLoading} error={error} />
        {!isLoading && !error && players.length > 0 && (
          <Box sx={{ overflow: 'hidden', borderRadius: 2 }}>
            <FootballPitch
              compact
              gameweekId={gameweek}
              squad={players.map((player) => ({
                playerId: player.id,
                isStarter: true,
                gameweekPoints: player.points,
              }))}
            />
          </Box>
        )}
        {!isLoading && !error && players.length === 0 && (
          <Alert severity="info">Team of the Week will appear when Gameweek points are available.</Alert>
        )}
      </CardContent>
    </Card>
  );
}
