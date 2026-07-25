import type { PlayerCollected, TeamCollected } from '../types';

interface StatisticEntry {
  id: string;
  title: string;
  value: string;
  subtitle: string;
}

function topPlayer(
  players: PlayerCollected[],
  selector: (player: PlayerCollected) => number
): PlayerCollected | null {
  if (players.length === 0) {
    return null;
  }

  return [...players].sort((a, b) => selector(b) - selector(a))[0] ?? null;
}

export function collectStatistics(
  players: PlayerCollected[],
  teams: TeamCollected[]
): StatisticEntry[] {
  const goalsLeader = topPlayer(players, (player) => player.goals);
  const assistsLeader = topPlayer(players, (player) => player.assists);
  const minutesLeader = topPlayer(players, (player) => player.minutes);

  const teamGoalCount = new Map<string, number>();
  for (const player of players) {
    teamGoalCount.set(
      player.nationTeamName,
      (teamGoalCount.get(player.nationTeamName) ?? 0) + player.goals
    );
  }

  const teamWithMostGoals = [...teamGoalCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const knownTeamCount = teams.length;

  return [
    {
      id: 'top-scorer',
      title: 'Top Scorer',
      value: goalsLeader ? `${goalsLeader.name} (${goalsLeader.goals})` : 'Not Available',
      subtitle: goalsLeader ? goalsLeader.nationTeamName : 'No official data yet',
    },
    {
      id: 'top-assists',
      title: 'Top Assists',
      value: assistsLeader ? `${assistsLeader.name} (${assistsLeader.assists})` : 'Not Available',
      subtitle: assistsLeader ? assistsLeader.nationTeamName : 'No official data yet',
    },
    {
      id: 'clean-sheets',
      title: 'Most Clean Sheets',
      value: 'Not Available',
      subtitle: 'Official clean sheet ranking not published',
    },
    {
      id: 'most-goals',
      title: 'Most Goals Team',
      value: teamWithMostGoals
        ? `${teamWithMostGoals[0]} (${teamWithMostGoals[1]})`
        : 'Not Available',
      subtitle: `${knownTeamCount} teams tracked`,
    },
    {
      id: 'most-minutes',
      title: 'Most Minutes',
      value: minutesLeader ? `${minutesLeader.name} (${minutesLeader.minutes})` : 'Not Available',
      subtitle: minutesLeader ? minutesLeader.nationTeamName : 'No official data yet',
    },
    {
      id: 'golden-boot',
      title: 'Golden Boot Leader',
      value: goalsLeader ? goalsLeader.name : 'Not Available',
      subtitle: goalsLeader ? `${goalsLeader.goals} goals` : 'No official data yet',
    },
  ];
}
