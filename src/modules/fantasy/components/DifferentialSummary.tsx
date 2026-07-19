/**
 * Differential Summary Component
 * Displays shared and differential players between two teams
 */

import React, { useMemo } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { PlayerRepository } from '@repositories/players';
import { calculateDifferentials } from '../utils/comparisonUtils';
import type { FantasySquadPick } from '../types';

export interface DifferentialSummaryProps {
  mySquad: FantasySquadPick[];
  opponentSquad: FantasySquadPick[];
}

const PlayerList: React.FC<{ playerIds: number[] }> = ({ playerIds }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {playerIds.length === 0 ? (
        <Typography sx={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>
          None
        </Typography>
      ) : (
        playerIds.map((playerId) => {
          try {
            const repo = new PlayerRepository();
            const player = repo.getById(playerId);
            return (
              <Typography key={playerId} sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                {player?.displayName || `Player ${playerId}`}
              </Typography>
            );
          } catch {
            return (
              <Typography key={playerId} sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Player {playerId}
              </Typography>
            );
          }
        })
      )}
    </Box>
  );
};

export const DifferentialSummary: React.FC<DifferentialSummaryProps> = ({
  mySquad,
  opponentSquad,
}) => {
  const differentials = useMemo(
    () => calculateDifferentials(mySquad, opponentSquad),
    [mySquad, opponentSquad]
  );

  return (
    <Box sx={{ marginBottom: 3 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          marginBottom: 1.5,
          fontSize: '1rem',
        }}
      >
        Squad Differentials
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {/* Shared Players */}
        <Card>
          <CardContent sx={{ padding: '16px !important' }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                marginBottom: 1,
                color: '#666',
              }}
            >
              Shared Players ({differentials.sharedPlayers.length})
            </Typography>
            <PlayerList playerIds={differentials.sharedPlayers} />
          </CardContent>
        </Card>

        {/* My Differentials */}
        <Card>
          <CardContent sx={{ padding: '16px !important' }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                marginBottom: 1,
                color: '#1976d2',
              }}
            >
              My Differentials ({differentials.myDifferentials.length})
            </Typography>
            <PlayerList playerIds={differentials.myDifferentials} />
          </CardContent>
        </Card>

        {/* Opponent Differentials */}
        <Card>
          <CardContent sx={{ padding: '16px !important' }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                marginBottom: 1,
                color: '#ef5350',
              }}
            >
              Opponent Differentials ({differentials.opponentDifferentials.length})
            </Typography>
            <PlayerList playerIds={differentials.opponentDifferentials} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
