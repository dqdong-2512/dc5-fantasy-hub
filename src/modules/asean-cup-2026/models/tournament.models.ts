export type TournamentFixtureStatusRaw =
  'UPCOMING' | 'LIVE' | 'HALF_TIME' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export type TournamentFixtureStatus =
  'upcoming' | 'live' | 'half-time' | 'finished' | 'postponed' | 'cancelled';

export type TournamentPlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export type TournamentCountryCode =
  'VN' | 'TH' | 'MY' | 'ID' | 'KH' | 'SG' | 'PH' | 'MM' | 'LA' | 'TL';

export interface TournamentTeamRaw {
  id: number;
  name: string;
  countryCode: TournamentCountryCode;
}

export interface TournamentGroupStandingRaw {
  teamId: number;
  played: number;
  won: number;
  draw: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
}

export interface TournamentGroupRaw {
  id: 'A' | 'B';
  name: string;
  standings: TournamentGroupStandingRaw[];
}

export interface TournamentFixtureRaw {
  id: string;
  stage: string;
  kickoff: string;
  venue: string;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number | null;
  awayScore: number | null;
  status: TournamentFixtureStatusRaw;
  minute?: number;
  addedTime?: number;
  note?: string;
}

export interface TournamentPlayerRaw {
  id: number;
  name: string;
  nationTeamId: number;
  club: string;
  position: TournamentPlayerPosition;
  goals: number;
  assists: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
}

export interface KnockoutTeamRaw {
  label: string;
  teamId: number | null;
  score: number | null;
  aggregate: string;
  status: 'pending' | 'qualified' | 'champion';
}

export interface KnockoutMatchRaw {
  title: string;
  legDates: string;
  home: KnockoutTeamRaw;
  away: KnockoutTeamRaw;
}

export interface TournamentStatisticRaw {
  id: string;
  title: string;
  value: string;
  subtitle: string;
}

export interface TournamentMetaRaw {
  competition: string;
  season: string;
  name: string;
  subtitle: string;
  currentStage: string;
  currentMatchday: number;
  updatedAt: string;
}

export interface TournamentRawDataset {
  meta: TournamentMetaRaw;
  teams: TournamentTeamRaw[];
  groups: TournamentGroupRaw[];
  fixtures: TournamentFixtureRaw[];
  players: TournamentPlayerRaw[];
  knockout: {
    semiFinal1: KnockoutMatchRaw;
    semiFinal2: KnockoutMatchRaw;
    final: KnockoutMatchRaw;
    champion: KnockoutTeamRaw;
  };
  statistics: TournamentStatisticRaw[];
}

export interface TournamentTeam {
  id: number;
  name: string;
  countryCode: TournamentCountryCode | 'TBD';
}

export interface TournamentGroupStanding {
  position: number;
  team: TournamentTeam;
  played: number;
  won: number;
  draw: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface TournamentGroup {
  id: 'A' | 'B';
  name: string;
  standings: TournamentGroupStanding[];
}

export interface TournamentFixture {
  id: string;
  stage: string;
  kickoff: string;
  venue: string;
  homeTeam: TournamentTeam;
  awayTeam: TournamentTeam;
  homeScore: number | null;
  awayScore: number | null;
  status: TournamentFixtureStatus;
  minute: number | null;
  addedTime: number | null;
  note: string | null;
}

export interface TournamentPlayer {
  id: number;
  name: string;
  nation: TournamentTeam;
  club: string;
  position: TournamentPlayerPosition;
  goals: number;
  assists: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
}

export interface KnockoutTeam {
  label: string;
  team: TournamentTeam | null;
  score: number | null;
  aggregate: string;
  status: 'pending' | 'qualified' | 'champion';
}

export interface KnockoutMatch {
  title: string;
  legDates: string;
  home: KnockoutTeam;
  away: KnockoutTeam;
}

export interface TournamentStatistic {
  id: string;
  title: string;
  value: string;
  subtitle: string;
}

export interface TournamentHighlight {
  state: 'live' | 'finished' | 'upcoming' | 'none';
  label: string;
  fixtureText: string;
  minuteText: string | null;
}

export interface TournamentHero {
  tournamentName: string;
  subtitle: string;
  currentStage: string;
  currentMatchday: number;
  matchesCompleted: number;
  matchesRemaining: number;
  nextFixture: string;
  latestResult: string;
  highlight: TournamentHighlight;
  lastUpdated: string;
}

export interface TournamentCenterData {
  hero: TournamentHero;
  groups: TournamentGroup[];
  fixtures: {
    today: TournamentFixture[];
    upcoming: TournamentFixture[];
    completed: TournamentFixture[];
  };
  players: TournamentPlayer[];
  knockout: {
    semiFinal1: KnockoutMatch;
    semiFinal2: KnockoutMatch;
    final: KnockoutMatch;
    champion: KnockoutTeam;
  };
  statistics: TournamentStatistic[];
}
