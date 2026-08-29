import { FplApiClient } from './FplApiClient';
import { FplCache, type CachedFetchResult } from './FplCache';
import { FplGameweekResolver } from './FplGameweekResolver';
import { FplNormalizer } from './FplNormalizer';
import { FplLivePointsCalculator } from './FplLivePointsCalculator';
import type {
  FplBootstrap,
  FplDataStatus,
  FplEntry,
  FplEntryHistory,
  FplEntryPicks,
  FplFixture,
  FplLivePlayer,
  FplLiveSnapshot,
  FplManagerLiveScore,
  InternalApiResponse,
  ResolvedGameweek,
} from './models';
import { stableHash } from './utils';

export class FplLiveService {
  constructor(
    private readonly client: FplApiClient,
    private readonly cache: FplCache,
    private readonly normalizer = new FplNormalizer(),
    private readonly resolver = new FplGameweekResolver(),
    private readonly calculator = new FplLivePointsCalculator()
  ) {}

  async getStatus(): Promise<InternalApiResponse<ResolvedGameweek>> {
    try {
      const current = await this.getCurrentGameweek();
      return current;
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async getBootstrap(): Promise<InternalApiResponse<FplBootstrap>> {
    try {
      return this.resourceResponse(
        await this.cache.getOrFetch('bootstrap', 300, stableHash, async () =>
          this.normalizer.normalizeBootstrap(await this.client.getBootstrap())
        )
      );
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async getFixtures(
    gameweek: number,
    ttlSeconds = 180,
    force = false
  ): Promise<InternalApiResponse<FplFixture[]>> {
    try {
      return this.resourceResponse(
        await this.cache.getOrFetch(
          `fixtures:${gameweek}`,
          ttlSeconds,
          stableHash,
          async () => this.normalizer.normalizeFixtures(await this.client.getFixtures(gameweek)),
          force
        )
      );
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async getCurrentGameweek(): Promise<InternalApiResponse<ResolvedGameweek>> {
    try {
      const bootstrap = await this.getBootstrap();
      if (!bootstrap.data) return this.errorResponse(bootstrap.error ?? 'Bootstrap unavailable');

      const candidate =
        bootstrap.data.gameweeks.find((gameweek) => gameweek.isCurrent) ??
        bootstrap.data.gameweeks.find((gameweek) => !gameweek.finished) ??
        bootstrap.data.gameweeks.at(-1) ??
        null;
      const fixtures = candidate ? await this.getFixtures(candidate.id) : null;
      const resolved = this.resolver.resolve(bootstrap.data.gameweeks, fixtures?.data ?? []);
      return {
        data: resolved,
        dataStatus: this.combineStatus(bootstrap.dataStatus, fixtures?.dataStatus),
        lastUpdated: fixtures?.lastUpdated ?? bootstrap.lastUpdated,
        ...(bootstrap.error || fixtures?.error
          ? { error: bootstrap.error ?? fixtures?.error }
          : {}),
      };
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async getGameweekLive(gameweek: number): Promise<InternalApiResponse<FplLiveSnapshot>> {
    try {
      const [bootstrap, initialFixtures] = await Promise.all([
        this.getBootstrap(),
        this.getFixtures(gameweek),
      ]);
      if (!bootstrap.data || !initialFixtures.data) {
        return this.errorResponse(
          bootstrap.error ?? initialFixtures.error ?? 'Gameweek data unavailable'
        );
      }
      let fixtures = initialFixtures;
      let fixtureData: FplFixture[] = initialFixtures.data;
      let resolved = this.resolver.resolve(
        bootstrap.data.gameweeks,
        fixtureData,
        new Date(),
        gameweek
      );
      const fixtureAgeMs = Date.now() - new Date(fixtures.lastUpdated).getTime();
      if (resolved.phase === 'LIVE' && fixtureAgeMs > 20_000) {
        fixtures = await this.getFixtures(gameweek, 20, true);
        if (!fixtures.data) return this.errorResponse(fixtures.error ?? 'Fixtures unavailable');
        fixtureData = fixtures.data;
        resolved = this.resolver.resolve(
          bootstrap.data.gameweeks,
          fixtureData,
          new Date(),
          gameweek
        );
      }
      const ttlSeconds = resolved.gameweek?.id === gameweek ? resolved.pollIntervalSeconds : 900;
      const previous = await this.cache.get<FplLivePlayer[]>(`event-live:${gameweek}`);
      const live = await this.cache.getOrFetch(
        `event-live:${gameweek}`,
        ttlSeconds,
        stableHash,
        async () => this.normalizer.normalizeLivePlayers(await this.client.getEventLive(gameweek))
      );
      const changedPlayerIds = this.changedPlayerIds(previous?.value ?? [], live.record.value);
      const snapshot: FplLiveSnapshot = {
        gameweek,
        phase: resolved.phase,
        provisional: resolved.phase !== 'FINAL',
        players: live.record.value,
        changedPlayerIds,
        fixtures: fixtureData,
        availability: this.buildAvailability(bootstrap.data, fixtureData, live.record.value),
        hash: live.record.hash,
      };
      return {
        data: snapshot,
        dataStatus: this.combineStatus(live.stale ? 'STALE' : 'LIVE', fixtures.dataStatus),
        lastUpdated: live.record.updatedAt,
        ...(live.error ? { error: live.error } : {}),
      };
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async getEntry(entryId: number): Promise<InternalApiResponse<FplEntry>> {
    return this.fetchNormalized(`entry:${entryId}`, 300, async () =>
      this.normalizer.normalizeEntry(await this.client.getEntry(entryId))
    );
  }

  async getEntryHistory(entryId: number): Promise<InternalApiResponse<FplEntryHistory>> {
    return this.fetchNormalized(`entry-history:${entryId}`, 300, async () =>
      this.normalizer.normalizeEntryHistory(await this.client.getEntryHistory(entryId))
    );
  }

  async getEntryPicks(
    entryId: number,
    gameweek: number
  ): Promise<InternalApiResponse<FplEntryPicks>> {
    return this.fetchNormalized(`entry-picks:${entryId}:${gameweek}`, 900, async () =>
      this.normalizer.normalizeEntryPicks(
        await this.client.getEntryPicks(entryId, gameweek),
        entryId,
        gameweek
      )
    );
  }

  async getEntryLive(
    entryId: number,
    gameweek: number
  ): Promise<InternalApiResponse<FplManagerLiveScore>> {
    try {
      const [picks, live] = await Promise.all([
        this.getEntryPicks(entryId, gameweek),
        this.getGameweekLive(gameweek),
      ]);
      if (!picks.data || !live.data) {
        return this.errorResponse(picks.error ?? live.error ?? 'Entry live data unavailable');
      }
      const score = this.calculator.calculate(picks.data, live.data.players, {
        provisional: live.data.provisional,
        availability: new Map(
          Object.entries(live.data.availability).map(([playerId, availability]) => [
            Number(playerId),
            availability,
          ])
        ),
      });
      return {
        data: score,
        dataStatus: this.combineStatus(picks.dataStatus, live.dataStatus),
        lastUpdated: live.lastUpdated,
        ...(picks.error || live.error ? { error: picks.error ?? live.error } : {}),
      };
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  private async fetchNormalized<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
  ): Promise<InternalApiResponse<T>> {
    try {
      return this.resourceResponse(
        await this.cache.getOrFetch(key, ttlSeconds, stableHash, fetcher)
      );
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  private resourceResponse<T>(result: CachedFetchResult<T>): InternalApiResponse<T> {
    return {
      data: result.record.value,
      dataStatus: result.stale ? 'STALE' : 'LIVE',
      lastUpdated: result.record.updatedAt,
      ...(result.error ? { error: result.error } : {}),
    };
  }

  private errorResponse<T>(error: unknown): InternalApiResponse<T> {
    return {
      data: null,
      dataStatus: 'ERROR',
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }

  private combineStatus(...statuses: Array<FplDataStatus | undefined>): FplDataStatus {
    if (statuses.some((status) => status === 'ERROR')) return 'ERROR';
    if (statuses.some((status) => status === 'STALE')) return 'STALE';
    return 'LIVE';
  }

  private changedPlayerIds(previous: FplLivePlayer[], current: FplLivePlayer[]): number[] {
    const previousHash = new Map(
      previous.map((player) => [
        player.playerId,
        stableHash([player.totalPoints, player.minutes, player.bonus, player.bps]),
      ])
    );
    return current
      .filter(
        (player) =>
          previousHash.get(player.playerId) !==
          stableHash([player.totalPoints, player.minutes, player.bonus, player.bps])
      )
      .map((player) => player.playerId);
  }

  private buildAvailability(
    bootstrap: FplBootstrap,
    fixtures: FplFixture[],
    livePlayers: FplLivePlayer[]
  ): FplLiveSnapshot['availability'] {
    const liveByPlayer = new Map(livePlayers.map((player) => [player.playerId, player]));
    return Object.fromEntries(
      bootstrap.players.map((player) => {
        const playerFixtures = fixtures.filter(
          (fixture) => fixture.homeTeamId === player.teamId || fixture.awayTeamId === player.teamId
        );
        return [
          String(player.id),
          {
            appeared: (liveByPlayer.get(player.id)?.minutes ?? 0) > 0,
            fixtureFinal:
              playerFixtures.length > 0 && playerFixtures.every((fixture) => fixture.finished),
          },
        ];
      })
    );
  }
}
