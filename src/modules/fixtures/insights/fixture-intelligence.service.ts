/**
 * Fixture Intelligence Service
 * Analyzes fixture data to generate transparent, deterministic insights
 * All calculations use only official FPL fixture difficulty data
 */

import type { Fixture, Team } from '@domain/models';
import type { FixtureRun, TeamFixtureDifficultyAnalysis, FixtureRunSummary } from './models';

/**
 * Configuration for fixture analysis
 */
const FIXTURE_ANALYSIS_CONFIG = {
  FIXTURE_HORIZON: 5, // Analyze next 5 fixtures
};

/**
 * Analyze fixture difficulty for a team over the next N gameweeks
 */
export function analyzeTeamFixtureDifficulty(
  team: Team,
  upcomingFixtures: Fixture[]
): TeamFixtureDifficultyAnalysis {
  // Get team's upcoming fixtures limited by horizon
  const teamFixtures = upcomingFixtures
    .filter((f) => f.homeTeam.id === team.id || f.awayTeam.id === team.id)
    .slice(0, FIXTURE_ANALYSIS_CONFIG.FIXTURE_HORIZON);

  if (teamFixtures.length === 0) {
    return {
      team,
      upcomingCount: 0,
      averageDifficulty: 0,
      homeFixtures: 0,
      awayFixtures: 0,
      runs: [],
    };
  }

  const runs: FixtureRun[] = teamFixtures.map((fixture) => {
    const isHome = fixture.homeTeam.id === team.id;
    const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
    const difficulty = isHome ? fixture.homeDifficulty : fixture.awayDifficulty;

    return {
      opponent,
      difficulty,
      isHome,
    };
  });

  const totalDifficulty = runs.reduce((sum, run) => sum + run.difficulty, 0);
  const averageDifficulty = totalDifficulty / runs.length;

  const homeFixtures = runs.filter((r) => r.isHome).length;
  const awayFixtures = runs.length - homeFixtures;

  return {
    team,
    upcomingCount: teamFixtures.length,
    averageDifficulty,
    homeFixtures,
    awayFixtures,
    runs,
  };
}

/**
 * Find teams with easiest fixture runs
 */
export function findEasiestFixtureRuns(
  teams: Team[],
  allFixtures: Fixture[],
  limit: number = 5
): FixtureRunSummary[] {
  const analyses = teams.map((team) => analyzeTeamFixtureDifficulty(team, allFixtures));

  return analyses
    .filter((a) => a.upcomingCount > 0)
    .map((a) => ({
      team: a.team,
      averageDifficulty: a.averageDifficulty,
      fixtures: a.upcomingCount,
      homeFixtures: a.homeFixtures,
      awayFixtures: a.awayFixtures,
      sequenceLabel: generateSequenceLabel(a),
    }))
    .sort((a, b) => a.averageDifficulty - b.averageDifficulty)
    .slice(0, limit);
}

/**
 * Find teams with hardest fixture runs
 */
export function findHardestFixtureRuns(
  teams: Team[],
  allFixtures: Fixture[],
  limit: number = 5
): FixtureRunSummary[] {
  const analyses = teams.map((team) => analyzeTeamFixtureDifficulty(team, allFixtures));

  return analyses
    .filter((a) => a.upcomingCount > 0)
    .map((a) => ({
      team: a.team,
      averageDifficulty: a.averageDifficulty,
      fixtures: a.upcomingCount,
      homeFixtures: a.homeFixtures,
      awayFixtures: a.awayFixtures,
      sequenceLabel: generateSequenceLabel(a),
    }))
    .sort((a, b) => b.averageDifficulty - a.averageDifficulty)
    .slice(0, limit);
}

/**
 * Generate a sequence label showing fixture opponents and home/away
 * Example: "BOU(H), FUL(A), CHE(H), ..."
 */
export function generateSequenceLabel(analysis: TeamFixtureDifficultyAnalysis): string {
  if (analysis.runs.length === 0) {
    return 'No upcoming fixtures';
  }

  return analysis.runs
    .map((run) => {
      const homeAway = run.isHome ? 'H' : 'A';
      const fdr = run.difficulty;
      return `${run.opponent.code}(${homeAway}) ${fdr}`;
    })
    .join(' • ');
}

/**
 * Get the next gameweek with fixtures
 */
export function getNextGameweekWithFixtures(fixtures: Fixture[]): number | null {
  const upcoming = fixtures.filter((f) => !f.finished);
  if (upcoming.length === 0) return null;

  const gameweeks = [...new Set(upcoming.map((f) => f.gameweek))];
  return Math.min(...gameweeks);
}
