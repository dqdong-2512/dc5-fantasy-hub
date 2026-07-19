/**
 * Transfer Plan Summary Component
 * Shows list of transfers in the plan with remove buttons
 */

import React from 'react';
import { Box, Typography, Card, CardContent, Stack, IconButton, Chip, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ThemeTokens } from '@shared/theme/tokens';
import type { TransferPlan } from '../../domain/TransferPlan';

export interface TransferPlanSummaryProps {
  plan: TransferPlan;
  onRemoveTransfer: (index: number) => void;
  onClearPlan: () => void;
}

export const TransferPlanSummary: React.FC<TransferPlanSummaryProps> = ({
  plan,
  onRemoveTransfer,
  onClearPlan,
}) => {
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: ThemeTokens.spacing.md,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Transfers ({plan.transfers.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {plan.transfers.length > 0 && (
              <Chip
                label={`£${plan.projectedBank.toFixed(1)}m remaining`}
                icon={<Box />}
                sx={{
                  backgroundColor: plan.projectedBank >= 0 ? '#e8f5e9' : '#ffebee',
                  color: plan.projectedBank >= 0 ? '#2e7d32' : '#c62828',
                  fontWeight: 700,
                }}
              />
            )}
          </Box>
        </Box>

        {/* Validation Alert */}
        {!plan.validation.isValid && (
          <Alert severity="warning" sx={{ marginBottom: ThemeTokens.spacing.md }}>
            <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 0.5 }}>
              Squad Issues:
            </Typography>
            {plan.validation.errors.map((err, idx) => (
              <Typography key={idx} variant="caption" sx={{ display: 'block' }}>
                • {err.message}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Transfer List */}
        <Stack spacing={1}>
          {plan.transfers.map((transfer, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: ThemeTokens.spacing.md,
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                border: '1px solid #eee',
              }}
            >
              {/* Transfer Details */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.md }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {transfer.playerOutName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Out • £{(transfer.sellingPriceOut / 10).toFixed(1)}m
                    </Typography>
                  </Box>

                  <ArrowForwardIcon sx={{ color: '#999' }} />

                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                      {transfer.playerInName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      In • £{(transfer.purchasePriceIn / 10).toFixed(1)}m
                    </Typography>
                  </Box>
                </Box>

                {/* Bank Change */}
                <Box sx={{ marginTop: ThemeTokens.spacing.sm, display: 'flex', gap: 2 }}>
                  <Chip
                    label={`Bank: £${(transfer.bankBefore / 10).toFixed(1)}m → £${(transfer.bankAfter / 10).toFixed(1)}m`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Remove Button */}
              <IconButton
                size="small"
                onClick={() => onRemoveTransfer(idx)}
                sx={{ color: '#d32f2f', marginLeft: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Stack>

        {/* Clear All Button */}
        {plan.transfers.length > 0 && (
          <Box sx={{ marginTop: ThemeTokens.spacing.lg, textAlign: 'center' }}>
            <Typography
              variant="body2"
              onClick={onClearPlan}
              sx={{
                cursor: 'pointer',
                color: '#d32f2f',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Clear all transfers
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
