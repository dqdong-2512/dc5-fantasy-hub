# RFC FANTASY-003: Live Mini League Center - Implementation Complete

## Build Status

✅ **SUCCESS** - Exit Code 0

- **Build Time**: 40.80s
- **Modules Transformed**: 11,836
- **TypeScript Strict Mode**: All errors resolved
- **New Dependencies**: None

---

## Implementation Overview

The Live Mini League Center transforms the existing static Leagues section into a dynamic live scoring dashboard during active Gameweeks. Users can now view calculated live rankings for their mini-league managers alongside official FPL standings.

### Architecture

```
Official Standings (FPL API)
        ↓
League Selector
        ↓
┌─────────────────────────────────┐
│  Official View  │  Live View     │
├─────────────────────────────────┤
│  Official Data  │ Calculated     │
│                 │ Live Scores    │
└─────────────────────────────────┘
        ↓
Manager Squad Inspection (Drawer)
```

---

## Files Created

### 1. Domain Models

**File**: `src/domain/models/LiveLeagueStandings.ts`

Exports three new interfaces:

- **LiveManagerScore**: Calculated live score for one manager
- **LiveLeagueStanding**: Combined official + live standing
- **LiveLeagueStandingsResult**: Collection with page-scoped metrics

### 2. Live League Service

**File**: `src/shared/services/fantasy-game-live-league.service.ts` (350+ lines)

Key class: `FantasyGameLiveLeagueService`

**Methods**:

- `calculateLiveLeagueStandings()` - Main orchestration method
- `calculateManagerLiveScore()` - Per-manager calculation
- `fetchManagerPicks()` - With retry logic
- `mapRawPicksToModel()` - API response mapper

**Features**:

- Reuses `FantasyGameLiveService` for squad scoring (no duplication)
- Built-in `ConcurrencyController` (max 5 parallel requests)
- Partial failure resilience
- Page-scoped metric calculation

### 3. Enhanced Leagues Component

**File**: `src/modules/fantasy/components/Leagues.tsx` (500+ lines)

**Sub-components**:

- `ManagerInspectionDrawer` - Squad viewing drawer
- `RankMovementCell()` - Visual rank change indicator

**Features**:

- Official ↔ Live view toggle
- Live standings table with rich metrics
- Manager inspection with MyTeam reuse
- Progress tracking
- Refresh button
- Summary card with comparison metrics

### 4. FantasyWorkspace Integration

**File**: `src/modules/fantasy/pages/FantasyWorkspace.tsx` (1 line changed)

- Passes `selectedGameweek` to Leagues component
- Enables gameweek-aware live calculations

---

## Acceptance Criteria Compliance

### ✅ User Journey

- [x] Select a joined classic league
- [x] View official standings
- [x] Switch to Live standings
- [x] See calculated live scores
- [x] See rank movement
- [x] Compare with page average
- [x] Inspect another manager's squad

### ✅ Technical Requirements

**Data Loading** (Part 5-7):

- [x] Event live data fetched once per calculation cycle
- [x] Manager picks loaded for current page only
- [x] Concurrency limited (max 5 parallel requests)
- [x] No uncontrolled request storms

**Calculations** (Part 8-15):

- [x] Live Gameweek points per manager
- [x] Captain multiplier (2x if played, 1x otherwise)
- [x] Bench points included
- [x] Transfer costs deducted
- [x] Calculated live totals computed
- [x] Live rankings sorted by calculated total
- [x] Rank movement calculated and displayed
- [x] Captain contribution shown when available
- [x] Players remaining tracked when safely determinable

**User Experience** (Part 1-3, 14-15, 24-25):

- [x] League selector with official rank/prev rank
- [x] Connected user row highlighted with "(You)" label
- [x] Connected user easily identifiable
- [x] Manual refresh with disabled state during operation
- [x] Last updated timestamp displayed
- [x] Loading progress indicator shown
- [x] Partial failures handled gracefully

**Safety & Transparency** (Part 12, 18-22):

- [x] Calculated values clearly distinguished from official
- [x] Scope transparency: "page-scoped calculation" messaging
- [x] Only public FPL data used
- [x] No speculative projections
- [x] Failed manager doesn't cascade failure
- [x] Stale requests prevented

### ✅ Architecture Requirements (Part 29-30)

- [x] Reuses `FantasyGameLiveService` (no duplication)
- [x] Reuses `FantasyGameRepository` (standings, picks)
- [x] Reuses `MyTeam` component (squad inspection)
- [x] Reuses `FplClient` (API calls)
- [x] Strict season safety enforced
- [x] No incompatible data merging
- [x] No new dependencies installed

---

## Feature Details

### Official View

- **Columns**: Rank | Manager | Team | GW Points | Total Points
- **Behavior**: Shows FPL official data only
- **Always Available**: No gameweek required

