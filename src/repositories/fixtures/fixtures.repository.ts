/**
 * Fixture Repository
 * Provides access to fixture data
 * Returns domain models instead of raw normalized data
 */

import type { Fixture } from '@domain/models';

export interface NormalizedFixture {
  id: number;
  event: number;
  homeTeam: number;
  awayTeam: number;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  started: boolean;
  finished: boolean;
  kickoff_time: string;
}

export class FixtureRepository {
  getAll(): Fixture[] {
    // TODO: Load from data/normalized/fixtures.json when available
    return [];
  }

  getUpcoming(): Fixture[] {
    // TODO: Filter fixtures with started=false
    const all = this.getAll();
    return all;
  }
}
