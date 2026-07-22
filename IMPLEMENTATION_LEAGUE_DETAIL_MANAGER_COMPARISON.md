# League Detail & Manager Comparison Feature - Implementation Specification

**Status**: Technical Planning Phase  
**Target Milestone**: Complete League Detail experience with real FPL data  
**Complexity**: Major feature requiring multi-layer architecture  
**Estimated Implementation**: 4-6 development phases

---

## 1. CURRENT STATE ANALYSIS

### Existing Infrastructure ✅

- **FantasyGameRepository**: Already has `getLeagueStandings()` method
- **FPL Client**: Has `getLeagueStandings(leagueId, page?)` endpoint
- **Routing**: `/premier-league/fantasy-game/leagues/:leagueId` exists
- **Components**: LeagueStandingsPage, ManagerComparisonPage exist
- **Domain Models**: FantasyLeague, FantasyLeagueStanding, FantasyLeagueStandings defined
- **Services**: FantasyGameLiveLeagueService for live calculations

### What's Already Built ✅

- Manager Comparison page with detailed UI (ComparisonHeader, HeadToHeadSummary, etc.)
- LeagueStandingsTable with manager selection
- Fixtures data for development/testing
- Live league standings calculation service

### What Needs Enhancement 🔄

1. **Leagues Tab in FantasyWorkspace**: Currently shows leagues but needs real data
2. **League Data Fetching**: Need to get actual league names, not just IDs
3. **League Detail Header**: Need compact header with dropdown selector
4. **League Standings Pagination**: Need to handle multi-page standings
5. **Real-time Data Integration**: Connect to live FPL API

---

## 2. FPL API ENDPOINTS REQUIRED

### Endpoints Used

```
GET /entry/{entryId}
  └─ Returns: Entry data including joinedLeaguesIds

GET /leagues-classic/{leagueId}
  └─ Returns: League metadata (name, type, admin, etc.)
  └─ Optional params: ?page_standings={page}
  └─ Returns: FantasyLeagueStandings with pagination

GET /entry/{entryId}/history
  └─ Returns: Gameweek history including rank progression

GET /entry/{entryId}/event/{eventId}/picks
  └─ Returns: Team selection for a specific gameweek
```

### Data Response Structures

```typescript
// League Metadata (from GET /leagues-classic/{leagueId})
{
  id: number
  name: string
  league_type: 'x' | 's'  // x=classic, s=h2h
  created: string
  admin_entry?: number
  max_able_to_join: number
  scoring?: string
}

// League Standings (from pageStandings param)
{
  rank: number
  entry_id: number
  entry_name: string
  player_name: string
  player_region_name?: string
  team_name: string
  points: number
  event_points: number  // Current GW points
  total: number  // Season total
  movement: number  // Rank change indicator
  last_rank: number | null
}
```

---

## 3. DATA ARCHITECTURE DESIGN

### 3.1 New Repository Methods

**File**: `src/repositories/fantasy/fantasy.repository.ts`

```typescript
// Add methods:

/**
 * Get league metadata (name, type, settings)
 */
async getLeagueInfo(leagueId: number): Promise<FantasyLeague> {
  // Fetch from FPL API
  // Map to domain model
  // Cache result
}

/**
 * Get all leagues for a connected entry
 */
async getEntryLeagues(entryId: number): Promise<FantasyLeague[]> {
  const entry = await this.getEntry(entryId);
  // For each joinedLeaguesIds, fetch league info
  // Combine into array
}

/**
 * Get paginated standings with real FPL data
 */
async getLeagueStandingsWithPagination(
  leagueId: number,
  page: number = 1
): Promise<FantasyLeagueStandings>

/**
 * Get specific manager's profile within a league
 */
async getManagerInLeague(
  leagueId: number,
  managerId: number
): Promise<{manager: FantasyLeagueStanding, leagueInfo: FantasyLeague}>
```

### 3.2 New Service Layer

**File**: `src/modules/fantasy/services/LeagueDetailService.ts` (NEW)

```typescript
/**
 * Encapsulates league detail logic
 * Coordinates repository calls
 * Handles caching and state management
 */
export class LeagueDetailService {
  /**
   * Load complete league detail
   * Returns: League info + current standings + connected user's position
   */
  async loadLeagueDetail(leagueId: number, connectedEntryId: number);

  /**
   * Compare two managers within a league
   * Returns: Detailed comparison with metrics
   */
  async compareManagersInLeague(
    leagueId: number,
    connectedManagerId: number,
    opponentManagerId: number
  );

  /**
   * Calculate league rank movement
   * Uses entry history + current league standings
   */
  calculateRankMovement(currentLeagueRank: number, previousLeagueRank: number | null);
}
```

