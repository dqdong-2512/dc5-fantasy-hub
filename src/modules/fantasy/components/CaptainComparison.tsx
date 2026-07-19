/**
 * Captain Comparison Component
 * Displays captain selection comparison between two managers
 */

import React, { useMemo } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { PlayerRepository } from '@repositories/players';
import type { FantasySquadPick } from '../types';

export interface CaptainComparisonProps {
  mySquad: FantasySquadPick[];
  opponentSquad: FantasySquadPick[];
}

export const CaptainComparison: React.FC<CaptainComparisonProps> = ({ mySquad, opponentSquad }) => {
  const myCaptain = useMemo(() => mySquad.find((p) => p.isCaptain) || null, [mySquad]);
  const opponentCaptain = useMemo(
    () => opponentSquad.find((p) => p.isCaptain) || null,
    [opponentSquad]
  );

  const myPlayer = useMemo(() => {
    if (!myCaptain) return null;
    try {
      const repo = new PlayerRepository();
      return repo.getById(myCaptain.playerId);
    } catch {
      return null;
    }
  }, [myCaptain]);

  const opponentPlayer = useMemo(() => {
    if (!opponentCaptain) return null;
    try {
      const repo = new PlayerRepository();
      return repo.getById(opponentCaptain.playerId);
    } catch {
      return null;
    }
  }, [opponentCaptain]);

  const isSameCaptain = myCaptain?.playerId === opponentCaptain?.playerId;

  if (!myPlayer || !opponentPlayer) {
    return null;
  }

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
        Captain Comparison
      </Typography>

      {isSameCaptain ? (
        <Card sx={{ backgroundColor: '#f5f5f5' }}>
          <CardContent sx={{ padding: '16px !important', textAlign: 'center' }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                marginBottom: 0.5,
              }}
            >
              {myPlayer.displayName} (C)
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>Same Captain</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {/* My Captain */}
          <Card>
            <CardContent sx={{ padding: '16px !important', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#999', marginBottom: 0.5 }}>
                My Captain
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  marginBottom: 1,
                  color: '#1976d2',
                }}
              >
                {myPlayer.displayName} (C)
              </Typography>
              <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#4caf50' }}>
                {myCaptain?.gameweekPoints || 0} pts
              </Typography>
            </CardContent>
          </Card>

          {/* Opponent Captain */}
          <Card>
            <CardContent sx={{ padding: '16px !important', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#999', marginBottom: 0.5 }}>
                Opponent Captain
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  marginBottom: 1,
                  color: '#ef5350',
                }}
              >
                {opponentPlayer.displayName} (C)
              </Typography>
              <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#ef5350' }}>
                {opponentCaptain?.gameweekPoints || 0} pts
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};
