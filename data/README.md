# Competition data

All football data is isolated by competition:

```text
data/competitions/
├── fpl/
│   ├── manifest.json
│   ├── shared/
│   └── seasons/<season>/
│       ├── raw/
│       │   ├── bootstrap-static.json
│       │   ├── fixtures.json
│       │   ├── element-summaries/<player-id>.json
│       │   ├── event-live/<gameweek>.json
│       │   └── sync-manifest.json
│       ├── normalized/
│       │   ├── players.json
│       │   ├── player-details.json
│       │   ├── teams.json
│       │   ├── fixtures.json
│       │   ├── gameweeks.json
│       │   ├── event-live.json
│       │   └── element-types.json
│       └── assets/
│           ├── player-photos/
│           └── player-photos.manifest.json
└── asean-cup-2026/
    ├── manifest.json
    └── seasons/<season>/
        ├── manual/
        └── normalized/
```

## Sync commands

- `npm run sync:fpl -- --season=2026-2027`
- `npm run sync:asean -- --season=2026-2027`

FPL raw files preserve the API payloads. Normalized files are stable application/test
fixtures. `player-photos.manifest.json` contains one record per player; unavailable
official photos point to the shared placeholder and are also listed in the sync manifest.

The `fpl/legacy` directory preserves the former unversioned snapshot for reference. It is
not read by the application.
