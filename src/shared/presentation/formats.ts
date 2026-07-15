/**
 * Format Service
 * Centralized utility for formatting values for UI consumption
 * Handles: prices, percentages, dates, statistics, etc.
 */

/**
 * Format player price to readable string
 * @param priceInTenths - Price in tenths of pounds (e.g., 82 = £8.2m)
 * @returns Formatted price string (e.g., "£8.2m")
 */
export function formatPrice(priceInTenths: number): string {
  const priceInMillions = priceInTenths / 10;
  return `£${priceInMillions.toFixed(1)}m`;
}

/**
 * Format ownership percentage
 * @param ownership - Ownership as decimal (e.g., 36.4)
 * @returns Formatted percentage string (e.g., "36.4%")
 */
export function formatOwnership(ownership: number): string {
  return `${ownership.toFixed(1)}%`;
}

/**
 * Format form score
 * @param form - Form as decimal (e.g., 5.5)
 * @returns Formatted form string (e.g., "5.5")
 */
export function formatForm(form: number): string {
  return form.toFixed(1);
}

/**
 * Format total points
 * @param points - Total points earned
 * @returns Formatted points string (e.g., "162 pts")
 */
export function formatTotalPoints(points: number): string {
  return `${points} pts`;
}

/**
 * Format points per game
 * @param ppg - Points per game as decimal
 * @returns Formatted PPG string (e.g., "4.4 ppg")
 */
export function formatPointsPerGame(ppg: number): string {
  return `${ppg.toFixed(1)} ppg`;
}

/**
 * Format minutes played
 * @param minutes - Total minutes
 * @returns Formatted minutes string (e.g., "3,330 mins")
 */
export function formatMinutes(minutes: number): string {
  return `${minutes.toLocaleString()} mins`;
}

/**
 * Format ICT Index (Influence, Creativity, Threat)
 * @param value - ICT value as decimal
 * @returns Formatted ICT string (e.g., "85.5")
 */
export function formatICT(value: number): string {
  return value.toFixed(1);
}

/**
 * Format individual statistic (goals, assists, clean sheets, etc.)
 * @param value - Statistic value (can be undefined)
 * @returns Formatted statistic string or "—" if undefined
 */
export function formatStatistic(value: number | undefined): string {
  return value !== undefined && value !== null ? String(value) : '—';
}

/**
 * Format deadline date/time
 * @param deadline - ISO date string or Date object
 * @returns Formatted deadline string (e.g., "Sat, Dec 15, 15:00")
 */
export function formatDeadline(deadline: string | Date | undefined): string {
  if (!deadline) return '—';

  try {
    const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
    return date.toLocaleString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return typeof deadline === 'string' ? deadline : '—';
  }
}

/**
 * Format team name with abbreviation
 * @param fullName - Full team name
 * @param shortName - Short team name (3 letters)
 * @returns Team display object
 */
export function formatTeam(fullName: string, shortName: string): { full: string; short: string } {
  return { full: fullName, short: shortName };
}

/**
 * Get color based on form score
 * @param form - Form score (0-10)
 * @returns Color hex code
 */
export function getFormColor(form: number): string {
  if (form >= 6) return '#4caf50'; // Green - excellent
  if (form >= 4) return '#fbc02d'; // Amber - good
  if (form >= 2) return '#ff9800'; // Orange - poor
  return '#e53935'; // Red - very poor
}

/**
 * Get color based on availability (ownership)
 * @param ownership - Ownership percentage
 * @returns Color hex code
 */
export function getOwnershipColor(ownership: number): string {
  if (ownership < 5) return '#1976d2'; // Blue - rare
  if (ownership < 20) return '#43a047'; // Green - popular
  if (ownership < 50) return '#fbc02d'; // Amber - very popular
  return '#e53935'; // Red - extremely popular
}

/**
 * Format squad number with position badge
 * @param position - Player position (GK, DEF, MID, FWD)
 * @returns Position badge text
 */
export function formatPositionBadge(position: string): string {
  const positionMap: Record<string, string> = {
    goalkeeper: 'GK',
    defender: 'DEF',
    midfielder: 'MID',
    forward: 'FWD',
  };
  return positionMap[position.toLowerCase()] || position.toUpperCase();
}

/**
 * Generate FPL player image URL
 * @param playerCode - FPL player code
 * @returns Player photo URL
 */
export function getPlayerImageUrl(playerCode?: number): string {
  if (!playerCode) return '/images/placeholder-player.png';
  return `https://resources.premierleague.com/premierleague/photos/players/110x110/p${playerCode}.png`;
}
