/**
 * Player Comparison Component
 * Allows comparing 2 players side-by-side
 */

import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  Autocomplete,
  Button,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { Player } from '@domain/models';
import { PlayerRepository } from '@repositories/players';
import { PlayerAnalyticsService } from '../services/player-analytics.service';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';

export interface PlayerComparisonProps {
  open: boolean;
  onClose: () => void;
  players?: Player[];
}

export const PlayerComparison: React.FC<PlayerComparisonProps> = ({
  open,
  onClose,
  players: allPlayers,
}) => {
  const playerRepository = useMemo(() => new PlayerRepository(), []);
  const analyticsService = useMemo(() => new PlayerAnalyticsService(), []);

  const [playerAId, setPlayerAId] = useState<number | null>(null);
  const [playerBId, setPlayerBId] = useState<number | null>(null);

  const allPlayersList = useMemo(
    () => allPlayers || playerRepository.getAll(),
    [allPlayers, playerRepository]
  );

  const playerA = useMemo(
    () => (playerAId ? playerRepository.getById(playerAId) : null),
    [playerAId, playerRepository]
  );

  const playerB = useMemo(
    () => (playerBId ? playerRepository.getById(playerBId) : null),
    [playerBId, playerRepository]
  );

  const analyticsA = useMemo(
    () => (playerA ? analyticsService.buildAnalyticsRecord(playerA) : null),
    [playerA, analyticsService]
  );

  const analyticsB = useMemo(
    () => (playerB ? analyticsService.buildAnalyticsRecord(playerB) : null),
    [playerB, analyticsService]
  );

  const renderMetricRow = (
    label: string,
    valueA: number | string,
    valueB: number | string,
    format: 'number' | 'price' | 'percentage' = 'number',
    higherIsBetter = true
  ) => {
    const formatValue = (v: number | string) => {
      if (typeof v === 'string') return v;
      switch (format) {
        case 'price':
          return `£${(v / 10).toFixed(1)}m`;
        case 'percentage':
          return `${v.toFixed(1)}%`;
        default:
          return v.toFixed(1);
      }
    };

    const isNumeric = typeof valueA === 'number' && typeof valueB === 'number';

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: ThemeTokens.spacing.md,
          padding: ThemeTokens.spacing.md,
          borderBottom: '1px solid #eee',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: higherIsBetter && isNumeric ? (valueA > valueB ? '#2e7d32' : '#999') : 'inherit',
          }}
        >
          {formatValue(valueA)}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: higherIsBetter && isNumeric ? (valueB > valueA ? '#2e7d32' : '#999') : 'inherit',
            textAlign: 'right',
          }}
        >
          {formatValue(valueB)}
        </Typography>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Player Comparison</span>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ paddingTop: ThemeTokens.spacing.lg }}>
        <Stack spacing={ThemeTokens.spacing.lg}>
          {/* Player Selection */}
          <Box
            sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: ThemeTokens.spacing.md }}
          >
            <Autocomplete
              options={allPlayersList}
              getOptionLabel={(option) => option.displayName}
              value={playerA}
              onChange={(_, value) => setPlayerAId(value?.id || null)}
              renderInput={(params) => <TextField {...params} label="Player A" />}
            />
            <Autocomplete
              options={allPlayersList}
              getOptionLabel={(option) => option.displayName}
              value={playerB}
              onChange={(_, value) => setPlayerBId(value?.id || null)}
              renderInput={(params) => <TextField {...params} label="Player B" />}
            />
          </Box>

          {/* Comparison Table */}
          {playerA && playerB && analyticsA && analyticsB && (
            <Paper>
              {/* Header */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: ThemeTokens.spacing.md,
                  padding: ThemeTokens.spacing.md,
                  backgroundColor: '#f5f5f5',
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>Metric</Typography>
                <Typography sx={{ fontWeight: 700 }}>{playerA.displayName}</Typography>
                <Typography sx={{ fontWeight: 700, textAlign: 'right' }}>
                  {playerB.displayName}
                </Typography>
              </Box>

              {/* Metrics */}
              {renderMetricRow('Price', playerA.price, playerB.price, 'price', false)}
              {renderMetricRow('Form', playerA.form, playerB.form, 'number')}
              {renderMetricRow('Total Points', playerA.totalPoints, playerB.totalPoints, 'number')}
              {renderMetricRow(
                'Points Per Game',
                playerA.pointsPerGame,
                playerB.pointsPerGame,
                'number'
              )}
              {renderMetricRow('Ownership', playerA.ownership, playerB.ownership, 'percentage')}
              {renderMetricRow(
                'Minutes Played',
                playerA.minutesPlayed,
                playerB.minutesPlayed,
                'number'
              )}

              <Box sx={{ padding: ThemeTokens.spacing.md, backgroundColor: '#f9f9f9' }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}
                >
                  Analytics Scores
                </Typography>
                {renderMetricRow(
                  'Value Score',
                  analyticsA.valueScore,
                  analyticsB.valueScore,
                  'number'
                )}
                {renderMetricRow(
                  'Differential Score',
                  analyticsA.differentialScore,
                  analyticsB.differentialScore,
                  'number'
                )}
                {renderMetricRow(
                  'Fixture Score',
                  analyticsA.fixtureScore,
                  analyticsB.fixtureScore,
                  'number'
                )}
                {renderMetricRow(
                  'Overall Score',
                  analyticsA.overallScore,
                  analyticsB.overallScore,
                  'number'
                )}
              </Box>
            </Paper>
          )}

          {!playerA || !playerB ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', padding: ThemeTokens.spacing.lg }}
            >
              Select two players to compare
            </Typography>
          ) : null}

          {/* Close Button */}
          <Button variant="outlined" onClick={onClose} fullWidth>
            Close
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
