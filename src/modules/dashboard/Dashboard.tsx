import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { PageContainer } from '@shared/components';
import type { CompetitionType } from '../../types/competition';
import { COMPETITIONS } from '../../types/competition';
import { CommandCenter } from './components/CommandCenter';
import {
  CurrentGameweekSummary,
  TopPerformingPlayers,
  MostSelectedPlayers,
  PlayerFormRankings,
  TopClubs,
} from './widgets';
import { ThemeTokens } from '@shared/theme/tokens';
import { BootstrapRepository } from '@repositories/bootstrap';

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

  // Get current gameweek from bootstrap
  const currentGW = React.useMemo(() => {
    try {
      const repo = new BootstrapRepository();
      return repo.getCurrentGameweek();
    } catch {
      return 1;
    }
  }, []);

  return (
    <PageContainer sx={{ paddingY: { xs: ThemeTokens.spacing.md, md: ThemeTokens.spacing.lg } }}>
      {/* Dashboard Header - Ultra Compact */}
      <Box sx={{ marginBottom: ThemeTokens.spacing.lg }}>
        <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.xs }}>
          Dashboard
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginBottom: ThemeTokens.spacing.sm }}
        >
          Fantasy Premier League Analytics & Overview
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
          {competitionInfo.name} • 2025/26 • GW
          {currentGW ? (typeof currentGW === 'object' ? currentGW.id : currentGW) : '-'}
        </Typography>
      </Box>

      {/* FPL Command Center */}
      <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
        <CommandCenter />
      </Box>

      {/* Widget Grid - First Row: Current GW (3 cols) + Top Players (9 cols) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '3fr 9fr' },
          gap: ThemeTokens.spacing.md,
          marginBottom: ThemeTokens.spacing.md,
          alignItems: 'start',
        }}
      >
        <Box>
          <CurrentGameweekSummary />
        </Box>
        <Box>
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
  );
};