### 3.3 New Custom Hook

**File**: `src/modules/fantasy/hooks/useLeagueDetail.ts` (NEW)

```typescript
interface UseLeagueDetailProps {
  leagueId: number;
  connectedEntryId: number;
  connectedManagerId: number;
}

export function useLeagueDetail({
  leagueId,
  connectedEntryId,
  connectedManagerId,
}: UseLeagueDetailProps) {
  // State management for league detail
  const [leagueInfo, setLeagueInfo] = useState<FantasyLeague | null>(null);
  const [standings, setStandings] = useState<FantasyLeagueStandings | null>(null);
  const [selectedManager, setSelectedManager] = useState<FantasyLeagueStanding | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect to load league detail when ID changes
  // Memoized service instance
  // Cached data to prevent duplicate fetches

  return {
    leagueInfo,
    standings,
    selectedManager,
    isLoading,
    error,
    setSelectedManager,
    loadMoreStandings, // For pagination
  };
}
```

---

## 4. COMPONENT ARCHITECTURE

### 4.1 League Detail Header Component

**File**: `src/modules/fantasy/components/LeagueDetailHeader.tsx` (NEW)

```
┌─────────────────────────────────────────────┐
│ League Dropdown ▼                           │
│ ┌─────────────────────────────────────────┐ │
│ │ League Name                             │ │
│ │ Your Rank: #42 | Movement: ↑ 5 positions│
│ │ Managers: 47                            │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

Props:
- leagueInfo: FantasyLeague
- userRank: number
- userRankPrevious: number | null
- managerCount: number
- onLeagueChange: (leagueId: number) => void
- allLeagues: FantasyLeague[]

Spacing:
- paddingY: xs, paddingX: sm
- marginBottom: xs (to match tab spacing)
- Dropdown button: compact
```

### 4.2 Enhanced Leagues Tab Component

**File**: `src/modules/fantasy/components/Leagues.tsx` (ENHANCE)

```
Replace:
- "League {ID}" buttons
+ Actual league names with stats

Reuse:
- LeagueDetailHeader (dropdown + info)
- LeagueStandingsTable (with pagination)
- Manager selection drawer/modal

Action:
- Clicking league → sets selectedLeagueId
- LeagueDetailHeader dropdown → changes league
- Manager click in table → show comparison modal or navigate
```

### 4.3 League Standings Table with Pagination

**File**: `src/modules/fantasy/components/LeagueStandingsTable.tsx` (ENHANCE)

```
Changes:
- Handle pageNumber state
- "Next Page" / "Previous Page" buttons
- Show "Page X of Y"
- Don't reload all standings on every fetch
- Keep existing selection across pages

Architecture:
- Accept: standings (current page), hasNext, pageNumber
- Emit: onPageChange(newPageNumber)
- Reuse pagination logic
```

---

## 5. RESPONSE HANDLING & EDGE CASES

### 5.1 Defensive Coding Requirements

```typescript
// League metadata missing
if (!leagueData.name) {
  return `League #${leagueId}`
}

// League has no standings yet
if (!standings || standings.length === 0) {
  return <EmptyState title="No standings available" />
}

// User is not ranked
if (!currentRank) {
  return '—'
}

// Previous rank unavailable
if (!previousRank) {
  return <Typography>New to league</Typography>
}

// Pagination beyond limit
if (requestedPage > totalPages) {
  setCurrentPage(totalPages)
}

// API timeout on standings fetch
if (error.code === 'TIMEOUT') {
  return <ErrorState message="Loading took too long. Try again." retry={refresh} />
}

// Network offline
if (error.type === 'NETWORK') {
  return <EmptyState title="Offline" description="Check your internet" />
}
```

---

## 6. LOADING UX STRATEGY

### 6.1 Preserve Existing Data

```typescript
// Don't clear standings when switching leagues
// Keep previous league data visible during load
// Show loading indicator on headers only

Pattern:
1. User selects new league
2. Keep old standings visible
3. Show loading spinner in header area
4. Once new data arrives, swap in
5. No full-page flicker
```

### 6.2 Skeleton vs Spinner Decision

```
League Header:
- Use skeleton matching header layout
- Show league name placeholder
- Show rank placeholder

Standings Table:
- Use row skeleton (5-7 rows)
- Match actual table structure
- Same height for smooth transition
```

---

## 7. RESPONSIVE DESIGN SPECIFICS

### 7.1 Desktop (lg+)

```
Layout:
┌─────────────────────────────────────┐
│ League Header with dropdown         │
├─────────────────────────────────────┤
│ Standings Table (full width)        │
│ ┌────┬────────┬──────┬──────┬──────┐│
│ │Rank│Manager │Team  │Points│ Mov  ││
│ └────┴────────┴──────┴──────┴──────┘│
└─────────────────────────────────────┘

