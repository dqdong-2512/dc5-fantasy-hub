/**
 * Club Intelligence Service
 * Analyzes club data by composing team, player, and fixture intelligence
 * All calculations are deterministic - no predictions
 */

import type { Team, Player, Fixture } from '@domain/models';
import { FixtureRepository } from '@repositories/fixtures';
import { PlayerRepository } from '@repositories/players';
import { TeamRepository } from '@repositories/teams';
import type {
  ClubIntelligence,
  ClubKeyPlayer,
  ClubFixtureRun,
  ClubStrengthOverview,
  ClubFantasyMetrics,
} from './models';

export class ClubIntelligenceService {
  private fixtureRepository: FixtureRepository;
  private playerRepository: PlayerRepository;
  private teamRepository: TeamRepository;

  constructor() {
    this.fixtureRepository = new FixtureRepository();
    this.playerRepository = new PlayerRepository();
    this.teamRepository = new TeamRepository();
  }

  /**
   * Generate complete club intelligence profile
   */
  analyzeClub(team: Team): ClubIntelligence {
    const clubPlayers = this.playerRepository.getByTeam(team.id);
    const upcomingFixtures = this.fixtureRepository.getUpcomingByTeam(team.id);

    return {
      team,
      strengthOverview: this.getStrengthOverview(team),
      fixtureRun: this.getFixtureRun(upcomingFixtures),
      keyPlayers: this.getKeyPlayers(clubPlayers, 5),
      fantasyMetrics: this.getFantasyMetrics(clubPlayers),
      nextFixture: upcomingFixtures.length > 0 ? upcomingFixtures[0] : null,
      allUpcomingFixtures: upcomingFixtures,
    };
  }

  /**
   * Get strength overview for a team
   */
  private getStrengthOverview(team: Team): ClubStrengthOverview {
    return {
      overall: team.strength,
      overallHome: team.strengthOverallHome,
      overallAway: team.strengthOverallAway,
      attackHome: team.strengthAttackHome,
      attackAway: team.strengthAttackAway,
      defenceHome: team.strengthDefenceHome,
      defenceAway: team.strengthDefenceAway,
    };
  }

  /**
   * Get fixture run analysis
   */
  private getFixtureRun(upcomingFixtures: Fixture[]): ClubFixtureRun {
    if (upcomingFixtures.length === 0) {
      return {
        upcomingCount: 0,
        averageFdr: 0,
        homeCount: 0,
        awayCount: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
      };
    }

    const homeCounts = upcomingFixtures.filter(
      (f) => f.homeTeam.id === upcomingFixtures[0].homeTeam.id
    ).length;
    const awayCounts = upcomingFixtures.length - homeCounts;

    const difficulties = upcomingFixtures.map((f) => {
      const isHome = f.homeTeam.id === upcomingFixtures[0].homeTeam.id;
      return isHome ? f.homeDifficulty : f.awayDifficulty;
    });

    const avgFdr = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
    const easyCount = difficulties.filter((d) => d <= 2).length;
    const mediumCount = difficulties.filter((d) => d > 2 && d <= 3).length;
    const hardCount = difficulties.filter((d) => d > 3).length;

    return {
      upcomingCount: upcomingFixtures.length,
      averageFdr: avgFdr,
      homeCount: homeCounts,
      awayCount: awayCounts,
      easyCount,
      mediumCount,
      hardCount,
    };
  }

  /**
   * Get key fantasy players for a club
   * Transparent ranking: total points > form > ownership
   */
  private getKeyPlayers(clubPlayers: Player[], limit: number = 5): ClubKeyPlayer[] {
    return clubPlayers
      .filter((p) => p.minutesPlayed > 0) // Only active players
      .map((p) => ({
        id: p.id,
        name: p.displayName,
        position: p.position,
        price: p.price,
        totalPoints: p.totalPoints,
        form: p.form,
        ownership: p.ownership,
      }))
      .sort((a, b) => {
        // Sort by total points (desc), then form (desc), then ownership (desc)
        if (a.totalPoints !== b.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        if (a.form !== b.form) {
          return b.form - a.form;
        }
        return b.ownership - a.ownership;
      })
      .slice(0, limit);
  }

  /**
   * Calculate aggregate fantasy metrics for club
   */
  private getFantasyMetrics(clubPlayers: Player[]): ClubFantasyMetrics {
    if (clubPlayers.length === 0) {
      return {
        totalPlayerPoints: 0,
        averagePlayerForm: 0,
        averageOwnership: 0,
        highestOwnedPlayer: null,
        highestScoringPlayer: null,
        squadPlayerCount: 0,
        activePlayerCount: 0,
      };
    }

    const activePlayers = clubPlayers.filter((p) => p.minutesPlayed > 0);
    const totalPoints = clubPlayers.reduce((sum, p) => sum + p.totalPoints, 0);
    const avgForm =
      activePlayers.length > 0
        ? activePlayers.reduce((sum, p) => sum + p.form, 0) / activePlayers.length
        : 0;
    const avgOwnership =
      activePlayers.length > 0
        ? activePlayers.reduce((sum, p) => sum + p.ownership, 0) / activePlayers.length
        : 0;

    const highestOwned = clubPlayers.reduce((max, p) => (p.ownership > max.ownership ? p : max));
    const highestScoring = clubPlayers.reduce((max, p) =>
      p.totalPoints > max.totalPoints ? p : max
    );

    return {
      totalPlayerPoints: totalPoints,
      averagePlayerForm: avgForm,
      averageOwnership: avgOwnership,
      highestOwnedPlayer: {
        id: highestOwned.id,
        name: highestOwned.displayName,
        position: highestOwned.position,
        price: highestOwned.price,
        totalPoints: highestOwned.totalPoints,
        form: highestOwned.form,
        ownership: highestOwned.ownership,
      },
      highestScoringPlayer: {
        id: highestScoring.id,
        name: highestScoring.displayName,
        position: highestScoring.position,
        price: highestScoring.price,
        totalPoints: highestScoring.totalPoints,
        form: highestScoring.form,
        ownership: highestScoring.ownership,
      },
      squadPlayerCount: clubPlayers.length,
      activePlayerCount: activePlayers.length,
    };
  }

  /**
   * Compare multiple clubs
   */
  compareClubs(teamIds: number[]): ClubIntelligence[] {
    const validTeamIds = Array.from(new Set(teamIds)).slice(0, 3); // Max 3, remove duplicates
    return validTeamIds
      .map((id) => this.teamRepository.getById(id))
      .filter((team): team is Team => team !== null)
      .map((team) => this.analyzeClub(team));
  }
}
