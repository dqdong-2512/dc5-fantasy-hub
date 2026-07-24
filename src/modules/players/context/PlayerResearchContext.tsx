import React, { createContext, useContext, useMemo } from 'react';
import type { Fixture, Player, Team } from '@domain/models';
import {
  FixtureRepository,
  getBootstrapRepository,
  getPlayerRepository,
  getTeamRepository,
} from '@repositories/index';

export interface PlayerResearchDataState {
  players: Player[];
  teams: Team[];
  fixtures: Fixture[];
  playerById: Map<number, Player>;
  teamById: Map<number, Team>;
  totalPlayers: number;
  seasonState: 'pre-season' | 'active' | 'completed';
  hasTransferTrendData: boolean;
  hasPriceMovementData: boolean;
  errorMessage: string | null;
}

const PlayerResearchContext = createContext<PlayerResearchDataState | undefined>(undefined);

export function PlayerResearchProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const value = useMemo<PlayerResearchDataState>(() => {
    try {
      const playerRepository = getPlayerRepository();
      const teamRepository = getTeamRepository();
      const bootstrapRepository = getBootstrapRepository();
      const fixtureRepository = new FixtureRepository();

      const players = playerRepository.getAll();
      const teams = teamRepository.getAll();
      const fixtures = fixtureRepository.getAll();
      const seasonState = bootstrapRepository.getSeasonState();

      const playerById = new Map<number, Player>(players.map((player) => [player.id, player]));
      const teamById = new Map<number, Team>(teams.map((team) => [team.id, team]));

      const hasTransferTrendData = players.some(
        (player) =>
          typeof player.transfersInEvent === 'number' ||
          typeof player.transfersOutEvent === 'number'
      );
      const hasPriceMovementData = players.some(
        (player) => typeof player.costChangeEvent === 'number'
      );

      return {
        players,
        teams,
        fixtures,
        playerById,
        teamById,
        totalPlayers: players.length,
        seasonState,
        hasTransferTrendData,
        hasPriceMovementData,
        errorMessage: null,
      };
    } catch (error) {
      console.error('Failed to initialize Player Research data:', error);
      return {
        players: [],
        teams: [],
        fixtures: [],
        playerById: new Map<number, Player>(),
        teamById: new Map<number, Team>(),
        totalPlayers: 0,
        seasonState: 'pre-season',
        hasTransferTrendData: false,
        hasPriceMovementData: false,
        errorMessage: 'Player research data is currently unavailable.',
      };
    }
  }, []);

  return <PlayerResearchContext.Provider value={value}>{children}</PlayerResearchContext.Provider>;
}

export function usePlayerResearchData(): PlayerResearchDataState {
  const context = useContext(PlayerResearchContext);

  if (!context) {
    throw new Error('usePlayerResearchData must be used within PlayerResearchProvider');
  }

  return context;
}
