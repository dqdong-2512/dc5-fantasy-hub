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
}

export interface NormalizedPlayer {
  id: number;
  firstName: string;
  secondName: string;
  webName: string;
  team: number;
  elementType: number;
  squadNumber: number | null;
  selectedByPercent: string;
  nowCost: number;
  form: string;
  pointsPerGame: string;
  totalPoints: number;
  minutes: number;
  code?: number;
  photo?: string;
  status?: string;
  goalsScored?: number;
  assists?: number;
  cleanSheets?: number;
  goalsConceded?: number;
  ownGoals?: number;
  penaltiesSaved?: number;
  penaltiesMissed?: number;
  yellowCards?: number;
  redCards?: number;
  influence?: string;
  creativity?: string;
  threat?: string;
  ictIndex?: string;
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

export interface BootstrapData {
  teams: NormalizedTeam[];
  players: NormalizedPlayer[];
  gameweeks: NormalizedGameweek[];
  elementTypes: NormalizedElementType[];
}
