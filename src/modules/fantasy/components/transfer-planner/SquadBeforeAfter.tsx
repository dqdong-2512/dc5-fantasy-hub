/**
 * Squad Before/After Component
 * Displays comparison metrics between current and planned squad
 */

import React from 'react';
import { Box, Typography, Card, CardContent, Stack, Chip } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { SquadComparisonMetrics } from '../../domain/TransferPlan';

export interface SquadBeforeAfterProps {
  metrics: SquadComparisonMetrics;
}

const MetricCard: React.FC<{
  label: string;
  before: string | number;
  after: string | number;
  higherIsBetter?: boolean;
}> = ({ label, before, after, higherIsBetter = true }) => {
  const numBefore = typeof before === 'number' ? before : parseFloat(String(before));
  const numAfter = typeof after === 'number' ? after : parseFloat(String(after));
  const change = numAfter - numBefore;
  const isBetter = higherIsBetter ? change > 0 : change < 0;

  const changeLabel =
    change > 0 ? `+${change.toFixed(1)}` : change < 0 ? `${change.toFixed(1)}` : '0.0';

  const changeColor = isBetter ? '#2e7d32' : change === 0 ? '#999' : '#d32f2f';

  return (
    <Card sx={{ backgroundColor: '#f9f9f9' }}>
      <CardContent>
        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            marginTop: 1,
            marginBottom: 1,
          }}
        >
          <Box>
            <Typography variant="caption" color="textSecondary">
              Current
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {before}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              After
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {after}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={changeLabel}
          size="small"
          sx={{
            backgroundColor: changeColor,
            color: '#fff',
            fontWeight: 700,
            width: '100%',
          }}
        />
      </CardContent>
    </Card>
  );
};

export const SquadBeforeAfter: React.FC<SquadBeforeAfterProps> = ({ metrics }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.lg }}>
        Squad Impact Analysis
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
          gap: ThemeTokens.spacing.md,
        }}
      >
        {/* Bank */}
        <MetricCard
          label="Bank"
          before={`£${metrics.bankBefore.toFixed(1)}m`}
          after={`£${metrics.bankAfter.toFixed(1)}m`}
          higherIsBetter={true}
        />

        {/* Squad Value */}
        <MetricCard
          label="Squad Value"
          before={`£${metrics.squadValueBefore.toFixed(1)}m`}
          after={`£${metrics.squadValueAfter.toFixed(1)}m`}
          higherIsBetter={true}
        />

        {/* Total Points */}
        <MetricCard
          label="Total Points"
          before={metrics.totalPointsBefore}
          after={metrics.totalPointsAfter}
          higherIsBetter={true}
        />

        {/* Average Form */}
        <MetricCard
          label="Average Form"
          before={metrics.avgFormBefore.toFixed(1)}
          after={metrics.avgFormAfter.toFixed(1)}
          higherIsBetter={true}
        />

        {/* Fixtures Score */}
        <MetricCard
          label="Avg Fixture Score"
          before={metrics.avgFixtureBefore.toFixed(1)}
          after={metrics.avgFixtureAfter.toFixed(1)}
          higherIsBetter={true}
        />
      </Box>

      {/* Summary */}
      <Card sx={{ marginTop: ThemeTokens.spacing.lg, backgroundColor: '#e8f5e9' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, marginBottom: 1 }}>
            Summary
          </Typography>
          <Stack spacing={0.5}>
            {metrics.totalPointsAfter > metrics.totalPointsBefore && (
              <Typography variant="body2">
                ✓ Squad will gain{' '}
                <strong>{metrics.totalPointsAfter - metrics.totalPointsBefore}</strong> potential
                points
              </Typography>
            )}
            {metrics.avgFormAfter > metrics.avgFormBefore && (
              <Typography variant="body2">
                ✓ Average form improves by{' '}
                <strong>{(metrics.avgFormAfter - metrics.avgFormBefore).toFixed(1)}</strong>
              </Typography>
            )}
            {metrics.bankAfter >= metrics.bankBefore && (
              <Typography variant="body2">
                ✓ Bank remains strong at <strong>£{metrics.bankAfter.toFixed(1)}m</strong>
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
