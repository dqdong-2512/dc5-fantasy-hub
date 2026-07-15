/**
 * My Team Component
 * Displays current gameweek picks with pitch layout
 */

import React, { useMemo } from 'react';
import { Box, Typography, Avatar, Stack, Alert } from '@mui/material';
import type { FantasyGameweekPicks, FantasyPick } from '@domain/models';
import type { Player } from '@domain/models';
import { Position } from '@domain/enums';
import { PlayerRepository } from '@repositories/players';
import { LoadingState, ErrorState } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { getPlayerImageUrl } from '@shared/assets';

export interface MyTeamProps {
  picks: FantasyGameweekPicks | null;
  isLoading: boolean;
  error?: string | null;
}

interface PlayerWithDetails extends FantasyPick {
  playerData?: Player;
}

/**
 * My Team Component - Displays gameweek picks
 */
export function MyTeam({ picks, isLoading, error }: MyTeamProps): React.ReactElement {
  const playerRepository = new PlayerRepository();

  const playerMap = useMemo(() => {
    try {
      const players = playerRepository.getAll();
      return new Map(players.map((p) => [p.id, p]));
    } catch {
      return new Map();
    }
  }, []);

  const picksWithDetails = useMemo<PlayerWithDetails[]>(() => {
    if (!picks) return [];
    return picks.picks.map((pick) => ({
      ...pick,
      playerData: playerMap.get(pick.element),
    }));
  }, [picks, playerMap]);

  const starters = useMemo(
    () => picksWithDetails.filter((p) => p.position <= 11),
    [picksWithDetails]
  );
  const bench = useMemo(() => picksWithDetails.filter((p) => p.position > 11), [picksWithDetails]);

  // Group starters by position
  const goalkeeper = starters.filter((p) => p.playerData?.position === Position.Goalkeeper);
  const defenders = starters.filter((p) => p.playerData?.position === Position.Defender);
  const midfielders = starters.filter((p) => p.playerData?.position === Position.Midfielder);
  const forwards = starters.filter((p) => p.playerData?.position === Position.Forward);

  if (isLoading) {
    return <LoadingState label="Loading team..." />;
  }

  if (error) {
    return <ErrorState title="Failed to load team" message={error} />;
  }

  if (!picks) {
    return (
      <Typography color="textSecondary" sx={{ textAlign: 'center' }}>
        No picks available
      </Typography>
    );
  }

  const PlayerPick: React.FC<{ pick: PlayerWithDetails; size?: 'sm' | 'md' }> = ({
    pick,
    size = 'md',
  }) => {
    const player = pick.playerData;
    if (!player) return null;

    const isCaptain = pick.isCaptain;
    const isVC = pick.isViceCaptain;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={getPlayerImageUrl(player.id)}
            sx={{
              width: size === 'sm' ? 56 : 72,
              height: size === 'sm' ? 56 : 72,
              border: isCaptain
                ? '3px solid #fbc02d'
                : isVC
                  ? '3px solid #ff9800'
                  : '2px solid #e0e0e0',
            }}
            alt={player.displayName}
          />
          {isCaptain && (
            <Typography
              sx={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: '#fbc02d',
                color: '#000',
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              C
            </Typography>
          )}
          {isVC && !isCaptain && (
            <Typography
              sx={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: '#ff9800',
                color: '#fff',
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              V
            </Typography>
          )}
        </Box>
        <Box sx={{ textAlign: 'center', width: '100%', minWidth: size === 'sm' ? 50 : 70 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}
            noWrap
          >
            {player.displayName.split(' ').pop()}
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
            {player.club}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Stack spacing={ThemeTokens.spacing.xl}>
      {/* Gameweek Transfer Cost Info */}
      {picks.transfersMade > 0 && (
        <Alert severity="info">
          Transfers Made: {picks.transfersMade} (Cost: -{picks.transfersCost})
        </Alert>
      )}

      {/* Pitch Layout */}
      <Box
        sx={{
          backgroundColor: '#2d5016',
          borderRadius: ThemeTokens.borderRadius.lg,
          padding: ThemeTokens.spacing.lg,
          color: '#fff',
          minHeight: 600,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
        }}
      >
        {/* Formation: GK - DEF - MID - FWD */}

        {/* Goalkeeper */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: ThemeTokens.spacing.lg }}>
          {goalkeeper.map((p) => (
            <PlayerPick key={p.element} pick={p} />
          ))}
        </Box>

        {/* Defenders */}
        {defenders.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: ThemeTokens.spacing.md,
              flexWrap: 'wrap',
            }}
          >
            {defenders.map((p) => (
              <PlayerPick key={p.element} pick={p} size="md" />
            ))}
          </Box>
        )}

        {/* Midfielders */}
        {midfielders.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: ThemeTokens.spacing.md,
              flexWrap: 'wrap',
            }}
          >
            {midfielders.map((p) => (
              <PlayerPick key={p.element} pick={p} size="md" />
            ))}
          </Box>
        )}

        {/* Forwards */}
        {forwards.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: ThemeTokens.spacing.md,
              flexWrap: 'wrap',
            }}
          >
            {forwards.map((p) => (
              <PlayerPick key={p.element} pick={p} size="md" />
            ))}
          </Box>
        )}
      </Box>

      {/* Bench */}
      {bench.length > 0 && (
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
          >
            Bench
          </Typography>
          <Box sx={{ display: 'flex', gap: ThemeTokens.spacing.md, flexWrap: 'wrap' }}>
            {bench.map((p) => (
              <PlayerPick key={p.element} pick={p} size="sm" />
            ))}
          </Box>
        </Box>
      )}

      {/* Captain Info */}
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: ThemeTokens.borderRadius.md,
          padding: ThemeTokens.spacing.md,
        }}
      >
        <Stack spacing={ThemeTokens.spacing.sm}>
          {starters.find((p) => p.isCaptain) && (
            <Typography variant="body2">
              <Typography component="span" sx={{ fontWeight: 600 }}>
                Captain (2x):
              </Typography>{' '}
              {starters.find((p) => p.isCaptain)?.playerData?.displayName}
            </Typography>
          )}
          {starters.find((p) => p.isViceCaptain) && (
            <Typography variant="body2">
              <Typography component="span" sx={{ fontWeight: 600 }}>
                Vice Captain (1x):
              </Typography>{' '}
              {starters.find((p) => p.isViceCaptain)?.playerData?.displayName}
            </Typography>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
