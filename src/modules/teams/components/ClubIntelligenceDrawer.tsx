/**
 * Club Intelligence Detail Component
 * Displays comprehensive club analysis in a SideDrawer
 */

import React, { useMemo } from 'react';
import {
  Drawer,
  Box,
  Stack,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import type { Team } from '@domain/models';
import { ThemeTokens } from '@shared/theme/tokens';
import { getTeamBadgeUrl } from '@shared/assets';
import { ClubIntelligenceService } from '../insights';
import { getDifficultyColor } from '@shared/presentation/fixture-formats';

export interface ClubIntelligenceDrawerProps {
  team: Team | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Club Intelligence Detail Drawer
 * Shows complete club profile including strength, fixtures, and key players
 */
export function ClubIntelligenceDrawer({
  team,
  open,
  onClose,
}: ClubIntelligenceDrawerProps): React.ReactElement {
  const service = useMemo(() => new ClubIntelligenceService(), []);

  const intelligence = useMemo(() => (team ? service.analyzeClub(team) : null), [team, service]);

  if (!intelligence) {
    return <Drawer anchor="right" open={open} onClose={onClose} />;
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 500, md: 600 } } } }}
    >
      <Box sx={{ padding: ThemeTokens.spacing.lg, height: '100%', overflow: 'auto' }}>
        {/* Club Header */}
        <Stack spacing={ThemeTokens.spacing.md} sx={{ marginBottom: ThemeTokens.spacing.lg }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.md }}>
            <Avatar src={getTeamBadgeUrl(intelligence.team.code)} sx={{ width: 64, height: 64 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {intelligence.team.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {intelligence.team.shortName} • 2025/26
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Divider sx={{ marginBottom: ThemeTokens.spacing.lg }} />

        {/* Strength Overview */}
        <Box sx={{ marginBottom: ThemeTokens.spacing.lg }}>
          <Typography
            variant={ThemeTokens.typography.subsectionTitleVariant}
            sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
          >
            Strength Overview
          </Typography>
          <Box
            sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: ThemeTokens.spacing.md }}
          >
            <Box
              sx={{
                padding: ThemeTokens.spacing.md,
                backgroundColor: '#f5f5f5',
                borderRadius: ThemeTokens.borderRadius.sm,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Overall
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {intelligence.strengthOverview.overall.toFixed(1)}
              </Typography>
            </Box>
            <Box
              sx={{
                padding: ThemeTokens.spacing.md,
                backgroundColor: '#f5f5f5',
                borderRadius: ThemeTokens.borderRadius.sm,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Home
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {intelligence.strengthOverview.overallHome.toFixed(1)}
              </Typography>
            </Box>
            <Box
              sx={{
                padding: ThemeTokens.spacing.md,
                backgroundColor: '#f5f5f5',
                borderRadius: ThemeTokens.borderRadius.sm,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Away
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {intelligence.strengthOverview.overallAway.toFixed(1)}
              </Typography>
            </Box>
            <Box
              sx={{
                padding: ThemeTokens.spacing.md,
                backgroundColor: '#f5f5f5',
                borderRadius: ThemeTokens.borderRadius.sm,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Attack Home
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {intelligence.strengthOverview.attackHome.toFixed(1)}
              </Typography>
            </Box>
            <Box
              sx={{
                padding: ThemeTokens.spacing.md,
                backgroundColor: '#f5f5f5',
                borderRadius: ThemeTokens.borderRadius.sm,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Attack Away
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {intelligence.strengthOverview.attackAway.toFixed(1)}
              </Typography>
            </Box>
            <Box
              sx={{
                padding: ThemeTokens.spacing.md,
                backgroundColor: '#f5f5f5',
                borderRadius: ThemeTokens.borderRadius.sm,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Defence Home
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {intelligence.strengthOverview.defenceHome.toFixed(1)}
              </Typography>
            </Box>
            <Box
              sx={{
                padding: ThemeTokens.spacing.md,
                backgroundColor: '#f5f5f5',
                borderRadius: ThemeTokens.borderRadius.sm,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Defence Away
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {intelligence.strengthOverview.defenceAway.toFixed(1)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ marginBottom: ThemeTokens.spacing.lg }} />

        {/* Fixture Intelligence */}
        <Box sx={{ marginBottom: ThemeTokens.spacing.lg }}>
          <Typography
            variant={ThemeTokens.typography.subsectionTitleVariant}
            sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
          >
            Fixture Intelligence
          </Typography>
          {intelligence.allUpcomingFixtures.length > 0 ? (
            <>
              <Stack
                direction="row"
                spacing={ThemeTokens.spacing.md}
                sx={{ marginBottom: ThemeTokens.spacing.md, flexWrap: 'wrap' }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Upcoming
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {intelligence.fixtureRun.upcomingCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Avg FDR
                  </Typography>
                  <Chip
                    label={intelligence.fixtureRun.averageFdr.toFixed(1)}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      backgroundColor: getDifficultyColor(
                        Math.round(intelligence.fixtureRun.averageFdr)
                      ),
                      color: 'white',
                      height: 24,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Home
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {intelligence.fixtureRun.homeCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Away
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {intelligence.fixtureRun.awayCount}
                  </Typography>
                </Box>
              </Stack>

              <TableContainer
                component={Paper}
                sx={{ borderRadius: ThemeTokens.borderRadius.sm, backgroundColor: 'transparent' }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>GW</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Opponent</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>H/A</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>FDR</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {intelligence.allUpcomingFixtures.slice(0, 5).map((fixture) => {
                      const isHome = fixture.homeTeam.id === intelligence.team.id;
                      const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
                      const fdr = isHome ? fixture.homeDifficulty : fixture.awayDifficulty;
                      return (
                        <TableRow key={fixture.id}>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{fixture.gameweek}</TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{opponent.shortName}</TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{isHome ? 'H' : 'A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={fdr}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                backgroundColor: getDifficultyColor(fdr),
                                color: 'white',
                                height: 20,
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Season Complete
            </Typography>
          )}
        </Box>

        <Divider sx={{ marginBottom: ThemeTokens.spacing.lg }} />

        {/* Key Fantasy Players */}
        <Box sx={{ marginBottom: ThemeTokens.spacing.lg }}>
          <Typography
            variant={ThemeTokens.typography.subsectionTitleVariant}
            sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
          >
            Key Fantasy Players
          </Typography>
          <Stack spacing={ThemeTokens.spacing.sm}>
            {intelligence.keyPlayers.map((player) => (
              <Box
                key={player.id}
                sx={{
                  padding: ThemeTokens.spacing.md,
                  backgroundColor: '#f5f5f5',
                  borderRadius: ThemeTokens.borderRadius.sm,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': { backgroundColor: '#eeeeee' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {player.position} • £{(player.price / 10).toFixed(1)}m
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.totalPoints}pts
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Form: {player.form.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', marginTop: ThemeTokens.spacing.xs }}
                >
                  Owned: {player.ownership.toFixed(1)}%
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ marginBottom: ThemeTokens.spacing.lg }} />

        {/* Fantasy Metrics */}
        <Box>
          <Typography
            variant={ThemeTokens.typography.subsectionTitleVariant}
            sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
          >
            Fantasy Metrics
          </Typography>
          <Stack spacing={ThemeTokens.spacing.sm}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Total Player Points</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {intelligence.fantasyMetrics.totalPlayerPoints}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Avg Player Form</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {intelligence.fantasyMetrics.averagePlayerForm.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Avg Ownership</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {intelligence.fantasyMetrics.averageOwnership.toFixed(1)}%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Squad Players</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {intelligence.fantasyMetrics.activePlayerCount} /{' '}
                {intelligence.fantasyMetrics.squadPlayerCount}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
