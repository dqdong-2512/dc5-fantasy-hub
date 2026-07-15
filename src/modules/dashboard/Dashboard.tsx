import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Stack } from '@mui/material';
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
    <PageContainer>
      {/* Dashboard Header */}
      <Box
        sx={{
          paddingBottom: ThemeTokens.spacing.lg,
          marginBottom: ThemeTokens.spacing.lg,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Stack spacing={ThemeTokens.spacing.md} sx={{ marginBottom: ThemeTokens.spacing.md }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fantasy Premier League Analytics & Overview
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={ThemeTokens.spacing.lg}
          sx={{
            flexWrap: 'wrap',
            '& > div': { minWidth: 150 },
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Competition
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {competitionInfo.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Season
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              2025/26
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Current Gameweek
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              GW {currentGW ? (typeof currentGW === 'object' ? currentGW.id : currentGW) : '-'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* FPL Command Center */}
      <Box sx={{ marginBottom: ThemeTokens.spacing.lg }}>
        <CommandCenter />
      </Box>

      {/* Widget Grid - Balanced 2-column layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' },
          gap: ThemeTokens.spacing.lg,
        }}
      >
        {/* Column 1: Context widgets */}
        <Box>
          <CurrentGameweekSummary />
        </Box>

        {/* Column 2: Primary data widget */}
        <Box>
          <TopPerformingPlayers onPlayerClick={() => handleNavigate('players')} />
        </Box>
      </Box>

      {/* Row 2: Most Selected & Form Rankings - Balanced grid */}
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

      {/* Row 3: Club Intelligence */}
      <Box sx={{ marginTop: ThemeTokens.spacing.lg }}>
        <TopClubs onViewClubs={() => handleNavigate('teams')} />
      </Box>

      {/* Quick Navigation Actions */}
      <Box
        sx={{
          display: 'flex',
          gap: ThemeTokens.spacing.md,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: ThemeTokens.spacing.xl,
          paddingTop: ThemeTokens.spacing.lg,
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleNavigate('players')}
          sx={{ textTransform: 'none', minWidth: 160 }}
        >
          Explore Players
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleNavigate('fixtures')}
          sx={{ textTransform: 'none', minWidth: 160 }}
        >
          View Fixtures
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleNavigate('teams')}
          sx={{ textTransform: 'none', minWidth: 160 }}
        >
          Analyze Clubs
        </Button>
      </Box>
    </PageContainer>
  );
};
