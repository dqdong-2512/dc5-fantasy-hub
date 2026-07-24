/**
 * Normalized Data Types
 * These types mirror the structure of normalized JSON files in data/normalized/
 */

export interface NormalizedTeam {
  id: number;
  name: string;
  shortName: string;
  code: number;
  strength: number;
  position: number;
  strengthOverallHome: number;
  strengthOverallAway: number;
  strengthAttackHome: number;
  strengthAttackAway: number;
  strengthDefenceHome: number;
  strengthDefenceAway: number;
}

export interface NormalizedPlayer {
  id: number;
  firstName: string;
  secondName: string;
  webName: string;
  status: string;
  code: number;
  team: number;
  teamCode: number;
  elementType: number;
  squadNumber: number | null;
  photo: string;
  selectedByPercent: string;
  nowCost: number;
  form: string;
  pointsPerGame: string;
  totalPoints: number;
  minutes: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  ownGoals: number;
  penaltiesSaved: number;
  penaltiesMissed: number;
  yellowCards: number;
  redCards: number;
  transfersInEvent?: number;
  transfersOutEvent?: number;
  costChangeEvent?: number;
}

export interface NormalizedGameweek {
  id: number;
  name: string;
  deadlineTime: string;
  finished: boolean;
  averageEntryScore: number | null;
}

export interface NormalizedElementType {
  id: number;
  name: string;
  pluralName: string;
  singularName: string;
}

export interface NormalizedFixture {
  id: number;
  gameweek: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  started: boolean;
  finished: boolean;
  kickoffTime: string;
  homeDifficulty: number;
  awayDifficulty: number;
}

export interface BootstrapData {
  teams: NormalizedTeam[];
  players: NormalizedPlayer[];
  gameweeks: NormalizedGameweek[];
  elementTypes: NormalizedElementType[];
  metadata?: DatabaseMetadata;
}

export interface DatabaseMetadata {
  competition: string;
  season: string;
  syncedAt: string;
  dataMode: 'live' | 'historical' | 'mock';
  source: string;
}
