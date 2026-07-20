/**
 * BGW/DGW Analysis Panel
 * Shows blank and double gameweek analysis
 */

import React from 'react';
import { Box, Card, Stack, Typography, Chip } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { SeasonPlan } from '../../domain/SeasonPlan';

interface BGWDGWAnalysisPanelProps {
  plan: SeasonPlan;
}

export const BGWDGWAnalysisPanel: React.FC<BGWDGWAnalysisPanelProps> = ({ plan }) => {
  return (
    <Card sx={{ p: ThemeTokens.spacing.md }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        BGW / DGW Summary
      </Typography>

      <Stack spacing={2}>
        {Array.from({ length: plan.endGameweekId - plan.startGameweekId + 1 }, (_, i) => (
          <Box key={i}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 600, minWidth: 40 }}>
                GW{plan.startGameweekId + i}
              </Typography>
              <Chip label="Normal" size="small" variant="outlined" />
            </Stack>
          </Box>
        ))}
      </Stack>
    </Card>
  );
};
