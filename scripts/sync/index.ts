/**
 * Sync Entry Point
 * Orchestrates the entire FPL data synchronization pipeline
 * Executes: Download → Normalize → Generate normalized JSON
 */

import { syncBootstrap } from './bootstrap.sync';
import { normalize } from './normalize.sync';

async function main(): Promise<void> {
  try {
    // Step 1: Download bootstrap data
    await syncBootstrap();

    // Step 2: Normalize data
    await normalize();

    console.log('Completed.');
  } catch (error) {
    console.error('Sync failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
