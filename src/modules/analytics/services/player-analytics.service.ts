/**
 * Player Analytics Service
 * Calculates derived analytics metrics for players
 * Separates raw FPL metrics from derived application metrics
 */

import type { Player } from '@domain/models';
import { OwnershipCategory, type PlayerAnalyticsRecord } from '@domain/models';
import { PlayerFixtureIntelligenceService } from '@modules/players/services';

/**
 * Configuration for analytics calculations
 * Centralized thresholds for transparent, auditable scoring
 */
const ANALYTICS_CONFIG = {
  // Price normalization - FPL stores price in tenths (e.g., 75 = £7.5m)
  PRICE_DIVISOR: 10,

  // Ownership thresholds for classification
  OWNERSHIP_THRESHOLDS: {
    HIGHLY_OWNED: 50, // > 50%
    POPULAR: 20, // 20-50%
    DIFFERENTIAL: 5, // 5-20%
    // < 5% is Ultra Differential
  },

  // Minimum minutes for filtering
  MIN_MINUTES_FOR_ANALYSIS: 500,

  // Value score calculation
  // valueScore = totalPoints / (normalizedPrice / 100)
  // Example: 180 points / £7.5m = 24.0
  VALUE_BASELINE: 20, // Average value player

  // Differential score calculation
  // Balances good performance with low ownership
  // Formula: (form + normalized ownership factor) * performance multiplier
  DIFFERENTIAL_WEIGHTS: {
    FORM_WEIGHT: 0.4,
    PERFORMANCE_WEIGHT: 0.6,
  },

  // Form classification
  FORM_THRESHOLDS: {
    IN_FORM: 6.0,
  },

  // Fixture score calculation
  // Convert FDR (1-5) to score (0-10)
  // Lower FDR = higher score
  FIXTURE_SCORE_MULTIPLIER: 2, // (5 - fdr) * 2 = 0-10
};

export class PlayerAnalyticsService {
  private fixtureService: PlayerFixtureIntelligenceService;
  private currentManagerSquadPlayerIds: Set<number> = new Set();

  constructor(currentManagerSquadPlayerIds?: number[]) {
    this.fixtureService = new PlayerFixtureIntelligenceService();

    if (currentManagerSquadPlayerIds) {
      this.currentManagerSquadPlayerIds = new Set(currentManagerSquadPlayerIds);
    }
  }

  /**
   * Set current manager's squad for "In My Team" indicator
   */
  setCurrentManagerSquad(playerIds: number[]): void {
    this.currentManagerSquadPlayerIds = new Set(playerIds);
  }

  /**
   * Normalize price from FPL format (tenths) to millions
   * FPL: price = 75 → Display: £7.5m
   */
  private normalizePrice(price: number): number {
    return price / ANALYTICS_CONFIG.PRICE_DIVISOR;
  }

  /**
   * Calculate Value Score
   * Formula: totalPoints / normalizedPrice
   * Example: 180 points / £7.5m = 24.0
   */
  private calculateValueScore(totalPoints: number, price: number): number {
    const normalizedPrice = this.normalizePrice(price);
    if (normalizedPrice === 0) return 0;
    return totalPoints / normalizedPrice;
  }

  /**
   * Classify ownership
   */
  private classifyOwnership(ownership: number): OwnershipCategory {
    if (ownership > ANALYTICS_CONFIG.OWNERSHIP_THRESHOLDS.HIGHLY_OWNED) {
      return OwnershipCategory.HighlyOwned;
    }
    if (ownership > ANALYTICS_CONFIG.OWNERSHIP_THRESHOLDS.POPULAR) {
      return OwnershipCategory.Popular;
    }
    if (ownership > ANALYTICS_CONFIG.OWNERSHIP_THRESHOLDS.DIFFERENTIAL) {
      return OwnershipCategory.Differential;
    }
    return OwnershipCategory.UltraDifferential;
  }

  /**
   * Normalize form to 0-10 scale
   * FPL form is 0-10, so pass through as-is
   */
  private normalizeForm(form: number): number {
    return Math.max(0, Math.min(10, form));
  }

  /**
   * Normalize ownership to 0-1 scale for calculations
   */
  private normalizeOwnership(ownership: number): number {
    return Math.max(0, Math.min(1, ownership / 100));
  }

