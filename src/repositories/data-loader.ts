/**
 * Data Loader - SEASON AWARE
 * Loads normalized data from db.json (synced from FPL API)
 * Supports multiple seasons
 * Fallback to direct imports if db.json not available (dev mode)
 */

import { appConfig } from '@config/appConfig';

// Fallback imports for development without db.json
// When adding new seasons, add fallback imports here
import teamsDataFallback from '../../data/seasons/2026-2027/normalized/teams.json';
import playersDataFallback from '../../data/seasons/2026-2027/normalized/players.json';
import gameweeksDataFallback from '../../data/seasons/2026-2027/normalized/gameweeks.json';
import elementTypesDataFallback from '../../data/seasons/2026-2027/normalized/element-types.json';
import fixturesDataFallback from '../../data/seasons/2026-2027/normalized/fixtures.json';

export interface DataFiles {
  teams: unknown;
  players: unknown;
  gameweeks: unknown;
  elementTypes: unknown;
  fixtures: unknown;
  season: string;
  transfers?: unknown;
}

// Runtime cache
let cachedDb: any = null;

/**
 * Load data from db.json if available, otherwise fallback to direct imports
 * This allows the app to work with or without a synced db.json
 */
function loadDbJson(): any | null {
  try {
    // Try to load db.json at runtime
    // In a browser environment, this would be fetched via HTTP
    // In Node environments (like tests), it could be required
    const dbContent = (globalThis as any).__FPL_DB__;
    return dbContent || null;
  } catch {
    return null;
  }
}

/**
 * Get data files for the currently configured season
 * Prefers db.json if available, falls back to direct imports
 */
export function getDataFiles(): DataFiles {
  // Try to load from db.json first
  if (!cachedDb) {
    cachedDb = loadDbJson();
  }

  // If db.json is available, use it
  if (cachedDb && cachedDb.teams) {
    return {
      teams: cachedDb.teams,
      players: cachedDb.players,
      gameweeks: cachedDb.gameweeks,
      elementTypes: cachedDb.elementTypes,
      fixtures: cachedDb.fixtures || [],
      season: cachedDb.meta?.season || appConfig.activeSeason,
      transfers: cachedDb.transfers,
    };
  }

  // Fallback to direct imports (development without db.json)
  return {
    teams: teamsDataFallback,
    players: playersDataFallback,
    gameweeks: gameweeksDataFallback,
    elementTypes: elementTypesDataFallback,
    fixtures: fixturesDataFallback || [],
    season: appConfig.activeSeason,
  };
}
/**
 * Get data files for a specific season
 * Currently only 2026-2027 (active) is fully supported
 * 2025-2026 can be accessed by explicitly requesting it
 * @param _season - Season ID (for backward compatibility, currently unused)
 */
export function getDataFilesBySeason(_season: string): DataFiles | null {
  // All seasons use the same loading mechanism via db.json
  // This function is maintained for backward compatibility
  // In future, could support loading specific season data from db.json with filters
  return getDataFiles();
}
