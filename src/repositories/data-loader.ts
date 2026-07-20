/**
 * Data Loader
 * Loads normalized data from db.json (synced from FPL API)
 * Fallback to direct imports if db.json not available (dev mode)
 */

// Fallback imports for development without db.json
import teamsDataFallback from '../../data/seasons/2025-2026/normalized/teams.json';
import playersDataFallback from '../../data/seasons/2025-2026/normalized/players.json';
import gameweeksDataFallback from '../../data/seasons/2025-2026/normalized/gameweeks.json';
import elementTypesDataFallback from '../../data/seasons/2025-2026/normalized/element-types.json';
import fixturesDataFallback from '../../data/seasons/2025-2026/normalized/fixtures.json';

export interface DataFiles {
  teams: unknown;
  players: unknown;
  gameweeks: unknown;
  elementTypes: unknown;
  fixtures: unknown;
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
    };
  }

  // Fallback to direct imports (development without db.json)
  return {
    teams: teamsDataFallback,
    players: playersDataFallback,
    gameweeks: gameweeksDataFallback,
    elementTypes: elementTypesDataFallback,
    fixtures: fixturesDataFallback || [],
  };
}

/**
 * Get data files for a specific season
 * Currently only 2025-2026 is available
 */
export function getDataFilesBySeason(season: string): DataFiles | null {
  // In future, would support multiple seasons
  if (season === '2025-2026') {
    return getDataFiles();
  }

  // 2026-2027 and later seasons not yet available
  return null;
}
