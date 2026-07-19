/**
 * Fantasy Game Module
 * Personal FPL workspace for connected users
 * Displays team, picks, and leagues
 */

import React, { useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useFantasyGame } from './hooks';
import {
  FantasyWorkspace,
  FantasyGameOverview,
  MyTeamPage,
  LeagueStandingsPage,
  GameweekCenterPage,
} from './pages';
import { fantasyGameFixtures } from './fixtures';

export const Fantasy: React.FC = () => {
  const gameState = useFantasyGame();
  const location = useLocation();
  const fixtures = useMemo(() => fantasyGameFixtures, []);

  // Show loading while checking for stored entry
  if (gameState.isLoading && !gameState.isConnected) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Not connected - Show pages based on route
  if (!gameState.isConnected) {
    // Redirect /leagues (without ID) to primary league
    if (location.pathname === '/premier-league/fantasy-game/leagues') {
      return (
        <Navigate
          to={`/premier-league/fantasy-game/leagues/${fixtures.manager.primaryLeagueId}`}
          replace
        />
      );
    }

    // Check for gameweek center page
    if (location.pathname.includes('/gameweeks/')) {
      return <GameweekCenterPage />;
    }

    // Check for league workspace (handles both standings and manager comparison)
    if (location.pathname.includes('/leagues/')) {
      return <LeagueStandingsPage />;
    }

    // Check for team page
    if (location.pathname.includes('/team')) {
      return <MyTeamPage />;
    }

    // Show the Fantasy Game Overview with fixture data
    // This allows UI development and testing before real entry connection
    return <FantasyGameOverview />;
  }

  // Connected - Show Workspace
  return <FantasyWorkspace gameState={gameState} />;
};
