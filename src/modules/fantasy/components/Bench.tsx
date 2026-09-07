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
  compact?: boolean;
  onPlayerClick?: (playerId: number) => void;
}

export const Bench: React.FC<BenchProps> = ({
  squad,
  gameweekId,
  compact = false,
  onPlayerClick,
}) => {
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
        p: compact ? 1 : { xs: 1.5, sm: 2 },
        borderRadius: compact ? 0 : '12px',
        color: '#fff',
        background: 'linear-gradient(135deg, #37003c, #5b075f)',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          marginBottom: compact ? 0.75 : 2,
          fontSize: '1rem',
        }}
      >
        Bench
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: compact ? 0.5 : { xs: 2, sm: 3 },
          padding: compact ? 0.75 : 2,
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
            onClick={onPlayerClick}
          />
        ))}
      </Box>
    </Box>
  );
};
