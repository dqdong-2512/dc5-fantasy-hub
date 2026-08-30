/**
 * Official Assets Utilities
 * Generates URLs for official FPL player images and team badges
 * Centralizes all asset URL generation to avoid hardcoding
 */

import { appConfig } from '../../config';

function getPublicBaseUrl(): string {
  return import.meta.env?.BASE_URL ?? '/';
}

export function resolvePlayerPhotoIdentifier(photoOrCode?: number | string | null): string | null {
  if (typeof photoOrCode === 'number') {
    return Number.isFinite(photoOrCode) && photoOrCode > 0 ? String(photoOrCode) : null;
  }
  if (typeof photoOrCode !== 'string') return null;
  const match = photoOrCode.trim().match(/^(?:p)?(\d+)(?:\.(?:png|jpe?g|webp))?$/i);
  return match?.[1] ?? null;
}

/**
 * Get official FPL player image URL
 * @param playerCode - The unique player code from FPL API
 * @returns Full URL to player image or placeholder if code is undefined
 */
export function getPlayerImageUrl(playerCode?: number | string | null): string {
  const identifier = resolvePlayerPhotoIdentifier(playerCode);
  if (!identifier) {
    return `${getPublicBaseUrl()}player-photo-placeholder.svg`;
  }

  // sync:fpl stores successful official downloads in the active season public assets folder.
  return `${getPublicBaseUrl()}player-photos/${identifier}.png`;
}

/**
 * Get official FPL team badge URL
 * @param teamCode - The team code (1-20 for FPL)
 * @returns Full URL to team badge
 */
export function getTeamBadgeUrl(teamCode?: number | string | null): string {
  const identifier = resolvePlayerPhotoIdentifier(teamCode);
  if (!identifier) return '';
  // Official FPL team badges: /badges/t{code}.svg
  return `${appConfig.assetsBaseUrl}/badges/t${identifier}.svg`;
}

/**
 * Get FPL player headshot URL
 * Alternative smaller version of player image
 * @param playerCode - The unique player code from FPL API
 * @returns Full URL to player headshot
 */
export function getPlayerHeadshotUrl(playerCode?: number | string | null): string {
  return getPlayerImageUrl(playerCode);
}

/**
 * Get FPL stadium image URL
 * @param teamCode - The team code
 * @returns Full URL to stadium image
 */
export function getStadiumImageUrl(teamCode: number | string): string {
  return `${appConfig.assetsBaseUrl}/stadiums/s${teamCode}.png`;
}

/**
 * Preload player image for better performance
 * @param playerCode - The unique player code
 */
export function preloadPlayerImage(playerCode?: number | string): void {
  if (typeof window !== 'undefined') {
    const img = new Image();
    img.src = getPlayerImageUrl(playerCode);
  }
}

/**
 * Preload team badge for better performance
 * @param teamCode - The team code
 */
export function preloadTeamBadge(teamCode: number | string): void {
  if (typeof window !== 'undefined') {
    const img = new Image();
    img.src = getTeamBadgeUrl(teamCode);
  }
}
