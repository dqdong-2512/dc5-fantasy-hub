import { FplApiClient } from './FplApiClient';
import { FplCache, type KvLike } from './FplCache';
import { FplLeagueService } from './FplLeagueService';
import { FplLiveService } from './FplLiveService';
import type { LiveLeagueCursor } from './FplLeagueService';

export interface Env {
  FPL_CACHE?: KvLike;
  ALLOWED_ORIGIN?: string;
  DEV_FPL_ENTRY_ID?: string;
  DEV_FPL_LEAGUE_ID?: string;
}

interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

function createServices(env: Env): { live: FplLiveService; league: FplLeagueService } {
  const client = new FplApiClient();
  const cache = new FplCache(env.FPL_CACHE);
  const live = new FplLiveService(client, cache);
  return { live, league: new FplLeagueService(client, cache, live) };
}

function jsonResponse(body: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
      Vary: 'Origin',
    },
  });
}

function positiveInteger(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function liveLeagueCursor(value: string | null): LiveLeagueCursor | null {
  if (!value) return { page: 1, offset: 0 };
  const match = value.match(/^(\d+):(\d+)$/);
  if (!match) return null;
  const page = Number(match[1]);
  const offset = Number(match[2]);
  return Number.isInteger(page) && page > 0 && Number.isInteger(offset) && offset >= 0
    ? { page, offset }
    : null;
}

async function route(request: Request, env: Env): Promise<Response> {
  const origin = env.ALLOWED_ORIGIN ?? '*';
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, origin);

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  const { live, league } = createServices(env);
  let result: unknown;

  if (path === '/api/fpl/status') result = await live.getStatus();
  else if (path === '/api/fpl/bootstrap') result = await live.getBootstrap();
  else if (path === '/api/fpl/gameweek/current') result = await live.getCurrentGameweek();
  else {
    let match = path.match(/^\/api\/fpl\/fixtures\/(\d+)$/);
    if (match) result = await live.getFixtures(Number(match[1]));
    else if ((match = path.match(/^\/api\/fpl\/gameweek\/(\d+)\/live$/))) {
      result = await live.getGameweekLive(Number(match[1]));
    } else if ((match = path.match(/^\/api\/fpl\/entry\/(\d+)$/))) {
      result = await live.getEntry(Number(match[1]));
    } else if ((match = path.match(/^\/api\/fpl\/entry\/(\d+)\/history$/))) {
      result = await live.getEntryHistory(Number(match[1]));
    } else if ((match = path.match(/^\/api\/fpl\/entry\/(\d+)\/gameweek\/(\d+)\/picks$/))) {
      result = await live.getEntryPicks(Number(match[1]), Number(match[2]));
    } else if ((match = path.match(/^\/api\/fpl\/entry\/(\d+)\/live$/))) {
      const gameweek = positiveInteger(url.searchParams.get('gw') ?? undefined);
      if (!gameweek)
        return jsonResponse({ error: 'A positive gw query parameter is required.' }, 400, origin);
      result = await live.getEntryLive(Number(match[1]), gameweek);
    } else if ((match = path.match(/^\/api\/fpl\/league\/(\d+)\/standings$/))) {
      const page = positiveInteger(url.searchParams.get('page') ?? undefined) ?? 1;
      result = await league.getLeaguePage(Number(match[1]), page);
    } else if ((match = path.match(/^\/api\/fpl\/league\/(\d+)\/live$/))) {
      const gameweek = positiveInteger(url.searchParams.get('gw') ?? undefined);
      if (!gameweek)
        return jsonResponse({ error: 'A positive gw query parameter is required.' }, 400, origin);
      const cursor = liveLeagueCursor(url.searchParams.get('cursor'));
      if (!cursor)
        return jsonResponse({ error: 'Cursor must use the page:offset format.' }, 400, origin);
      const batchSize = positiveInteger(url.searchParams.get('limit') ?? undefined) ?? undefined;
      result = await league.getLiveLeague(Number(match[1]), gameweek, cursor, batchSize);
    } else {
      return jsonResponse({ error: 'Not found' }, 404, origin);
    }
  }

  const responseStatus =
    typeof result === 'object' &&
    result !== null &&
    'dataStatus' in result &&
    result.dataStatus === 'ERROR'
      ? 503
      : 200;
  return jsonResponse(result, responseStatus, origin);
}

async function warmConfiguredResources(env: Env): Promise<void> {
  const { live, league } = createServices(env);
  const current = await live.getCurrentGameweek();
  const gameweek = current.data?.gameweek?.id;
  if (!gameweek) return;
  await live.getGameweekLive(gameweek);

  const entryId = positiveInteger(env.DEV_FPL_ENTRY_ID);
  const leagueId = positiveInteger(env.DEV_FPL_LEAGUE_ID);
  if (entryId) await live.getEntryLive(entryId, gameweek);
  if (leagueId) await league.getLiveLeague(leagueId, gameweek);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await route(request, env);
    } catch (error) {
      console.error('Unhandled FPL internal API error', error);
      return jsonResponse(
        {
          data: null,
          dataStatus: 'ERROR',
          lastUpdated: new Date().toISOString(),
          error: 'FPL live service is temporarily unavailable.',
        },
        503,
        env.ALLOWED_ORIGIN ?? '*'
      );
    }
  },
  scheduled(_controller: unknown, env: Env, context: ExecutionContextLike): void {
    context.waitUntil(
      warmConfiguredResources(env).catch((error) => {
        console.error('Scheduled FPL warm-up failed', error);
      })
    );
  },
};
