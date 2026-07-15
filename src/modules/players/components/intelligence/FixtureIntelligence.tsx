/**
 * Fixture Intelligence Component
 * Displays upcoming fixtures and fixture difficulty analysis
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import type { Player } from '@domain/models';
import { ThemeTokens } from '@shared/theme/tokens';
import { getTeamBadgeUrl } from '@shared/assets';
import {
  formatKickoffDate,
  getDifficultyColor,
  formatDifficulty,
} from '@shared/presentation/fixture-formats';
import { PlayerFixtureIntelligenceService } from '../../services';

export interface FixtureIntelligenceProps {
  player: Player;
}

/**
 * Fixture Intelligence
 * Shows upcoming fixtures, difficulty ratings, and fixture outlook
 */
export function FixtureIntelligence({ player }: FixtureIntelligenceProps): React.ReactElement {
  const fixtureService = useMemo(() => new PlayerFixtureIntelligenceService(), []);

  const summary = useMemo(
    () => fixtureService.getPlayerFixtureSummary(player),
    [fixtureService, player]
  );
  const outlook = useMemo(
    () => fixtureService.classifyFixtureOutlook(summary.avgDifficulty, summary.hasUpcomingFixtures),
    [fixtureService, summary.avgDifficulty, summary.hasUpcomingFixtures]
  );

  const outlookLabel = fixtureService.getFixtureOutlookLabel(outlook);
  const outlookColor = fixtureService.getFixtureOutlookColor(outlook);

  return (
    <Box>
      <Typography
        variant={ThemeTokens.typography.subsectionTitleVariant}
        sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
      >
        Fixture Intelligence
      </Typography>

      <Stack spacing={ThemeTokens.spacing.md}>
        {/* Fixture Outlook Card */}
        <Card>
          <CardContent>
            <Stack spacing={ThemeTokens.spacing.md}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', marginBottom: ThemeTokens.spacing.xs }}
                >
                  Fixture Outlook
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.md }}>
                  <Chip
                    label={outlookLabel}
                    size="small"
                    sx={{
                      backgroundColor: outlookColor,
                      color: 'white',
                      fontWeight: 600,
                      height: 28,
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Avg FDR: {fixtureService.formatAverageFdr(summary.avgDifficulty)}
                  </Typography>
                </Box>
              </Box>

              {summary.hasUpcomingFixtures && (
                <Box
                  sx={{
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    paddingTop: ThemeTokens.spacing.md,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', marginBottom: ThemeTokens.spacing.sm }}
                  >
                    Next 5 Fixtures Summary
                  </Typography>
                  <Stack direction="row" spacing={ThemeTokens.spacing.lg} sx={{ flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Home
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {summary.homeFixtures}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Away
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {summary.awayFixtures}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Easiest
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        FDR {summary.easiestDifficulty}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Hardest
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        FDR {summary.hardestDifficulty}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Upcoming Fixtures Table */}
        {summary.hasUpcomingFixtures ? (
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
              >
                Upcoming Fixtures (Next 5)
              </Typography>
              <TableContainer
                component={Paper}
                sx={{ borderRadius: ThemeTokens.borderRadius.sm, backgroundColor: 'transparent' }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>GW</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Opponent</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        H/A
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Date</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        FDR
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.upcomingFixtures.map((fixture, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {fixture.gameweek}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: ThemeTokens.spacing.sm,
                            }}
                          >
                            <Avatar
                              src={getTeamBadgeUrl(fixture.opponentBadge)}
                              sx={{ width: 24, height: 24 }}
                            />
                            <Typography sx={{ fontSize: '0.85rem' }}>
                              {fixture.opponent.shortName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {fixture.homeAway}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {formatKickoffDate(fixture.kickoffTime)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={formatDifficulty(fixture.difficulty)}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              backgroundColor: getDifficultyColor(fixture.difficulty),
                              color: 'white',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                No upcoming fixtures available. Season may be complete.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
