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

export interface CurrentTeamData {
  picks: Array<{
    element: number;
    position: number;
    multiplier: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }>;
  transfers?: {
    made?: number;
    cost?: number;
    bank?: number;
    value?: number;
  };
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
  new_entries?: {
    has_next: boolean;
    page: number;
    results: Array<{
      entry: number;
      entry_name: string;
      joined_time?: string;
      player_first_name?: string;
      player_last_name?: string;
      player_name?: string;
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

interface InternalApiResponse<T> {
  data: T | null;
  dataStatus: 'LIVE' | 'STALE' | 'ERROR';
  lastUpdated: string;
  error?: string;
}

interface InternalBootstrap {
  gameweeks: Array<Record<string, unknown>>;
  players: Array<Record<string, unknown>>;
  teams: Array<Record<string, unknown>>;
  elementTypes: Array<Record<string, unknown>>;
  totalPlayers: number;
}

interface InternalLiveSnapshot {
  phase: string;
  players: Array<Record<string, unknown>>;
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
  private useInternalApi = true;

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
      this.useInternalApi = false;
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
    if (this.useInternalApi) {
      return this.withDeduplication('bootstrap', async () => {
        const data = await this.getInternal<InternalBootstrap>('/bootstrap');
        return this.mapInternalBootstrap(data);
      });
    }
    return this.withDeduplication('bootstrap', () =>
      this.httpClient.get<BootstrapStatic>(ENDPOINTS.BOOTSTRAP_STATIC)
    );
  }

  async getFixtures(eventId?: number): Promise<FPLFixture[]> {
    if (this.useInternalApi) {
      let selectedEvent = eventId;
      if (!selectedEvent) {
        const current = await this.getInternal<{ gameweek: { id: number } | null }>(
          '/gameweek/current'
        );
        selectedEvent = current.gameweek?.id;
      }
      if (!selectedEvent) return [];
      const fixtures = await this.getInternal<Array<Record<string, unknown>>>(
        `/fixtures/${selectedEvent}`
      );
      return fixtures.map((fixture) => this.mapInternalFixture(fixture));
    }
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
    if (this.useInternalApi) {
      return this.withDeduplication(`event-live-${eventId}`, async () => {
        const snapshot = await this.getInternal<InternalLiveSnapshot>(`/gameweek/${eventId}/live`);
        return this.mapInternalLive(snapshot);
      });
    }
    return this.withDeduplication(`event-live-${eventId}`, () =>
      this.httpClient.get<EventLiveData>(`/event/${eventId}/live/`)
    );
  }

  // Personal Entry Endpoints

  async getEntry(entryId: number): Promise<EntryData> {
    if (this.useInternalApi) {
      const entry = await this.getInternal<Record<string, unknown>>(`/entry/${entryId}`);
      const leagueIds = this.numberArray(entry.classicLeagueIds);
      return {
        id: this.number(entry.id, entryId),
        name: this.string(entry.teamName, 'Team'),
        manager: { name: this.string(entry.managerName, 'Manager'), status: 'active' },
        player_first_name: this.string(entry.managerName, 'Manager'),
        player_last_name: '',
        summary_overall_points: this.number(entry.overallPoints),
        summary_overall_rank: this.nullableNumber(entry.overallRank),
        current_event: this.nullableNumber(entry.currentGameweek) ?? undefined,
        leagues: {
          classic: leagueIds.map((id) => ({ id, name: `League ${id}` })),
          h2h: [],
        },
      };
    }
    return this.withDeduplication(`entry-${entryId}`, () =>
      this.httpClient.get<EntryData>(`/entry/${entryId}/`)
    );
  }

  async getEntryHistory(entryId: number): Promise<EntryHistory> {
    if (this.useInternalApi) {
      const history = await this.getInternal<Record<string, unknown>>(`/entry/${entryId}/history`);
      return {
        current: this.recordArray(history.current).map((item) => ({
          event: this.number(item.gameweek),
          points: this.number(item.points),
          total_points: this.number(item.totalPoints),
          rank: null,
          rank_sort: null,
          overall_rank: this.nullableNumber(item.overallRank),
          bank: this.number(item.bank),
          value: this.number(item.teamValue),
          event_transfers: 0,
          event_transfers_cost: this.number(item.transferCost),
          transfers_made: 0,
          transfers_cost: this.number(item.transferCost),
        })),
        past: this.recordArray(history.past).map((item) => ({
          season_name: this.string(item.season),
          total_points: this.number(item.points),
          rank: this.nullableNumber(item.rank),
        })),
      };
    }
    return this.withDeduplication(`entry-history-${entryId}`, () =>
      this.httpClient.get<EntryHistory>(`/entry/${entryId}/history/`)
    );
  }

  async getEntryPicks(entryId: number, eventId: number): Promise<EntryPicksData> {
    if (this.useInternalApi) {
      const data = await this.getInternal<Record<string, unknown>>(
        `/entry/${entryId}/gameweek/${eventId}/picks`
      );
      return {
        active_chip: typeof data.activeChip === 'string' ? data.activeChip : null,
        automatic_subs: this.recordArray(data.automaticSubstitutions).map((sub) => ({
          entry: entryId,
          element_in: this.number(sub.playerIn),
          element_out: this.number(sub.playerOut),
          period: 0,
          sub_order: this.number(sub.order),
        })),
        entry_history: {
          event: eventId,
          points: 0,
          total_points: 0,
          rank: null,
          rank_sort: null,
          overall_rank: null,
          percentile_rank: null,
          bank: 0,
          value: 0,
          event_transfers: 0,
          event_transfers_cost: this.number(data.transferCost),
          transfers_made: 0,
          transfers_cost: this.number(data.transferCost),
        },
        picks: this.recordArray(data.picks).map((pick) => ({
          element: this.number(pick.playerId),
          position: this.number(pick.position),
          multiplier: this.number(pick.multiplier),
          is_captain: pick.isCaptain === true,
          is_vice_captain: pick.isViceCaptain === true,
        })),
      };
    }
    return this.withDeduplication(`entry-picks-${entryId}-${eventId}`, () =>
      this.httpClient.get<EntryPicksData>(`/entry/${entryId}/event/${eventId}/picks/`)
    );
  }

  async getCurrentTeam(entryId: number): Promise<CurrentTeamData> {
    if (this.useInternalApi) {
      throw new Error(
        `Private pre-deadline picks for entry ${entryId} are not available through the public FPL API.`
      );
    }
    return this.withDeduplication(`current-team-${entryId}`, () =>
      this.httpClient.get<CurrentTeamData>(`/my-team/${entryId}/`)
    );
  }

  async getLeagueStandings(leagueId: number, page?: number): Promise<LeagueStandingsData> {
    if (this.useInternalApi) {
      const data = await this.getInternal<Record<string, unknown>>(
        `/league/${leagueId}/standings?page=${page ?? 1}`
      );
      const members = this.recordArray(data.members);
      return {
        league: {
          id: this.number(data.leagueId, leagueId),
          name: this.string(data.leagueName, `League ${leagueId}`),
          closed: false,
        },
        standings: {
          has_next: data.hasNext === true,
          page: this.number(data.page, page ?? 1),
          results: members.map((member, index) => ({
            id: this.number(member.entryId),
            rank: this.number(member.rank, index + 1),
            previous_rank: this.nullableNumber(member.previousRank),
            entry: this.number(member.entryId),
            entry_name: this.string(member.teamName, 'Team'),
            player_name: this.string(member.managerName, 'Manager'),
            total: this.number(member.totalPoints),
            event_total: this.number(member.gameweekPoints),
          })),
        },
      };
    }
    const pageParam = page ? `?page_standings=${page}` : '';
    const cacheKey = `league-standings-${leagueId}-${page || 1}`;
    return this.withDeduplication(cacheKey, () =>
      this.httpClient.get<LeagueStandingsData>(
        `/leagues-classic/${leagueId}/standings/${pageParam}`
      )
    );
  }

  private async getInternal<T>(path: string): Promise<T> {
    const response = await this.httpClient.get<InternalApiResponse<T>>(path);
    if (response.data === null) {
      throw new Error(response.error ?? 'FPL internal API returned no data.');
    }
    return response.data;
  }

  private mapInternalBootstrap(data: InternalBootstrap): BootstrapStatic {
    return {
      events: data.gameweeks.map((event) => ({
        id: this.number(event.id),
        name: this.string(event.name),
        deadline_time: this.string(event.deadlineTime),
        average_entry_score: this.nullableNumber(event.averageEntryScore),
        finished: event.finished === true,
        data_checked: event.dataChecked === true,
        highest_scoring_element: null,
        stats: [],
        top_element: null,
        top_element_info: null,
        transfers_made: 0,
        most_transferred_in: null,
        most_transferred_out: null,
        most_captained: null,
        most_vice_captained: null,
      })),
      teams: data.teams.map((team) => ({
        id: this.number(team.id),
        name: this.string(team.name),
        short_name: this.string(team.shortName),
        code: this.number(team.code),
        strength: this.number(team.strength),
        position: 0,
        played: 0,
        win: 0,
        draw: 0,
        loss: 0,
        points_for: 0,
        points_against: 0,
        points_difference: 0,
        strength_overall_home: this.number(team.strengthOverallHome),
        strength_overall_away: this.number(team.strengthOverallAway),
        strength_attack_home: this.number(team.strengthAttackHome),
        strength_attack_away: this.number(team.strengthAttackAway),
        strength_defence_home: this.number(team.strengthDefenceHome),
        strength_defence_away: this.number(team.strengthDefenceAway),
        unavailable: false,
        next_event_fixture: null,
      })),
      total_players: data.totalPlayers,
      elements: data.players.map((player) => ({
        id: this.number(player.id),
        first_name: this.string(player.firstName),
        second_name: this.string(player.secondName),
        web_name: this.string(player.webName),
        status: this.string(player.status, 'a'),
        code: this.number(player.code),
        team: this.number(player.teamId),
        team_code: this.number(player.teamCode),
        element_type: this.number(player.positionId),
        squad_number: this.nullableNumber(player.squadNumber),
        photo: this.string(player.photo),
        selected_by_percent: this.string(player.selectedByPercent, '0'),
        now_cost: this.number(player.price),
        form: this.string(player.form, '0'),
        points_per_game: this.string(player.pointsPerGame, '0'),
        total_points: this.number(player.totalPoints),
        minutes: this.number(player.minutes),
        goals_scored: this.number(player.goalsScored),
        assists: this.number(player.assists),
        clean_sheets: this.number(player.cleanSheets),
        goals_conceded: this.number(player.goalsConceded),
        own_goals: this.number(player.ownGoals),
        penalties_saved: this.number(player.penaltiesSaved),
        penalties_missed: this.number(player.penaltiesMissed),
        yellow_cards: this.number(player.yellowCards),
        red_cards: this.number(player.redCards),
      })),
      element_types: data.elementTypes.map((type) => ({
        id: this.number(type.id),
        singular_name: this.string(type.singularName),
        plural_name: this.string(type.pluralName),
      })),
      game_settings: {
        league_join_private_max: 0,
        league_join_public_max: 0,
        league_max_size_public_classic: 0,
        league_max_size_league_classic: 0,
        league_creation_min_buy_in: 0,
        league_creation_max_buy_in: 0,
        league_prefix_public: '',
        league_points_H2H: 0,
        league_points_for_group: 0,
        timezone: 'UTC',
      },
    };
  }

  private mapInternalFixture(fixture: Record<string, unknown>): FPLFixture {
    const home = this.number(fixture.homeTeamId);
    const away = this.number(fixture.awayTeamId);
    return {
      id: this.number(fixture.id),
      event: this.number(fixture.gameweek),
      home_team: home,
      away_team: away,
      home_team_score: this.nullableNumber(fixture.homeScore),
      away_team_score: this.nullableNumber(fixture.awayScore),
      started: fixture.started === true,
      finished: fixture.finished === true,
      kickoff_time: this.string(fixture.kickoffTime),
      home_difficulty: 0,
      away_difficulty: 0,
      pulse_id: 0,
      team_h: home,
      team_a: away,
      team_h_score: this.nullableNumber(fixture.homeScore),
      team_a_score: this.nullableNumber(fixture.awayScore),
      team_h_difficulty: 0,
      team_a_difficulty: 0,
    };
  }

  private mapInternalLive(snapshot: InternalLiveSnapshot): EventLiveData {
    return {
      state: snapshot.phase === 'LIVE' ? 'live' : snapshot.phase === 'FINAL' ? 'post' : 'pre',
      status: [],
      elements: snapshot.players.map((player) => ({
        id: this.number(player.playerId),
        stats: {
          minutes: this.number(player.minutes),
          goals_scored: this.number(player.goalsScored),
          assists: this.number(player.assists),
          clean_sheets: this.number(player.cleanSheets),
          goals_conceded: this.number(player.goalsConceded),
          own_goals: this.number(player.ownGoals),
          penalties_saved: this.number(player.penaltiesSaved),
          penalties_missed: this.number(player.penaltiesMissed),
          yellow_cards: this.number(player.yellowCards),
          red_cards: this.number(player.redCards),
          saves: this.number(player.saves),
          bonus: this.number(player.bonus),
          bps: this.number(player.bps),
          total_points: this.number(player.totalPoints),
          in_lineups: 0,
        },
        explain: [],
      })),
    };
  }

  private number(value: unknown, fallback = 0): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  private nullableNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private string(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
  }

  private recordArray(value: unknown): Array<Record<string, unknown>> {
    return Array.isArray(value)
      ? value.filter(
          (item): item is Record<string, unknown> => typeof item === 'object' && item !== null
        )
      : [];
  }

  private numberArray(value: unknown): number[] {
    return Array.isArray(value)
      ? value.filter((item): item is number => typeof item === 'number' && Number.isFinite(item))
      : [];
  }
}
