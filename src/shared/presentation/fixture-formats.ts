/**
 * Fixture Presentation Formatters
 * Transforms fixture domain data into UI-friendly strings
 */

import type { Fixture } from '@domain/models';

/**
 * Format fixture status into human-readable label
 */
export function formatFixtureStatus(fixture: Fixture): string {
  if (fixture.finished) {
    return 'FT';
  }
  if (fixture.started) {
    return 'LIVE';
  }
  return 'Upcoming';
}

/**
 * Format kickoff time as date (e.g., "Sat, Aug 16")
 */
export function formatKickoffDate(kickoffTime: string): string {
  try {
    const date = new Date(kickoffTime);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-GB', options);
  } catch {
    return 'Date TBD';
  }
}

/**
 * Format kickoff time as time only (e.g., "15:00")
 */
export function formatKickoffTime(kickoffTime: string): string {
  try {
    const date = new Date(kickoffTime);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return 'TBD';
  }
}

/**
 * Format fixture difficulty (1-5 scale)
 */
export function formatDifficulty(difficulty: number): string {
  return `FDR ${difficulty}`;
}

/**
 * Get difficulty color based on FDR value (1-5)
 * 1-2 = Green (easy), 3 = Amber (medium), 4-5 = Red (hard)
 */
export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 2) return '#4caf50'; // success - green
  if (difficulty === 3) return '#ff9800'; // warning - amber
  return '#f44336'; // error - red
}

/**
 * Get difficulty label based on FDR value
 */
export function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return 'Easy';
  if (difficulty === 3) return 'Medium';
  return 'Hard';
}

/**
 * Format fixture score or time
 */
export function formatFixtureDisplay(fixture: Fixture): string {
  if (fixture.finished && fixture.homeTeamScore !== null && fixture.awayTeamScore !== null) {
    return `${fixture.homeTeamScore}-${fixture.awayTeamScore}`;
  }
  if (fixture.started) {
    return 'LIVE';
  }
  return formatKickoffTime(fixture.kickoffTime);
}
