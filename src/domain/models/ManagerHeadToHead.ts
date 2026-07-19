/**
 * Manager Head-to-Head Domain Models
 * Represents comprehensive comparison between two managers
 */

import type { ManagerGameweekSnapshot } from './GameweekCenter';

/**
 * Overall comparison metrics between two managers
 */
export interface OverallComparison {
  currentManagerRank: number;
  opponentManagerRank: number;
  currentManagerTotalPoints: number;
  opponentManagerTotalPoints: number;
  pointsGap: number;
  currentManagerTeamValue: number;
  opponentManagerTeamValue: number;
  currentManagerBank: number;
  opponentManagerBank: number;
}

/**
 * Gameweek-specific comparison
 */
export interface GameweekComparison {
  currentManagerRawPoints: number;
  opponentManagerRawPoints: number;
  currentManagerTransferCost: number;
  opponentManagerTransferCost: number;
  currentManagerNetPoints: number;
  opponentManagerNetPoints: number;
  currentManagerBenchPoints: number;
  opponentManagerBenchPoints: number;
  gameweekPointsGap: number;
  gameweekWinner: 'current' | 'opponent' | 'draw';
}

/**
 * Captain comparison
 */
export interface CaptainComparison {
  currentManagerCaptainId?: number;
  currentManagerCaptainName?: string;
  currentManagerCaptainContribution: number;
  opponentManagerCaptainId?: number;
  opponentManagerCaptainName?: string;
  opponentManagerCaptainContribution: number;
  sameCaptain: boolean;
  captainSwing: number;
}

/**
 * Transfer cost comparison
 */
export interface TransferComparison {
  currentManagerTransfers: number;
  opponentManagerTransfers: number;
  currentManagerTransferCost: number;
  opponentManagerTransferCost: number;
  transferCostSwing: number;
}

/**
 * Bench points comparison
 */
export interface BenchComparison {
  currentManagerBenchPoints: number;
  opponentManagerBenchPoints: number;
  benchPointsSwing: number;
}

/**
 * Player differential impact
 */
export interface PlayerDifferentialImpact {
  playerId: number;
  playerName?: string;
  manager: 'current' | 'opponent';
  gameweekContribution: number;
  minutesPlayed: number;
  isCaptain: boolean;
  captainMultiplier: number;
}

/**
 * Differential analysis
 */
export interface DifferentialAnalysis {
  sharedPlayerIds: number[];
  currentManagerDifferentials: PlayerDifferentialImpact[];
  opponentManagerDifferentials: PlayerDifferentialImpact[];
  currentManagerDifferentialTotal: number;
  opponentManagerDifferentialTotal: number;
  differentialSwing: number;
  biggestSwingPlayer?: {
    playerId: number;
    playerName?: string;
    manager: 'current' | 'opponent';
    swing: number;
    contribution: number;
  };
}

/**
 * Single gameweek in historical trend
 */
export interface GameweekTrendEntry {
  gameweekId: number;
  currentManagerPoints: number;
  opponentManagerPoints: number;
  swing: number;
}

/**
 * Rivalry summary across multiple gameweeks
 */
export interface RivalrySummary {
  currentManagerWins: number;
  opponentManagerWins: number;
  draws: number;
  averageSwing: number;
  bestAdvantage: number;
  worstDeficit: number;
}

/**
 * Historical trend data
 */
export interface HistoricalTrend {
  gameweeks: GameweekTrendEntry[];
  summary: RivalrySummary;
}

/**
 * Full manager head-to-head comparison
 */
export interface ManagerHeadToHeadComparison {
  leagueId: number;
  gameweekId: number;
  currentManagerId: number;
  opponentManagerId: number;
  dataStatus: 'live' | 'final' | 'snapshot' | 'upcoming';
  overallComparison: OverallComparison;
  gameweekComparison: GameweekComparison;
  captainComparison: CaptainComparison;
  transferComparison: TransferComparison;
  benchComparison: BenchComparison;
  differentialAnalysis: DifferentialAnalysis;
  historicalTrend?: HistoricalTrend;
  currentManagerSnapshot?: ManagerGameweekSnapshot;
  opponentManagerSnapshot?: ManagerGameweekSnapshot;
  hasMissingSnapshots: boolean;
}

/**
 * Player contribution for comparison table
 */
export interface PlayerComparisonRow {
  playerId: number;
  playerName: string;
  position?: string;
  currentManagerContribution: number;
  opponentManagerContribution: number;
  pointsDifference: number;
  isShared: boolean;
  isCaptain: boolean;
}
