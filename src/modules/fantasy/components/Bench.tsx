/**
 * Bench Component
 * Displays substitute players on the bench
 */

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { PitchPlayer } from './PitchPlayer';

export interface BenchSquadPlayer {
  playerId: number;
  isStarter: boolean;
  benchOrder?: number;
  gameweekPoints?: number;
}

export interface BenchProps {
  squad: BenchSquadPlayer[];
  gameweekId?: number;
}

export const Bench: React.FC<BenchProps> = ({ squad, gameweekId }) => {
  // Get bench players sorted by bench order
  const benchPlayers = useMemo(() => {
    return squad
      .filter((p) => !p.isStarter)
      .sort((a, b) => (a.benchOrder ?? 0) - (b.benchOrder ?? 0));
  }, [squad]);

  if (benchPlayers.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: '12px',
        color: '#fff',
        background: 'linear-gradient(135deg, #37003c, #5b075f)',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          marginBottom: 2,
          fontSize: '1rem',
        }}
      >
        Bench
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: { xs: 2, sm: 3 },
          padding: 2,
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderRadius: '8px',
        }}
      >
        {benchPlayers.map((player) => (
          <PitchPlayer
            key={player.playerId}
            playerId={player.playerId}
            gameweekPoints={player.gameweekPoints}
            size="small"
            gameweekId={gameweekId}
          />
        ))}
      </Box>
    </Box>
  );
};
