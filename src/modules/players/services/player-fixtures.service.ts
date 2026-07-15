/**
 * Player Fixture Intelligence Service
 * Analyzes player upcoming fixtures using existing fixture intelligence
 * No logic duplication - reuses fixture repository and intelligence
 */

import type { Player, Team } from '@domain/models';
import { FixtureRepository } from '@repositories/fixtures';
import { TeamRepository } from '@repositories/teams';
import { getDifficultyLabel } from '@shared/presentation/fixture-formats';
import {
  PLAYER_FIXTURE_HORIZON,
  FIXTURE_OUTLOOK_THRESHOLDS,
  PLAYER_FIXTURE_CRITERIA,
} from '../config/player-fixture-config';
import type {
  PlayerUpcomingFixture,
  PlayerFixtureSummary,
  PlayerWithFixtureIntelligence,
} from '../types/player-fixtures';
import { FixtureOutlook } from '../types/player-fixtures';
import type { FixtureOutlook as FixtureOutlookType } from '../types/player-fixtures';

export class PlayerFixtureIntelligenceService {
  private fixtureRepository: FixtureRepository;
  private teamRepository: TeamRepository;

  constructor() {
    this.fixtureRepository = new FixtureRepository();
    this.teamRepository = new TeamRepository();
  }

  /**
   * Get player's team ID from their club name
   */
  private getPlayerTeamId(player: Player): number | null {
    // Try using clubCode if available
    if (player.clubCode) {
      return player.clubCode;
    }

    // Otherwise, look up by team name
    const allTeams = this.teamRepository.getAll();
    const team = allTeams.find((t) => t.name === player.club);
    return team?.id || null;
  }

  /**
   * Get upcoming fixtures for a player
   */
  getPlayerUpcomingFixtures(
    player: Player,
    limit: number = PLAYER_FIXTURE_HORIZON
  ): PlayerUpcomingFixture[] {
    const teamId = this.getPlayerTeamId(player);
    if (!teamId) {
      return [];
    }

    const playerTeamFixtures = this.fixtureRepository.getUpcomingByTeam(teamId).slice(0, limit);

    return playerTeamFixtures.map((fixture) => {
      const isHome = fixture.homeTeam.id === teamId;
      const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
      const difficulty = isHome ? fixture.homeDifficulty : fixture.awayDifficulty;

      return {
        fixture,
        gameweek: fixture.gameweek,
        opponent,
        opponentBadge: opponent.code,
        homeAway: isHome ? 'H' : 'A',
        kickoffTime: fixture.kickoffTime,
        difficulty,
        difficultyLabel: getDifficultyLabel(difficulty),
      };
    });
  }

  /**
   * Calculate fixture summary for a player
   */
  getPlayerFixtureSummary(player: Player): PlayerFixtureSummary {
    const upcomingFixtures = this.getPlayerUpcomingFixtures(player, PLAYER_FIXTURE_HORIZON);

    if (upcomingFixtures.length === 0) {
      return {
        avgDifficulty: 0,
        homeFixtures: 0,
        awayFixtures: 0,
        easiestDifficulty: 0,
        hardestDifficulty: 0,
        upcomingFixtures: [],
        hasUpcomingFixtures: false,
      };
    }

    const difficulties = upcomingFixtures.map((f) => f.difficulty);
    const avgDifficulty = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
    const homeFixtures = upcomingFixtures.filter((f) => f.homeAway === 'H').length;
    const awayFixtures = upcomingFixtures.length - homeFixtures;

    return {
      avgDifficulty,
      homeFixtures,
      awayFixtures,
      easiestDifficulty: Math.min(...difficulties),
      hardestDifficulty: Math.max(...difficulties),
      upcomingFixtures,
      hasUpcomingFixtures: true,
    };
  }

