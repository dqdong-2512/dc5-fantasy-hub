/**
 * Planning Horizon Selector
 * Allows user to select planning duration
 */

import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

interface PlanningHorizonSelectorProps {
  startGameweek: number;
  endGameweek: number;
  onStartChange: (gw: number) => void;
  onEndChange: (gw: number) => void;
}

const PRESET_RANGES = [
  { label: 'Next 3 GWs', duration: 3 },
  { label: 'Next 5 GWs', duration: 5 },
  { label: 'Next 8 GWs', duration: 8 },
  { label: 'Next 10 GWs', duration: 10 },
];

export const PlanningHorizonSelector: React.FC<PlanningHorizonSelectorProps> = ({
  startGameweek,
  endGameweek,
  onStartChange,
  onEndChange,
}) => {
  const currentDuration = endGameweek - startGameweek + 1;

  const handlePreset = (duration: number) => {
    onStartChange(startGameweek);
    onEndChange(Math.min(startGameweek + duration - 1, 38));
  };

  return (
    <Box
      sx={{
        p: ThemeTokens.spacing.md,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        Planning Horizon
      </Typography>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {PRESET_RANGES.map((preset) => (
          <Button
            key={preset.duration}
            size="small"
            variant={currentDuration === preset.duration ? 'contained' : 'outlined'}
            onClick={() => handlePreset(preset.duration)}
          >
            {preset.label}
          </Button>
        ))}
      </Stack>

      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
        Currently: GW{startGameweek}-{endGameweek} ({currentDuration} gameweeks)
      </Typography>
    </Box>
  );
};
