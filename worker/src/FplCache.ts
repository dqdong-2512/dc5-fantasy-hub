export interface KvLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface CacheRecord<T> {
  value: T;
  hash: string;
  updatedAt: string;
  expiresAt: number;
}

export interface CachedFetchResult<T> {
  record: CacheRecord<T>;
  stale: boolean;
  error?: string;
}

export class FplCache {
  private readonly memory = new Map<string, CacheRecord<unknown>>();

  constructor(private readonly kv?: KvLike) {}

  async get<T>(key: string): Promise<CacheRecord<T> | null> {
    const memoryRecord = this.memory.get(key) as CacheRecord<T> | undefined;
    if (memoryRecord) return memoryRecord;

    if (this.kv) {
      const serialized = await this.kv.get(`fpl:${key}`);
      if (serialized) {
        const record = JSON.parse(serialized) as CacheRecord<T>;
        this.memory.set(key, record);
        return record;
      }
    }

    const cloudflareCache = this.getCloudflareCache();
    if (cloudflareCache) {
      const response = await cloudflareCache.match(this.cacheRequest(key));
      if (response) {
        const record = (await response.json()) as CacheRecord<T>;
        this.memory.set(key, record);
        return record;
      }
    }

    return null;
  }

  async put<T>(key: string, value: T, hash: string, ttlSeconds: number): Promise<CacheRecord<T>> {
    const now = Date.now();
    const record: CacheRecord<T> = {
      value,
      hash,
      updatedAt: new Date(now).toISOString(),
      expiresAt: now + ttlSeconds * 1000,
    };
    this.memory.set(key, record);

    const serialized = JSON.stringify(record);
    if (this.kv) {
      await this.kv.put(`fpl:${key}`, serialized, {
        expirationTtl: Math.max(ttlSeconds * 12, 86_400),
      });
    }

    const cloudflareCache = this.getCloudflareCache();
    if (cloudflareCache) {
      await cloudflareCache.put(
        this.cacheRequest(key),
        new Response(serialized, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${Math.max(ttlSeconds * 12, 86400)}`,
          },
        })
      );
    }
    return record;
  }

  async getOrFetch<T>(
    key: string,
    ttlSeconds: number,
    hashValue: (value: T) => string,
    fetcher: () => Promise<T>,
    force = false
  ): Promise<CachedFetchResult<T>> {
    const previous = await this.get<T>(key);
    if (!force && previous && previous.expiresAt > Date.now()) {
      return { record: previous, stale: false };
    }

    try {
      const value = await fetcher();
      const record = await this.put(key, value, hashValue(value), ttlSeconds);
      return { record, stale: false };
    } catch (error) {
      if (previous) {
        return {
          record: previous,
          stale: true,
          error: error instanceof Error ? error.message : String(error),
        };
      }
      throw error;
    }
  }

  private cacheRequest(key: string): Request {
    return new Request(`https://dc5-fpl-cache.internal/${encodeURIComponent(key)}`);
  }

  private getCloudflareCache(): Cache | null {
    const cacheStorage = globalThis.caches as CacheStorage & { default?: Cache };
    return cacheStorage?.default ?? null;
  }
}
