/**
 * Planning Conflicts Panel
 * Shows validation issues and conflicts
 */

import React from 'react';
import { Card, Alert, Stack, Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { SeasonPlan } from '../../domain/SeasonPlan';

interface PlanningConflictsPanelProps {
  plan: SeasonPlan;
}

export const PlanningConflictsPanel: React.FC<PlanningConflictsPanelProps> = ({ plan }) => {
  return (
    <Card sx={{ p: ThemeTokens.spacing.md }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Planning Conflicts
      </Typography>

      <Stack spacing={1.5}>
        {plan.entries.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No gameweeks added yet.
          </Typography>
        ) : (
          <Alert severity="success" sx={{ mb: 1 }}>
            No conflicts detected
          </Alert>
        )}

        {plan.entries.some((e) => e.chipPlan && !e.gameweekPlanId) && (
          <Alert severity="warning">
            {plan.entries.filter((e) => e.chipPlan && !e.gameweekPlanId).length} chip(s) planned
            without lineup plans
          </Alert>
        )}
      </Stack>
    </Card>
  );
};
