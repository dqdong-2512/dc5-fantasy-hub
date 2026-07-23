/**
 * FPL Client
 * Official Fantasy Premier League API client
 * Centralizes all endpoints and data fetching
 */

import { HttpClient } from './http-client';

export interface BootstrapStatic {
  events: Event[];
  teams: Team[];
  total_players: number;
  elements: Player[];
  element_types: ElementType[];
  game_settings: GameSettings;
}

export interface Event {
  id: number;
  name: string;
  deadline_time: string;
  average_entry_score: number | null;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_element: number | null;
  stats: {
    name: string;
    position: number;
  }[];
  top_element: number | null;
  top_element_info: {
    id: number;
    points: number;
  } | null;
  transfers_made: number;
  most_transferred_in: number | null;
  most_transferred_out: number | null;
  most_captained: number | null;
  most_vice_captained: number | null;
}

export interface Team {
  id: number;
  name: string;
  short_name: string;
  code: number;
  strength: number;
  position: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  points_for: number;
  points_against: number;
  points_difference: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
  unavailable: boolean;
  next_event_fixture: string | null;
}

export interface Player {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  status: string;
  code: number;
  team: number;
  team_code: number;
  element_type: number;
  squad_number: number | null;
  photo: string;
  selected_by_percent: string;
  now_cost: number;
  form: string;
  points_per_game: string;
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
}

export interface ElementType {
  id: number;
  plural_name: string;
  singular_name: string;
}

export interface GameSettings {
  league_join_private_max: number;
  league_join_public_max: number;
  league_max_size_public_classic: number;
  league_max_size_league_classic: number;
  league_creation_min_buy_in: number;
  league_creation_max_buy_in: number;
  league_prefix_public: string;
  league_points_H2H: number;
  league_points_for_group: number;
  timezone: string;
}

export interface FPLFixture {
  id: number;
  event: number;
  home_team: number;
  away_team: number;
  home_team_score: number | null;
  away_team_score: number | null;
  started: boolean;
  finished: boolean;
  kickoff_time: string;
  home_difficulty: number;
  away_difficulty: number;
  pulse_id: number;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  team_h_difficulty: number;
  team_a_difficulty: number;
}

// Personal Entry API Interfaces
export interface EntryData {
  id: number;
  name: string;
  manager: {
    name: string;
    status: string;
    join_date?: string;
    favourite_team?: number;
    starting_chip?: string;
  };
  favourite_team?: number;
  player_first_name: string;
  player_last_name: string;
  player_region_id?: number;
  player_region_name?: string;
  summary_overall_points: number;
  summary_overall_rank: number | null;
  current_event?: number;
  current_event_fixture?: unknown;
  league_set?: unknown;
  leagues?: {
    classic: Array<{
      id: number;
      name: string;
      short_name?: string;
      created?: string;
      closed?: boolean;
      rank?: number | null;
      max_entries?: number;
      league_type?: string;
      scoring?: string;
      admin_entry?: number;
      start_event?: number;
    }>;
    h2h: Array<unknown>;
  };
}

export interface EntryHistory {
  current: Array<{
    event: number;
    points: number;
    total_points: number;
    rank: number | null;
    rank_sort: number | null;
    overall_rank: number | null;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    transfers_made: number;
    transfers_cost: number;
  }>;
  past: Array<{
    season_name: string;
    total_points: number;
    rank: number | null;
  }>;
}

export interface EntryPicksData {
  active_chip: string | null;
  automatic_subs: Array<{
    entry: number;
    element_in: number;
    element_out: number;
    period: number;
    sub_order: number;
  }>;
  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number | null;
    rank_sort: number | null;
    overall_rank: number | null;
    percentile_rank: number | null;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    transfers_made: number;
    transfers_cost: number;
  };
  picks: Array<{
    element: number;
    position: number;
    multiplier: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }>;
}

export interface LeagueStandingsData {
  league: {
    id: number;
    name: string;
    closed: boolean;
    maxEntries?: number;
    leagueType?: string;
    scoring?: string;
    adminEntry?: number;
    startEvent?: number;
  };
  standings: {
    has_next: boolean;
    page: number;
    results: Array<{
      id: number;
      rank: number;
      previous_rank: number | null;
      entry: number;
      entry_name: string;
      player_name: string;
      total: number;
      last_rank?: number | null;
      event_total: number;
      division_rank?: number | null;
      division_points?: number | null;
    }>;
  };
}

/**
 * Live event data for a gameweek
 * Contains real-time player performance stats
 */
export interface LivePlayerStats {
  id: number;
  stats: {
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    own_goals: number;
    penalties_saved: number;
    penalties_missed: number;
    yellow_cards: number;
    red_cards: number;
    saves: number;
    bonus: number;
    bps: number;
    total_points: number;
    in_lineups: number;
  };
  explain: Array<{
    fixture: number;
    points: number;
    total: number;
    event: number;
  }>;
}

