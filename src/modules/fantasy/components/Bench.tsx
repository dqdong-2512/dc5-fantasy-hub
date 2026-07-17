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
}

export const Bench: React.FC<BenchProps> = ({ squad }) => {
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
    <Box>
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
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        {benchPlayers.map((player) => (
          <PitchPlayer
            key={player.playerId}
            playerId={player.playerId}
            gameweekPoints={player.gameweekPoints}
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
};
