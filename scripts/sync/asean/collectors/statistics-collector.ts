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

function calculateGoalDifference(
  players: PlayerCollected[],
  teamName: string
): { goals: number; conceded: number } {
  // Extract team goals from their players' goal counts
  const teamGoals = players
    .filter((p) => p.nationTeamName === teamName)
    .reduce((sum, p) => sum + p.goals, 0);

  // TODO: Conceded goals would require match details with scoring info
  return { goals: teamGoals, conceded: 0 };
}

function calculateTeamCleanSheets(
  players: PlayerCollected[],
  teams: TeamCollected[]
): Map<string, number> {
  // TODO: Clean sheets require match details with goals per team
  // For now, return empty map - to be populated from match details in future enhancement
  return new Map();
}

export function collectStatistics(
  players: PlayerCollected[],
  teams: TeamCollected[]
): StatisticEntry[] {
  const goalsLeader = topPlayer(players, (player) => player.goals);
  const assistsLeader = topPlayer(players, (player) => player.assists);

  const teamGoalCount = new Map<string, number>();
  for (const player of players) {
    teamGoalCount.set(
      player.nationTeamName,
      (teamGoalCount.get(player.nationTeamName) ?? 0) + player.goals
    );
  }

  const teamWithMostGoals = [...teamGoalCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const totalGoals = [...teamGoalCount.values()].reduce((sum, g) => sum + g, 0);

  // Find best attack (most goals scored by team)
  const bestAttackTeam = teamWithMostGoals
    ? teams.find((t) => t.name === teamWithMostGoals[0])
    : null;

  // TODO: Best defence requires match data with conceded goals per team
  // TODO: Most clean sheets requires match details showing matches with 0 goals conceded
  // TODO: Highest scoring match requires match events with all goal times

  const stats: StatisticEntry[] = [
    {
      id: 'top-scorer',
      title: 'Top Scorer',
      value: goalsLeader ? `${goalsLeader.name} (${goalsLeader.goals})` : 'Not Available',
      subtitle: goalsLeader ? goalsLeader.nationTeamName : 'No official data yet',
    },
    {
      id: 'most-assists',
      title: 'Most Assists',
      value: assistsLeader ? `${assistsLeader.name} (${assistsLeader.assists})` : 'Not Available',
      subtitle: assistsLeader ? assistsLeader.nationTeamName : 'No official data yet',
    },
    {
      id: 'most-clean-sheets',
      title: 'Most Clean Sheets',
      value: 'Not Available',
      subtitle: 'Requires detailed match data',
    },
    {
      id: 'most-goals',
      title: 'Most Goals (Team)',
      value: teamWithMostGoals
        ? `${teamWithMostGoals[0]} (${teamWithMostGoals[1]})`
        : 'Not Available',
      subtitle: `${teams.length} teams tracked`,
    },
    {
      id: 'best-attack',
      title: 'Best Attack',
      value: teamWithMostGoals ? teamWithMostGoals[0] : 'Not Available',
      subtitle: teamWithMostGoals ? `${teamWithMostGoals[1]} goals scored` : 'No official data yet',
    },
    {
      id: 'best-defence',
      title: 'Best Defence',
      value: 'Not Available',
      subtitle: 'Requires detailed match data',
    },
    {
      id: 'highest-scoring-match',
      title: 'Highest Scoring Match',
      value: 'Not Available',
      subtitle: 'Requires detailed match data',
    },
    {
      id: 'total-goals',
      title: 'Total Goals',
      value: `${totalGoals}`,
      subtitle: 'Goals scored across all matches',
    },
  ];

  return stats;
}
