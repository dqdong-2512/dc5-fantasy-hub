import { getDataFiles } from '@repositories/data-loader';
import { ASEAN_CUP_2026_RAW_DATA } from '../data/asean-cup-2026.raw';
import type { TournamentRawDataset } from '../models/tournament.models';

interface CachedTournamentPayload {
  data: TournamentRawDataset;
  syncedAt: string;
  updatedAt: number;
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

    const syncedAtRaw = dataFiles.meta?.syncedAt;
    const syncedAt =
      typeof syncedAtRaw === 'string' && syncedAtRaw.length > 0
        ? syncedAtRaw
        : ASEAN_CUP_2026_RAW_DATA.meta.updatedAt;

    return Promise.resolve({
      data: ASEAN_CUP_2026_RAW_DATA,
      syncedAt,
      updatedAt: Date.now(),
    });
  }
}
