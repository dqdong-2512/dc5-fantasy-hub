/**
 * Data Loader
 * Season-aware utility for accessing normalized data through Vite's JSON import
 * Automatically resolves configured season from appConfig
 */

// Import normalized JSON files for 2025-2026 season
import teamsData from '../../data/seasons/2025-2026/normalized/teams.json';
import playersData from '../../data/seasons/2025-2026/normalized/players.json';
import gameweeksData from '../../data/seasons/2025-2026/normalized/gameweeks.json';
import elementTypesData from '../../data/seasons/2025-2026/normalized/element-types.json';
import fixturesData from '../../data/seasons/2025-2026/normalized/fixtures.json';

export interface DataFiles {
  teams: unknown;
  players: unknown;
  gameweeks: unknown;
  elementTypes: unknown;
  fixtures: unknown;
}

/**
 * Get data files for the currently configured season
 * React never knows where data is stored - this handles the resolution
 * @returns DataFiles containing all normalized data for the active season
 */
export function getDataFiles(): DataFiles {
  // Currently returns 2025-2026 data
  // To add new seasons:
  // 1. Create new import statements for the season
  // 2. Add conditional logic here based on getActiveSeason()
  // 3. Run sync script for the new season

  return {
    teams: teamsData,
    players: playersData,
    gameweeks: gameweeksData,
    elementTypes: elementTypesData,
    fixtures: fixturesData,
  };
}

/**
 * Get data files for a specific season (used during development/testing)
 * @param season - The season in YYYY-YYYY format
 * @returns DataFiles or null if season is not available
 */
export function getDataFilesBySeason(season: string): DataFiles | null {
  // Add new seasons here as they are synchronized
  if (season === '2025-2026') {
    return {
      teams: teamsData,
      players: playersData,
      gameweeks: gameweeksData,
      elementTypes: elementTypesData,
      fixtures: fixturesData,
    };
  }

  // 2026-2027 season will be added when synchronized
  // Example:
  // if (season === '2026-2027') {
  //   return { ... import from 2026-2027 ... };
  // }

  return null;
}
