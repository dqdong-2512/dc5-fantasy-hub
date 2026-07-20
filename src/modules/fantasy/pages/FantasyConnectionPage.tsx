/**
 * Fantasy Connection Page
 * Entry point for connecting FPL Entry ID
 * Shows connection form when user is not connected
 */

import React, { useCallback } from 'react';
import { ConnectTeam } from '../components/ConnectTeam';
import { useFantasyGame } from '../hooks';

export const FantasyConnectionPage: React.FC = () => {
  const gameState = useFantasyGame();

  const handleConnect = useCallback(
    async (entryId: number) => {
      await gameState.connectEntry(entryId);
      // Navigation back to dashboard happens automatically via redirect
      // in Fantasy.tsx when isConnected becomes true
    },
    [gameState]
  );

  return (
    <ConnectTeam
      onConnect={handleConnect}
      error={gameState.error}
      isLoading={gameState.isConnecting}
    />
  );
};
