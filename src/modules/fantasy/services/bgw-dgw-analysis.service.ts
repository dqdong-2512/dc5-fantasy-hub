/**
 * BGW/DGW Analysis Service
 * Analyzes blank and double gameweeks across the season
 */

import type { SeasonSquadSnapshot } from '../domain/SeasonPlan';
import { FixtureRepository } from '@repositories/fixtures';
import { PlayerRepository } from '@repositories/players';
import { TeamRepository } from '@repositories/teams';

export interface BGWDGWDetail {
  gameweekId: number;
  blankPlayerIds: number[];
  doubleFixturePlayerIds: number[];
  potentialBGW: boolean;
  potentialDGW: boolean;
  squadBlankCount?: number;
  squadDGWCount?: number;
}

/**
 * Service for analyzing blank and double gameweeks
 */
export class BGWDGWAnalysisService {
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
   * Analyze BGW/DGW across gameweeks with squad context
   *
   * @param squadSnapshots - Squad snapshots from simulation
   * @returns BGW/DGW analysis by gameweek
   */
  analyzeBGWDGW(squadSnapshots: Map<number, SeasonSquadSnapshot>): BGWDGWDetail[] {
    const results: BGWDGWDetail[] = [];

    for (const [gameweekId, snapshot] of squadSnapshots) {
      const detail = this.analyzeGameweekBGWDGW(gameweekId, snapshot);
      results.push(detail);
    }

    return results;
  }

  /**
   * Analyze a single gameweek for BGW/DGW
   *
   * @param gameweekId - Gameweek ID
   * @param squad - Squad snapshot
   * @returns Analysis for this gameweek
   */
  private analyzeGameweekBGWDGW(gameweekId: number, snapshot: SeasonSquadSnapshot): BGWDGWDetail {
    const fixtures = this.fixtureRepository.getByGameweek(gameweekId);
    const teamsWithFixtures = new Set<number>();

    // Collect teams with fixtures
    fixtures.forEach((fixture) => {
      teamsWithFixtures.add(fixture.homeTeam.id);
      teamsWithFixtures.add(fixture.awayTeam.id);
    });

    // Analyze squad
    const blankPlayerIds: number[] = [];
    const doubleFixturePlayerIds: number[] = [];

    // For each player in squad
    for (const player of snapshot.squad) {
      // Find player to get team
      const fullPlayer = this.playerRepository.getById(player.playerId);
      if (!fullPlayer) continue;

      const team = this.teamRepository.getAll().find((t) => t.name === fullPlayer.club);
      if (!team) continue;

      // Count fixtures for this team
      const teamFixtures = fixtures.filter(
        (f) => f.homeTeam.id === team.id || f.awayTeam.id === team.id
      );

      if (teamFixtures.length === 0) {
        blankPlayerIds.push(player.playerId);
      } else if (teamFixtures.length > 1) {
        doubleFixturePlayerIds.push(player.playerId);
      }
    }

    return {
      gameweekId,
      blankPlayerIds,
      doubleFixturePlayerIds,
      potentialBGW: blankPlayerIds.length > 0,
      potentialDGW: doubleFixturePlayerIds.length > 0,
      squadBlankCount: blankPlayerIds.length,
      squadDGWCount: doubleFixturePlayerIds.length,
    };
  }

  /**
   * Get summary of all BGWs/DGWs in range
   *
   * @param analyses - BGW/DGW analyses
   * @returns Summary counts
   */
  getSummary(analyses: BGWDGWDetail[]): {
    totalBGWs: number;
    totalDGWs: number;
    potentialBGWGameweeks: number[];
    potentialDGWGameweeks: number[];
  } {
    return {
      totalBGWs: analyses.filter((a) => a.potentialBGW).length,
      totalDGWs: analyses.filter((a) => a.potentialDGW).length,
      potentialBGWGameweeks: analyses.filter((a) => a.potentialBGW).map((a) => a.gameweekId),
      potentialDGWGameweeks: analyses.filter((a) => a.potentialDGW).map((a) => a.gameweekId),
    };
  }
}
