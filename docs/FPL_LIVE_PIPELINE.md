# FPL live data pipeline

## Default architecture

```text
Fantasy Premier League API
  -> Cloudflare Pages Function (/api/fpl/*)
  -> shared normalize/cache/live calculator in worker/src
  -> React application on the same Pages domain
```

The production entrypoint is `functions/api/fpl/[[path]].ts`. It reuses the provider and live
calculation modules in `worker/src`; there is only one implementation of the FPL pipeline.

React calls the same-origin `/api/fpl` path. Do not call the upstream FPL API directly from browser
components. The default below works in development and production:

```text
VITE_FPL_API_BASE_URL=/api/fpl
```

No standalone Worker URL, cross-origin CORS configuration, Cloudflare API token, or manual
`wrangler deploy` step is required for the normal production workflow.

## Local development

Run one process:

```powershell
npm run dev
```

Vite serves React and executes the shared FPL handler for `/api/fpl/*` in-process. Port `5173` is
fixed so a stale process fails clearly instead of silently opening a second frontend.

## Production deployment

Connect the repository to Cloudflare Pages and use:

```text
Build command: npm run build
Build output directory: dist
Root directory: /
```

Push or merge into `main`, the branch used by the Pages production environment. Cloudflare deploys `dist` and the
`functions` directory together. Leave `VITE_FPL_API_BASE_URL` unset or set it to `/api/fpl`.

After deployment verify:

```text
https://dc5-fantasy-hub.pages.dev/api/fpl/status
```

The response must use `Content-Type: application/json`. HTML means the Pages build did not include
the `functions` directory or an older deployment is still active.

Live data does not rebuild Pages. Browser polling refreshes snapshots through the Pages Function
according to the service TTLs. Pages Functions uses Cache API and isolate memory; an optional Pages
KV binding named `FPL_CACHE` provides longer-lived cross-colo stale fallback.

## Internal endpoints

- `GET /api/fpl/status`
- `GET /api/fpl/bootstrap`
- `GET /api/fpl/gameweek/current`
- `GET /api/fpl/gameweek/{gw}/live`
- `GET /api/fpl/fixtures/{gw}`
- `GET /api/fpl/entry/{entryId}`
- `GET /api/fpl/entry/{entryId}/history`
- `GET /api/fpl/entry/{entryId}/gameweek/{gw}/picks`
- `GET /api/fpl/entry/{entryId}/live?gw={gw}`
- `GET /api/fpl/league/{leagueId}/standings?page={page}`
- `GET /api/fpl/league/{leagueId}/live?gw={gw}&cursor={page}:{offset}&limit=7`

Responses use `{ data, dataStatus, lastUpdated, error? }`. `dataStatus` is `LIVE`, `STALE`, or
`ERROR`. When possible, an upstream failure preserves the previous snapshot as `STALE`.

### Free-tier live league batching

Live league calculation is cursor-paginated to stay below Cloudflare Workers Free's external
subrequest limit. One Pages Function invocation processes at most seven managers. Its response
contains `pagination.nextCursor`; the internal frontend client follows the cursors sequentially,
merges managers, and calculates the final league-wide live ranks.

Do not increase this server-side maximum without recalculating the worst-case request budget. A
cold batch can fetch league standings, bootstrap, fixtures, the gameweek live snapshot, and manager
picks, and each upstream request may use up to four retry attempts. Normal live polls reuse Cache
API snapshots and do not refetch manager picks on every poll.

No paid Workers plan is required. The Pages project's empty Variables and Bindings sections are a
valid baseline; an `FPL_CACHE` KV binding remains optional rather than required.

## Optional standalone Worker

The standalone entrypoint remains available for advanced deployments requiring a cron trigger or
an independently scaled API:

```powershell
npm run dev:worker:standalone
npm run deploy:worker:standalone
```

This mode is optional and is not needed for the Pages production deployment.

## Verification

```powershell
npm run type-check
npm run type-check:worker
npm run type-check:functions
npm test
npm run lint
npm run build
```
