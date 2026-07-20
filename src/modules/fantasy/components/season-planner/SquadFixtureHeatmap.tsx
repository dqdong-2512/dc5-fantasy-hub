/**
 * Squad Fixture Heatmap
 * Shows squad player fixture outlook across gameweeks
 */

import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

interface SquadFixtureHeatmapProps {
  // Placeholder interface for future implementation
}

export const SquadFixtureHeatmap: React.FC<SquadFixtureHeatmapProps> = () => {
  return (
    <Card sx={{ p: ThemeTokens.spacing.md }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Squad Fixture Outlook
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Player-by-gameweek fixture difficulty heatmap
      </Typography>

      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Squad data loading...
        </Typography>
      </Box>
    </Card>
  );
};
