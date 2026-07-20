/**
 * Chip Strategy Panel
 * Manages chip planning
 */

import React from 'react';
import { Box, Card, Button, Stack, Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { SeasonPlan } from '../../domain/SeasonPlan';

interface ChipStrategyPanelProps {
  plan: SeasonPlan;
  onPlanChange: (plan: SeasonPlan) => void;
}

export const ChipStrategyPanel: React.FC<ChipStrategyPanelProps> = ({ plan }) => {
  const plannedChips = plan.entries.filter((e) => e.chipPlan);

  return (
    <Card sx={{ p: ThemeTokens.spacing.md }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Chip Strategy
      </Typography>

      {plannedChips.length > 0 ? (
        <Stack spacing={1.5}>
          {plannedChips.map((entry) => (
            <Box
              key={entry.gameweekId}
              sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
            >
              <Stack
                sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography variant="body2">
                  <strong>GW{entry.gameweekId}:</strong> {entry.chipPlan?.chipType.toUpperCase()}
                </Typography>
                <Button size="small" color="error">
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          No chips planned yet. Select a gameweek in the timeline to add a chip.
        </Typography>
      )}

      <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
        Available chips: Wildcard, Free Hit, Bench Boost, Triple Captain
      </Typography>
    </Card>
  );
};
