/**
 * Saved Gameweek Plans Component
 * Manages saving, loading, deleting, renaming, and duplicating plans
 */

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { GameweekPlan } from '../../domain/GameweekPlan';
import { GameweekPlanRepository } from '../../services';

export interface SavedGameweekPlansProps {
  gameweekId: number;
  currentPlanId?: string;
  onLoadPlan: (plan: GameweekPlan) => void;
  onDeletePlan: (planId: string) => void;
  onRenamePlan: (planId: string, newName: string) => void;
  onDuplicatePlan: (plan: GameweekPlan) => void;
}

export const SavedGameweekPlans: React.FC<SavedGameweekPlansProps> = ({
  gameweekId,
  currentPlanId,
  onLoadPlan,
  onDeletePlan,
  onRenamePlan,
  onDuplicatePlan,
}) => {
  const repository = useMemo(() => new GameweekPlanRepository(), []);
  const [plans, setPlans] = useState<GameweekPlan[]>(() => repository.loadAll(gameweekId));
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingPlanId, setRenamingPlanId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPlanId, setMenuPlanId] = useState<string | null>(null);

  const handleLoadPlan = (plan: GameweekPlan) => {
    onLoadPlan(plan);
  };

  const handleDeletePlan = (planId: string) => {
    onDeletePlan(planId);
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    setAnchorEl(null);
  };

  const handleOpenRenameDialog = (planId: string, currentName: string) => {
    setRenamingPlanId(planId);
    setNewName(currentName);
    setRenameDialogOpen(true);
    setAnchorEl(null);
  };

  const handleConfirmRename = () => {
    if (renamingPlanId && newName.trim()) {
      onRenamePlan(renamingPlanId, newName);
      setPlans((prev) => prev.map((p) => (p.id === renamingPlanId ? { ...p, name: newName } : p)));
      setRenameDialogOpen(false);
      setRenamingPlanId(null);
      setNewName('');
    }
  };

  const handleDuplicatePlan = (plan: GameweekPlan) => {
    onDuplicatePlan(plan);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, planId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuPlanId(planId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuPlanId(null);
  };

  if (plans.length === 0) {
    return (
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
        >
          Saved Plans
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
          No saved plans for this gameweek. Create and save a plan to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
        >
          Saved Plans ({plans.length})
        </Typography>
        <Stack spacing={ThemeTokens.spacing.md}>
          {plans.map((plan) => (
            <Card
              key={plan.id}
              sx={{
                border: currentPlanId === plan.id ? '2px solid #1976d2' : undefined,
                backgroundColor: currentPlanId === plan.id ? '#f3f6ff' : 'transparent',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: ThemeTokens.spacing.md,
                    alignItems: 'center',
                  }}
                >
                  <Box onClick={() => handleLoadPlan(plan)} sx={{ flex: 1, cursor: 'pointer' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Created: {plan.createdAt.toLocaleDateString()} • Source: {plan.sourceType}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: ThemeTokens.spacing.sm }}>
                    <Button
                      variant={currentPlanId === plan.id ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleLoadPlan(plan)}
                    >
                      Load
                    </Button>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, plan.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            const plan = plans.find((p) => p.id === menuPlanId);
            if (plan) {
              handleOpenRenameDialog(plan.id, plan.name);
            }
          }}
        >
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            const plan = plans.find((p) => p.id === menuPlanId);
            if (plan) {
              handleDuplicatePlan(plan);
            }
          }}
        >
          Duplicate
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuPlanId) {
              handleDeletePlan(menuPlanId);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rename Plan</DialogTitle>
        <DialogContent sx={{ pt: ThemeTokens.spacing.md }}>
          <TextField
            autoFocus
            fullWidth
            label="Plan Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirmRename();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRename} variant="contained">
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
