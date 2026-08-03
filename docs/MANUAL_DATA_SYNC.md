# Manual competition data synchronization

Run synchronization commands from the repository root. Install dependencies once before running
any sync command:

```powershell
npm install
```

## Fantasy Premier League

Use the full pipeline for normal manual updates. It downloads public FPL data, normalizes it,
validates the result, and atomically updates `db.json`.

```powershell
npm run sync:fpl
```

Useful options:

```powershell
npm run sync:fpl -- --season=2026-2027
npm run sync:fpl -- --season=2026-2027 --manager-id=12345
npm run sync:fpl -- --season=2026-2027 --no-write-db
npm run sync:fpl -- --season=2026-2027 --no-validate
```

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