  /**
   * Calculate Differential Score
   * Higher for good performers with low ownership
   * Formula: performance_score * (1 - normalized_ownership)
   * Scaled 0-10
   */
  private calculateDifferentialScore(
    form: number,
    pointsPerGame: number,
    ownership: number,
    minutesPlayed: number
  ): number {
    // Only calculate for players with reasonable minutes
    if (minutesPlayed < ANALYTICS_CONFIG.MIN_MINUTES_FOR_ANALYSIS) {
      return 0;
    }

    // Performance factor (weighted average of form and PPG)
    // PPG can be 0-10+ range, so cap at 10 for calculation
    const normalizedPpg = Math.max(0, Math.min(10, pointsPerGame));
    const performanceFactor =
      form * ANALYTICS_CONFIG.DIFFERENTIAL_WEIGHTS.FORM_WEIGHT +
      normalizedPpg * ANALYTICS_CONFIG.DIFFERENTIAL_WEIGHTS.PERFORMANCE_WEIGHT;

    // Low ownership factor (0-1, higher for lower ownership)
    const normalizedOwnership = this.normalizeOwnership(ownership);
    const lowOwnershipFactor = 1 - normalizedOwnership;

    // Combine: performance * low_ownership_multiplier
    // Scale to 0-10
    const score = performanceFactor * (0.5 + lowOwnershipFactor);
    return Math.max(0, Math.min(10, score));
  }

  /**
   * Calculate Fixture Score
   * Higher for easier upcoming fixtures
   * FDR ranges 1-5, convert to 0-10 where higher is better
   */
  private calculateFixtureScore(averageFdr: number): number {
    // Convert: (5 - fdr) * 2 = 0-10
    // FDR 1 (easy) → score 8
    // FDR 5 (hard) → score 0
    const score = (5 - averageFdr) * ANALYTICS_CONFIG.FIXTURE_SCORE_MULTIPLIER;
    return Math.max(0, Math.min(10, score));
  }

  /**
   * Calculate Overall Score
   * Balanced combination of form, value, fixtures, and differential
   * Scaled 0-10
   */
  private calculateOverallScore(
    valueScore: number,
    formScore: number,
    fixtureScore: number,
    differentialScore: number
  ): number {
    // Weighted average
    // Value: 25% (consistency and efficiency)
    // Form: 30% (current performance)
    // Fixtures: 20% (upcoming opportunity)
    // Differential: 25% (contrarian opportunity)

    // Normalize value score to 0-10 scale (baseline ~20 is "good")
    const normalizedValueScore = Math.max(
      0,
      Math.min(10, (valueScore / ANALYTICS_CONFIG.VALUE_BASELINE) * 10)
    );

    const overall =
      normalizedValueScore * 0.25 + formScore * 0.3 + fixtureScore * 0.2 + differentialScore * 0.25;

    return Math.max(0, Math.min(10, overall));
  }