### Live View (Gameweek Required)

#### Summary Card

Displays for current user:

- Your Live Rank
- Your GW Points
- Page Average
- Your vs Page Average (±)

#### Live Standings Table

Columns:
| Live Rank | Δ | Manager | Captain | GW Pts | Played | Remaining | Total |

Key features:

- Rank movement with accessible icons (▲/▼)
- Captain name with raw → effective points
- Players played/remaining counts
- Calculated live total
- Opacity reduced for failed managers
- Clickable rows for squad inspection

### Manager Inspection

- Opens SideDrawer on manager row click
- Reuses existing `MyTeam` component
- Shows full squad with pitch layout
- Displays player stats and performance
- Works for any manager in standings

### Progress & Reliability

- "Calculating live standings..." loading state
- "X / 50 managers loaded" progress indicator
- Partial failure messaging when applicable
- Each manager shows load status (✓ or ✗)
- Retry/refresh capability

---

## Performance Optimizations

1. **Event Live Data Optimization**
   - Single fetch per calculation cycle
   - Reused for all managers
   - Prevents O(n) API calls

2. **Concurrency Control**
   - Built-in `ConcurrencyController` (no library)
   - Max 5 parallel requests
   - Prevents API rate limiting

3. **Data Structure Efficiency**
   - Maps for O(1) lookups
   - No repeated calculations
   - Efficient sorting on demand

4. **Rendering Optimization**
   - Drawer lazy loads manager squad
   - Table rows clickable (not individual elements)
   - Status chips minimize re-renders

---

## Live Total Calculation Formula

```
Live Total = Official Total
           + Calculated Live GW Points
           - Official GW Points
           - Transfer Cost
```

**Example**:

- Manager's official total: 1000 pts
- Manager's official GW points: 45 pts
- Calculated live GW points: 52 pts (with captain)
- Transfer cost: 4 pts
- **Calculated Live Total**: 1000 + 52 - 45 - 4 = **1003 pts**

---

## Scope & Boundaries

### ✅ Implemented

- Live Mini League Center (current page only)
- Official/Live standings toggle
- Live calculations for loaded managers
- Calculated rank with movement
- Manager squad inspection
- Page-scoped metrics
- Partial failure handling
- Manual refresh
- Concurrency control

### ❌ NOT Implemented (By Design)

- Full league recursive calculation
- Effective Ownership
- Safety Score
- Threat Score
- Rank Prediction
- Projected Autosubs
- Transfer Recommendations
- Captain Recommendations
- Machine Learning features

These are explicitly reserved for future RFCs per project guidelines.

---

## Testing Checklist

- [x] Build passes with exit code 0
- [x] TypeScript strict mode compliance
- [x] No new dependencies introduced
- [x] Official standings continue working
- [x] Live view loads correctly with gameweek
- [x] Live button disabled without gameweek
- [x] Manager inspection drawer works
- [x] MyTeam component reused successfully
- [x] Partial failures handled gracefully
- [x] Concurrency limiting verified
- [x] Page-scoped metrics calculated
- [x] Rank movement displayed
- [x] Connected user highlighted
- [x] Scope transparency messaging present

---

## Known Limitations

1. **Current Page Only**: Live calculations only include managers on active standings page
2. **Single Page Load**: No recursive pagination (by design)
3. **Session Scope**: Doesn't persist state across page refreshes (by design)
4. **No Caching**: Recalculates on every request (can be added later)

---

## Future Enhancement Opportunities

1. **RFC FANTASY-004**: Full-league recursive calculation
2. **RFC FANTASY-005**: Advanced metrics (effective ownership, threats)
3. **RFC FANTASY-006**: AI recommendations
4. **RFC FANTASY-007**: Historical comparison
5. **RFC FANTASY-008**: Export/sharing features

---

## Implementation Notes

### Design Decisions

1. **Concurrency Controller**: Built with Promise patterns instead of library to meet "no new deps" requirement
2. **Service Injection**: FplClient optional parameter allows testing without new service
3. **Drawer Pattern**: Reused existing SideDrawer pattern for consistency
4. **MyTeam Reuse**: Same component powers both personal team and manager inspection
5. **Page Scoping**: Intentional limitation to prevent unnecessary API load

### Code Quality

- TypeScript strict mode throughout
- Clear separation of concerns
- Comprehensive error handling
- No commented-out code
- Consistent with project architecture
- Follows Feature-First structure

---

## References

- **RFC**: RFC FANTASY-003: Live Mini League Center
- **Previous**: RFC FANTASY-002: Live Gameweek Center (established scoring foundation)
- **Architecture**: src/.github/copilot-instructions.md
- **Build**: npm run build → Exit Code 0
