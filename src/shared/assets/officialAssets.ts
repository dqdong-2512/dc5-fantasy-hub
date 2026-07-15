/**
 * Official Assets Utilities
 * Generates URLs for official FPL player images and team badges
 * Centralizes all asset URL generation to avoid hardcoding
 */

import { appConfig } from '../../config';

/**
 * Get official FPL player image URL
 * @param playerCode - The unique player code from FPL API
 * @returns Full URL to player image or placeholder if code is undefined
 */
export function getPlayerImageUrl(playerCode?: number | string): string {
  if (!playerCode) {
    return `${appConfig.assetsBaseUrl}/players/placeholder.png`;
  }

  // Official FPL player images: /players/{code}.png
  return `${appConfig.assetsBaseUrl}/players/photos/250x250/p${playerCode}.png`;
}

/**
 * Get official FPL team badge URL
 * @param teamCode - The team code (1-20 for FPL)
 * @returns Full URL to team badge
 */
export function getTeamBadgeUrl(teamCode: number | string): string {
  // Official FPL team badges: /badges/t{code}.svg
  return `${appConfig.assetsBaseUrl}/badges/t${teamCode}.svg`;
}

/**
 * Get FPL player headshot URL
 * Alternative smaller version of player image
 * @param playerCode - The unique player code from FPL API
 * @returns Full URL to player headshot
 */
export function getPlayerHeadshotUrl(playerCode?: number | string): string {
  if (!playerCode) {
    return `${appConfig.assetsBaseUrl}/players/placeholder.png`;
  }

  return `${appConfig.assetsBaseUrl}/players/photos/75x75/p${playerCode}.png`;
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
