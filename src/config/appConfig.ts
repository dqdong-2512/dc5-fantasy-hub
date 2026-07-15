/**
 * Application Configuration
 * Centralized configuration for the entire application
 * Single source of truth for season, competition, URLs, and enabled modules
 */

import type { AppConfig } from './types';

export const appConfig: AppConfig = {
  // Active season - Change here to switch to 2026-2027
  activeSeason: '2025-2026',

  // Active competition - Change to switch between FPL and UCL
  activeCompetition: 'fpl',

  // API configuration
  apiBaseUrl: 'https://fantasy.premierleague.com/api',
  assetsBaseUrl: 'https://resources.premierleague.com/premierleague',

  // Data file paths (relative to src directory)
  dataPath: {
    raw: `../../data/seasons/2025-2026/raw`,
    normalized: `../../data/seasons/2025-2026/normalized`,
  },

  // Competition profiles and enabled modules
  competitionProfiles: {
    fpl: {
      id: 'fpl',
      name: 'Fantasy Premier League',
      displayName: 'Fantasy Premier League',
      description: 'Official Fantasy Premier League analytical platform',
      logo: 'https://fantasy.premierleague.com/static/components/site-header/logo-colour.png',
      modules: {
        dashboard: true,
        players: true,
        fixtures: true,
        analytics: true,
      },
    },
    ucl: {
      id: 'ucl',
      name: 'UEFA Champions League',
      displayName: 'UEFA Champions League',
      description: 'UEFA Champions League analytical platform',
      logo: 'https://www.uefa.com/imgml/TP/competitions/Logo_UCL_2x.png',
      modules: {
        dashboard: false,
        players: false,
        fixtures: false,
        analytics: false,
      },
    },
  },
};

/**
 * Get the active competition profile
 */
export function getActiveCompetition() {
  return appConfig.competitionProfiles[appConfig.activeCompetition];
}

/**
 * Get the active season with proper formatting
 * Returns season in YYYY-YYYY format (e.g., 2025-2026)
 */
export function getActiveSeason(): string {
  return appConfig.activeSeason;
}

/**
 * Get the season display format (e.g., 2025/26)
 */
export function getSeasonDisplay(): string {
  const [start, end] = appConfig.activeSeason.split('-');
  return `${start}/${end?.slice(-2)}`;
}

/**
 * Get configured data paths for the active season
 */
export function getDataPaths() {
  return {
    raw: appConfig.dataPath.raw,
    normalized: appConfig.dataPath.normalized,
  };
}

/**
 * Check if a module is enabled for the active competition
 */
export function isModuleEnabled(
  module: keyof typeof appConfig.competitionProfiles.fpl.modules
): boolean {
  return getActiveCompetition().modules[module];
}
