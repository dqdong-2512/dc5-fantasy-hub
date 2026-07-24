import { getDataFiles } from '@repositories/data-loader';
import { ASEAN_CUP_2026_RAW_DATA } from '../data/asean-cup-2026.raw';
import type { TournamentRawDataset } from '../models/tournament.models';
import asean2025_2026Dataset from '../../../../data/seasons/2025-2026/normalized/asean-cup-2026.json';
import asean2026_2027Dataset from '../../../../data/seasons/2026-2027/normalized/asean-cup-2026.json';

interface CachedTournamentPayload {
  data: TournamentRawDataset;
  syncedAt: string;
  updatedAt: number;
}

const SEASON_ASEAN_DATASETS: Record<string, TournamentRawDataset> = {
  '2025-2026': asean2025_2026Dataset as TournamentRawDataset,
  '2026-2027': asean2026_2027Dataset as TournamentRawDataset,
};

function isValidTournamentDataset(value: unknown): value is TournamentRawDataset {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.meta === 'object' &&
    Array.isArray(record.teams) &&
    Array.isArray(record.groups) &&
    Array.isArray(record.fixtures) &&
    Array.isArray(record.players) &&
    typeof record.knockout === 'object' &&
    Array.isArray(record.statistics)
  );
}

export class TournamentRepository {
  private cache: CachedTournamentPayload | null = null;
  private inFlight: Promise<CachedTournamentPayload> | null = null;

  public async getSnapshot(forceRefresh = false): Promise<CachedTournamentPayload> {
    const ttlMs = 30000;
    const now = Date.now();

    if (!forceRefresh && this.cache && now - this.cache.updatedAt < ttlMs) {
      return this.cache;
    }

    if (this.inFlight) {
      return this.inFlight;
    }

    this.inFlight = this.loadSnapshot();

    try {
      const payload = await this.inFlight;
      this.cache = payload;
      return payload;
    } finally {
      this.inFlight = null;
    }
  }

  public invalidate(): void {
    this.cache = null;
  }

  private async loadSnapshot(): Promise<CachedTournamentPayload> {
    const dataFiles = getDataFiles();
    const datasetFromSeason =
      SEASON_ASEAN_DATASETS[dataFiles.season] ??
      SEASON_ASEAN_DATASETS['2026-2027'] ??
      ASEAN_CUP_2026_RAW_DATA;
    const runtimeDb = (globalThis as { __FPL_DB__?: { aseanCup2026?: unknown } }).__FPL_DB__;
    const runtimeDataset = runtimeDb?.aseanCup2026;
    const selectedDataset = isValidTournamentDataset(runtimeDataset)
      ? runtimeDataset
      : datasetFromSeason;

    const syncedAtRaw = dataFiles.meta?.syncedAt;
    const syncedAt =
      typeof syncedAtRaw === 'string' && syncedAtRaw.length > 0
        ? syncedAtRaw
        : selectedDataset.meta.updatedAt;

    return Promise.resolve({
      data: selectedDataset,
      syncedAt,
      updatedAt: Date.now(),
    });
  }
}
