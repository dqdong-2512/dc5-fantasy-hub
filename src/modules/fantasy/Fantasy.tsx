/**
 * Fantasy Game Module
 * Personal FPL workspace for connected users
 * Displays team, picks, and leagues
 */

import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useFantasyGame } from './hooks';
import { ConnectTeam } from './components';
import { FantasyWorkspace } from './pages';

export const Fantasy: React.FC = () => {
  const gameState = useFantasyGame();
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleConnect = async (entryId: number) => {
    try {
      setConnectError(null);
      await gameState.connectEntry(entryId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect entry';
      setConnectError(message);
    }
  };

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

  // Not connected - Show Connect Form
  if (!gameState.isConnected) {
    return (
      <ConnectTeam
        onConnect={handleConnect}
        error={connectError || gameState.error}
        isLoading={gameState.isConnecting}
      />
    );
  }

  // Connected - Show Workspace
  return <FantasyWorkspace gameState={gameState} />;
};
