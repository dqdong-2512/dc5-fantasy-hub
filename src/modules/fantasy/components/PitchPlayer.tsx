/**
 * Pitch Player Component
 * Displays a single player on the football pitch
 */

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { PlayerRepository } from '@repositories/players';
import { FixtureRepository } from '@repositories/fixtures';
import { getPlayerImageUrl } from '@shared/assets';

export interface PitchPlayerProps {
  playerId: number;
  gameweekPoints?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  size?: 'small' | 'medium' | 'large';
  gameweekId?: number;
}

export const PitchPlayer: React.FC<PitchPlayerProps> = ({
  playerId,
  gameweekPoints = 0,
  isCaptain = false,
  isViceCaptain = false,
  size = 'medium',
  gameweekId,
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

  const fixtureLabel = useMemo(() => {
    if (!player || !gameweekId) return 'No fixture';
    try {
      const fixture = new FixtureRepository()
        .getByGameweek(gameweekId)
        .find(
          (match) => match.homeTeam.id === player.teamId || match.awayTeam.id === player.teamId
        );
      if (!fixture) return 'No fixture';
      const isHome = fixture.homeTeam.id === player.teamId;
      const opponent = isHome ? fixture.awayTeam.shortName : fixture.homeTeam.shortName;
      return `${opponent} (${isHome ? 'H' : 'A'})`;
    } catch {
      return 'No fixture';
    }
  }, [gameweekId, player]);

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
    small: { avatar: 48, card: 82, nameFont: '10px', pointsFont: '10px', badgeSize: 18 },
    medium: { avatar: 64, card: 104, nameFont: '11px', pointsFont: '10px', badgeSize: 20 },
    large: { avatar: 76, card: 116, nameFont: '12px', pointsFont: '11px', badgeSize: 22 },
  };

  const config = sizeConfig[size];
  const mobileCardWidth = size === 'small' ? 72 : 62;
  const mobileImageSize = size === 'small' ? 44 : 46;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: { xs: mobileCardWidth, sm: config.card },
        borderRadius: '8px',
        transition: 'transform 160ms ease, filter 160ms ease',
        filter: 'drop-shadow(0 7px 8px rgba(0, 0, 0, 0.20))',
        '&:hover': { transform: 'translateY(-3px)' },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          height: { xs: mobileImageSize, sm: config.avatar },
          overflow: 'hidden',
          borderRadius: '8px 8px 0 0',
          background: 'linear-gradient(145deg, rgba(255,255,255,.94), rgba(226,232,240,.88))',
        }}
      >
        <Box
          component="img"
          src={getPlayerImageUrl(player.clubCode)}
          alt={player.displayName}
          sx={{
            width: { xs: mobileImageSize, sm: config.avatar },
            height: { xs: mobileImageSize, sm: config.avatar },
            objectFit: 'contain',
            objectPosition: 'bottom center',
          }}
        />

        {/* Captain Badge */}
        {isCaptain && (
          <Box
            sx={{
              position: 'absolute',
              top: 5,
              left: 5,
              backgroundColor: '#37003c',
              color: '#fff',
              borderRadius: '50%',
              width: config.badgeSize,
              height: config.badgeSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: `${config.badgeSize - 4}px`,
              border: '1px solid #fff',
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
              top: 5,
              left: 5,
              backgroundColor: '#00a8e8',
              color: '#fff',
              borderRadius: '50%',
              width: config.badgeSize,
              height: config.badgeSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: `${config.badgeSize - 4}px`,
              border: '1px solid #fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            V
          </Box>
        )}
      </Box>

      <Box
        sx={{
          px: 0.5,
          py: 0.45,
          textAlign: 'center',
          color: '#0f172a',
          borderRadius: '0 0 8px 8px',
          backgroundColor: '#fff',
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '9px', sm: config.nameFont },
            lineHeight: 1.2,
            fontWeight: 800,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {player.displayName}
        </Typography>
        <Typography
          sx={{ fontSize: { xs: '8px', sm: config.pointsFont }, lineHeight: 1.2, color: '#64748b' }}
        >
          {fixtureLabel}
        </Typography>
        <Typography
          sx={{
            mt: 0.25,
            fontSize: { xs: '8px', sm: config.pointsFont },
            lineHeight: 1.2,
            fontWeight: 800,
            color: gameweekPoints > 0 ? '#16a34a' : '#475569',
          }}
        >
          {Number.isFinite(gameweekPoints) ? gameweekPoints : 0} pts · £{player.price.toFixed(1)}m
        </Typography>
      </Box>
    </Box>
  );
};
