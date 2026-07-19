/**
 * Team Pitch Comparison Component
 * Displays both team pitches side-by-side on desktop, stacked on mobile
 * Reuses existing FootballPitch component
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { FootballPitch, Bench } from './index';
import { calculateFormation } from '../utils/comparisonUtils';
import type { FantasySquadPick } from '../types';

export interface TeamPitchComparisonProps {
  mySquad: FantasySquadPick[];
  myTeamName: string;
  opponentSquad: FantasySquadPick[];
  opponentTeamName: string;
}

export const TeamPitchComparison: React.FC<TeamPitchComparisonProps> = ({
  mySquad,
  myTeamName,
  opponentSquad,
  opponentTeamName,
}) => {
  const myFormation = calculateFormation(mySquad);
  const opponentFormation = calculateFormation(opponentSquad);

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
        Starting XI
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: { xs: 3, lg: 2 },
        }}
      >
        {/* My Team Pitch */}
        <Box>
          <Box
            sx={{
              backgroundColor: '#f5f5f5',
              padding: 2,
              borderRadius: '8px 8px 0 0',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                marginBottom: 0.5,
                color: '#1976d2',
              }}
            >
              {myTeamName}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
              Formation: {myFormation}
            </Typography>
          </Box>
          <Box sx={{ padding: 2, backgroundColor: '#fff' }}>
            <FootballPitch squad={mySquad} />
          </Box>
          <Box sx={{ marginTop: 2 }}>
            <Bench squad={mySquad} />
          </Box>
        </Box>

        {/* Opponent Team Pitch */}
        <Box>
          <Box
            sx={{
              backgroundColor: '#f5f5f5',
              padding: 2,
              borderRadius: '8px 8px 0 0',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                marginBottom: 0.5,
                color: '#ef5350',
              }}
            >
              {opponentTeamName}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
              Formation: {opponentFormation}
            </Typography>
          </Box>
          <Box sx={{ padding: 2, backgroundColor: '#fff' }}>
            <FootballPitch squad={opponentSquad} />
          </Box>
          <Box sx={{ marginTop: 2 }}>
            <Bench squad={opponentSquad} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
