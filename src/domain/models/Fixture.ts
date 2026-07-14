import type { FixtureStatus } from '../enums';

/**
 * Domain model for a fixture
 */
export interface Fixture {
  id: number;
  gameweek: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  status: FixtureStatus;
  kickoffTime: string;
}
