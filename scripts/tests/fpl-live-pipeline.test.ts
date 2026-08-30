import { FplApiClient } from '../../worker/src/FplApiClient';
import { FplCache } from '../../worker/src/FplCache';
import { FplGameweekResolver } from '../../worker/src/FplGameweekResolver';
import { FplLivePointsCalculator } from '../../worker/src/FplLivePointsCalculator';
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

async function main(): Promise<void> {
  runLivePointsTests();
  runNullableAndPreseasonTests();
  runAssetFallbackTests();
  await runUpstreamFallbackTests();
  console.log('fpl-live-pipeline.test.ts: all tests passed');
}

await main();
