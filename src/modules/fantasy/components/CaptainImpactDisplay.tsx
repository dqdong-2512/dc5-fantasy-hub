/**
 * Captain Impact Component
 * Displays captain multiplier contribution
 */

import React, { useMemo } from 'react';
import { Box, Typography, Card } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { ManagerGameweekSnapshot } from '@domain/models';

export interface CaptainImpactProps {
  snapshot: ManagerGameweekSnapshot;
}

export const CaptainImpact: React.FC<CaptainImpactProps> = ({ snapshot }) => {
  const captainContribution = useMemo(() => {
    if (!snapshot.captainId) return null;

    const captain = snapshot.playerContributions.find((p) => p.isCaptain);
    if (!captain) return null;

    return {
      playerName: captain.playerName || 'Unknown',
      rawPoints: captain.rawPoints,
      contribution: captain.managerPoints,
      gain: captain.managerPoints - captain.rawPoints,
    };
  }, [snapshot]);

  if (!captainContribution) {
    return null;
  }

  return (
    <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          marginBottom: 1.5,
          fontSize: '1rem',
        }}
      >
        Captain Impact
      </Typography>

      <Card sx={{ padding: 3, backgroundColor: '#fff9c4', borderLeft: '4px solid #ff9800' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
          >
            {captainContribution.playerName}
          </Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: '#666',
              }}
            >
              Base Points
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>{captainContribution.rawPoints}</Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 2,
            paddingTop: 2,
            borderTop: '1px solid #ffd54f',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#666', marginBottom: 0.5 }}>
              Multiplier
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>×2</Typography>
          </Box>

          <Typography
            sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.3rem', color: '#ff9800' }}
          >
            =
          </Typography>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#666', marginBottom: 0.5 }}>
              Contribution
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#ff9800' }}>
              {captainContribution.contribution}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{ marginTop: 2, paddingTop: 2, borderTop: '1px solid #ffd54f', textAlign: 'center' }}
        >
          <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>Captain Gain</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#ff9800' }}>
            +{captainContribution.gain} pts
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};
