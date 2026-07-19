/**
 * Planned Squad Preview Component
 * Shows the projected squad after transfers using pitch/bench visualization
 * Reuses existing FootballPitch and Bench components
 */

import React, { useMemo } from 'react';
import { Box, Typography, Alert, Stack } from '@mui/material';
import { SquadSimulationService } from '../../services';
import type { SquadPlayer, TransferMove, TransferPlanValidation } from '../../domain/TransferPlan';
import { FootballPitch, type PitchSquadPlayer } from '../FootballPitch';
import { Bench, type BenchSquadPlayer } from '../Bench';
import { ThemeTokens } from '@shared/theme/tokens';

export interface PlannedSquadPreviewProps {
  currentSquad: SquadPlayer[];
  transfers: TransferMove[];
  planValidation: TransferPlanValidation;
}

export const PlannedSquadPreview: React.FC<PlannedSquadPreviewProps> = ({
  currentSquad,
  transfers,
  planValidation,
}) => {
  const simulationService = useMemo(() => new SquadSimulationService(), []);

  // Calculate planned squad
  const plannedSquad = useMemo(() => {
    const result = simulationService.applyTransfers(currentSquad, transfers, 0); // Bank not needed for display
    return result.players;
  }, [currentSquad, transfers, simulationService]);

  // Convert to pitch/bench format
  const pitchSquad = useMemo((): PitchSquadPlayer[] => {
    return plannedSquad.map((p) => ({
      playerId: p.playerId,
      isStarter: p.isStarter,
      isCaptain: p.isCaptain,
      isViceCaptain: p.isViceCaptain,
    }));
  }, [plannedSquad]);

  const benchSquad = useMemo((): BenchSquadPlayer[] => {
    return plannedSquad.map((p) => ({
      playerId: p.playerId,
      isStarter: p.isStarter,
      benchOrder: p.benchOrder,
    }));
  }, [plannedSquad]);

  // Separate starters and bench
  const starters = useMemo(() => plannedSquad.filter((p) => p.isStarter), [plannedSquad]);

  return (
    <Stack spacing={ThemeTokens.spacing.lg}>
      {/* Validation Alert */}
      {!planValidation.isValid && (
        <Alert severity="error">
          <Typography variant="subtitle2" sx={{ fontWeight: 600, marginBottom: 1 }}>
            Squad Invalid
          </Typography>
          {planValidation.errors.map((err, idx) => (
            <Typography key={idx} variant="body2">
              • {err.message}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Formation Info */}
      <Box
        sx={{
          padding: ThemeTokens.spacing.md,
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
          Formation
        </Typography>
        <Typography variant="body2">
          {starters.filter((p) => p.position === 1).length} GK •{' '}
          {starters.filter((p) => p.position >= 2 && p.position <= 5).length} DEF •{' '}
          {starters.filter((p) => p.position >= 6 && p.position <= 8).length} MID •{' '}
          {starters.filter((p) => p.position >= 9 && p.position <= 11).length} FWD
        </Typography>
      </Box>

      {/* Pitch */}
      <FootballPitch squad={pitchSquad} />

      {/* Bench */}
      {benchSquad.filter((p) => !p.isStarter).length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}>
            Bench
          </Typography>
          <Bench squad={benchSquad} />
        </Box>
      )}

      {/* Transfer Flags */}
      <Box
        sx={{
          padding: ThemeTokens.spacing.md,
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, marginBottom: 1 }}>
          Transfer Changes
        </Typography>
        <Stack spacing={0.5}>
          {plannedSquad
            .filter((p) => p.isTransferredIn || p.isTransferredOut)
            .map((p) => (
              <Typography key={p.playerId} variant="caption">
                {p.isTransferredIn && (
                  <Box component="span" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                    ✓ Player {p.playerId} (IN)
                  </Box>
                )}
                {p.isTransferredOut && (
                  <Box component="span" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                    ✗ Player {p.playerId} (OUT)
                  </Box>
                )}
              </Typography>
            ))}
        </Stack>
      </Box>
    </Stack>
  );
};
