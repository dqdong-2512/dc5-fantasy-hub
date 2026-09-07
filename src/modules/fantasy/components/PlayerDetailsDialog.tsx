import React, { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { PlayerRepository } from '@repositories/players';
import { FixtureRepository } from '@repositories/fixtures';
import { PlayerAvatar } from '@shared/components';
import type { EnrichedPick } from '../services/pick-enrichment.service';

export interface PlayerDetailsDialogProps {
  playerId: number | null;
  pick?: EnrichedPick | null;
  gameweekId?: number | null;
  open: boolean;
  onClose: () => void;
}

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: '#f7f8fc', minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 850, lineHeight: 1.25 }}>{value}</Typography>
  </Box>
);

export const PlayerDetailsDialog: React.FC<PlayerDetailsDialogProps> = ({
  playerId,
  pick,
  gameweekId,
  open,
  onClose,
}) => {
  const [tab, setTab] = useState(0);

  const player = useMemo(() => {
    if (!playerId) return null;
    try {
      return new PlayerRepository().getById(playerId);
    } catch {
      return null;
    }
  }, [playerId]);

  const fixtures = useMemo(() => {
    if (!player) return [];
    try {
      return new FixtureRepository()
        .getByTeam(player.teamId)
        .filter((fixture) => !gameweekId || fixture.gameweek >= gameweekId)
        .sort((a, b) => a.gameweek - b.gameweek)
        .slice(0, 4);
    } catch {
      return [];
    }
  }, [gameweekId, player]);

  if (!player) return null;
  const event = pick?.eventStats;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}
    >
      <Box
        sx={{
          color: '#fff',
          p: 2.5,
          background: 'linear-gradient(120deg, #37003c, #6d0875 60%, #009b6b)',
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <PlayerAvatar
            photo={player.photo}
            playerCode={player.clubCode}
            name={player.displayName}
            size="large"
            lazy={false}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {player.displayName}
            </Typography>
            <Typography sx={{ opacity: 0.82 }}>
              {player.club} · {String(player.position).replace('_', ' ')}
            </Typography>
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={`£${player.price.toFixed(1)}m`}
                sx={{ bgcolor: '#00ff87', fontWeight: 800 }}
              />
              <Chip
                size="small"
                label={`${player.ownership.toFixed(1)}% owned`}
                sx={{ bgcolor: 'rgba(255,255,255,.16)', color: '#fff' }}
              />
            </Stack>
          </Box>
          <IconButton
            aria-label="Close player details"
            onClick={onClose}
            sx={{ color: '#fff', alignSelf: 'flex-start' }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </Box>

      <Tabs
        value={tab}
        onChange={(_event, value: number) => setTab(value)}
        variant="fullWidth"
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab label="Summary" sx={{ textTransform: 'none', fontWeight: 750 }} />
        <Tab label={`GW ${gameweekId ?? ''}`} sx={{ textTransform: 'none', fontWeight: 750 }} />
        <Tab label="Upcoming" sx={{ textTransform: 'none', fontWeight: 750 }} />
      </Tabs>

      <DialogContent sx={{ p: 2.5 }}>
        {tab === 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
            <Stat label="Season points" value={player.totalPoints} />
            <Stat label="Form" value={player.form.toFixed(1)} />
            <Stat label="Points per match" value={player.pointsPerGame.toFixed(1)} />
            <Stat label="Minutes" value={player.minutesPlayed.toLocaleString()} />
            <Stat label="Goals" value={player.goalsScored ?? 0} />
            <Stat label="Assists" value={player.assists ?? 0} />
            <Stat label="Clean sheets" value={player.cleanSheets ?? 0} />
            <Stat
              label="Availability"
              value={
                player.status === 'a' ? 'Available' : (player.status?.toUpperCase() ?? 'Unknown')
              }
            />
          </Box>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: '#f2eaf4' }}>
              <Typography variant="caption" color="text.secondary">
                Fantasy points
              </Typography>
              <Typography variant="h3" sx={{ color: '#37003c', fontWeight: 900 }}>
                {pick?.playerEffectivePoints ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pick?.playerEventPoints ?? 0} raw points × {pick?.playerMultiplier ?? 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
              <Stat label="Minutes" value={event?.minutes ?? 0} />
              <Stat label="Goals" value={event?.goalsScored ?? 0} />
              <Stat label="Assists" value={event?.assists ?? 0} />
              <Stat label="Clean sheets" value={event?.cleanSheets ?? 0} />
              <Stat label="Saves" value={event?.saves ?? 0} />
              <Stat label="Bonus" value={event?.bonus ?? 0} />
              <Stat label="BPS" value={event?.bps ?? 0} />
              <Stat
                label="Yellow / red"
                value={`${event?.yellowCards ?? 0} / ${event?.redCards ?? 0}`}
              />
              <Stat label="Status" value={pick?.matchStatus?.replace('_', ' ') ?? 'Unknown'} />
            </Box>
          </Stack>
        )}

        {tab === 2 && (
          <Stack spacing={1}>
            {fixtures.map((fixture) => {
              const isHome = fixture.homeTeam.id === player.teamId;
              const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
              return (
                <Stack
                  key={fixture.id}
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>Gameweek {fixture.gameweek}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {opponent.name} ({isHome ? 'H' : 'A'})
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={`FDR ${isHome ? fixture.homeDifficulty : fixture.awayDifficulty}`}
                  />
                </Stack>
              );
            })}
            {fixtures.length === 0 && (
              <Typography color="text.secondary">No upcoming fixture is available.</Typography>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};
