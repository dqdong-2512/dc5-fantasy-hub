import { syncAseanTournament } from './asean/sync';

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
