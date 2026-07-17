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
}

/**
 * Formation Row Component - displays players in a single formation row
 */
const FormationRow: React.FC<{
  players: PitchSquadPlayer[];
}> = ({ players }) => {
  if (players.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: { xs: 1, sm: 2, md: 3 },
        flexWrap: 'wrap',
        marginY: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      {players.map((player) => (
        <PitchPlayer
          key={player.playerId}
          playerId={player.playerId}
          gameweekPoints={player.gameweekPoints}
          isCaptain={player.isCaptain}
          isViceCaptain={player.isViceCaptain}
          size="medium"
        />
      ))}
    </Box>
  );
};

export const FootballPitch: React.FC<FootballPitchProps> = ({ squad }) => {
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
        backgroundColor: '#2d5016',
        backgroundImage: `
          linear-gradient(90deg, transparent 47%, rgba(255,255,255,0.1) 47%, rgba(255,255,255,0.1) 53%, transparent 53%),
          linear-gradient(180deg, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 50.5%, transparent 50.5%)
        `,
        borderRadius: '8px',
        padding: { xs: 2, sm: 3, md: 4 },
        marginBottom: 3,
        position: 'relative',
        aspectRatio: '16 / 10',
        maxWidth: '100%',
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.1)',
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
        {grouped.gk.length > 0 && <FormationRow players={grouped.gk} />}

        {/* Defender Rows */}
        {grouped.def.length > 0 && <FormationRow players={grouped.def} />}

        {/* Midfielder Rows */}
        {grouped.mid.length > 0 && <FormationRow players={grouped.mid} />}

        {/* Forward Rows */}
        {grouped.fwd.length > 0 && <FormationRow players={grouped.fwd} />}
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
