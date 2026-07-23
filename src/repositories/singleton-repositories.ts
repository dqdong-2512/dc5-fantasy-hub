/**
 * Singleton Repository Instances
 * Provides application-wide singleton instances of repositories
 * Ensures cache is shared across all modules and components
 * Prevents duplicate data loading and instantiation
 */

import { BootstrapRepository } from './bootstrap';
import { PlayerRepository } from './players';
import { TeamRepository } from './teams';

// Singleton instances created once per application lifecycle
let bootstrapRepositoryInstance: BootstrapRepository | null = null;
let playerRepositoryInstance: PlayerRepository | null = null;
let teamRepositoryInstance: TeamRepository | null = null;

/**
 * Get singleton BootstrapRepository instance
 * Cache is shared across entire application
 * @returns Shared BootstrapRepository instance
 */
export function getBootstrapRepository(): BootstrapRepository {
  if (!bootstrapRepositoryInstance) {
    bootstrapRepositoryInstance = new BootstrapRepository();
  }
  return bootstrapRepositoryInstance;
}

/**
 * Get singleton PlayerRepository instance
 * Cache is shared across entire application
 * @returns Shared PlayerRepository instance
 */
export function getPlayerRepository(): PlayerRepository {
  if (!playerRepositoryInstance) {
    playerRepositoryInstance = new PlayerRepository();
  }
  return playerRepositoryInstance;
}

/**
 * Get singleton TeamRepository instance
 * Cache is shared across entire application
 * @returns Shared TeamRepository instance
 */
export function getTeamRepository(): TeamRepository {
  if (!teamRepositoryInstance) {
    teamRepositoryInstance = new TeamRepository();
  }
  return teamRepositoryInstance;
}
