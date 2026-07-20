/**
 * Saved Season Plans Panel
 * Lists and manages saved season plans
 */

import React from 'react';
import {
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { SeasonPlan } from '../../domain/SeasonPlan';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileCopyIcon from '@mui/icons-material/FileCopy';

interface SavedSeasonPlansPanelProps {
  plans: SeasonPlan[];
  onLoadPlan: (plan: SeasonPlan) => void;
  onDeletePlan: (planId: string) => void;
}

export const SavedSeasonPlansPanel: React.FC<SavedSeasonPlansPanelProps> = ({
  plans,
  onLoadPlan,
  onDeletePlan,
}) => {
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<SeasonPlan | null>(null);
  const [newName, setNewName] = React.useState('');

  const handleRename = (plan: SeasonPlan) => {
    setSelectedPlan(plan);
    setNewName(plan.name);
    setRenameDialogOpen(true);
  };

  const handleDuplicate = (plan: SeasonPlan) => {
    const duplicated: SeasonPlan = {
      ...plan,
      id: `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${plan.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onLoadPlan(duplicated);
  };

  return (
    <Card sx={{ p: ThemeTokens.spacing.md }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Saved Season Plans ({plans.length})
      </Typography>

      {plans.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No saved plans yet. Create a new one to get started.
        </Typography>
      ) : (
        <List sx={{ width: '100%' }}>
          {plans.map((plan) => (
            <ListItem
              key={plan.id}
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleRename(plan)}>
                    Rename
                  </Button>
                  <Button
                    size="small"
                    startIcon={<FileCopyIcon />}
                    onClick={() => handleDuplicate(plan)}
                  >
                    Copy
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDeletePlan(plan.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              }
              disablePadding
              sx={{ mb: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
            >
              <ListItemButton onClick={() => onLoadPlan(plan)}>
                <ListItemText
                  primary={plan.name}
                  secondary={`GW${plan.startGameweekId}-${plan.endGameweekId} • ${plan.entries.length} gameweeks planned • ${new Date(plan.updatedAt).toLocaleDateString()}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Rename Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rename Plan</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Plan Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedPlan) {
                const updated = { ...selectedPlan, name: newName };
                onLoadPlan(updated);
              }
              setRenameDialogOpen(false);
            }}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
