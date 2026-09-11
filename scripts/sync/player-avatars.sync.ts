import path from 'path';
import { fileURLToPath } from 'url';
import { appConfig } from '../../src/config/appConfig';
import { syncPlayerAvatars } from '../services/player-avatar-cache';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const season =
  args.find((argument) => argument.startsWith('--season='))?.split('=')[1] ??
  process.env.FPL_SEASON ??
  appConfig.activeSeason;
const force = args.includes('--force');
const strict = args.includes('--strict');

if (args.includes('--help')) {
  console.log(`Usage: npm run sync:avatars -- [options]

Options:
  --season=YYYY-YYYY  Select the FPL season snapshot
  --force             Re-download all portraits, including valid cache entries
  --strict            Fail when any official portrait is still unavailable
  --help              Show this help`);
  process.exit(0);
}

console.log('FPL Player Avatar Sync');
console.log(`Season: ${season}`);
console.log(`Mode: ${force ? 'force refresh' : 'download missing/corrupt only'}`);

try {
  const result = await syncPlayerAvatars({ projectRoot, season, force });
  console.log(`Scanned: ${result.scanned}`);
  console.log(`Cache hits: ${result.cacheHits}`);
  console.log(`Downloaded: ${result.downloaded}`);
  console.log(`Available: ${result.available}`);
  console.log(`Still missing from official CDN: ${result.missing}`);
  console.log(`Manifest: ${result.manifestPath}`);
  if (strict && result.missing > 0) process.exitCode = 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
