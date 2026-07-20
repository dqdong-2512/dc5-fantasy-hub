/**
 * Fixture Swing Analysis Service
 * Analyzes how fixture difficulty changes for teams across the season
 */

import type { SeasonSquadSnapshot } from '../domain/SeasonPlan';
import { FixtureRepository } from '@repositories/fixtures';
import { PlayerRepository } from '@repositories/players';
import { TeamRepository } from '@repositories/teams';

export interface FixtureSwingAnalysis {
  teamId: number;
  teamName: string;
  periodBeforeDifficulty: number;
  periodAfterDifficulty: number;
  swing: number;
  signal: 'improving' | 'declining' | 'stable';
  fixturesBeforeCount: number;
  fixturesAfterCount: number;
}

/**
 * Service for analyzing fixture swings
 */
export class FixtureSwingAnalysisService {
  private fixtureRepository: FixtureRepository;
  private playerRepository: PlayerRepository;
  private teamRepository: TeamRepository;

  constructor(
    fixtureRepository?: FixtureRepository,
    playerRepository?: PlayerRepository,
    teamRepository?: TeamRepository
  ) {
    this.fixtureRepository = fixtureRepository || new FixtureRepository();
    this.playerRepository = playerRepository || new PlayerRepository();
    this.teamRepository = teamRepository || new TeamRepository();
  }

  /**
   * Analyze fixture swings for teams in squad across planning horizon
   * Compares difficulty of first half vs second half of planning period
   *
   * @param snapshot - Squad snapshot for reference
   * @param startGameweekId - Planning start
   * @param midGameweekId - Swing point (usually middle of planning period)
   * @param endGameweekId - Planning end
   * @returns Fixture swing analyses for squad teams
   */
  analyzeSquadFixtureSwings(
    snapshot: SeasonSquadSnapshot,
    startGameweekId: number,
    midGameweekId: number,
    endGameweekId: number
  ): FixtureSwingAnalysis[] {
    const teamsInSquad = this.getTeamsInSquad(snapshot);
    const results: FixtureSwingAnalysis[] = [];

    for (const teamId of teamsInSquad) {
      const team = this.teamRepository.getById(teamId);
      if (!team) continue;

      const swing = this.calculateTeamFixtureSwing(
        teamId,
        team.name,
        startGameweekId,
        midGameweekId,
        endGameweekId
      );

      if (swing) {
        results.push(swing);
      }
    }

    return results.sort((a, b) => Math.abs(b.swing) - Math.abs(a.swing));
  }

  /**
   * Calculate fixture swing for a single team
   *
   * @param teamId - Team ID
   * @param teamName - Team name
   * @param periodStartGW - Period 1 start
   * @param periodMidGW - Swing point
   * @param periodEndGW - Period 2 end
   * @returns Fixture swing analysis
   */
  private calculateTeamFixtureSwing(
    teamId: number,
    teamName: string,
    periodStartGW: number,
    periodMidGW: number,
    periodEndGW: number
  ): FixtureSwingAnalysis | null {
    // Get fixtures for periods
    const fixturesBefore = this.getTeamFixturesInRange(teamId, periodStartGW, periodMidGW);
    const fixturesAfter = this.getTeamFixturesInRange(teamId, periodMidGW + 1, periodEndGW);

    if (fixturesBefore.length === 0 || fixturesAfter.length === 0) {
      return null;
    }

    // Calculate average difficulty
    const beforeDifficulty = this.calculateAverageDifficulty(fixturesBefore, teamId);
    const afterDifficulty = this.calculateAverageDifficulty(fixturesAfter, teamId);

    const swing = beforeDifficulty - afterDifficulty; // Positive = improvement

    return {
      teamId,
      teamName,
      periodBeforeDifficulty: Number(beforeDifficulty.toFixed(2)),
      periodAfterDifficulty: Number(afterDifficulty.toFixed(2)),
      swing: Number(swing.toFixed(2)),
      signal: swing > 0.2 ? 'improving' : swing < -0.2 ? 'declining' : 'stable',
      fixturesBeforeCount: fixturesBefore.length,
      fixturesAfterCount: fixturesAfter.length,
    };
  }

  /**
   * Get team's fixtures in a gameweek range
   *
   * @param teamId - Team ID
   * @param startGW - Start gameweek
   * @param endGW - End gameweek
   * @returns Fixtures for this team in range
   */
  private getTeamFixturesInRange(teamId: number, startGW: number, endGW: number) {
    const allFixtures = this.fixtureRepository.getAll();
    return allFixtures.filter(
      (f) =>
        f.gameweek >= startGW &&
        f.gameweek <= endGW &&
        (f.homeTeam.id === teamId || f.awayTeam.id === teamId)
    );
  }

  /**
   * Calculate average difficulty for fixtures
   * Uses the perspective of the team (difficulty for home is different from away)
   */
  private calculateAverageDifficulty(fixtures: any[], teamId: number): number {
    if (fixtures.length === 0) return 5; // Neutral difficulty

    const difficulties = fixtures.map((f) => {
      if (f.homeTeam.id === teamId) {
        return f.awayDifficulty; // Away team's difficulty rating from home perspective
      } else {
        return f.homeDifficulty; // Home team's difficulty rating from away perspective
      }
    });

    return difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
  }

  /**
   * Get all teams represented in squad
   */
  private getTeamsInSquad(snapshot: SeasonSquadSnapshot): Set<number> {
    const teams = new Set<number>();

    for (const player of snapshot.squad) {
      const fullPlayer = this.playerRepository.getById(player.playerId);
      if (fullPlayer) {
        const team = this.teamRepository.getAll().find((t) => t.name === fullPlayer.club);
        if (team) {
          teams.add(team.id);
        }
      }
    }

    return teams;
  }
}
