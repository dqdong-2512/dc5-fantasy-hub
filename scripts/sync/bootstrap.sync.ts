/**
 * Bootstrap Synchronizer
 * Downloads bootstrap-static data from FPL API and saves to raw data folder
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FplClient } from '../../src/shared/services/fpl-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
const dataDir = path.join(projectRoot, 'data', 'seasons', '2025-2026', 'raw');

export async function syncBootstrap(): Promise<void> {
  console.log('Fetching bootstrap...');

  try {
    const client = new FplClient();
    const data = await client.getBootstrap();

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, 'bootstrap-static.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log('Bootstrap downloaded.');
  } catch (error) {
    throw new Error(
      `Failed to sync bootstrap: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
