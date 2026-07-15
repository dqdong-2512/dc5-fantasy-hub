/**
 * Insight Models
 * Typed representations of FPL insights
 */

export type InsightSeverity = 'info' | 'positive' | 'warning' | 'critical';

export type InsightType =
  | 'deadline'
  | 'form'
  | 'ownership'
  | 'performance'
  | 'availability'
  | 'fixture'
  | 'transfer';

/**
 * Core insight model
 */
export interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description?: string;
  entityId?: number;
  actionRoute?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Deadline insight specific data
 */
export interface DeadlineInsight extends Insight {
  type: 'deadline';
  gameweek: number;
  deadline: string;
  hoursRemaining: number;
  isActive: boolean;
}

/**
 * Player recommendation with reasons
 */
export interface PlayerRecommendation {
  playerId: number;
  playerName: string;
  club: string;
  position: string;
  price: number;
  form: number;
  totalPoints: number;
  ownership: number;
  minutesPlayed: number;
  reason: string;
  score?: number;
}

/**
 * Ownership watch insight
 */
export interface OwnershipWatchInsight extends Insight {
  type: 'ownership';
  players: PlayerRecommendation[];
}

/**
 * Differential watch insight (low ownership + good form)
 */
export interface DifferentialWatchInsight extends Insight {
  type: 'transfer';
  players: PlayerRecommendation[];
}

/**
 * Command Center compiled insights
 */
export interface CommandCenterData {
  deadline: DeadlineInsight | null;
  playersToWatch: PlayerRecommendation[];
  differentials: PlayerRecommendation[];
  topOwned: PlayerRecommendation[];
  unavailablePlayers: PlayerRecommendation[];
  hasUnavailableData: boolean;
}
