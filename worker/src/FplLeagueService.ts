import { FplApiClient } from './FplApiClient';
import { FplCache } from './FplCache';
import { FplLivePointsCalculator } from './FplLivePointsCalculator';
import { FplLiveService } from './FplLiveService';
import { FplNormalizer } from './FplNormalizer';
import type {
  FplDataStatus,
  FplEntryPicks,
  FplLeagueMember,
  FplLeaguePage,
  FplLiveLeague,
  FplLiveLeagueMember,
  FplManagerLiveScore,
  InternalApiResponse,
} from './models';
import { stableHash } from './utils';

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  worker: (value: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(values[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

export class FplLeagueService {
  constructor(
    private readonly client: FplApiClient,
    private readonly cache: FplCache,
    private readonly liveService: FplLiveService,
    private readonly normalizer = new FplNormalizer(),
    private readonly calculator = new FplLivePointsCalculator()
  ) {}

  async getLeaguePage(leagueId: number, page = 1): Promise<InternalApiResponse<FplLeaguePage>> {
    try {
      const cached = await this.cache.getOrFetch(
        `league:${leagueId}:page:${page}`,
        120,
        stableHash,
        async () =>
          this.normalizer.normalizeLeaguePage(
            await this.client.getLeagueStandings(leagueId, page),
            leagueId
          )
      );
      return {
        data: cached.record.value,
        dataStatus: cached.stale ? 'STALE' : 'LIVE',
        lastUpdated: cached.record.updatedAt,
        ...(cached.error ? { error: cached.error } : {}),
      };
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async getLiveLeague(
    leagueId: number,
    gameweek: number
  ): Promise<InternalApiResponse<FplLiveLeague>> {
    try {
      const pages = await this.getAllLeaguePages(leagueId);
      if (pages.length === 0) return this.errorResponse('League standings unavailable');
      const members = this.uniqueMembers(pages.flatMap((page) => page.members));
      const entryIds = members.map((member) => member.entryId);

      const picksResponses = await mapWithConcurrency(entryIds, 8, (entryId) =>
        this.liveService.getEntryPicks(entryId, gameweek)
      );
      const picks = picksResponses
        .map((response) => response.data)
        .filter((value): value is FplEntryPicks => value !== null);
      const ownership = this.calculator.buildOwnershipIndex(picks);
      const live = await this.liveService.getGameweekLive(gameweek);
      if (!live.data) return this.errorResponse(live.error ?? 'Live gameweek unavailable');

      const previousScores =
        (
          await this.cache.get<Record<string, FplManagerLiveScore>>(
            `league:${leagueId}:scores:${gameweek}`
          )
        )?.value ?? {};
      const previousPickHashes =
        (await this.cache.get<Record<string, string>>(`league:${leagueId}:pick-hashes:${gameweek}`))
          ?.value ?? {};
      const currentPickHashes = Object.fromEntries(
        picks.map((entryPicks) => [String(entryPicks.entryId), stableHash(entryPicks)])
      );
      const affectedEntries = this.affectedEntries(live.data.changedPlayerIds, ownership);
      const scores: Record<string, FplManagerLiveScore> = { ...previousScores };
      const availability = new Map(
        Object.entries(live.data.availability).map(([playerId, state]) => [Number(playerId), state])
      );

      for (const entryPicks of picks) {
        if (
          !scores[entryPicks.entryId] ||
          affectedEntries.has(entryPicks.entryId) ||
          previousPickHashes[entryPicks.entryId] !== currentPickHashes[entryPicks.entryId]
        ) {
          scores[entryPicks.entryId] = this.calculator.calculate(entryPicks, live.data.players, {
            provisional: live.data.provisional,
            availability,
          });
        }
      }
      await this.cache.put(
        `league:${leagueId}:scores:${gameweek}`,
        scores,
        stableHash(scores),
        live.data.provisional ? 86_400 : 604_800
      );
      await this.cache.put(
        `league:${leagueId}:pick-hashes:${gameweek}`,
        currentPickHashes,
        stableHash(currentPickHashes),
        604_800
      );

      const calculated: FplLiveLeagueMember[] = members.map((member) => {
        const score = scores[member.entryId];
        return {
          ...member,
          liveGameweekPoints: score?.livePoints ?? member.gameweekPoints,
          liveTotalPoints:
            member.totalPoints -
            member.gameweekPoints +
            (score?.livePoints ?? member.gameweekPoints),
          liveRank: 0,
          rankMovement: null,
          provisional: live.data!.provisional,
        };
      });
      calculated.sort(
        (a, b) => b.liveTotalPoints - a.liveTotalPoints || (a.rank ?? 9999) - (b.rank ?? 9999)
      );
      calculated.forEach((member, index) => {
        member.liveRank = index + 1;
        member.rankMovement = member.rank === null ? null : member.rank - member.liveRank;
      });

      const data: FplLiveLeague = {
        leagueId,
        leagueName: pages[0].leagueName,
        gameweek,
        entryIds,
        ownershipIndex: Object.fromEntries(
          [...ownership].map(([playerId, owners]) => [String(playerId), [...owners]])
        ),
        changedPlayerIds: live.data.changedPlayerIds,
        members: calculated,
        provisional: live.data.provisional,
      };
      const status = this.combineStatus([
        live.dataStatus,
        ...picksResponses.map((response) => response.dataStatus),
      ]);
      return {
        data,
        dataStatus: status,
        lastUpdated: live.lastUpdated,
        ...(picksResponses.some((response) => response.error)
          ? {
              error:
                'One or more manager picks were unavailable; previous valid scores were preserved.',
            }
          : {}),
      };
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  private async getAllLeaguePages(leagueId: number): Promise<FplLeaguePage[]> {
    const pages: FplLeaguePage[] = [];
    for (let pageNumber = 1; pageNumber <= 100; pageNumber += 1) {
      const response = await this.getLeaguePage(leagueId, pageNumber);
      if (!response.data) break;
      pages.push(response.data);
      if (!response.data.hasNext) break;
    }
    return pages;
  }

  private uniqueMembers(members: FplLeagueMember[]): FplLeagueMember[] {
    return [...new Map(members.map((member) => [member.entryId, member])).values()];
  }

  private affectedEntries(
    changedPlayerIds: number[],
    ownership: ReadonlyMap<number, Set<number>>
  ): Set<number> {
    const affected = new Set<number>();
    for (const playerId of changedPlayerIds) {
      for (const entryId of ownership.get(playerId) ?? []) affected.add(entryId);
    }
    return affected;
  }

  private combineStatus(statuses: FplDataStatus[]): FplDataStatus {
    if (statuses.some((status) => status === 'ERROR')) return 'ERROR';
    if (statuses.some((status) => status === 'STALE')) return 'STALE';
    return 'LIVE';
  }

  private errorResponse<T>(error: unknown): InternalApiResponse<T> {
    return {
      data: null,
      dataStatus: 'ERROR',
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
