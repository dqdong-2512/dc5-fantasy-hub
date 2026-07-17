import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { PageContainer } from '@shared/components';
import type { CompetitionType } from '../../types/competition';
import { COMPETITIONS } from '../../types/competition';
import { DashboardHero } from './components/DashboardHero';
import {
  CurrentGameweekSummary,
  TopPerformingPlayers,
  MostSelectedPlayers,
  PlayerFormRankings,
  TopClubs,
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
    <Box>
      {/* FPL Dashboard Hero - Full Width */}
      <DashboardHero />

      {/* Dashboard Content Container */}
      <PageContainer
        sx={{
          paddingTop: { xs: '16px', md: '24px' },
          paddingBottom: { xs: '16px', md: '24px' },
        }}
      >
        {/* Widget Grid - First Row: Current GW (3 cols) + Top Players (9 cols) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '3fr 9fr' },
            gap: ThemeTokens.spacing.md,
            marginBottom: ThemeTokens.spacing.md,
            alignItems: { xs: 'start', md: 'stretch' },
          }}
        >
          <Box sx={{ height: { xs: 'auto', md: '100%' } }}>
            <CurrentGameweekSummary />
          </Box>
          <Box sx={{ height: { xs: 'auto', md: '100%' } }}>
            <TopPerformingPlayers onPlayerClick={() => handleNavigate('players')} />
          </Box>
        </Box>

        {/* Row 2: Most Selected & Form Rankings */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: ThemeTokens.spacing.md,
            marginBottom: ThemeTokens.spacing.md,
          }}
        >
          <Box>
            <MostSelectedPlayers />
          </Box>
          <Box>
            <PlayerFormRankings />
          </Box>
        </Box>

        {/* Row 3: Club Intelligence */}
        <Box>
          <TopClubs onViewClubs={() => handleNavigate('teams')} />
        </Box>
      </PageContainer>
    </Box>
  );
};
