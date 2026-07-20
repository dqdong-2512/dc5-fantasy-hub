/**
 * Gameweek State Service
 * Single source of truth for gameweek state resolution
 *
 * Consolidates logic for determining:
 * - Current/active gameweek
 * - Last finished gameweek
 * - Next gameweek
 * - Gameweek status (pre-season, active, between, finished)
 */

import { BootstrapRepository } from '@repositories/bootstrap';
import type { Gameweek } from '@domain/models';

export enum GameweekStatus {
  PreSeason = 'PRE_SEASON',
  Active = 'ACTIVE',
  Between = 'BETWEEN_GAMEWEEKS',
  SeasonComplete = 'SEASON_COMPLETE',
}

export interface GameweekState {
  status: GameweekStatus;
  currentGameweek: Gameweek | null;
  nextGameweek: Gameweek | null;
  lastFinishedGameweek: Gameweek | null;
  allGameweeks: Gameweek[];
  totalGameweeks: number;
}

/**
 * Gameweek State Service
 * Determines current gameweek state from bootstrap data
 */
export class GameweekStateService {
  private bootstrapRepo: BootstrapRepository;

  constructor() {
    this.bootstrapRepo = new BootstrapRepository();
  }

  /**
   * Get current gameweek state
   */
  getGameweekState(): GameweekState {
    const bootstrap = this.bootstrapRepo.getBootstrap();
    const gameweeks = bootstrap.gameweeks;

    if (!gameweeks || gameweeks.length === 0) {
      return {
        status: GameweekStatus.PreSeason,
        currentGameweek: null,
        nextGameweek: null,
        lastFinishedGameweek: null,
        allGameweeks: [],
        totalGameweeks: 0,
      };
    }

    // Find current, next, and last finished
    let currentGameweek: Gameweek | null = null;
    let nextGameweek: Gameweek | null = null;
    let lastFinishedGameweek: Gameweek | null = null;
    let status = GameweekStatus.PreSeason;

    // First pass: find first unfinished (current)
    for (const gw of gameweeks) {
      if (!gw.finished) {
        currentGameweek = gw;
        break;
      }
      // Track last finished as we go
      lastFinishedGameweek = gw;
    }

    // If all gameweeks are finished, season is complete
    if (!currentGameweek) {
      status = GameweekStatus.SeasonComplete;
      if (gameweeks.length > 0) {
        lastFinishedGameweek = gameweeks[gameweeks.length - 1];
      }
    } else {
      // We have a current gameweek
      status = GameweekStatus.Active;

      // Find next gameweek (first after current)
      const currentIndex = gameweeks.indexOf(currentGameweek);
      if (currentIndex >= 0 && currentIndex < gameweeks.length - 1) {
        nextGameweek = gameweeks[currentIndex + 1];
      } else {
        // Current is the last gameweek
        status = GameweekStatus.Between;
      }
    }

    return {
      status,
      currentGameweek,
      nextGameweek,
      lastFinishedGameweek,
      allGameweeks: gameweeks,
      totalGameweeks: gameweeks.length,
    };
  }

  /**
   * Get current gameweek
   */
  getCurrentGameweek(): Gameweek | null {
    return this.getGameweekState().currentGameweek;
  }

  /**
   * Get next gameweek
   */
  getNextGameweek(): Gameweek | null {
    return this.getGameweekState().nextGameweek;
  }

  /**
   * Get last finished gameweek
   */
  getLastFinishedGameweek(): Gameweek | null {
    return this.getGameweekState().lastFinishedGameweek;
  }

  /**
   * Get gameweek by ID
   */
  getGameweekById(id: number): Gameweek | null {
    return this.bootstrapRepo.getGameweekById(id);
  }

  /**
   * Get gameweek status text
   */
  static formatStatus(status: GameweekStatus): string {
    switch (status) {
      case GameweekStatus.PreSeason:
        return 'Pre-season';
      case GameweekStatus.Active:
        return 'Active';
      case GameweekStatus.Between:
        return 'Between Gameweeks';
      case GameweekStatus.SeasonComplete:
        return 'Season Complete';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get status color for display
   */
  static getStatusColor(status: GameweekStatus): string {
    switch (status) {
      case GameweekStatus.Active:
        return '#4caf50'; // Green
      case GameweekStatus.Between:
        return '#ff9800'; // Orange
      case GameweekStatus.PreSeason:
        return '#2196f3'; // Blue
      case GameweekStatus.SeasonComplete:
        return '#9e9e9e'; // Gray
      default:
        return '#1976d2'; // Default blue
    }
  }
}

/**
 * Convenience function for React components
 */
export function getGameweekState(): GameweekState {
  return new GameweekStateService().getGameweekState();
}