Pagination: Centered at bottom
```

### 7.2 Tablet (sm-md)

```
Layout: Same as desktop
Columns: Hide "Team" or abbreviate
Spacing: Reduce padding 20%
```

### 7.3 Mobile (xs)

```
Layout: Stacked cards instead of table
┌──────────────────┐
│ #5 Manager Name  │
│ Team Name        │
│ 425 pts | ↑ 2    │
└──────────────────┘

Pagination:
- "← Prev | Next →" buttons
- Show "Page 1 of 5"
```

---

## 8. VERIFICATION CHECKLIST

### Before Marking Complete

- [ ] npm run type-check → 0 errors
- [ ] npm run lint → 0 new errors
- [ ] npm run build → succeeds
- [ ] App runs locally without crashes
- [ ] Connected user leagues load
- [ ] League name displays correctly
- [ ] League dropdown shows all leagues
- [ ] Switching leagues updates standings
- [ ] Standings pagination works
- [ ] Manager selection works
- [ ] Comparison page navigates correctly
- [ ] Mobile layout responsive
- [ ] No full-page loading flicker
- [ ] Existing Fantasy Game features unbroken
- [ ] Existing Dashboard/Players/Fixtures unbroken

---

## 9. IMPLEMENTATION PHASES

### Phase 1: Data Layer (2-3 hours)

- [ ] Create LeagueDetailService
- [ ] Add repository methods
- [ ] Enhance FPL Client types if needed
- [ ] Test with real FPL data

### Phase 2: Hooks & State (2 hours)

- [ ] Create useLeagueDetail hook
- [ ] Handle caching and memoization
- [ ] Error handling

### Phase 3: UI Components (3-4 hours)

- [ ] LeagueDetailHeader component
- [ ] Enhance Leagues tab
- [ ] Enhance LeagueStandingsTable with pagination
- [ ] Test responsive layouts

### Phase 4: Integration (2-3 hours)

- [ ] Wire components together
- [ ] Test data flow
- [ ] Verify navigation
- [ ] Handle edge cases

### Phase 5: Polish & Verification (1-2 hours)

- [ ] Spacing/typography review
- [ ] UX testing
- [ ] Build & test
- [ ] Final verification

---

## 10. KNOWN LIMITATIONS & FUTURE ENHANCEMENTS

### Current Limitations

1. Standings pagination limited to FPL API's page size (50 managers default)
2. Live league race requires gameweek selection
3. Manager comparison still uses fixtures data (needs live picks integration)
4. No caching persistence across browser refresh

### Future Enhancements

1. Add "Favorite League" functionality
2. League standings filtering/sorting
3. Historical rank charts
4. All-play-all head-to-head mode
5. Captain impact analysis
6. Projected rank calculations
7. Alerts for league rank changes
8. Squad comparison with live points

---

## 11. FILE STRUCTURE SUMMARY

```
src/
├── repositories/fantasy/
│   └── fantasy.repository.ts (ENHANCE)
│
├── modules/fantasy/
│   ├── services/
│   │   └── LeagueDetailService.ts (NEW)
│   │
│   ├── hooks/
│   │   └── useLeagueDetail.ts (NEW)
│   │   └── useFantasyGame.ts (existing)
│   │
│   ├── components/
│   │   ├── LeagueDetailHeader.tsx (NEW)
│   │   ├── Leagues.tsx (ENHANCE)
│   │   └── LeagueStandingsTable.tsx (ENHANCE)
│   │
│   ├── pages/
│   │   ├── LeagueStandingsPage.tsx (ENHANCE)
│   │   └── ManagerComparisonPage.tsx (existing, may enhance)
│   │
│   └── fixtures/ (use existing as fallback)
│
├── shared/services/
│   └── fpl-client.ts (existing, already has endpoints)
│
└── router/
    └── routes.tsx (may enhance if needed)
```

---

## NEXT IMMEDIATE STEPS

**For Next Session:**

1. ✅ Read this specification
2. Create LeagueDetailService.ts
3. Enhance FantasyGameRepository with new methods
4. Create useLeagueDetail hook
5. Create LeagueDetailHeader component
6. Test with Entry ID 4583863

**Not For Now:**

- Don't rebuild ManagerComparisonPage (already works with fixtures)
- Don't redesign routing (current structure is good)
- Don't refactor existing components unnecessarily

---

## REFERENCE: Entry ID for Testing

- **Connected User**: Entry ID 4583863
- **Team Name**: Should have joined classic leagues
- **Test Scenario**: Load leagues → select one → view standings → select manager → compare
