/**
 * Transfer Comparison Component
 * Side-by-side comparison of outgoing vs incoming player
 * Reuses existing player comparison logic
 */

import React, { useMemo } from 'react';
import { Box, Typography, Card, CardContent, Stack, Chip } from '@mui/material';
import { PlayerRepository } from '@repositories/players';
import { ThemeTokens } from '@shared/theme/tokens';

export interface TransferComparisonProps {
  outgoingPlayerId: number;
  incomingPlayerId: number;
  availableBudget: number;
}

const ComparisonRow: React.FC<{
  label: string;
  valueOut: string | number;
  valueIn: string | number;
  higherIsBetter?: boolean;
}> = ({ label, valueOut, valueIn, higherIsBetter = true }) => {
  const numOut = typeof valueOut === 'number' ? valueOut : parseFloat(String(valueOut));
  const numIn = typeof valueIn === 'number' ? valueIn : parseFloat(String(valueIn));
  const isBetter = higherIsBetter ? numIn > numOut : numIn < numOut;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: ThemeTokens.spacing.md,
        alignItems: 'center',
        padding: ThemeTokens.spacing.sm,
        borderBottom: '1px solid #eee',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: isBetter && !higherIsBetter ? '#2e7d32' : '#999',
        }}
      >
        {valueOut}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: isBetter && higherIsBetter ? '#2e7d32' : '#999',
          textAlign: 'right',
        }}
      >
        {valueIn}
      </Typography>
    </Box>
  );
};

export const TransferComparison: React.FC<TransferComparisonProps> = ({
  outgoingPlayerId,
  incomingPlayerId,
  availableBudget,
}) => {
  const playerRepo = useMemo(() => new PlayerRepository(), []);

  const outPlayer = useMemo(
    () => playerRepo.getById(outgoingPlayerId),
    [outgoingPlayerId, playerRepo]
  );

  const inPlayer = useMemo(
    () => playerRepo.getById(incomingPlayerId),
    [incomingPlayerId, playerRepo]
  );

  if (!outPlayer || !inPlayer) return null;

  const outPrice = outPlayer.price / 10;
  const inPrice = inPlayer.price / 10;
  const priceDiff = inPrice - outPrice;
  const bankAfter = availableBudget - priceDiff;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}>
          Transfer Comparison
        </Typography>

        {/* Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: ThemeTokens.spacing.md,
            marginBottom: ThemeTokens.spacing.md,
            paddingBottom: ThemeTokens.spacing.md,
            borderBottom: '2px solid #1976d2',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Metric
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Current
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>
            Target
          </Typography>
        </Box>

        {/* Rows */}
        <Stack spacing={0}>
          <ComparisonRow
            label="Player"
            valueOut={outPlayer.displayName}
            valueIn={inPlayer.displayName}
          />
          <ComparisonRow label="Club" valueOut={outPlayer.club} valueIn={inPlayer.club} />
          <ComparisonRow
            label="Price"
            valueOut={`£${outPrice.toFixed(1)}m`}
            valueIn={`£${inPrice.toFixed(1)}m`}
          />
          <ComparisonRow
            label="Form"
            valueOut={outPlayer.form.toFixed(1)}
            valueIn={inPlayer.form.toFixed(1)}
            higherIsBetter={true}
          />
          <ComparisonRow
            label="Total Points"
            valueOut={outPlayer.totalPoints}
            valueIn={inPlayer.totalPoints}
            higherIsBetter={true}
          />
          <ComparisonRow
            label="Ownership"
            valueOut={`${outPlayer.ownership.toFixed(1)}%`}
            valueIn={`${inPlayer.ownership.toFixed(1)}%`}
          />
          <ComparisonRow
            label="Points Per Game"
            valueOut={outPlayer.pointsPerGame.toFixed(1)}
            valueIn={inPlayer.pointsPerGame.toFixed(1)}
            higherIsBetter={true}
          />
        </Stack>

        {/* Bank Impact */}
        <Box
          sx={{
            marginTop: ThemeTokens.spacing.lg,
            padding: ThemeTokens.spacing.md,
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}
          >
            Bank Impact
          </Typography>

          <Box
            sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: ThemeTokens.spacing.md }}
          >
            <Box>
              <Typography variant="caption" color="textSecondary">
                Current
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                £{availableBudget.toFixed(1)}m
              </Typography>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={priceDiff > 0 ? `+£${priceDiff.toFixed(1)}m` : `£${priceDiff.toFixed(1)}m`}
                  size="small"
                  sx={{
                    backgroundColor: priceDiff > 0 ? '#ffebee' : '#e8f5e9',
                    color: priceDiff > 0 ? '#c62828' : '#2e7d32',
                    fontWeight: 700,
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              marginTop: ThemeTokens.spacing.md,
              paddingTop: ThemeTokens.spacing.md,
              borderTop: '1px solid #ddd',
            }}
          >
            <Typography variant="caption" color="textSecondary">
              After Transfer
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: bankAfter >= 0 ? '#2e7d32' : '#c62828',
              }}
            >
              £{bankAfter.toFixed(1)}m
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
