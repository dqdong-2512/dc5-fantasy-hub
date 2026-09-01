import { FplApiClient } from '../../worker/src/FplApiClient';
import { FplCache } from '../../worker/src/FplCache';
import { FplGameweekResolver } from '../../worker/src/FplGameweekResolver';
import { FplLivePointsCalculator } from '../../worker/src/FplLivePointsCalculator';
import {
  FPL_FREE_TIER_LEAGUE_BATCH_SIZE,
  FplLeagueService,
} from '../../worker/src/FplLeagueService';
import { FplLiveService } from '../../worker/src/FplLiveService';
import { FplNormalizer } from '../../worker/src/FplNormalizer';
import type { FplEntryPicks, FplLivePlayer } from '../../worker/src/models';
import { stableHash } from '../../worker/src/utils';
import {
  getPlayerImageUrl,
  getTeamBadgeUrl,
  resolvePlayerPhotoIdentifier,
} from '../../src/shared/assets/officialAssets';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function livePlayer(playerId: number, totalPoints: number, minutes = 90): FplLivePlayer {
  return {
    playerId,
    totalPoints,
    minutes,
    bonus: 0,
    bps: 0,
    goalsScored: 0,
    assists: 0,
    cleanSheets: 0,
    goalsConceded: 0,
    ownGoals: 0,
    penaltiesSaved: 0,
    penaltiesMissed: 0,
    yellowCards: 0,
    redCards: 0,
    saves: 0,
  };
}

function picks(overrides: Partial<FplEntryPicks> = {}): FplEntryPicks {
  return {
    entryId: 10,
    gameweek: 2,
    activeChip: null,
    transferCost: 4,
    bank: null,
    teamValue: null,
    automaticSubstitutions: [],
    picks: [
      { playerId: 1, position: 1, multiplier: 2, isCaptain: true, isViceCaptain: false },
      { playerId: 2, position: 2, multiplier: 1, isCaptain: false, isViceCaptain: true },
      { playerId: 3, position: 12, multiplier: 0, isCaptain: false, isViceCaptain: false },
    ],
    ...overrides,
  };
}

function runLivePointsTests(): void {
  const calculator = new FplLivePointsCalculator();
  const players = [livePlayer(1, 5), livePlayer(2, 3), livePlayer(3, 4)];
  const normal = calculator.calculate(picks(), players, { provisional: true });
  assert(normal.grossPoints === 13, 'Captain x2 and normal multiplier must be applied');
  assert(normal.livePoints === 9, 'Transfer hit must be deducted once');
  assert(normal.benchPoints === 4, 'Bench points must be reported separately');
  assert(normal.provisional, 'Live score must remain provisional');

  const triple = calculator.calculate(
    picks({
      activeChip: '3xc',
      transferCost: 0,
      picks: [{ playerId: 1, position: 1, multiplier: 3, isCaptain: true, isViceCaptain: false }],
    }),
    players,
    { provisional: true }
  );
  assert(triple.livePoints === 15, 'Triple captain multiplier must be respected');

  const benchBoost = calculator.calculate(
    picks({ activeChip: 'bboost', transferCost: 0 }),
    players,
    {
      provisional: true,
    }
  );
  assert(benchBoost.livePoints === 17, 'Bench boost must activate bench multipliers');

  const viceFallback = calculator.calculate(
    picks({ transferCost: 0 }),
    [livePlayer(1, 0, 0), livePlayer(2, 3), livePlayer(3, 4)],
    {
      provisional: true,
      availability: new Map([
        [1, { appeared: false, fixtureFinal: true }],
        [2, { appeared: true, fixtureFinal: true }],
      ]),
    }
  );
  assert(viceFallback.livePoints === 6, 'Vice captain must inherit captain multiplier');
}

function runNullableAndPreseasonTests(): void {
  const normalizer = new FplNormalizer();
  const bootstrap = normalizer.normalizeBootstrap({
    events: [{ id: 1, name: null, deadline_time: null, finished: null }],
    elements: [null],
    teams: null,
    element_types: null,
    total_players: null,
  });
  assert(bootstrap.gameweeks[0].deadlineTime === null, 'Nullable deadline must remain null');
  assert(bootstrap.players[0].id === 0, 'Malformed nullable player must normalize safely');

  const entry = normalizer.normalizeEntry({ id: 10, summary_overall_rank: null });
  assert(entry.overallRank === null, 'Null manager rank must remain null');
  const normalizedPicks = normalizer.normalizeEntryPicks(
    { entry_history: { bank: null, value: null }, picks: [] },
    10,
    1
  );
  assert(normalizedPicks.teamValue === null, 'Null team value must remain null');

  const future = new Date(Date.now() + 86_400_000).toISOString();
  const preseason = new FplGameweekResolver().resolve(
    [
      {
        id: 1,
        name: 'Gameweek 1',
        deadlineTime: future,
        averageEntryScore: null,
        highestScore: null,
        finished: false,
        dataChecked: false,
        isCurrent: false,
        isNext: true,
        isPrevious: false,
      },
    ],
    []
  );
  assert(preseason.phase === 'PRESEASON', 'Future GW1 with no completed GW must be preseason');

  const locked = new FplGameweekResolver().resolve(
    [{ ...preseason.gameweek!, deadlineTime: new Date(Date.now() - 60_000).toISOString() }],
    []
  );
  assert(
    locked.phase === 'LOCKED',
    'Post-deadline gameweek with no started fixture must be locked'
  );

  const live = new FplGameweekResolver().resolve(
    [{ ...preseason.gameweek!, deadlineTime: new Date(Date.now() - 60_000).toISOString() }],
    [
      {
        id: 1,
        gameweek: 1,
        homeTeamId: 1,
        awayTeamId: 2,
        homeScore: 0,
        awayScore: 0,
        kickoffTime: null,
        started: true,
        finished: false,
        finishedProvisional: false,
        minutes: null,
      },
    ]
  );
  assert(live.phase === 'LIVE', 'Started unfinished fixture must resolve to live gameweek');

  const final = new FplGameweekResolver().resolve(
    [{ ...preseason.gameweek!, finished: true, dataChecked: true }],
    []
  );
  assert(final.phase === 'FINAL', 'Checked completed gameweek must resolve to final');
}