export interface EventLiveData {
  state: 'live' | 'pre' | 'post' | 'unknown';
  status: Array<{
    id: number;
    match_event: number | null;
    league_match: number | null;
    event: number;
  }>;
  elements: LivePlayerStats[];
}

// API Endpoints
const ENDPOINTS = {
  BOOTSTRAP_STATIC: '/bootstrap-static/',
  FIXTURES: '/fixtures/',
  ELEMENT_SUMMARY: '/element-summary/',
  EVENT_LIVE: '/event/live/',
} as const;

export class FplClient {
  private httpClient: HttpClient;
  private fplApiBaseUrl: string;
  private inFlightRequests: Map<string, Promise<unknown>> = new Map();

  constructor() {
    // Use environment variable if available, otherwise use direct FPL API
    // Supports:
    // - Browser/Vite: import.meta.env.VITE_FPL_API_BASE_URL (e.g., /api/fpl for proxied dev)
    // - Node.js scripts: process.env.VITE_FPL_API_BASE_URL or direct FPL API
    // - Fallback: https://fantasy.premierleague.com/api (direct)

    let baseUrl = '/api/fpl'; // Default for browser

    // Check if running in Node.js by checking for process.versions.node
    // This is more reliable than checking typeof process, as some bundlers
    // polyfill process in browser context
    const globalAny = globalThis as any;
    const isNodeJs =
      typeof globalAny.process !== 'undefined' &&
      globalAny.process.versions &&
      typeof globalAny.process.versions.node === 'string';

    if (isNodeJs) {
      // Node.js environment - use direct FPL API or env var
      baseUrl =
        globalAny.process.env.VITE_FPL_API_BASE_URL || 'https://fantasy.premierleague.com/api';
    } else if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      // Browser/Vite environment - try to use import.meta.env
      const envUrl = (import.meta as any).env.VITE_FPL_API_BASE_URL;
      if (envUrl) baseUrl = envUrl;
    }

    this.fplApiBaseUrl = baseUrl;

    this.httpClient = new HttpClient({
      baseUrl: this.fplApiBaseUrl,
      timeout: 30000,
    });
  }

  /**
   * Deduplicate concurrent requests with identical keys
   * Returns existing in-flight Promise if request already started
   * Automatically cleans up completed requests from cache
   */
  private withDeduplication<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.inFlightRequests.get(key);
    if (cached) {
      return cached as Promise<T>;
    }

    const promise = fetcher().finally(() => {
      // Clean up on completion (success or error)
      this.inFlightRequests.delete(key);
    });

    this.inFlightRequests.set(key, promise);
    return promise;
  }

  async getBootstrap(): Promise<BootstrapStatic> {
    return this.withDeduplication('bootstrap', () =>
      this.httpClient.get<BootstrapStatic>(ENDPOINTS.BOOTSTRAP_STATIC)
    );
  }

  async getFixtures(): Promise<FPLFixture[]> {
    return this.withDeduplication('fixtures', () =>
      this.httpClient.get<FPLFixture[]>(ENDPOINTS.FIXTURES)
    );
  }

  async getElementSummary(elementId: number): Promise<unknown> {
    // Placeholder for future implementation
    return this.httpClient.get<unknown>(`${ENDPOINTS.ELEMENT_SUMMARY}${elementId}/`);
  }

  /**
   * Get live stats for all players in a gameweek
   * Real-time player performance data
   */
  async getEventLive(eventId: number): Promise<EventLiveData> {
    return this.withDeduplication(`event-live-${eventId}`, () =>
      this.httpClient.get<EventLiveData>(`/event/${eventId}/live/`)
    );
  }

  // Personal Entry Endpoints

  async getEntry(entryId: number): Promise<EntryData> {
    return this.withDeduplication(`entry-${entryId}`, () =>
      this.httpClient.get<EntryData>(`/entry/${entryId}/`)
    );
  }

  async getEntryHistory(entryId: number): Promise<EntryHistory> {
    return this.withDeduplication(`entry-history-${entryId}`, () =>
      this.httpClient.get<EntryHistory>(`/entry/${entryId}/history/`)
    );
  }

  async getEntryPicks(entryId: number, eventId: number): Promise<EntryPicksData> {
    return this.withDeduplication(`entry-picks-${entryId}-${eventId}`, () =>
      this.httpClient.get<EntryPicksData>(`/entry/${entryId}/event/${eventId}/picks/`)
    );
  }

  async getLeagueStandings(leagueId: number, page?: number): Promise<LeagueStandingsData> {
    const pageParam = page ? `?page_standings=${page}` : '';
    const cacheKey = `league-standings-${leagueId}-${page || 1}`;
    return this.withDeduplication(cacheKey, () =>
      this.httpClient.get<LeagueStandingsData>(
        `/leagues-classic/${leagueId}/standings/${pageParam}`
      )
    );
  }
}
