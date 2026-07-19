/**
 * Fantasy Game Module
 * Personal FPL workspace for connected users
 * Displays team, picks, and leagues
 */

import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useFantasyGame } from './hooks';
import {
  FantasyWorkspace,
  FantasyGameOverview,
  MyTeamPage,
  MyLeaguesPage,
  LeagueStandingsPage,
  ManagerComparisonPage,
} from './pages';

export const Fantasy: React.FC = () => {
  const gameState = useFantasyGame();
  const location = useLocation();

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
    // Check for manager comparison page (must check before /leagues/)
    if (location.pathname.includes('/managers/')) {
      return <ManagerComparisonPage />;
    }

    // Check for league standings page
    if (location.pathname.includes('/leagues/')) {
      return <LeagueStandingsPage />;
    }

    // Check for my leagues page
    if (location.pathname.includes('/leagues')) {
      return <MyLeaguesPage />;
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
