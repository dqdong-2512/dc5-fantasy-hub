export type FplDataStatus = 'LIVE' | 'STALE' | 'ERROR';

export type FplGameweekPhase =
  'PRESEASON' | 'PRE_DEADLINE' | 'LOCKED' | 'LIVE' | 'PROVISIONAL' | 'FINAL';

export interface InternalApiResponse<T> {
  data: T | null;
  dataStatus: FplDataStatus;
  lastUpdated: string;
  error?: string;
}

export interface FplGameweek {
  id: number;
  name: string;
  deadlineTime: string | null;
  averageEntryScore: number | null;
  highestScore: number | null;
  finished: boolean;
  dataChecked: boolean;
  isCurrent: boolean;
  isNext: boolean;
  isPrevious: boolean;
}

export interface FplPlayer {
  id: number;
  firstName: string;
  secondName: string;
  webName: string;
  teamId: number | null;
  positionId: number | null;
  totalPoints: number;
  price: number;
  status: string | null;
  code: number;
  teamCode: number | null;
  squadNumber: number | null;
  photo: string | null;
  selectedByPercent: string;
  form: string;
  pointsPerGame: string;
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
}

export interface FplTeam {
  id: number;
  name: string;
  shortName: string;
  code: number;
  strength: number;
  strengthOverallHome: number;
  strengthOverallAway: number;
  strengthAttackHome: number;
  strengthAttackAway: number;
  strengthDefenceHome: number;
  strengthDefenceAway: number;
}

export interface FplElementType {
  id: number;
  singularName: string;
  pluralName: string;
}

export interface FplBootstrap {
  gameweeks: FplGameweek[];
  players: FplPlayer[];
  teams: FplTeam[];
  elementTypes: FplElementType[];
  totalPlayers: number;
}

export interface FplFixture {
  id: number;
  gameweek: number | null;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  kickoffTime: string | null;
  started: boolean;
  finished: boolean;
  finishedProvisional: boolean;
  minutes: number | null;
}

export interface FplLivePlayer {
  playerId: number;
  minutes: number;
  totalPoints: number;
  bonus: number;
  bps: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  ownGoals: number;
  penaltiesSaved: number;
  penaltiesMissed: number;
  yellowCards: number;
  redCards: number;
  saves: number;
}

export interface FplPlayerAvailability {
  appeared: boolean;
  fixtureFinal: boolean;
}

export interface FplLiveSnapshot {
  gameweek: number;
  phase: FplGameweekPhase;
  provisional: boolean;
  players: FplLivePlayer[];
  changedPlayerIds: number[];
  fixtures: FplFixture[];
  availability: Record<string, FplPlayerAvailability>;
  hash: string;
}

export interface FplEntry {
  id: number;
  teamName: string;
  managerName: string;
  overallPoints: number;
  overallRank: number | null;
  currentGameweek: number | null;
  classicLeagueIds: number[];
}

export interface FplEntryHistoryItem {
  gameweek: number;
  points: number;
  totalPoints: number;
  overallRank: number | null;
  transferCost: number;
  bank: number;
  teamValue: number;
}

export interface FplEntryHistory {
  current: FplEntryHistoryItem[];
  past: Array<{ season: string; points: number; rank: number | null }>;
}

export interface FplPick {
  playerId: number;
  position: number;
  multiplier: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

export interface FplAutomaticSubstitution {
  playerIn: number;
  playerOut: number;
  order: number;
}

export interface FplEntryPicks {
  entryId: number;
  gameweek: number;
  activeChip: string | null;
  transferCost: number;
  bank: number | null;
  teamValue: number | null;
  picks: FplPick[];
  automaticSubstitutions: FplAutomaticSubstitution[];
}

export interface FplLeagueMember {
  entryId: number;
  managerName: string;
  teamName: string;
  rank: number | null;
  previousRank: number | null;
  gameweekPoints: number;
  totalPoints: number;
}

export interface FplLeaguePage {
  leagueId: number;
  leagueName: string;
  page: number;
  hasNext: boolean;
  members: FplLeagueMember[];
}

export interface FplPlayerScore {
  playerId: number;
  points: number;
  multiplier: number;
  effectivePoints: number;
  position: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isBench: boolean;
}

export interface FplManagerLiveScore {
  entryId: number;
  gameweek: number;
  grossPoints: number;
  transferHit: number;
  livePoints: number;
  benchPoints: number;
  captainPoints: number;
  provisional: boolean;
  activeChip: string | null;
  players: FplPlayerScore[];
}

export interface FplLiveLeagueMember extends FplLeagueMember {
  liveGameweekPoints: number;
  liveTotalPoints: number;
  liveRank: number;
  rankMovement: number | null;
  provisional: boolean;
}

export interface FplLiveLeague {
  leagueId: number;
  leagueName: string;
  gameweek: number;
  entryIds: number[];
  ownershipIndex: Record<string, number[]>;
  changedPlayerIds: number[];
  members: FplLiveLeagueMember[];
  provisional: boolean;
}

export interface ResolvedGameweek {
  gameweek: FplGameweek | null;
  phase: FplGameweekPhase;
  pollIntervalSeconds: number;
}
