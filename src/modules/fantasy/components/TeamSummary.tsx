import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
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
  const allPlayers = useMemo(() => {
    try {
      return new PlayerRepository().getAll();
    } catch {
      return [];
    }
  }, []);

  const formation = useMemo(() => {
    const squadWithPositions = squad
      .map((pick) => ({
        position: allPlayers.find((player) => player.id === pick.playerId)?.position,
        isStarter: pick.isStarter,
      }))
      .filter((player) => player.position !== undefined);
    return calculateFormation(squadWithPositions);
  }, [squad, allPlayers]);

  const metrics = [
    {
      label: 'Gameweek points',
      value: Number.isFinite(gameweekPoints) ? `${gameweekPoints}` : '0',
      color: '#16a34a',
    },
    { label: 'Formation', value: formation.formation, color: '#7c3aed' },
    {
      label: 'Team value',
      value: `£${Number.isFinite(teamValue) ? teamValue.toFixed(1) : '0.0'}m`,
      color: '#0284c7',
    },
    {
      label: 'In the bank',
      value: `£${Number.isFinite(bank) ? bank.toFixed(1) : '0.0'}m`,
      color: '#ea580c',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 850 }}>
        Gameweek overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {teamName} · Gameweek {gameweekNumber}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {metrics.map((metric) => (
          <Card key={metric.label} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Typography variant="caption" color="text.secondary">
                {metric.label}
              </Typography>
              <Typography
                variant="h5"
                sx={{ mt: 0.5, fontWeight: 850, color: metric.color }}
              >
                {metric.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
