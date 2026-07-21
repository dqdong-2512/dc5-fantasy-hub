/**
 * My Team Panel Component (League Detail Context)
 * Displays current manager's team in league detail view
 */

import React, { useMemo } from 'react';
import { Box, Card, Typography, Stack, CircularProgress, Alert } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { FootballPitch, Bench, GameweekSummaryCard } from '../index';
import { PlayerRepository } from '@repositories/players';

export interface MyTeamPanelProps {
  title?: string;
  currentManagerEntry: any;
  enrichedPicks: any;
  transfers: number;
  transferCost: number;
  isLoading: boolean;
  error: string | null;
  gameweekId: number;
}

export const MyTeamPanel: React.FC<MyTeamPanelProps> = ({
  title = 'My Team',
  currentManagerEntry,
  enrichedPicks,
  transfers,
  transferCost,
  isLoading,
  error,
  gameweekId,
}) => {
  const playerRepo = useMemo(() => new PlayerRepository(), []);

  const squadForPitch = useMemo(() => {
    if (!enrichedPicks?.picks) return [];

    return enrichedPicks.picks.map((pick: any) => {
      const player = playerRepo.getById(pick.element);
      return {
        playerId: pick.element,
        playerName: player?.displayName || 'Unknown',
        playerTeamId: 0,
        isStarter: pick.position <= 11,
        isCaptain: pick.isCaptain,
        isViceCaptain: pick.isViceCaptain,
        gameweekPoints: pick.playerEffectivePoints,
        benchOrder: pick.position > 11 ? pick.position - 12 : undefined,
      };
    });
  }, [enrichedPicks, playerRepo]);

  if (isLoading) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Alert severity="error">{error}</Alert>
      </Card>
    );
  }

  if (!enrichedPicks || !currentManagerEntry) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Typography color="textSecondary">No team data available</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ padding: ThemeTokens.spacing.md }}>
      <Stack spacing={ThemeTokens.spacing.lg}>
        {/* Header */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.sm }}>
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {currentManagerEntry.managerName}
          </Typography>
        </Box>

        {/* Gameweek Summary */}
        {enrichedPicks && (
          <GameweekSummaryCard
            gameweekNumber={gameweekId}
            totalPoints={enrichedPicks.totalPoints || 0}
            gameweekRank={currentManagerEntry.gameweekRank}
            transfers={transfers}
            transferCost={transferCost}
            captainPoints={enrichedPicks.captainPoints || 0}
            benchPoints={enrichedPicks.benchPoints || 0}
            activeChip={enrichedPicks.activeChip}
          />
        )}

        {/* Pitch */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md, fontSize: '0.9rem' }}
          >
            Formation
          </Typography>
          <FootballPitch squad={squadForPitch} />
        </Box>

        {/* Bench */}
        <Box>
          <Bench squad={squadForPitch} />
        </Box>
      </Stack>
    </Card>
  );
};
