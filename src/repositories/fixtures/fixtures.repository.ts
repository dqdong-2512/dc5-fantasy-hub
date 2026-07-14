/**
 * Fixture Repository
 * Provides access to fixture data
 * Note: Fixture data structure to be defined when fixture normalization is implemented
 */

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
  getAll(): NormalizedFixture[] {
    // TODO: Load from data/normalized/fixtures.json when available
    return [];
  }

  getUpcoming(): NormalizedFixture[] {
    // TODO: Filter fixtures with started=false
    const all = this.getAll();
    return all.filter((fixture) => !fixture.started);
  }
}
