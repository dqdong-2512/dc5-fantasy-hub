import type { Team } from './Team';
import type { FixtureStatus } from '../enums';

/**
 * Domain model for a fixture
 * Represents a Premier League match with all relevant information
 */
export interface Fixture {
  id: number;
  gameweek: number;
  homeTeam: Team;
  awayTeam: Team;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  kickoffTime: string;
  status: FixtureStatus;
  started: boolean;
  finished: boolean;
  homeDifficulty: number;
  awayDifficulty: number;
}
