/**
 * Team Summary Component
 * Displays team information and statistics
 */

import React, { useMemo } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { PlayerRepository } from '@repositories/players';
import { calculateFormation } from '../utils/formationUtils';

export interface TeamSummarySquadPlayer {
  playerId: number;
  isStarter: boolean;
}

export interface TeamSummaryProps {
  teamName: string;
  gameweekNumber: number;
  gameweekPoints: number;
  teamValue: number;
  bank: number;
  squad: TeamSummarySquadPlayer[];
}

export const TeamSummary: React.FC<TeamSummaryProps> = ({
  teamName,
  gameweekNumber,
  gameweekPoints,
  teamValue,
  bank,
  squad,
}) => {
  const playerRepo = useMemo(() => new PlayerRepository(), []);

  // Get all players
  const allPlayers = useMemo(() => {
    try {
      return playerRepo.getAll();
    } catch {
      return [];
    }
  }, [playerRepo]);

  // Calculate formation
  const formation = useMemo(() => {
    const squadWithPositions = squad
      .map((pick) => {
        const player = allPlayers.find((p) => p.id === pick.playerId);
        return { position: player?.position, isStarter: pick.isStarter };
      })
      .filter((p) => p.position !== undefined);

    return calculateFormation(squadWithPositions);
  }, [squad, allPlayers]);

  return (
    <Box sx={{ marginBottom: 3 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            marginBottom: 0.5,
          }}
        >
          {teamName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Gameweek {gameweekNumber}
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        <Card>
          <CardContent sx={{ padding: '12px !important' }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5 }}
            >
              Gameweek Points
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#4caf50' }}>
              {gameweekPoints}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ padding: '12px !important' }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5 }}
            >
              Formation
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
              {formation.formation}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ padding: '12px !important' }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5 }}
            >
              Team Value
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
              £{teamValue.toFixed(1)}m
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ padding: '12px !important' }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5 }}
            >
              Bank
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
              £{bank.toFixed(1)}m
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
