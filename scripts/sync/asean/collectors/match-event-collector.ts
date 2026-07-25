import type { MatchDetailCollected, MatchEventCollected } from '../types';

export function collectMatchEventsFromDetails(
  details: MatchDetailCollected[]
): MatchEventCollected[] {
  const events: MatchEventCollected[] = [];
  let counter = 1;

  for (const detail of details) {
    for (const goal of detail.goals) {
      events.push({
        id: `event-${counter}`,
        fixtureId: detail.fixtureId,
        playerName: goal.playerName,
        side: goal.side,
        minute: goal.minute,
        addedTime: goal.addedTime,
        type: 'goal',
        note: null,
      });
      counter += 1;
    }
  }

  return events.sort((a, b) => {
    if (a.fixtureId !== b.fixtureId) {
      return a.fixtureId.localeCompare(b.fixtureId);
    }

    if (a.minute !== b.minute) {
      return a.minute - b.minute;
    }

    return a.id.localeCompare(b.id);
  });
}
