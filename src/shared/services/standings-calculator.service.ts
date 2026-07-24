/**
 * Standings Calculator Service
 * Pure function for calculating Premier League standings from fixture results
 *
 * Features:
 * - Deterministic: Same input always produces same output
 * - Season-aware: Works for any completed fixtures in the dataset
 * - Snapshot support: Calculate standings after any gameweek
 * - No side effects: No external dependencies or mutations
 */

import type { Fixture, Team } from '@domain/models';

export interface StandingsRow {
  position: number;
  prevPosition: number | null;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface LeagueStandings {
  gameweekId: number;
  generatedAt: Date;
  rows: StandingsRow[];
}

/**
 * Calculate standings from completed fixtures
 *
 * @param fixtures - All fixtures (the service filters for completed ones)
 * @param teams - All teams in the league
 * @param upToGameweek - Optional: calculate standings only up to this gameweek
 * @returns Calculated standings table
 */
export class StandingsCalculatorService {
  static calculate(fixtures: Fixture[], teams: Team[], upToGameweek?: number): LeagueStandings {
    // Filter to only completed fixtures
    let completedFixtures = fixtures.filter(
      (f) =>
        f.finished &&
        f.homeTeamScore !== null &&
        f.homeTeamScore !== undefined &&
        f.awayTeamScore !== null &&
        f.awayTeamScore !== undefined
    );

    // If upToGameweek specified, only include fixtures up to that gameweek
    if (upToGameweek !== undefined) {
      completedFixtures = completedFixtures.filter((f) => f.gameweek <= upToGameweek);
    }

    // Initialize stats for each team
    const teamStats = new Map<
      number,
      {
        team: Team;
        played: number;
        won: number;
        drawn: number;
        lost: number;
        goalsFor: number;
        goalsAgainst: number;
      }
    >();

    teams.forEach((team) => {
      teamStats.set(team.id, {
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      });
    });

    // Process each completed fixture
    completedFixtures.forEach((fixture) => {
      const homeStats = teamStats.get(fixture.homeTeam.id);
      const awayStats = teamStats.get(fixture.awayTeam.id);

      if (!homeStats || !awayStats) {
        console.warn(
          `Fixture ${fixture.id}: Team not found (home: ${fixture.homeTeam.id}, away: ${fixture.awayTeam.id})`
        );
        return;
      }

      const homeScore = fixture.homeTeamScore || 0;
      const awayScore = fixture.awayTeamScore || 0;

      // Update played games
      homeStats.played += 1;
      awayStats.played += 1;

      // Update goals
      homeStats.goalsFor += homeScore;
      homeStats.goalsAgainst += awayScore;
      awayStats.goalsFor += awayScore;
      awayStats.goalsAgainst += homeScore;

      // Update wins/draws/losses
      if (homeScore > awayScore) {
        homeStats.won += 1;
        awayStats.lost += 1;
      } else if (awayScore > homeScore) {
        awayStats.won += 1;
        homeStats.lost += 1;
      } else {
        homeStats.drawn += 1;
        awayStats.drawn += 1;
      }
    });

    // Calculate points and convert to standings rows
    const rows: StandingsRow[] = Array.from(teamStats.values())
      .map((stats) => ({
        position: 0, // Will be set after sorting
        prevPosition: null,
        team: stats.team,
        played: stats.played,
        won: stats.won,
        drawn: stats.drawn,
        lost: stats.lost,
        goalsFor: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
        goalDifference: stats.goalsFor - stats.goalsAgainst,
        points: stats.won * 3 + stats.drawn * 1,
      }))
      .sort((a, b) => {
        // Premier League ranking criteria:
        // 1. Points
        // 2. Goal Difference
        // 3. Goals For
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        if (b.goalDifference !== a.goalDifference) {
          return b.goalDifference - a.goalDifference;
        }
        return b.goalsFor - a.goalsFor;
      })
      .map((row, index) => ({
        ...row,
        position: index + 1,
      }));

    return {
      gameweekId: upToGameweek || Math.max(0, ...completedFixtures.map((f) => f.gameweek)),
      generatedAt: new Date(),
      rows,
    };
  }

  /**
   * Get previous gameweek standings to calculate position movement
   *
   * @param fixtures - All fixtures
   * @param teams - All teams
   * @param gameweekId - Current gameweek
   * @returns Previous standings or null if gameweek 1
   */
  static getPreviousGameweekStandings(
    fixtures: Fixture[],
    teams: Team[],
    gameweekId: number
  ): LeagueStandings | null {
    if (gameweekId <= 1) {
      return null;
    }

    return this.calculate(fixtures, teams, gameweekId - 1);
  }

  /**
   * Calculate position movement from previous gameweek
   *
   * @param currentStandings - Current standings
   * @param previousStandings - Previous gameweek standings
   * @returns Standings with position movement calculated
   */
  static addPositionMovement(
    currentStandings: LeagueStandings,
    previousStandings: LeagueStandings | null
  ): LeagueStandings {
    if (!previousStandings) {
      // No previous gameweek - all neutral movement
      return currentStandings;
    }

    // Build previous position map
    const prevPositionMap = new Map<number, number>();
    previousStandings.rows.forEach((row) => {
      prevPositionMap.set(row.team.id, row.position);
    });

    // Add previous position to current standings
    const rowsWithMovement = currentStandings.rows.map((row) => ({
      ...row,
      prevPosition: prevPositionMap.get(row.team.id) || null,
    }));

    return {
      ...currentStandings,
      rows: rowsWithMovement,
    };
  }

  /**
   * Get position movement indicator
   * Returns: "↑", "↓", or "—"
   */
  static getMovementIndicator(prevPosition: number | null, currentPosition: number): string {
    if (prevPosition === null || prevPosition === undefined) {
      return '—';
    }

    if (currentPosition < prevPosition) {
      return '↑';
    }

    if (currentPosition > prevPosition) {
      return '↓';
    }

    return '—';
  }

  /**
   * Get movement magnitude (how many places moved)
   */
  static getMovementMagnitude(prevPosition: number | null, currentPosition: number): number {
    if (prevPosition === null || prevPosition === undefined) {
      return 0;
    }

    return Math.abs(currentPosition - prevPosition);
  }
}
