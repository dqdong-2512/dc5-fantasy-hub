/**
 * Opponent Team Panel Component (League Detail Context)
 * Displays selected opponent's team in league detail view
 */

import React, { useMemo } from 'react';
import { Box, Card, Typography, Stack, CircularProgress, Alert, Button } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { FootballPitch, Bench } from '../index';
import { PlayerRepository } from '@repositories/players';
import CloseIcon from '@mui/icons-material/Close';
import type { FantasyGameweekPicks } from '@domain/models';

export interface OpponentTeamPanelProps {
  opponentManagerEntry: any;
  opponentPicks: FantasyGameweekPicks | null;
  enrichedPicks: any;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
}

export const OpponentTeamPanel: React.FC<OpponentTeamPanelProps> = ({
  opponentManagerEntry,
  opponentPicks,
  enrichedPicks,
  isLoading,
  error,
  onClear,
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

  if (!opponentManagerEntry) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md, textAlign: 'center' }}>
        <Typography color="textSecondary">Select an opponent to compare</Typography>
      </Card>
    );
  }

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
        <Stack spacing={ThemeTokens.spacing.md}>
          <Alert severity="error">{error}</Alert>
          <Button onClick={onClear} variant="outlined" size="small">
            Clear Selection
          </Button>
        </Stack>
      </Card>
    );
  }

  if (!enrichedPicks) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Typography color="textSecondary">No team data available</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ padding: ThemeTokens.spacing.md }}>
      <Stack spacing={ThemeTokens.spacing.lg}>
        {/* Header with Close Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.sm }}>
              {opponentManagerEntry.playerName || 'Opponent'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {opponentManagerEntry.entryName}
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginTop: ThemeTokens.spacing.sm }}
            >
              Rank #{opponentManagerEntry.rank}
            </Typography>
          </Box>
          <Button
            onClick={onClear}
            size="small"
            sx={{ minWidth: 'auto', padding: 1 }}
            startIcon={<CloseIcon />}
          />
        </Box>

        {/* Summary Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: ThemeTokens.spacing.md,
            paddingBottom: ThemeTokens.spacing.md,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5 }}
            >
              GW Points
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#4caf50' }}>
              {enrichedPicks?.totalPoints || 0}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5 }}
            >
              Net Points
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#2196f3' }}>
              {(enrichedPicks?.totalPoints || 0) - (opponentPicks?.transfersCost || 0)}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5 }}
            >
              Total
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {opponentManagerEntry.points || 0}
            </Typography>
          </Box>
        </Box>

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
