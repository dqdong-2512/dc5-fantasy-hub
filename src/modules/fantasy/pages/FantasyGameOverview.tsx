/**
 * Fantasy Game Overview Page
 * Main entry point for Fantasy Premier League game management
 * Displays team summary, current gameweek stats, leagues, and quick actions
 */

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { fantasyGameFixtures } from '../fixtures';
import { MyTeamSummary, CurrentGameweekSummary, MyLeagues, QuickActions } from '../widgets';

export const FantasyGameOverview: React.FC = () => {
  const fixtures = useMemo(() => fantasyGameFixtures, []);
  const navigate = useNavigate();

  const handleViewTeam = (): void => {
    navigate('/premier-league/fantasy-game/team');
  };

  const handleViewGameweek = (): void => {
    navigate(`/premier-league/fantasy-game/gameweeks/${fixtures.currentGameweek.gameweek}`);
  };

  const handleViewLeagues = (): void => {
    navigate('/premier-league/fantasy-game/leagues');
  };

  const handleLeagueClick = (leagueId: number): void => {
    navigate(`/premier-league/fantasy-game/leagues/${leagueId}`);
  };

  return (
    <Box>
      {/* Page Header - Centered Logo and Subtitle */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingX: ThemeTokens.spacing.md,
          paddingY: { xs: ThemeTokens.spacing.sm, md: '32px' },
        }}
      >
        {/* FPL Logo */}
        <Box
          component="img"
          src="/fantasy-logo.png"
          alt="Fantasy Premier League"
          sx={{
            height: { xs: '80px', sm: '100px', md: '160px' },
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            flexShrink: 0,
            marginBottom: { xs: '2', md: '4' },
          }}
        />

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            fontSize: { xs: '15px', sm: '16px', md: '18px' },
            letterSpacing: '0.3px',
            lineHeight: 1.5,
            color: '#64748b',
            maxWidth: '600px',
          }}
        >
          Manage your FPL team, gameweeks and leagues
        </Typography>
      </Box>

      {/* Main Content Container */}
      <PageContainer
        sx={{
          padding: ThemeTokens.spacing.xs,
        }}
      >
        {/* First Row: My Team & Current Gameweek (50/50 on lg+) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr', lg: '1fr 1fr' },
            gap: ThemeTokens.spacing.md,
            marginBottom: ThemeTokens.spacing.md,
            alignItems: { xs: 'start', lg: 'stretch' },
          }}
        >
          <Box sx={{ height: { xs: 'auto', lg: '100%' }, minHeight: 0 }}>
            <MyTeamSummary manager={fixtures.manager} onViewTeam={handleViewTeam} />
          </Box>
          <Box sx={{ height: { xs: 'auto', lg: '100%' }, minHeight: 0 }}>
            <CurrentGameweekSummary
              gameweek={fixtures.currentGameweek}
              onViewGameweek={handleViewGameweek}
            />
          </Box>
        </Box>

        {/* My Leagues Row */}
        <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
          <MyLeagues leagues={fixtures.leagues} onLeagueClick={handleLeagueClick} />
        </Box>

        {/* Quick Actions Row */}
        <Box>
          <QuickActions onViewTeam={handleViewTeam} onViewLeagues={handleViewLeagues} />
        </Box>
      </PageContainer>
    </Box>
  );
};
