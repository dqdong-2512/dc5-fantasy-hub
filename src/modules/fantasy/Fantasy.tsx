/**
 * Fantasy Game Module
 * Personal FPL workspace for connected users
 * Displays team, picks, and leagues
 */

import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useFantasyGame } from './hooks';
import { FantasyWorkspace, FantasyGameOverview } from './pages';

export const Fantasy: React.FC = () => {
  const gameState = useFantasyGame();

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

  // Not connected - Show Overview or Connect Form
  if (!gameState.isConnected) {
    // For now, show the Fantasy Game Overview with fixture data
    // This allows UI development and testing before real entry connection
    return <FantasyGameOverview />;
  }

  // Connected - Show Workspace
  return <FantasyWorkspace gameState={gameState} />;
};
