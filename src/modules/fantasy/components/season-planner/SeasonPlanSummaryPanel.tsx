/**
 * Season Plan Summary Panel
 * Shows overview metrics
 */

import React from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { SeasonPlan } from '../../domain/SeasonPlan';

interface SeasonPlanSummaryPanelProps {
  plan: SeasonPlan;
}

const MetricBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <Box sx={{ textAlign: 'center', p: 1 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
      {value}
    </Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
  </Box>
);

export const SeasonPlanSummaryPanel: React.FC<SeasonPlanSummaryPanelProps> = ({ plan }) => {
  const plannedTransfers = plan.entries.filter((e) => e.transferPlanId).length;
  const gameweekPlans = plan.entries.filter((e) => e.gameweekPlanId).length;
  const plannedChips = plan.entries.filter((e) => e.chipPlan).length;
  const totalGameweeks = plan.endGameweekId - plan.startGameweekId + 1;

  return (
    <Card sx={{ p: ThemeTokens.spacing.md }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Season Plan Summary
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 1,
          mb: 2,
        }}
      >
        <MetricBox label="Gameweeks" value={totalGameweeks} />
        <MetricBox label="Planned Transfers" value={plannedTransfers} />
        <MetricBox label="Lineup Plans" value={gameweekPlans} />
        <MetricBox label="Planned Chips" value={plannedChips} />
      </Box>

      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            <strong>Planning Period:</strong> GW{plan.startGameweekId} - GW{plan.endGameweekId}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            <strong>Base Squad:</strong>{' '}
            {plan.baseSquadSource === 'current' ? 'Current Squad' : 'Active Planned Squad'}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
};
