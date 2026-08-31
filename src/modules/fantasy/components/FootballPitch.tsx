/**
 * Football Pitch Component
 * Displays the starting XI on a football pitch visualization
 */

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { PlayerRepository } from '@repositories/players';
import { PitchPlayer } from './PitchPlayer';

export interface PitchSquadPlayer {
  playerId: number;
  isStarter: boolean;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  gameweekPoints?: number;
}

export interface FootballPitchProps {
  squad: PitchSquadPlayer[];
  gameweekId?: number;
}

/**
 * Formation Row Component - displays players in a single formation row
 */
const FormationRow: React.FC<{
  players: PitchSquadPlayer[];
  gameweekId?: number;
}> = ({ players, gameweekId }) => {
  if (players.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: { xs: 0.5, sm: 2, md: 3.5 },
        marginY: { xs: 0.75, sm: 1, md: 1.25 },
        width: '100%',
      }}
    >
      {players.map((player) => (
        <PitchPlayer
          key={player.playerId}
          playerId={player.playerId}
          gameweekPoints={player.gameweekPoints}
          isCaptain={player.isCaptain}
          isViceCaptain={player.isViceCaptain}
          size="large"
          gameweekId={gameweekId}
        />
      ))}
    </Box>
  );
};

export const FootballPitch: React.FC<FootballPitchProps> = ({ squad, gameweekId }) => {
  const playerRepo = useMemo(() => new PlayerRepository(), []);

  // Get all players
  const allPlayers = useMemo(() => {
    try {
      return playerRepo.getAll();
    } catch {
      return [];
    }
  }, [playerRepo]);

  // Map squad picks to player data
  const startersWithData = useMemo(() => {
    return squad
      .filter((p) => p.isStarter)
      .map((pick) => {
        const player = allPlayers.find((p) => p.id === pick.playerId);
        return {
          ...pick,
          position: player?.position,
          playerId: pick.playerId,
        };
      })
      .sort((a, b) => {
        const positionOrder: Record<string, number> = {
          GOALKEEPER: 0,
          DEFENDER: 1,
          MIDFIELDER: 2,
          FORWARD: 3,
        };
        const aPos = a.position as string | undefined;
        const bPos = b.position as string | undefined;
        return (positionOrder[aPos ?? ''] ?? 99) - (positionOrder[bPos ?? ''] ?? 99);
      });
  }, [squad, allPlayers]);

  // Group by position
  const grouped = useMemo(() => {
    return {
      gk: startersWithData.filter((p) => p.position === 'GOALKEEPER'),
      def: startersWithData.filter((p) => p.position === 'DEFENDER'),
      mid: startersWithData.filter((p) => p.position === 'MIDFIELDER'),
      fwd: startersWithData.filter((p) => p.position === 'FORWARD'),
    };
  }, [startersWithData]);

  return (
    <Box
      sx={{
        backgroundColor: '#00a65a',
        backgroundImage: `
          repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0, rgba(255,255,255,.035) 12.5%, rgba(0,0,0,.025) 12.5%, rgba(0,0,0,.025) 25%),
          linear-gradient(180deg, #00a65a 0%, #009b53 100%)
        `,
        borderRadius: '12px',
        padding: { xs: 1, sm: 2, md: 2.5 },
        position: 'relative',
        minHeight: { xs: 540, sm: 590, md: 620 },
        maxWidth: '100%',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.35)',
        boxShadow: 'inset 0 0 0 5px rgba(255,255,255,0.04)',
      }}
    >
      {/* Field markings */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            transform: 'translateY(-50%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px',
            height: '80px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
          },
        }}
      />

      {/* Pitch Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Goalkeeper Row */}
        {grouped.gk.length > 0 && <FormationRow players={grouped.gk} gameweekId={gameweekId} />}

        {/* Defender Rows */}
        {grouped.def.length > 0 && <FormationRow players={grouped.def} gameweekId={gameweekId} />}

        {/* Midfielder Rows */}
        {grouped.mid.length > 0 && <FormationRow players={grouped.mid} gameweekId={gameweekId} />}

        {/* Forward Rows */}
        {grouped.fwd.length > 0 && <FormationRow players={grouped.fwd} gameweekId={gameweekId} />}
      </Box>

      {/* Empty State */}
      {startersWithData.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          <Typography variant="body2">No starting XI data available</Typography>
        </Box>
      )}
    </Box>
  );
};
