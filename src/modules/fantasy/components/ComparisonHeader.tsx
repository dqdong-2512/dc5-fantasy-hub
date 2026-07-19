/**
 * Comparison Header Component
 * Displays "MY TEAM vs OPPONENT" visual with team names and rank
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import type { FantasyGameManagerFixture, LeagueStandingEntry } from '../types';

export interface ComparisonHeaderProps {
  currentManager: FantasyGameManagerFixture;
  opponentManager: LeagueStandingEntry;
}

export const ComparisonHeader: React.FC<ComparisonHeaderProps> = ({
  currentManager,
  opponentManager,
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 2,
        alignItems: 'center',
        marginBottom: 3,
        padding: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        textAlign: 'center',
      }}
    >
      {/* My Team */}
      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.875rem',
            color: '#999',
            marginBottom: 1,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          My Team
        </Typography>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            marginBottom: 0.5,
            color: '#1976d2',
          }}
        >
          {currentManager.teamName}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#666', marginBottom: 1 }}>
          {currentManager.name}
        </Typography>
      </Box>

      {/* VS Badge */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            color: '#999',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          vs
        </Typography>
      </Box>

      {/* Opponent Team */}
      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.875rem',
            color: '#999',
            marginBottom: 1,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Opponent
        </Typography>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            marginBottom: 0.5,
            color: '#ef5350',
          }}
        >
          {opponentManager.teamName}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#666', marginBottom: 1 }}>
          {opponentManager.managerName}
        </Typography>
      </Box>
    </Box>
  );
};
