/**
 * Transfer Intelligence Component
 * Displays transfer trends, price trends, and ownership trends
 */

import React from 'react';
import { Box, Typography, Card, CardContent, Stack, LinearProgress } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { ComingSoonCard } from '@shared/components';

export interface TransferIntelligenceProps {
  playerPrice: number;
  playerOwnership: number;
}

/**
 * Intelligence Metric Card
 * Reusable card for displaying a single metric
 */
function IntelligenceMetricCard({
  title,
  value,
  subtitle,
  trendIndicator,
}: {
  title: string;
  value: string;
  subtitle?: string;
  trendIndicator?: 'up' | 'down' | 'neutral';
}): React.ReactElement {
  const getTrendColor = (trend?: string): string => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getTrendSymbol = (trend?: string): string => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          gap: ThemeTokens.spacing.sm,
          marginTop: ThemeTokens.spacing.sm,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
        {trendIndicator && (
          <Typography
            variant="caption"
            sx={{
              color: getTrendColor(trendIndicator),
              fontWeight: 600,
            }}
          >
            {getTrendSymbol(trendIndicator)}
          </Typography>
        )}
      </Box>
      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', marginTop: ThemeTokens.spacing.xs }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Transfer Intelligence
 * Shows transfer trends, price trends, and ownership patterns
 */
export function TransferIntelligence({
  playerPrice,
  playerOwnership,
}: TransferIntelligenceProps): React.ReactElement {
  return (
    <Box>
      <Typography
        variant={ThemeTokens.typography.subsectionTitleVariant}
        sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
      >
        Transfer Intelligence
      </Typography>

      <Stack spacing={ThemeTokens.spacing.md}>
        {/* Market Position Summary */}
        <Card>
          <CardContent>
            <Stack spacing={ThemeTokens.spacing.lg}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: ThemeTokens.spacing.lg,
                }}
              >
                <IntelligenceMetricCard
                  title="Price"
                  value={`£${(playerPrice / 10).toFixed(1)}m`}
                  subtitle="Current market value"
                  trendIndicator="neutral"
                />
                <IntelligenceMetricCard
                  title="Ownership"
                  value={`${playerOwnership.toFixed(1)}%`}
                  subtitle="Selected by managers"
                  trendIndicator="neutral"
                />
                <IntelligenceMetricCard
                  title="Transfers In"
                  value="—"
                  subtitle="Gameweek"
                  trendIndicator="up"
                />
              </Box>

              <Box
                sx={{
                  paddingY: ThemeTokens.spacing.md,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', marginBottom: ThemeTokens.spacing.md }}
                >
                  Transfer Activity (Last 5 GWs)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={45}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    backgroundColor: 'action.disabledBackground',
                  }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Transfer Trend - Coming Soon */}
        <ComingSoonCard title="Transfer Trend" subtitle="In/Out transfer analysis" />

        {/* Price Trend - Coming Soon */}
        <ComingSoonCard title="Price Trend" subtitle="Historical price movements" />

        {/* Ownership Trend - Coming Soon */}
        <ComingSoonCard title="Ownership Trend" subtitle="Selection rate over time" />
      </Stack>
    </Box>
  );
}