  /**
   * Calculate Transfer Target Score
   * Emphasizes combination of form, value, and fixtures for transfer recommendations
   */
  private calculateTransferTargetScore(
    formScore: number,
    valueScore: number,
    fixtureScore: number,
    ownership: number,
    minutesPlayed: number
  ): number {
    // Require minimum minutes
    if (minutesPlayed < ANALYTICS_CONFIG.MIN_MINUTES_FOR_ANALYSIS) {
      return 0;
    }

    // Normalize value
    const normalizedValueScore = Math.max(
      0,
      Math.min(10, (valueScore / ANALYTICS_CONFIG.VALUE_BASELINE) * 10)
    );

    // Prefer less-owned players (not already in most teams)
    const ownershipFactor =
      ownership > ANALYTICS_CONFIG.OWNERSHIP_THRESHOLDS.HIGHLY_OWNED ? 0.8 : 1.0;

    // Weighted: Form 35%, Value 30%, Fixtures 25%, Ownership factor 10%
    const score =
      (formScore * 0.35 + normalizedValueScore * 0.3 + fixtureScore * 0.25) * ownershipFactor;

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Build complete analytics record for a player
   */
  buildAnalyticsRecord(player: Player): PlayerAnalyticsRecord {
    const valueScore = this.calculateValueScore(player.totalPoints, player.price);
    const ownershipCategory = this.classifyOwnership(player.ownership);
    const formScore = this.normalizeForm(player.form);

    // Get fixture intelligence
    const fixtureSummary = this.fixtureService.getPlayerFixtureSummary(player);
    const fixtureOutlook = this.fixtureService.classifyFixtureOutlook(
      fixtureSummary.avgDifficulty,
      fixtureSummary.hasUpcomingFixtures
    );
    const fixtureScore = this.calculateFixtureScore(fixtureSummary.avgDifficulty);

    const differentialScore = this.calculateDifferentialScore(
      player.form,
      player.pointsPerGame,
      player.ownership,
      player.minutesPlayed
    );

    const overallScore = this.calculateOverallScore(
      valueScore,
      formScore,
      fixtureScore,
      differentialScore
    );

    const transferTargetScore = this.calculateTransferTargetScore(
      formScore,
      valueScore,
      fixtureScore,
      player.ownership,
      player.minutesPlayed
    );

    return {
      playerId: player.id,
      playerName: player.displayName,
      position: player.position,
      club: player.club,
      price: player.price,

      // Raw metrics
      totalPoints: player.totalPoints,
      form: player.form,
      ownership: player.ownership,
      pointsPerGame: player.pointsPerGame,
      minutesPlayed: player.minutesPlayed,

      // Derived metrics
      valueScore,
      ownershipCategory,
      formScore,
      differentialScore,
      fixtureScore,
      fixtureOutlook: this.fixtureService.getFixtureOutlookLabel(fixtureOutlook),

      // Composite scores
      overallScore,
      transferTargetScore,

      // Flags
      isInMyTeam: this.currentManagerSquadPlayerIds.has(player.id),
      isDifferential:
        ownershipCategory === OwnershipCategory.Differential ||
        ownershipCategory === OwnershipCategory.UltraDifferential,
      isValuePick: valueScore > ANALYTICS_CONFIG.VALUE_BASELINE * 1.1, // 10% above baseline
      hasGoodFixtures: fixtureSummary.avgDifficulty <= 2.5, // Average FDR <= 2.5
    };
  }

  /**
   * Build analytics for all players
   */
  buildAllAnalytics(players: Player[]): PlayerAnalyticsRecord[] {
    return players.map((player) => this.buildAnalyticsRecord(player));
  }

  /**
   * Get top players by category
   */
  getTopByCategory(
    players: Player[],
    category: 'form' | 'value' | 'differential' | 'fixtures' | 'overall',
    limit: number = 10
  ): PlayerAnalyticsRecord[] {
    const analytics = this.buildAllAnalytics(players);

    let sorted: PlayerAnalyticsRecord[] = [];

    switch (category) {
      case 'form':
        sorted = [...analytics].sort((a, b) => b.formScore - a.formScore);
        break;
      case 'value':
        sorted = [...analytics].sort((a, b) => b.valueScore - a.valueScore);
        break;
      case 'differential':
        sorted = [...analytics]
          .filter(
            (a) =>
              a.ownershipCategory === OwnershipCategory.Differential ||
              a.ownershipCategory === OwnershipCategory.UltraDifferential
          )
          .sort((a, b) => b.differentialScore - a.differentialScore);
        break;
      case 'fixtures':
        sorted = [...analytics].sort((a, b) => b.fixtureScore - a.fixtureScore);
        break;
      case 'overall':
        sorted = [...analytics].sort((a, b) => b.overallScore - a.overallScore);
        break;
    }

    return sorted.slice(0, limit);
  }

  /**
   * Find transfer targets
   * Combines good form, value, and fixtures
   */
  findTransferTargets(
    players: Player[],
    minTransferTargetScore: number = 6.0,
    limit: number = 15
  ): PlayerAnalyticsRecord[] {
    const analytics = this.buildAllAnalytics(players);

    return analytics
      .filter(
        (a) =>
          a.transferTargetScore >= minTransferTargetScore &&
          a.minutesPlayed >= ANALYTICS_CONFIG.MIN_MINUTES_FOR_ANALYSIS
      )
      .sort((a, b) => b.transferTargetScore - a.transferTargetScore)
      .slice(0, limit);
  }
}
