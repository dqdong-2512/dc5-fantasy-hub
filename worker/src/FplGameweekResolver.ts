import type { FplFixture, FplGameweek, ResolvedGameweek } from './models';

export class FplGameweekResolver {
  resolve(
    gameweeks: FplGameweek[],
    fixtures: FplFixture[],
    now = new Date(),
    targetGameweek?: number
  ): ResolvedGameweek {
    if (gameweeks.length === 0) {
      return { gameweek: null, phase: 'PRESEASON', pollIntervalSeconds: 300 };
    }

    const explicitlySelected = gameweeks.find((gameweek) => gameweek.id === targetGameweek);
    const explicitlyCurrent = gameweeks.find((gameweek) => gameweek.isCurrent);
    const firstUnfinished = gameweeks.find((gameweek) => !gameweek.finished);
    const gameweek =
      explicitlySelected ?? explicitlyCurrent ?? firstUnfinished ?? gameweeks[gameweeks.length - 1];
    const selectedFixtures = fixtures.filter((fixture) => fixture.gameweek === gameweek.id);
    const live = selectedFixtures.some((fixture) => fixture.started && !fixture.finished);
    const allFinished =
      selectedFixtures.length > 0 && selectedFixtures.every((fixture) => fixture.finished);
    const beforeDeadline =
      gameweek.deadlineTime !== null && now.getTime() < new Date(gameweek.deadlineTime).getTime();

    if (live) return { gameweek, phase: 'LIVE', pollIntervalSeconds: 20 };
    if (gameweek.finished && gameweek.dataChecked) {
      return { gameweek, phase: 'FINAL', pollIntervalSeconds: 900 };
    }
    if (allFinished || selectedFixtures.some((fixture) => fixture.finishedProvisional)) {
      return { gameweek, phase: 'PROVISIONAL', pollIntervalSeconds: 60 };
    }
    if (beforeDeadline) {
      const hasPrevious = gameweeks.some((candidate) => candidate.finished);
      return {
        gameweek,
        phase: hasPrevious ? 'PRE_DEADLINE' : 'PRESEASON',
        pollIntervalSeconds: 300,
      };
    }
    return { gameweek, phase: 'LOCKED', pollIntervalSeconds: 60 };
  }
}
