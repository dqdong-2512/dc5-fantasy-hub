# Manual competition data synchronization

Run synchronization commands from the repository root. Install dependencies once before running
any sync command:

```powershell
npm install
```

## Fantasy Premier League

Use the full pipeline for normal manual updates. Both command names below run the same full-refresh
pipeline: they download fresh bootstrap data, fixtures, every player detail/history record and all
gameweek live snapshots, refresh missing player photos, normalize the result, validate it, and
atomically update `db.json`.

```powershell
npm run sync:data:fpl
npm run sync:fpl
```

Existing player-detail and event-live JSON files are never treated as a permanent cache. A run only
publishes mandatory JSON after all of those requests succeed. If an endpoint is still unavailable
after four attempts, the command exits with an error and keeps the previous complete snapshot.

Useful options:

```powershell
npm run sync:fpl -- --season=2026-2027
npm run sync:fpl -- --season=2026-2027 --manager-id=12345
npm run sync:fpl -- --season=2026-2027 --no-write-db
npm run sync:fpl -- --season=2026-2027 --no-validate
```

When `--manager-id` (or `FPL_MANAGER_ID`) is supplied, the pipeline also refreshes the public entry,
season history, joined classic leagues and every gameweek pick set currently published by FPL.
Private pre-deadline picks are not available through the public API and are not replaced with demo
data.

The active season defaults to `appConfig.activeSeason`; `--season` is only needed when deliberately
syncing another season.

## Automatic FPL synchronization

`.github/workflows/sync-fpl-data.yml` runs the same full-refresh pipeline every six hours and can
also be started with **Run workflow** in GitHub Actions. Automatic runs set
`FPL_SYNC_TRIGGER=automatic` and `FPL_WRITE_DB=false` because the application consumes the versioned
competition files under `data/competitions/fpl`; all other fetch, normalization and validation
stages are identical to a manual run.

Use the bootstrap-only command only when raw `bootstrap-static.json` and `fixtures.json` need to
be refreshed without running normalization or updating `db.json`:

```powershell
npm run sync:bootstrap -- --season=2026-2027
```

FPL season output is stored under:

```text
data/competitions/fpl/seasons/<season>/
```

## ASEAN Cup 2026

The ASEAN sync reads the official tournament website and combines it with the checked-in manual
schedule. It writes all normalized files as one atomic snapshot.

```powershell
npm run sync:asean
npm run sync:asean -- --season=2026-2027
```

The ASEAN command automatically prefers IPv4 on Windows and other environments where the
Cloudflare IPv6 route may be unavailable. No `NODE_OPTIONS` setup is normally required.

If the command reports `ENOTFOUND`, first confirm that DNS can currently resolve the source:

```powershell
Resolve-DnsName aseanutdfc.com -Type A
```

The collector retries transient requests four times with a 30-second timeout. If every attempt
fails, verify that `https://aseanutdfc.com` is reachable and that the network, VPN, DNS, or firewall
is not blocking it.

Before syncing a new or rescheduled tournament, review:

```text
data/competitions/asean-cup-2026/seasons/<season>/manual/asean-cup-2026.schedule.json
```

ASEAN normalized output is stored under:

```text
data/competitions/asean-cup-2026/seasons/<season>/normalized/
```

Successful output prints one Sync ID and confirms that all files were written from the same
snapshot. Do not manually copy only one normalized file because fixtures, details, and events are
validated as a consistent set.

## Fantasy Champions League

There is currently no Champions League data collector or manual sync command. The application only
exposes the competition launcher/placeholder. Add a competition-specific data directory and sync
pipeline before documenting or running a Champions League sync.

## Verification after any sync

```powershell
npm run type-check
npm run lint
npm run build
```

Also inspect the changed files under the relevant competition season directory and confirm the
snapshot metadata, record counts, fixture statuses, and timestamps before committing.
