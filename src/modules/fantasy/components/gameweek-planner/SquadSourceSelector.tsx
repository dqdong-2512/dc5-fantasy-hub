/**
 * Squad Source Selector Component
 * Allows switching between current squad and planned squad
 */

import React, { useMemo } from 'react';
import { Box, Button, Stack, Typography, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { SquadSourceType } from '../../domain/GameweekPlan';
import { SquadSourceResolver } from '../../services';

export interface SquadSourceSelectorProps {
  sourceType: SquadSourceType;
  sourceTransferPlanId?: string;
  onSourceChange: (sourceType: SquadSourceType, transferPlanId?: string) => void;
}

export const SquadSourceSelector: React.FC<SquadSourceSelectorProps> = ({
  sourceType,
  onSourceChange,
}) => {
  const resolver = useMemo(() => new SquadSourceResolver(), []);
  const [showPlannedDialog, setShowPlannedDialog] = React.useState(false);

  const availablePlans = useMemo(() => resolver.getAvailableGameweekPlans(0), [resolver]);
  const hasPlannedSquad = availablePlans.length > 0;

  const handleSelectPlanned = (transferPlanId: string) => {
    onSourceChange('planned', transferPlanId);
    setShowPlannedDialog(false);
  };

  return (
    <>
      <Stack direction="row" spacing={ThemeTokens.spacing.md} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
          Squad Source
        </Typography>
        <Stack direction="row" spacing={ThemeTokens.spacing.sm}>
          <Button
            variant={sourceType === 'current' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => onSourceChange('current')}
          >
            Current Squad
          </Button>
          <Button
            variant={sourceType === 'planned' ? 'contained' : 'outlined'}
            size="small"
            disabled={!hasPlannedSquad}
            onClick={() => setShowPlannedDialog(true)}
          >
            Planned Squad
          </Button>
        </Stack>
      </Stack>

      {/* Planned Squad Selection Dialog */}
      <Dialog open={showPlannedDialog} onClose={() => setShowPlannedDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Planned Squad</DialogTitle>
        <DialogContent>
          <Stack spacing={ThemeTokens.spacing.md} sx={{ mt: ThemeTokens.spacing.md }}>
            {availablePlans.map((plan: any) => (
              <Button
                key={plan.id}
                variant="outlined"
                fullWidth
                onClick={() => handleSelectPlanned(plan.id)}
                sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {plan.name}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};
