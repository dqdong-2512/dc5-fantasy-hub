# FPL live data pipeline

## Runtime architecture

```text
Fantasy Premier League API
  -> DC5 FPL Cloudflare Worker
  -> normalize + Cache API/KV + live points calculator
  -> /api/fpl/* internal API
  -> React application on Cloudflare Pages
```

React must only use `VITE_FPL_API_BASE_URL`. Browser code must never use
`https://fantasy.premierleague.com/api` directly. The Node-based offline synchronization pipeline
is separate and may continue to use the official API directly.

## Local development

Copy `worker/.dev.vars.example` to `worker/.dev.vars`. The checked development values resolve to
entry `2055583` (Dương Đồng / Thêm 1 lần đau) and league `65957` (DC5 FPL 2026-2027).
`worker/.dev.vars` is ignored by Git so local overrides are never committed accidentally.

Start the Worker and Vite together:

```powershell
npm run dev
```

For isolated debugging, use `npm run dev:worker` and `npm run dev:web` in separate terminals.

Vite proxies `/api/fpl` to `http://127.0.0.1:8787`. For a deployed environment set:

```text
VITE_FPL_API_BASE_URL=https://<worker-name>.<account>.workers.dev/api/fpl
```

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
- `GET /api/fpl/league/{leagueId}/live?gw={gw}`

Responses use `{ data, dataStatus, lastUpdated, error? }`. `dataStatus` is `LIVE`, `STALE`, or
`ERROR`. An upstream failure returns the previous valid cache record as `STALE` when available.

## Cache and polling policy

- Live fixtures and event-live snapshots: 20 seconds while a match is live.
- Provisional gameweek: 60 seconds.
- Preseason/pre-deadline: 3-5 minutes.
- Finalized gameweek: 15 minutes or longer.
- Manager picks: 15 minutes after publication; they are not fetched on every live poll. A picks
  hash invalidates only the affected manager score when captaincy, chips or auto-subs change.
- League pages: 2 minutes.

The cron trigger warms the current gameweek once per minute. Browser requests may refresh a live
snapshot after its 20-second TTL; this does not rebuild or redeploy Pages. Bind an optional KV
namespace named `FPL_CACHE` for cross-colo persistence. Without KV, the Worker uses Cache API plus
an isolate-local memory layer.

Create and bind KV before production deployment if cross-colo stale fallback is required:

```powershell
npx wrangler kv namespace create FPL_CACHE
```

Then add the returned `[[kv_namespaces]]` binding to `worker/wrangler.toml`.

## Verification and deployment

```powershell
npm test
npm run type-check
npm run type-check:worker
npm run lint
npm run build
npm run deploy:worker
```

Deploy the Worker independently from Cloudflare Pages. A live refresh never requires a Pages build.
