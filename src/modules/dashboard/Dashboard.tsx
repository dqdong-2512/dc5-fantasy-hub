/**
 * Professional Fantasy Premier League Dashboard
 * Landing page for daily usage with analytics and performance data
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { PageContainer } from '@shared/components';
import type { CompetitionType } from '../../types/competition';
import { COMPETITIONS } from '../../types/competition';
import { DashboardHeader } from './components/DashboardHeader';
import {
  CurrentGameweekSummary,
  TopPerformingPlayers,
  MostSelectedPlayers,
  PlayerFormRankings,
  TopClubs,
  PriceChanges,
  LatestNews,
} from './widgets';
import { ThemeTokens } from '@shared/theme/tokens';

/**
 * Professional Dashboard
 * Main landing page with analytics widgets
 */
export const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const competition = pathSegments[0] as CompetitionType;
  const competitionInfo = COMPETITIONS[competition];

  if (!competitionInfo) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Competition not found
        </Typography>
      </Box>
    );
  }

  const handleNavigate = (path: string): void => {
    navigate(`/${competition}/${path}`);
  };

  return (
    <PageContainer>
      {/* Dashboard Header */}
      <DashboardHeader competition={competitionInfo.name} lastSyncTime={new Date()} />

      {/* Widget Grid Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '3fr 9fr' },
          gap: ThemeTokens.spacing.lg,
        }}
      >
        {/* Row 1: Current Gameweek & Top Performing Players */}
        <Box sx={{ display: { xs: 'block', lg: 'block' } }}>
          <CurrentGameweekSummary />
        </Box>
        <Box sx={{ display: { xs: 'block', lg: 'block' } }}>
          <TopPerformingPlayers />
        </Box>
      </Box>

      {/* Row 2: Most Selected & Form Rankings */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: ThemeTokens.spacing.lg,
          marginTop: ThemeTokens.spacing.lg,
        }}
      >
        <Box>
          <MostSelectedPlayers />
        </Box>
        <Box>
          <PlayerFormRankings />
        </Box>
      </Box>

      {/* Row 3: Top Clubs & Price Changes */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: ThemeTokens.spacing.lg,
          marginTop: ThemeTokens.spacing.lg,
        }}
      >
        <Box>
          <TopClubs />
        </Box>
        <Box>
          <PriceChanges />
        </Box>
      </Box>

      {/* Row 4: Latest News */}
      <Box
        sx={{
          marginTop: ThemeTokens.spacing.lg,
        }}
      >
        <LatestNews />
      </Box>

      {/* Quick Actions Footer */}
      <Box
        sx={{
          display: 'flex',
          gap: ThemeTokens.spacing.md,
          justifyContent: 'center',
          marginTop: ThemeTokens.spacing.xl,
          paddingTop: ThemeTokens.spacing.xl,
          borderTop: '1px solid #e0e0e0',
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleNavigate('players')}
          sx={{ textTransform: 'none' }}
        >
          Explore All Players
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleNavigate('fixtures')}
          sx={{ textTransform: 'none' }}
        >
          View Fixtures
        </Button>
      </Box>
    </PageContainer>
  );
};
