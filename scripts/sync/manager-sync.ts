import type {
  EntryData,
  EntryHistory,
  EntryPicksData,
} from '../../src/shared/services/fpl-client';
import { FplClient } from '../../src/shared/services/fpl-client';

export interface ManagerSyncResult {
  manager: EntryData;
  history: EntryHistory;
  picks: Record<number, EntryPicksData>;
  leagues: NonNullable<EntryData['leagues']>['classic'];
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function fetchWithRetry<T>(label: string, operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < 4) await wait(750 * 2 ** (attempt - 1));
    }
  }

  throw new Error(
    `${label} failed after 4 attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    { cause: lastError }
  );
}

export async function syncManagerData(managerId: number): Promise<ManagerSyncResult> {
  const client = new FplClient();
  const [manager, history] = await Promise.all([
    fetchWithRetry(`entry/${managerId}`, () => client.getEntry(managerId)),
    fetchWithRetry(`entry/${managerId}/history`, () => client.getEntryHistory(managerId)),
  ]);

  // Public picks are available for gameweeks represented in entry history (normally after their
  // deadline). Pre-deadline private picks require an authenticated session and are intentionally
  // not fabricated by the sync pipeline.
  const picksEntries = await Promise.all(
    history.current.map(async ({ event }) => [
      event,
      await fetchWithRetry(`entry/${managerId}/event/${event}/picks`, () =>
        client.getEntryPicks(managerId, event)
      ),
    ] as const)
  );

  return {
    manager,
    history,
    picks: Object.fromEntries(picksEntries),
    leagues: manager.leagues?.classic ?? [],
  };
}
