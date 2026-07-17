/**
 * Fantasy Game Module
 * Personal FPL workspace for connected users
 * Displays team, picks, and leagues
 */

import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useFantasyGame } from './hooks';
import { FantasyWorkspace, FantasyGameOverview, MyTeamPage } from './pages';

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

  // Not connected - Show Overview or Team page based on route
  if (!gameState.isConnected) {
    // Check if requesting /team path
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
