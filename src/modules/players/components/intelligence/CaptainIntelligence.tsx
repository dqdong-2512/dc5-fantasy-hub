/**
 * Captain Intelligence Component
 * Displays captain-specific evaluation metrics
 */

import React from 'react';
import { Box, Typography, Card, CardContent, Stack, Chip } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface CaptainIntelligenceProps {
  playerForm: number;
  playerOwnership: number;
}

/**
 * Captain Intelligence
 * Shows captain score, expected points, and risk assessment
 */
export function CaptainIntelligence({
  playerForm,
  playerOwnership,
}: CaptainIntelligenceProps): React.ReactElement {
  // Placeholder algorithm for captain score
  const captainScore = Math.min(100, Math.floor(playerForm * 10 + playerOwnership / 2));
  const expectedPoints = Math.floor(playerForm * 2 + 5);
  const riskLevel = playerOwnership > 50 ? 'high' : playerOwnership > 30 ? 'medium' : 'low';

  const getRiskColor = (risk: string): string => {
    const colors: Record<string, string> = {
      high: '#e53935',
      medium: '#fbc02d',
      low: '#43a047',
    };
    return colors[risk] || '#999';
  };

  const getRiskLabel = (risk: string): string => {
    const labels: Record<string, string> = {
      high: 'High Risk',
      medium: 'Medium Risk',
      low: 'Low Risk',
    };
    return labels[risk] || risk;
  };

  return (
    <Box>
      <Typography
        variant={ThemeTokens.typography.subsectionTitleVariant}
        sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
      >
        Captain Intelligence
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={ThemeTokens.spacing.lg}>
            {/* Captain Score */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: ThemeTokens.spacing.md,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Captain Score
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, marginTop: ThemeTokens.spacing.xs }}
                >
                  {captainScore}
                  <Typography component="span" variant="body2" color="text.secondary">
                    /100
                  </Typography>
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `conic-gradient(#43a047 ${captainScore * 3.6}deg, #e0e0e0 ${captainScore * 3.6}deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    backgroundColor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {Math.round((captainScore / 100) * 100)}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Expected Points & Risk */}
            <Box
              sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: ThemeTokens.spacing.md }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Expected Points
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, marginTop: ThemeTokens.spacing.xs }}
                >
                  {expectedPoints}
                  <Typography component="span" variant="caption" color="text.secondary">
                    {' '}
                    pts
                  </Typography>
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', marginBottom: ThemeTokens.spacing.xs }}
                >
                  Captaincy Risk
                </Typography>
                <Chip
                  label={getRiskLabel(riskLevel)}
                  size="small"
                  sx={{
                    backgroundColor: getRiskColor(riskLevel),
                    color: '#fff',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>

            {/* Info */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ marginTop: ThemeTokens.spacing.md }}
            >
              Based on current form and ownership levels. Diversify your captaincy choices for
              better results.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
