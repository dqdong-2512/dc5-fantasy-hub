/**
 * Pitch Player Component
 * Displays a single player on the football pitch
 */

import React, { useMemo } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { PlayerRepository } from '@repositories/players';
import { getPlayerImageUrl } from '@shared/assets';

export interface PitchPlayerProps {
  playerId: number;
  gameweekPoints?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const PitchPlayer: React.FC<PitchPlayerProps> = ({
  playerId,
  gameweekPoints = 0,
  isCaptain = false,
  isViceCaptain = false,
  size = 'medium',
}) => {
  // Fetch player from repository
  const player = useMemo(() => {
    try {
      const repo = new PlayerRepository();
      return repo.getById(playerId);
    } catch {
      return null;
    }
  }, [playerId]);

  if (!player) {
    return (
      <Box sx={{ opacity: 0.5, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          Player not found
        </Typography>
      </Box>
    );
  }

  const sizeConfig = {
    small: { avatar: 32, nameFont: '11px', pointsFont: '10px', badgeSize: 14 },
    medium: { avatar: 40, nameFont: '12px', pointsFont: '11px', badgeSize: 16 },
    large: { avatar: 48, nameFont: '13px', pointsFont: '12px', badgeSize: 18 },
  };

  const config = sizeConfig[size];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        position: 'relative',
        minWidth: 0,
      }}
    >
      {/* Player Avatar */}
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={getPlayerImageUrl(player.id)}
          alt={player.displayName}
          sx={{
            width: config.avatar,
            height: config.avatar,
            border: '2px solid #fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {player.displayName.charAt(0)}
        </Avatar>

        {/* Captain Badge */}
        {isCaptain && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              backgroundColor: '#d32f2f',
              color: '#fff',
              borderRadius: '50%',
              width: config.badgeSize,
              height: config.badgeSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: `${config.badgeSize - 4}px`,
              border: '2px solid #fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            C
          </Box>
        )}

        {/* Vice Captain Badge */}
        {isViceCaptain && !isCaptain && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              backgroundColor: '#1976d2',
              color: '#fff',
              borderRadius: '50%',
              width: config.badgeSize,
              height: config.badgeSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: `${config.badgeSize - 4}px`,
              border: '2px solid #fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            V
          </Box>
        )}
      </Box>

      {/* Player Name */}
      <Typography
        variant="caption"
        sx={{
          fontSize: config.nameFont,
          fontWeight: 600,
          textAlign: 'center',
          maxWidth: config.avatar + 8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {player.displayName.split(' ')[0]}
      </Typography>

      {/* Gameweek Points */}
      <Typography
        variant="caption"
        sx={{
          fontSize: config.pointsFont,
          fontWeight: 700,
          color: gameweekPoints > 0 ? '#4caf50' : '#666',
        }}
      >
        {gameweekPoints} pts
      </Typography>
    </Box>
  );
};
