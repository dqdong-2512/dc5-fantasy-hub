import type { NormalizedFixture } from '../../repositories/types';
import { FixtureStatus } from '../enums';
import type { Fixture } from '../models';
import type { Team } from '../models';

/**
 * Maps normalized fixture data to domain fixture model
 */
export class FixtureMapper {
  static toDomain(fixture: NormalizedFixture, homeTeam: Team, awayTeam: Team): Fixture {
    return {
      id: fixture.id,
      gameweek: fixture.gameweek,
      homeTeam,
      awayTeam,
      homeTeamScore: fixture.homeTeamScore,
      awayTeamScore: fixture.awayTeamScore,
      status: this.statusFromFixture(fixture),
      started: fixture.started,
      finished: fixture.finished,
      kickoffTime: fixture.kickoffTime,
      homeDifficulty: fixture.homeDifficulty,
      awayDifficulty: fixture.awayDifficulty,
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
