/**
 * Player Explorer Types
 * Local state management for the Player Explorer feature
 */

import type { Player } from '@domain/models';
import { Position } from '@domain/enums';

export interface PlayerFilters {
  search: string;
  positions: Position[];
  clubs: number[];
  priceRange: [number, number];
  availability: 'all' | 'available' | 'expensive' | 'cheap';
  sortBy: 'name' | 'price' | 'form' | 'points' | 'ownership' | 'avgFdr';
  sortOrder: 'asc' | 'desc';
}

export interface SortConfig {
  field: keyof Player | 'ownership';
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
