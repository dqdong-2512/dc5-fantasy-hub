/**
 * Saved Plans Panel Component
 * Manages saved transfer plans
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadIcon from '@mui/icons-material/Download';
import { ThemeTokens } from '@shared/theme/tokens';
import type { TransferPlan } from '../../domain/TransferPlan';

export interface SavedPlansPanelProps {
  plans: TransferPlan[];
  onLoadPlan: (plan: TransferPlan) => void;
  onDeletePlan: (planId: string) => void;
  onRefreshPlans: () => void;
}

export const SavedPlansPanel: React.FC<SavedPlansPanelProps> = ({
  plans,
  onLoadPlan,
  onDeletePlan,
  onRefreshPlans,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteConfirm = (planId: string): void => {
    onDeletePlan(planId);
    setDeleteConfirm(null);
    onRefreshPlans();
  };

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', padding: ThemeTokens.spacing.lg }}>
          <Typography color="textSecondary" sx={{ marginBottom: 2 }}>
            No saved plans yet
          </Typography>
          <Typography variant="body2">Create a transfer plan and save it to see it here</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={ThemeTokens.spacing.lg}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Saved Plans ({plans.length})
        </Typography>
        <Button variant="text" onClick={onRefreshPlans} sx={{ textTransform: 'none' }}>
          Refresh
        </Button>
      </Box>

      <Stack spacing={ThemeTokens.spacing.md}>
        {plans.map((plan) => {
          const createdDate = new Date(plan.createdAt).toLocaleDateString();
          const updatedDate = new Date(plan.updatedAt).toLocaleDateString();

          return (
            <Card key={plan.id}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: ThemeTokens.spacing.md,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Created: {createdDate} • Updated: {updatedDate}
                    </Typography>

                    {/* Plan Details */}
                    <Box
                      sx={{
                        marginTop: ThemeTokens.spacing.md,
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Chip label={`GW${plan.gameweekId}`} size="small" variant="outlined" />
                      <Chip
                        label={`${plan.transfers.length} transfer${plan.transfers.length !== 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`£${plan.projectedBank.toFixed(1)}m`}
                        size="small"
                        sx={{
                          backgroundColor: plan.projectedBank >= 0 ? '#e8f5e9' : '#ffebee',
                          color: plan.projectedBank >= 0 ? '#2e7d32' : '#c62828',
                        }}
                      />
                      <Chip
                        label={plan.validation.isValid ? 'Valid Squad' : 'Invalid Squad'}
                        size="small"
                        sx={{
                          backgroundColor: plan.validation.isValid ? '#e8f5e9' : '#fff3e0',
                          color: plan.validation.isValid ? '#2e7d32' : '#e65100',
                        }}
                      />
                    </Box>

                    {/* Transfers List */}
                    {plan.transfers.length > 0 && (
                      <Box
                        sx={{
                          marginTop: ThemeTokens.spacing.md,
                          paddingTop: ThemeTokens.spacing.md,
                          borderTop: '1px solid #eee',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Transfers:
                        </Typography>
                        <Stack spacing={0.5} sx={{ marginTop: 0.5 }}>
                          {plan.transfers.map((transfer, idx) => (
                            <Typography key={idx} variant="caption">
                              {transfer.playerOutName} → {transfer.playerInName}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onLoadPlan(plan)}
                      title="Load plan"
                      sx={{ color: '#1976d2' }}
                    >
                      <LoadIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirm(plan.id)}
                      title="Delete plan"
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Plan?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={() => deleteConfirm && handleDeleteConfirm(deleteConfirm)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
