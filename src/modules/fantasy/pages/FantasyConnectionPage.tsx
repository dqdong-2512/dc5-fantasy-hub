/**
 * Fantasy Connection Page
 * Entry point for connecting FPL Entry ID
 * Shows connection form when user is not connected
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectTeam } from '../components/ConnectTeam';
import { useFantasyGame } from '../hooks';

export const FantasyConnectionPage: React.FC = () => {
  const gameState = useFantasyGame();
  const navigate = useNavigate();

  const handleConnect = useCallback(
    async (entryId: number) => {
      try {
        await gameState.connectEntry(entryId);
        // Connection successful - navigate to fantasy game dashboard
        // Use replace: true to prevent back button returning to connection form
        navigate('/premier-league/fantasy-game', { replace: true });
      } catch {
        // Error is handled by gameState.error and displayed in ConnectTeam
        // Remain on connection form for retry
      }
    },
    [gameState, navigate]
  );

  return (
    <ConnectTeam
      onConnect={handleConnect}
      error={gameState.error}
      isLoading={gameState.isConnecting}
    />
  );
};
