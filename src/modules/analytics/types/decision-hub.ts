import type { Player, Team } from '@domain/models';
import type { PlayerAnalyticsRecord } from '@domain/models';

export type FormBand = 'Excellent' | 'Good' | 'Average' | 'Poor';

export type FormTrend = 'rising' | 'stable' | 'falling';

export interface FormWindowStats {
  window: 3 | 5 | 8;
  averagePoints: number;
  minutesPlayed: number;
  starts: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  bonus: number;
  ict: number | null;
  xg: number | null;
  xa: number | null;
}

export interface PlayerFormProfile {
  playerId: number;
  playerName: string;
  trend: FormTrend;
  band: FormBand;
  last3: FormWindowStats;
  last5: FormWindowStats;
  last8: FormWindowStats;
}

export interface CaptainCandidate {
  playerId: number;
  playerName: string;
  club: string;
  score: number;
  confidence: 'High' | 'Medium' | 'Low';
  ownership: number;
  fixtureSummary: string;
  reason: string;
}

export type TransferRecommendationAction = 'buy' | 'sell' | 'hold' | 'watchlist';

export interface TransferCandidate {
  playerId: number;
  playerName: string;
  club: string;
  position: string;
  price: number;
  transferTargetScore: number;
  action: TransferRecommendationAction;
  priceTrend: number;
  fixtureSummary: string;
  formSummary: string;
  summary: string;
}

export interface TeamFixtureDifficulty {
  gameweek: number;
  opponentCode: string;
  homeAway: 'H' | 'A';
  difficulty: number;
}

export interface TeamFixtureRun {
  teamId: number;
  teamName: string;
  teamShortName: string;
  averageDifficulty3: number;
  averageDifficulty5: number;
  averageDifficulty8: number;
  fixtureRating: number;
  attackingRunRating: number;
  defensiveRunRating: number;
  runLabel: 'excellent' | 'good' | 'mixed' | 'tough';
  swing: number;
  upcoming: TeamFixtureDifficulty[];
}

export interface DifferentialPick {
  playerId: number;
  playerName: string;
  club: string;
  position: string;
  ownership: number;
  formScore: number;
  fixtureScore: number;
  valueScore: number;
  score: number;
}

export interface ValueIndexRecord {
  playerId: number;
  playerName: string;
  club: string;
  position: string;
  price: number;
  pointsPerMillion: number;
  expectedValue: number;
  minutesPerPrice: number;
}

export interface TeamInsightSummary {
  squadSize: number;
  averageForm: number;
  averageFixtureScore: number;
  playersAtRisk: number;
  playersWithGoodRuns: number;
}

export interface PlayerRiskFlag {
  playerId: number;
  playerName: string;
  reason: string;
}

export interface AnalyticsDecisionSnapshot {
  players: Player[];
  teams: Team[];
  analytics: PlayerAnalyticsRecord[];
  formProfiles: PlayerFormProfile[];
  isPreSeason: boolean;
  connectedEntryId: number | null;
  managerPlayerIds: number[];
  managerBankInMillions: number | null;
}
