export interface StandingRowCollected {
  teamName: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
}

export interface GroupCollected {
  id: string;
  name: string;
  standings: StandingRowCollected[];
}

export interface TeamCollected {
  id: number;
  name: string;
  countryCode: string;
  sourceSlug?: string;
}

export interface FixtureSeedCollected {
  id: string;
  detailUrl: string;
}

export type ManualTeamPlaceholder =
  | { type: 'team'; teamId: number }
  | { type: 'group-position'; groupId: 'A' | 'B'; position: 1 | 2 }
  | { type: 'tie-winner'; tieId: 'semi-final-1' | 'semi-final-2' };

export interface ManualScheduleFixture {
  fixtureId: string;
  stage: string;
  matchday: number;
  leg: 1 | 2 | null;
  kickoff: string;
  venue: string;
  broadcast: string | null;
  homePlaceholder: ManualTeamPlaceholder;
  awayPlaceholder: ManualTeamPlaceholder;
}

export interface ManualSchedule {
  competition: string;
  season: string;
  timezone: string;
  source: 'manual';
  fixtures: ManualScheduleFixture[];
}

export interface MatchPageSnapshot {
  fixtureId: string;
  fetchedAt: string;
  sourceUrl: string;
  html: string;
}

export interface GoalEventCollected {
  playerName: string;
  minute: number;
  addedTime: number | null;
  side: 'home' | 'away';
}

export interface MatchDetailCollected {
  fixtureId: string;
  detailUrl: string;
  statusLabel: string;
  homeScore: number | null;
  awayScore: number | null;
  goals: GoalEventCollected[];
}

export interface PlayerSeedCollected {
  slug: string;
  name: string;
}

export interface PlayerCollected {
  id: number;
  slug: string;
  name: string;
  nationTeamName: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  age: number | null;
  appearances: number | null;
  goals: number;
  assists: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
}

export interface MatchEventCollected {
  id: string;
  fixtureId: string;
  playerName: string;
  side: 'home' | 'away';
  minute: number;
  addedTime: number | null;
  type:
    'goal' | 'assist' | 'yellow-card' | 'red-card' | 'penalty-goal' | 'own-goal' | 'substitution';
  note: string | null;
}