  /**
   * Classify fixture outlook based on average FDR
   */
  classifyFixtureOutlook(avgDifficulty: number, hasUpcoming: boolean): FixtureOutlookType {
    if (!hasUpcoming) {
      return FixtureOutlook.NoUpcoming;
    }

    if (avgDifficulty <= FIXTURE_OUTLOOK_THRESHOLDS.VERY_FAVORABLE_MAX) {
      return FixtureOutlook.VeryFavorable;
    }
    if (avgDifficulty <= FIXTURE_OUTLOOK_THRESHOLDS.FAVORABLE_MAX) {
      return FixtureOutlook.Favorable;
    }
    if (avgDifficulty <= FIXTURE_OUTLOOK_THRESHOLDS.NEUTRAL_MAX) {
      return FixtureOutlook.Neutral;
    }
    if (avgDifficulty <= FIXTURE_OUTLOOK_THRESHOLDS.DIFFICULT_MAX) {
      return FixtureOutlook.Difficult;
    }

    return FixtureOutlook.VeryDifficult;
  }

  /**
   * Get fixture outlook label for display
   */
  getFixtureOutlookLabel(outlook: FixtureOutlookType): string {
    const labels: Record<FixtureOutlookType, string> = {
      [FixtureOutlook.VeryFavorable]: 'Very Favorable',
      [FixtureOutlook.Favorable]: 'Favorable',
      [FixtureOutlook.Neutral]: 'Neutral',
      [FixtureOutlook.Difficult]: 'Difficult',
      [FixtureOutlook.VeryDifficult]: 'Very Difficult',
      [FixtureOutlook.NoUpcoming]: 'Season Complete',
    };
    return labels[outlook];
  }

  /**
   * Get fixture outlook color for display
   */
  getFixtureOutlookColor(outlook: FixtureOutlookType): string {
    const colors: Record<FixtureOutlookType, string> = {
      [FixtureOutlook.VeryFavorable]: '#2e7d32', // dark green
      [FixtureOutlook.Favorable]: '#4caf50', // green
      [FixtureOutlook.Neutral]: '#ff9800', // amber
      [FixtureOutlook.Difficult]: '#f57c00', // orange
      [FixtureOutlook.VeryDifficult]: '#d32f2f', // red
      [FixtureOutlook.NoUpcoming]: '#757575', // grey
    };
    return colors[outlook];
  }

  /**
   * Find players with favorable upcoming fixtures
   * Uses deterministic criteria: form + avg FDR + minutes played + availability
   */
  findPlayersWithFavorableFixtures(
    players: Player[],
    limit: number = 5
  ): PlayerWithFixtureIntelligence[] {
    const playersWithAnalysis = players
      .map((player) => {
        const summary = this.getPlayerFixtureSummary(player);
        const outlook = this.classifyFixtureOutlook(
          summary.avgDifficulty,
          summary.hasUpcomingFixtures
        );
        const teamId = this.getPlayerTeamId(player);
        const team = teamId ? this.teamRepository.getById(teamId) : null;

        return {
          playerId: player.id,
          playerName: player.displayName,
          club: team || ({} as Team),
          price: player.price,
          form: player.form,
          minutesPlayed: player.minutesPlayed,
          avgFdr: summary.avgDifficulty,
          fixtureOutlook: outlook,
          nextFixtures: summary.upcomingFixtures.slice(0, 3), // Show next 3 in list
        };
      })
      // Filter: Form >= MIN_FORM, Minutes >= MIN_MINUTES, Favorable fixtures, Available
      .filter(
        (p) =>
          p.form >= PLAYER_FIXTURE_CRITERIA.MIN_FORM &&
          p.minutesPlayed >= PLAYER_FIXTURE_CRITERIA.MIN_MINUTES &&
          p.avgFdr <= PLAYER_FIXTURE_CRITERIA.FAVORABLE_FIXTURE_RUN_THRESHOLD &&
          p.club &&
          p.club.id // Must have valid club
      )
      // Sort by: Average FDR (ascending) then Form (descending)
      .sort((a, b) => {
        if (a.avgFdr !== b.avgFdr) {
          return a.avgFdr - b.avgFdr;
        }
        return b.form - a.form;
      })
      .slice(0, limit);

    return playersWithAnalysis;
  }

  /**
   * Format fixture sequence as readable string
   * Example: "BOU(H) FUL(A) CHE(H)"
   */
  formatFixtureSequence(fixtures: PlayerUpcomingFixture[], maxLength: number = 3): string {
    return fixtures
      .slice(0, maxLength)
      .map((f) => `${f.opponent.code}(${f.homeAway})`)
      .join(' · ');
  }

  /**
   * Format average FDR for display
   */
  formatAverageFdr(avgFdr: number): string {
    return avgFdr.toFixed(1);
  }
}