function runAssetFallbackTests(): void {
  assert(
    resolvePlayerPhotoIdentifier('223094.jpg') === '223094',
    'FPL photo filename must resolve to its player code'
  );
  assert(
    resolvePlayerPhotoIdentifier('not-a-photo') === null,
    'Malformed player photo must be rejected'
  );
  assert(
    getPlayerImageUrl(undefined).includes('player-photo-placeholder.svg'),
    'Missing player image must resolve to the fallback asset'
  );
  assert(getTeamBadgeUrl(null) === '', 'Missing club logo must allow the component fallback');
}

async function runUpstreamFallbackTests(): Promise<void> {
  const cache = new FplCache();
  await cache.put('bootstrap-test', { valid: true }, stableHash({ valid: true }), 0);

  const unavailableClient = new FplApiClient({
    maxAttempts: 1,
    fetcher: async () => new Response('unavailable', { status: 503 }),
    logger: { warn: () => undefined, error: () => undefined },
  });
  const stale = await cache.getOrFetch(
    'bootstrap-test',
    30,
    stableHash,
    async () => (await unavailableClient.getBootstrap()) as { valid: boolean },
    true
  );
  assert(stale.stale && stale.record.value.valid, '503 must preserve previous valid snapshot');

  const timeoutClient = new FplApiClient({
    maxAttempts: 1,
    timeoutMs: 5,
    fetcher: (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        );
      }),
    logger: { warn: () => undefined, error: () => undefined },
  });
  const timeoutFallback = await cache.getOrFetch(
    'bootstrap-test',
    30,
    stableHash,
    async () => (await timeoutClient.getBootstrap()) as { valid: boolean },
    true
  );
  assert(
    timeoutFallback.stale && timeoutFallback.record.value.valid,
    'Request timeout must preserve the previous valid snapshot'
  );
}

async function runFreeTierLeagueBatchTests(): Promise<void> {
  const leagueMembers = Array.from({ length: 10 }, (_, index) => ({
    entry: index + 1,
    player_name: `Manager ${index + 1}`,
    entry_name: `Team ${index + 1}`,
    rank: index + 1,
    last_rank: index + 1,
    event_total: 0,
    total: 100 - index,
  }));
  const requestedPicks: number[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    if (url.pathname.endsWith('/bootstrap-static/')) {
      return Response.json({
        events: [
          {
            id: 2,
            name: 'Gameweek 2',
            finished: true,
            data_checked: true,
            is_current: true,
          },
        ],
        elements: [],
        teams: [],
        element_types: [],
      });
    }
    if (url.pathname.endsWith('/fixtures/')) return Response.json([]);
    if (url.pathname.endsWith('/event/2/live/')) {
      return Response.json({ elements: [{ id: 1, stats: { total_points: 5, minutes: 90 } }] });
    }
    if (url.pathname.includes('/leagues-classic/')) {
      return Response.json({
        league: { id: 99, name: 'Free Tier League' },
        standings: { page: 1, has_next: false, results: leagueMembers },
      });
    }
    const picksMatch = url.pathname.match(/\/entry\/(\d+)\/event\/2\/picks\//);
    if (picksMatch) {
      requestedPicks.push(Number(picksMatch[1]));
      return Response.json({
        active_chip: null,
        entry_history: { event_transfers_cost: 0 },
        automatic_subs: [],
        picks: [
          {
            element: 1,
            position: 1,
            multiplier: 1,
            is_captain: false,
            is_vice_captain: false,
          },
        ],
      });
    }
    return new Response('not found', { status: 404 });
  };

  const client = new FplApiClient({
    maxAttempts: 1,
    fetcher,
    logger: { warn: () => undefined, error: () => undefined },
  });
  const cache = new FplCache();
  const live = new FplLiveService(client, cache);
  const league = new FplLeagueService(client, cache, live);

  const first = await league.getLiveLeague(99, 2);
  assert(first.data !== null, 'First live league batch must return data');
  assert(
    first.data.members.length === FPL_FREE_TIER_LEAGUE_BATCH_SIZE,
    'A live league invocation must cap manager picks to the free-tier batch size'
  );
  assert(first.data.pagination.nextCursor === '1:7', 'First batch must expose its next cursor');
  assert(requestedPicks.length === 7, 'First batch must fetch picks for seven managers only');

  const second = await league.getLiveLeague(99, 2, { page: 1, offset: 7 });
  assert(second.data !== null, 'Second live league batch must return data');
  assert(second.data.members.length === 3, 'Second batch must contain remaining managers');
  assert(second.data.pagination.complete, 'Final batch must be marked complete');
  assert(requestedPicks.length === 10, 'All managers must be covered across separate invocations');
}

async function main(): Promise<void> {
  runLivePointsTests();
  runNullableAndPreseasonTests();
  runAssetFallbackTests();
  await runUpstreamFallbackTests();
  await runFreeTierLeagueBatchTests();
  console.log('fpl-live-pipeline.test.ts: all tests passed');
}

await main();
