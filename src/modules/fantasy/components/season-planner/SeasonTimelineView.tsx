/**
 * Season Timeline View
 * Displays gameweeks with planning information
 */

import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  Stack,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { SeasonPlan } from '../../domain/SeasonPlan';
import { ChipType } from '../../domain/SeasonPlan';

interface SeasonTimelineViewProps {
  plan: SeasonPlan;
  onPlanChange: (plan: SeasonPlan) => void;
}

export const SeasonTimelineView: React.FC<SeasonTimelineViewProps> = ({ plan, onPlanChange }) => {
  const [selectedGW, setSelectedGW] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const gameweeks = useMemo(() => {
    const gws = [];
    for (let i = plan.startGameweekId; i <= plan.endGameweekId; i++) {
      gws.push(i);
    }
    return gws;
  }, [plan.startGameweekId, plan.endGameweekId]);

  const getEntryForGW = (gw: number) => {
    return plan.entries.find((e) => e.gameweekId === gw);
  };

  const handleEditGW = (gw: number) => {
    setSelectedGW(gw);
    setDialogOpen(true);
  };

  const handleAddChip = (chipType: ChipType) => {
    if (!selectedGW) return;

    const entry = getEntryForGW(selectedGW) || { gameweekId: selectedGW };
    entry.chipPlan = {
      chipType,
      status: 'planned',
    };

    const newPlan = { ...plan };
    const existingIndex = newPlan.entries.findIndex((e) => e.gameweekId === selectedGW);
    if (existingIndex >= 0) {
      newPlan.entries[existingIndex] = entry;
    } else {
      newPlan.entries.push(entry);
    }

    onPlanChange(newPlan);
    setDialogOpen(false);
  };

  const chipColors: Record<ChipType, string> = {
    [ChipType.WILDCARD]: '#FF6B6B',
    [ChipType.FREE_HIT]: '#4ECDC4',
    [ChipType.BENCH_BOOST]: '#95E1D3',
    [ChipType.TRIPLE_CAPTAIN]: '#FFD93D',
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Planning Timeline
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          overflowX: 'auto',
          pb: 2,
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'divider',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'primary.main',
            borderRadius: '3px',
          },
        }}
      >
        {gameweeks.map((gw) => {
          const entry = getEntryForGW(gw);

          return (
            <Card
              key={gw}
              sx={{
                minWidth: 140,
                p: ThemeTokens.spacing.sm,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: 'primary.main',
                },
              }}
              onClick={() => handleEditGW(gw)}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  GW{gw}
                </Typography>

                {entry?.transferPlanId && (
                  <Chip label="Transfers Planned" size="small" color="primary" variant="outlined" />
                )}

                {entry?.gameweekPlanId && (
                  <Chip label="Lineup Planned" size="small" variant="outlined" />
                )}

                {entry?.chipPlan && (
                  <Chip
                    label={entry.chipPlan.chipType.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: chipColors[entry.chipPlan.chipType],
                      color: '#fff',
                    }}
                  />
                )}

                {entry?.notes && (
                  <Typography
                    variant="caption"
                    sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                  >
                    {entry.notes.substring(0, 30)}...
                  </Typography>
                )}
              </Stack>
            </Card>
          );
        })}
      </Stack>

      {/* Edit GW Dialog */}
      <Dialog
        open={dialogOpen && selectedGW !== null}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>GW{selectedGW} Planning</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2">Add or manage planning for this gameweek</Typography>

            <FormControl fullWidth>
              <InputLabel>Chip</InputLabel>
              <Select
                defaultValue=""
                label="Chip"
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddChip(e.target.value as ChipType);
                  }
                }}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value={ChipType.WILDCARD}>Wildcard</MenuItem>
                <MenuItem value={ChipType.FREE_HIT}>Free Hit</MenuItem>
                <MenuItem value={ChipType.BENCH_BOOST}>Bench Boost</MenuItem>
                <MenuItem value={ChipType.TRIPLE_CAPTAIN}>Triple Captain</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Notes"
              multiline
              rows={3}
              placeholder="Add notes for this gameweek..."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
