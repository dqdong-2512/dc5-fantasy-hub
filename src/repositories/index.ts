/**
 * Data Repositories
 * Central access point for all normalized data
 * React components should only access data through these repositories
 */

export { BootstrapRepository } from './bootstrap';
export { TeamRepository } from './teams';
export { PlayerRepository } from './players';
export { FixtureRepository, type NormalizedFixture } from './fixtures';
export type {
  NormalizedTeam,
  NormalizedPlayer,
  NormalizedGameweek,
  NormalizedElementType,
  BootstrapData,
} from './types';
