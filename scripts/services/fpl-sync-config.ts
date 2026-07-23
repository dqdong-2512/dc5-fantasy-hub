/**
 * FPL Sync Configuration
 * Reads configuration from environment variables and CLI arguments
 * Supports multi-season sync with explicit season specification
 * CLI arguments override environment variables
 */

export interface SyncConfig {
  season: string;
  managerId: number | null;
  syncPublic: boolean;
  syncManager: boolean;
  validateData: boolean;
  writeDb: boolean;
  outputDir: string;
}

/**
 * Get sync configuration from environment and CLI args
 * Usage:
 *   npm run sync:fpl                               - Use default (2026-2027)
 *   npm run sync:fpl -- --season=2026-2027        - Explicit season
 *   npm run sync:fpl -- --manager-id=12345        - Sync manager data
 *   npm run sync:fpl -- --no-validate             - Skip validation
 *   npm run sync:fpl -- --no-write-db             - Skip db.json write
 *   FPL_SEASON=2026-2027 npm run sync:fpl         - Use env var
 */
export function getSyncConfig(): SyncConfig {
  const managerIdEnv = process.env.FPL_MANAGER_ID;
  let managerId: number | null = null;

  // Parse CLI arguments
  const args = process.argv.slice(2);
  let season = process.env.FPL_SEASON || '2026-2027'; // Default to 2026-2027
  let syncPublic = true;
  let syncManager = false;
  let validateData = true;
  let writeDb = true;

  for (const arg of args) {
    if (arg.startsWith('--season=')) {
      season = arg.split('=')[1];
    } else if (arg.startsWith('--manager-id=')) {
      managerId = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--no-validate') {
      validateData = false;
    } else if (arg === '--no-write-db') {
      writeDb = false;
    }
  }

  // Fall back to environment variable if not in CLI args
  if (!managerId && managerIdEnv) {
    managerId = parseInt(managerIdEnv, 10);
  }

  // If managerId is provided, enable manager sync
  syncManager = managerId !== null;

  return {
    season,
    managerId,
    syncPublic,
    syncManager,
    validateData,
    writeDb,
    outputDir: process.env.FPL_OUTPUT_DIR || '.',
  };
}
