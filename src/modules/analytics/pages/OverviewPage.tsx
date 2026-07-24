import React from 'react';
import { Alert, Box, Button, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';
import { useAnalyticsDecision } from '../context';

export function OverviewPage(): React.ReactElement {
  const {
    captainCandidates,
    risingPlayers,
    fallingPlayers,
    differentialPicks,
    valueIndex,
    fixtureSwings,
    injuryWatch,
    latestTransferSignals,
    isPreSeason,
    isLoading,
    error,
  } = useAnalyticsDecision();

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const cards = [
    {
      title: 'Captain Picks',
      subtitle: captainCandidates.slice(0, 3).map((row) => row.playerName),
      to: '/premier-league/analytics/captain',
      accent: '#f57c00',
    },
    {
      title: 'Rising Players',
      subtitle: risingPlayers.slice(0, 3).map((row) => row.playerName),
      to: '/premier-league/analytics/form',
      accent: '#2e7d32',
    },
    {
      title: 'Falling Players',
      subtitle: fallingPlayers.slice(0, 3).map((row) => row.playerName),
      to: '/premier-league/analytics/form',
      accent: '#c62828',
    },
    {
      title: 'Differentials',
      subtitle: differentialPicks.slice(0, 3).map((row) => row.playerName),
      to: '/premier-league/analytics/differentials',
      accent: '#1565c0',
    },
    {
      title: 'Value Picks',
      subtitle: valueIndex.slice(0, 3).map((row) => row.playerName),
      to: '/premier-league/analytics/value',
      accent: '#6a1b9a',
    },
    {
      title: 'Fixture Swings',
      subtitle: fixtureSwings.slice(0, 3).map((row) => row.teamShortName),
      to: '/premier-league/analytics/fixtures',
      accent: '#00838f',
    },
    {
      title: 'Injuries',
      subtitle: injuryWatch.slice(0, 3).map((row) => row.playerName),
      to: '/premier-league/analytics/team',
      accent: '#ad1457',
    },
    {
      title: 'Latest Transfers',
      subtitle: latestTransferSignals.slice(0, 3).map((row) => row.playerName),
      to: '/premier-league/analytics/transfers',
      accent: '#283593',
    },
  ];

  return (
    <Stack spacing={ThemeTokens.spacing.md}>
      <Alert severity="info">
        This dashboard is deterministic and explainable. It supports decisions without auto-actions.
      </Alert>

      {isPreSeason && (
        <Alert severity="info">
          Pre-season mode is active. Form windows are estimated from currently available official
          data.
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: 'repeat(4, 1fr)' },
          gap: ThemeTokens.spacing.sm,
        }}
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <Card key={`dashboard-skeleton-${index}`}>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="85%" />
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="rounded" height={32} sx={{ mt: ThemeTokens.spacing.sm }} />
                </CardContent>
              </Card>
            ))
          : cards.map((card, index) => (
              <Card
                key={card.title}
                sx={{
                  borderTop: `3px solid ${card.accent}`,
                  animation: 'decisionCenterReveal 520ms ease-out both',
                  animationDelay: `${index * 40}ms`,
                  '@keyframes decisionCenterReveal': {
                    from: { opacity: 0, transform: 'translateY(6px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <CardContent sx={{ p: ThemeTokens.spacing.sm }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {card.title}
                  </Typography>
                  {card.subtitle.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      No strong signals right now.
                    </Typography>
                  ) : (
                    <Stack spacing={0.25} sx={{ minHeight: 58 }}>
                      {card.subtitle.map((line) => (
                        <Typography
                          key={`${card.title}-${line}`}
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {line}
                        </Typography>
                      ))}
                    </Stack>
                  )}

                  <Button
                    component={RouterLink}
                    to={card.to}
                    size="small"
                    variant="text"
                    sx={{ p: 0, mt: ThemeTokens.spacing.xs, minWidth: 0 }}
                  >
                    Open Details
                  </Button>
                </CardContent>
              </Card>
            ))}
      </Box>
    </Stack>
  );
}
