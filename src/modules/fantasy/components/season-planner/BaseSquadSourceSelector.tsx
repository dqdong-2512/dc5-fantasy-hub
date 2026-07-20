/**
 * Base Squad Source Selector
 * Allows choosing between current squad and active planned squad
 */

import React from 'react';
import { Box, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { BaseSquadSourceType } from '../../domain/SeasonPlan';

interface BaseSquadSourceSelectorProps {
  source: BaseSquadSourceType;
  onChange: (source: BaseSquadSourceType) => void;
}

export const BaseSquadSourceSelector: React.FC<BaseSquadSourceSelectorProps> = ({
  source,
  onChange,
}) => {
  return (
    <Box
      sx={{
        p: ThemeTokens.spacing.md,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
        Base Squad Source
      </Typography>

      <FormControl component="fieldset">
        <RadioGroup
          value={source}
          onChange={(e) => onChange(e.target.value as BaseSquadSourceType)}
        >
          <FormControlLabel value="current" control={<Radio />} label="Current Squad" />
          <Typography
            variant="caption"
            sx={{ display: 'block', ml: 4, mb: 1.5, color: 'text.secondary' }}
          >
            Plan from your actual current squad
          </Typography>

          <FormControlLabel
            value="active_planned"
            control={<Radio />}
            label="Active Planned Squad"
          />
          <Typography variant="caption" sx={{ display: 'block', ml: 4, color: 'text.secondary' }}>
            Plan from a previously saved transfer plan result
          </Typography>
        </RadioGroup>
      </FormControl>
    </Box>
  );
};
