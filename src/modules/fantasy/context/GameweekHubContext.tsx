import React, { createContext, useContext } from 'react';
import { useFantasyGame, type UseFantasyGameState } from '../hooks';

interface GameweekHubContextValue {
  gameState: UseFantasyGameState;
}

const GameweekHubContext = createContext<GameweekHubContextValue | undefined>(undefined);

export function GameweekHubProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const gameState = useFantasyGame();

  return (
    <GameweekHubContext.Provider value={{ gameState }}>{children}</GameweekHubContext.Provider>
  );
}

export function useGameweekHubState(): UseFantasyGameState {
  const context = useContext(GameweekHubContext);

  if (!context) {
    throw new Error('useGameweekHubState must be used within GameweekHubProvider');
  }

  return context.gameState;
}
