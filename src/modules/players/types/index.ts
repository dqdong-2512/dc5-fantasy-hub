/**
 * Player Explorer Types
 * Local state management for the Player Explorer feature
 */

import type { Player } from '@domain/models';
import { Position } from '@domain/enums';

export interface PlayerFilters {
  search: string;
  position: Position | 'all';
  clubId: number | 'all';
  priceBand: 'all' | 'budget' | 'mid' | 'premium';
  availability: 'all' | 'available' | 'doubtful' | 'unavailable';
  sortBy: 'displayName' | 'price' | 'form' | 'totalPoints' | 'ownership';
  sortOrder: 'asc' | 'desc';
}

export interface SortConfig {
  field: keyof Player | 'ownership' | 'displayName' | 'totalPoints';
  direction: 'asc' | 'desc';
}

export type FilterablePlayer = Player & {
  teamId?: number;
};

// Re-export player-fixtures types
export type {
  PlayerUpcomingFixture,
  PlayerFixtureSummary,
  FixtureOutlook,
  PlayerWithFixtureIntelligence,
} from './player-fixtures';
export { FixtureOutlook as FixtureOutlookEnum } from './player-fixtures';
