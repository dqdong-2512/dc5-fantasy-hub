import type { Player, Team } from '@domain/models';
import type { PlayerAnalyticsRecord } from '@domain/models';

export interface CaptainCandidate {
  playerId: number;
  playerName: string;
  club: string;
  score: number;
  reason: string;
}

export interface TransferCandidate {
  playerId: number;
  playerName: string;
  club: string;
  position: string;
  price: number;
  transferTargetScore: number;
  summary: string;
}

export interface TeamFixtureRun {
  teamId: number;
  teamName: string;
  teamShortName: string;
  averageDifficulty: number;
  runLabel: 'excellent' | 'good' | 'mixed' | 'tough';
  upcoming: Array<{
    gameweek: number;
    opponentCode: string;
    homeAway: 'H' | 'A';
    difficulty: number;
  }>;
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
  isPreSeason: boolean;
  connectedEntryId: number | null;
  managerPlayerIds: number[];
  managerBankInMillions: number | null;
}
