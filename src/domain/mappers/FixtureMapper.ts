import type { NormalizedFixture } from '../../repositories/fixtures';
import { FixtureStatus } from '../enums';
import type { Fixture } from '../models';

/**
 * Maps normalized fixture data to domain fixture model
 */
export class FixtureMapper {
  static toDomain(fixture: NormalizedFixture, homeTeamName: string, awayTeamName: string): Fixture {
    return {
      id: fixture.id,
      gameweek: fixture.event,
      homeTeam: homeTeamName,
      awayTeam: awayTeamName,
      homeTeamScore: fixture.homeTeamScore,
      awayTeamScore: fixture.awayTeamScore,
      status: this.statusFromFixture(fixture),
      kickoffTime: fixture.kickoff_time,
    };
  }

  private static statusFromFixture(fixture: NormalizedFixture): FixtureStatus {
    if (fixture.finished) {
      return FixtureStatus.Finished;
    }

    if (fixture.started) {
      return FixtureStatus.Live;
    }

    return FixtureStatus.Upcoming;
  }
}
