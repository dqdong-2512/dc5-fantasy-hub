import { setDefaultResultOrder } from 'node:dns';
import { syncAseanTournament } from './asean/sync';

// Cloudflare publishes both IPv4 and IPv6 addresses for the ASEAN source. Some Windows/network
// combinations resolve IPv6 first even when that route is unavailable, so make the reliable order
// part of the command instead of requiring developers to set NODE_OPTIONS manually.
setDefaultResultOrder('ipv4first');

function parseSeasonArg(argv: string[]): string {
  const seasonArg = argv.find((arg) => arg.startsWith('--season='));
  if (!seasonArg) {
    return '2026-2027';
  }

  const [, value] = seasonArg.split('=');
  return value || '2026-2027';
}

async function main(): Promise<void> {
  const season = parseSeasonArg(process.argv.slice(2));

  try {
    await syncAseanTournament({ season });
  } catch (error) {
    console.error('ASEAN sync failed:', error);
    process.exitCode = 1;
  }
}

void main();
