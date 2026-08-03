/**
 * Bootstrap Synchronizer
 * Downloads bootstrap-static and fixtures data from FPL API and saves to raw data folder
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getFplSeasonPaths } from '../services/competition-data-paths';
import { FplClient } from '../../src/shared/services/fpl-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

export async function syncBootstrap(season: string = '2026-2027'): Promise<void> {
  const { rawDir: dataDir } = getFplSeasonPaths(projectRoot, season);
  console.log(`Fetching bootstrap for ${season}...`);

  try {
    const client = new FplClient();
    const [bootstrapData, fixturesData] = await Promise.all([
      client.getBootstrap(),
      client.getFixtures(),
    ]);

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const bootstrapPath = path.join(dataDir, 'bootstrap-static.json');
    fs.writeFileSync(bootstrapPath, JSON.stringify(bootstrapData, null, 2));
    console.log('Bootstrap downloaded.');

    const fixturesPath = path.join(dataDir, 'fixtures.json');
    fs.writeFileSync(fixturesPath, JSON.stringify(fixturesData, null, 2));
    console.log('Fixtures downloaded.');
  } catch (error) {
    throw new Error(
      `Failed to sync bootstrap: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

const seasonArg = process.argv.slice(2).find((arg) => arg.startsWith('--season='));
const season = seasonArg?.split('=')[1] || process.env.FPL_SEASON || '2026-2027';

syncBootstrap(season).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
