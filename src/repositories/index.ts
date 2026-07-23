/**
 * Data Repositories
 * Central access point for all data through domain models
 * React components and feature modules access data exclusively through these repositories
 * Raw FPL models are internal and never exposed
 */

export { BootstrapRepository, type DomainBootstrapData } from './bootstrap';
export { TeamRepository } from './teams';
export { PlayerRepository } from './players';
export { FantasyGameRepository } from './fantasy';
export { FixtureRepository } from './fixtures';

// Singleton factory functions for application-wide cache reuse
export {
  getBootstrapRepository,
  getPlayerRepository,
  getTeamRepository,
} from './singleton-repositories';

// Internal normalized types - not recommended for external use
// These are exported only for internal repository implementation
export type {
  NormalizedTeam,
  NormalizedPlayer,
  NormalizedGameweek,
  NormalizedElementType,
  NormalizedFixture,
  BootstrapData,
} from './types';
