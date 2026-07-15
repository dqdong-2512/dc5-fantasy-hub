/**
 * Command Center Insight Service
 * Deterministic business logic for calculating FPL insights
 * All calculations are transparent and based on available real data
 */

import type { Player } from '../../../domain/models/Player';
import type { Gameweek } from '../../../domain/models/Gameweek';
import type { CommandCenterData, DeadlineInsight, PlayerRecommendation } from './models';

// Thresholds for insight calculations (centralized constants)
const INSIGHT_THRESHOLDS = {
  // Form-based thresholds
  STRONG_FORM_MIN: 6.0,
  DIFFERENTIAL_FORM_MIN: 6.5,

  // Ownership thresholds
  HIGH_OWNERSHIP_MIN: 15.0,
  LOW_OWNERSHIP_MAX: 8.0,

  // Minutes thresholds
  MEANINGFUL_MINUTES_MIN: 1000,

  // Sample sizes
  PLAYERS_TO_WATCH_COUNT: 5,
  TOP_OWNED_COUNT: 5,
  DIFFERENTIAL_COUNT: 3,
};

/**
 * Calculate deadline insight
 */
export function calculateDeadlineInsight(gameweek: Gameweek | null): DeadlineInsight | null {
  if (!gameweek) return null;

  const now = new Date();
  const deadline = new Date(gameweek.deadline);
  const diffMs = deadline.getTime() - now.getTime();
  const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
  const isActive = diffMs > 0;

  let severity: 'info' | 'positive' | 'warning' | 'critical';
  if (!isActive) {
    severity = 'critical';
  } else if (hoursRemaining < 1) {
    severity = 'critical';
  } else if (hoursRemaining < 24) {
    severity = 'warning';
  } else {
    severity = 'info';
  }

  return {
    id: `deadline-gw${gameweek.id}`,
    type: 'deadline',
    severity,
    title: `GW${gameweek.id} Deadline`,
    gameweek: gameweek.id,
    deadline: gameweek.deadline,
    hoursRemaining: Math.max(0, hoursRemaining),
    isActive,
  };
}

/**
 * Calculate player score for "Players to Watch"
 * Combines form and total points
 */
function calculatePlayerWatchScore(player: Player): number {
  return player.form * 2 + (player.totalPoints / 100) * 10;
}

/**
 * Generate players to watch (top performers)
 * Based on form and total points
 */
export function generatePlayersToWatch(
  players: Player[],
  limit: number = INSIGHT_THRESHOLDS.PLAYERS_TO_WATCH_COUNT
): PlayerRecommendation[] {
  return players
    .filter((p) => p.form > 0 && p.totalPoints > 0)
    .map((p) => ({
      playerId: p.id,
      playerName: p.displayName,
      club: p.club,
      position: p.position,
      price: p.price,
      form: p.form,
      totalPoints: p.totalPoints,
      ownership: p.ownership,
      minutesPlayed: p.minutesPlayed,
      reason: 'Strong current form and season performance',
      score: calculatePlayerWatchScore(p),
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit)
    .map(({ score, ...rest }) => rest);
}

/**
 * Generate differential watch
 * Players with low ownership but strong form and minutes
 */
export function generateDifferentialWatch(
  players: Player[],
  limit: number = INSIGHT_THRESHOLDS.DIFFERENTIAL_COUNT
): PlayerRecommendation[] {
  return players
    .filter(
      (p) =>
        p.form >= INSIGHT_THRESHOLDS.DIFFERENTIAL_FORM_MIN &&
        p.ownership <= INSIGHT_THRESHOLDS.LOW_OWNERSHIP_MAX &&
        p.minutesPlayed >= INSIGHT_THRESHOLDS.MEANINGFUL_MINUTES_MIN
    )
    .map((p) => ({
      playerId: p.id,
      playerName: p.displayName,
      club: p.club,
      position: p.position,
      price: p.price,
      form: p.form,
      totalPoints: p.totalPoints,
      ownership: p.ownership,
      minutesPlayed: p.minutesPlayed,
      reason: `Low ownership (${p.ownership.toFixed(1)}%) with strong form (${p.form.toFixed(1)})`,
    }))
    .sort((a, b) => b.form - a.form)
    .slice(0, limit);
}

/**
 * Generate ownership watch (top owned players)
 * Shows the template / highly selected players
 */
export function generateOwnershipWatch(
  players: Player[],
  limit: number = INSIGHT_THRESHOLDS.TOP_OWNED_COUNT
): PlayerRecommendation[] {
  return players
    .filter((p) => p.ownership >= INSIGHT_THRESHOLDS.HIGH_OWNERSHIP_MIN)
    .map((p) => ({
      playerId: p.id,
      playerName: p.displayName,
      club: p.club,
      position: p.position,
      price: p.price,
      form: p.form,
      totalPoints: p.totalPoints,
      ownership: p.ownership,
      minutesPlayed: p.minutesPlayed,
      reason: `Highly selected (${p.ownership.toFixed(1)}% ownership)`,
    }))
    .sort((a, b) => b.ownership - a.ownership)
    .slice(0, limit);
}

/**
 * Generate availability watch
 * Players with status/availability issues
 */
export function generateAvailabilityWatch(players: Player[]): PlayerRecommendation[] {
  return players
    .filter(
      (p) =>
        p.status &&
        (p.status.toLowerCase() !== 'available' ||
          p.status.toLowerCase() === 'unavailable' ||
          p.status.toLowerCase().includes('injury') ||
          p.status.toLowerCase().includes('doubt') ||
          p.status.toLowerCase().includes('out'))
    )
    .map((p) => ({
      playerId: p.id,
      playerName: p.displayName,
      club: p.club,
      position: p.position,
      price: p.price,
      form: p.form,
      totalPoints: p.totalPoints,
      ownership: p.ownership,
      minutesPlayed: p.minutesPlayed,
      reason: `Status: ${p.status}`,
    }))
    .slice(0, 5);
}

/**
 * Compile all insights into Command Center data
 */
export function compileCommandCenterData(
  gameweek: Gameweek | null,
  players: Player[]
): CommandCenterData {
  const deadline = calculateDeadlineInsight(gameweek);
  const playersToWatch = generatePlayersToWatch(players);
  const differentials = generateDifferentialWatch(players);
  const topOwned = generateOwnershipWatch(players);
  const unavailablePlayers = generateAvailabilityWatch(players);

  return {
    deadline,
    playersToWatch,
    differentials,
    topOwned,
    unavailablePlayers,
    hasUnavailableData: unavailablePlayers.length > 0,
  };
}
