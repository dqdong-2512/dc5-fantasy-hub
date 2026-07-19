/**
 * Plan Change Summary Component
 * Shows changes between source lineup and current plan
 */

import React, { useMemo } from 'react';
import { Box, Typography, Stack, Card, CardContent, Chip, LinearProgress } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { GameweekPlan, GameweekPlanComparison } from '../../domain/GameweekPlan';

export interface PlanChangeSummaryProps {
  plan: GameweekPlan;
  comparison: GameweekPlanComparison;
}

export const PlanChangeSummary: React.FC<PlanChangeSummaryProps> = ({ comparison }) => {
  const summaryStats = useMemo(() => {
    return {
      lineupChanges:
        comparison.playersMovedToStarting.length + comparison.playersMovedToBench.length,
      captainChanged: comparison.captainChanged,
      vcChanged: comparison.viceCaptainChanged,
      formImproved: comparison.avgFormAfter > comparison.avgFormBefore,
      formChange: Math.abs(comparison.avgFormAfter - comparison.avgFormBefore),
      fixtureImproved: comparison.avgFixtureScoreAfter > comparison.avgFixtureScoreBefore,
      fixtureChange: Math.abs(comparison.avgFixtureScoreAfter - comparison.avgFixtureScoreBefore),
    };
  }, [comparison]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}>
          Plan Summary
        </Typography>

        <Stack spacing={ThemeTokens.spacing.md}>
          {/* Lineup Changes */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Lineup Changes
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {summaryStats.lineupChanges} players
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: ThemeTokens.spacing.sm, flexWrap: 'wrap' }}>
              {summaryStats.lineupChanges > 0 ? (
                <>
                  {comparison.playersMovedToStarting.length > 0 && (
                    <Chip
                      label={`↑ ${comparison.playersMovedToStarting.length} to Starting XI`}
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                  )}
                  {comparison.playersMovedToBench.length > 0 && (
                    <Chip
                      label={`↓ ${comparison.playersMovedToBench.length} to Bench`}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  )}
                </>
              ) : (
                <Typography variant="caption" color="textSecondary">
                  No lineup changes
                </Typography>
              )}
            </Box>
          </Box>

          {/* Captain/VC Changes */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: '8px' }}>
              Captain & Vice Captain
            </Typography>
            <Box sx={{ display: 'flex', gap: ThemeTokens.spacing.sm, flexWrap: 'wrap' }}>
              {comparison.captainChanged && (
                <Chip label="Captain Changed" size="small" variant="outlined" color="warning" />
              )}
              {comparison.viceCaptainChanged && (
                <Chip label="Vice Captain Changed" size="small" variant="outlined" color="info" />
              )}
              {!comparison.captainChanged && !comparison.viceCaptainChanged && (
                <Typography variant="caption" color="textSecondary">
                  No captain changes
                </Typography>
              )}
            </Box>
          </Box>

          {/* Form Analysis */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Avg Form
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: summaryStats.formImproved ? '#4caf50' : '#f44336',
                }}
              >
                {comparison.avgFormBefore.toFixed(1)} → {comparison.avgFormAfter.toFixed(1)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (comparison.avgFormAfter / 10) * 100)}
              sx={{ height: 6, borderRadius: '3px' }}
            />
          </Box>

          {/* Fixture Difficulty */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Fixture Score
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: summaryStats.fixtureImproved ? '#4caf50' : '#f44336',
                }}
              >
                {comparison.avgFixtureScoreBefore.toFixed(1)} →{' '}
                {comparison.avgFixtureScoreAfter.toFixed(1)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (comparison.avgFixtureScoreAfter / 10) * 100)}
              sx={{ height: 6, borderRadius: '3px' }}
            />
          </Box>

          {/* Fixture Risks */}
          <Box sx={{ pt: ThemeTokens.spacing.md, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: '8px' }}>
              Fixture Coverage
            </Typography>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: ThemeTokens.spacing.md }}
            >
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                  Players with Blank
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {comparison.playersWithBlankBefore} → {comparison.playersWithBlankAfter}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                  Players with Double
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {comparison.playersWithDoubleFixtureBefore} →{' '}
                  {comparison.playersWithDoubleFixtureAfter}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
