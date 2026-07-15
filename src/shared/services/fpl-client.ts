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
  name: string;
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

// API Endpoints
const ENDPOINTS = {
  BOOTSTRAP_STATIC: '/bootstrap-static/',
  FIXTURES: '/fixtures/',
  ELEMENT_SUMMARY: '/element-summary/',
  EVENT_LIVE: '/event/live/',
} as const;

export class FplClient {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient({
      baseUrl: 'https://fantasy.premierleague.com/api',
      timeout: 30000,
    });
  }

  async getBootstrap(): Promise<BootstrapStatic> {
    return this.httpClient.get<BootstrapStatic>(ENDPOINTS.BOOTSTRAP_STATIC);
  }

  async getFixtures(): Promise<FPLFixture[]> {
    return this.httpClient.get<FPLFixture[]>(ENDPOINTS.FIXTURES);
  }

  async getElementSummary(elementId: number): Promise<unknown> {
    // Placeholder for future implementation
    return this.httpClient.get<unknown>(`${ENDPOINTS.ELEMENT_SUMMARY}${elementId}/`);
  }

  async getEventLive(eventId: number): Promise<unknown> {
    // Placeholder for future implementation
    return this.httpClient.get<unknown>(`${ENDPOINTS.EVENT_LIVE}${eventId}/`);
  }
}
