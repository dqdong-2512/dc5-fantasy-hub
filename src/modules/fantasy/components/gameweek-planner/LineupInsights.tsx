/**
 * Lineup Insights Component
 * Displays transparent, rule-based insights about the lineup
 */

import React from 'react';
import { Box, Typography, Stack, Alert } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { LineupInsight } from '../../domain/GameweekPlan';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

export interface LineupInsightsProps {
  insights: LineupInsight[];
}

export const LineupInsights: React.FC<LineupInsightsProps> = ({ insights }) => {
  if (insights.length === 0) {
    return (
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
        >
          Lineup Insights
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
          No insights available for current lineup
        </Typography>
      </Box>
    );
  }

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'warning':
        return <WarningIcon sx={{ fontSize: '1.2rem' }} />;
      case 'consideration':
        return <LightbulbIcon sx={{ fontSize: '1.2rem' }} />;
      default:
        return <InfoIcon sx={{ fontSize: '1.2rem' }} />;
    }
  };

  const getColor = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'warning';
      case 'consideration':
        return 'info';
      default:
        return 'info';
    }
  };

  const getSeverityLabel = (
    type: string
  ): { label: string; severity: 'info' | 'warning' | 'consideration' } => {
    switch (type) {
      case 'strong_bench_option':
        return { label: 'Strong Bench Option', severity: 'consideration' };
      case 'difficult_fixture_starting':
        return { label: 'Difficult Fixture', severity: 'info' };
      case 'easier_bench_fixture':
        return { label: 'Easier Bench Fixture', severity: 'consideration' };
      case 'high_form_bench':
        return { label: 'High Form on Bench', severity: 'info' };
      case 'blank_gameweek_starting':
        return { label: 'Blank Gameweek', severity: 'warning' };
      case 'double_gameweek_bench':
        return { label: 'Double Gameweek', severity: 'info' };
      case 'captain_has_blank':
        return { label: 'Captain Blank', severity: 'warning' };
      case 'low_form_captain':
        return { label: 'Low Form Captain', severity: 'info' };
      default:
        return { label: 'Insight', severity: 'info' };
    }
  };

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
      >
        Lineup Insights ({insights.length})
      </Typography>
      <Stack spacing={ThemeTokens.spacing.sm}>
        {insights.map((insight, idx) => {
          const { label, severity } = getSeverityLabel(insight.type);
          const severityColor = getColor(severity);

          return (
            <Alert key={idx} severity={severityColor as any} sx={{ alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', gap: ThemeTokens.spacing.sm, alignItems: 'flex-start' }}>
                <Box sx={{ pt: 0.5 }}>{getIcon(severity)}</Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: '2px' }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {insight.message}
                  </Typography>
                </Box>
              </Box>
            </Alert>
          );
        })}
      </Stack>
    </Box>
  );
};
