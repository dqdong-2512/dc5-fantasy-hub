/**
 * Fantasy Dashboard Service
 * Aggregates application state from existing features into Dashboard view model
 * Collects data from: Transfer Planner, Gameweek Planner, Season Planner, Leagues
 * Does NOT create duplicate business logic - only aggregates existing state
 */

import { BootstrapRepository } from '@repositories/bootstrap';
import { TransferPlanRepository, GameweekPlanRepository, SeasonPlanRepository } from './index';
import type { TransferPlan } from '../domain/TransferPlan';
import type { GameweekPlan } from '../domain/GameweekPlan';
import type { SeasonPlan } from '../domain/SeasonPlan';
import { fantasyGameFixtures } from '../fixtures';

export interface GameweekOverviewData {
  currentGameweekId: number;
  nextGameweekId?: number;
  currentDeadline?: string;
  nextDeadline?: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'FINISHED';
}

export interface TransferPlanStatusData {
  hasActivePlan: boolean;
  planId?: string;
  moveCount: number;
  projectedBank: number;
  isValid: boolean;
  errors: number;
}

export interface GameweekPlanStatusData {
  hasActivePlan: boolean;
  planId?: string;
  gameweekId?: number;
  formation?: string;
  captainId?: number;
  viceCaptainId?: number;
  isReady: boolean;
}

export interface SeasonPlanStatusData {
  hasActivePlan: boolean;
  planId?: string;
  startGameweekId?: number;
  endGameweekId?: number;
  plannedTransfers: number;
  plannedChips: number;
  hasConflicts: boolean;
}

export interface LeagueSnapshotData {
  joinedLeagues: Array<{
    id: number;
    name: string;
    rank?: number;
    totalMembers: number;
  }>;
  primaryLeagueId?: number;
}

export interface NextActionData {
  id: string;
  type:
    | 'NO_TRANSFER_PLAN'
    | 'INVALID_TRANSFER_PLAN'
    | 'NO_GAMEWEEK_PLAN'
    | 'NO_CAPTAIN'
    | 'NO_VICE_CAPTAIN'
    | 'GAMEWEEK_PLAN_INCOMPLETE'
    | 'SEASON_PLAN_CONFLICT'
    | 'DEADLINE_APPROACHING'
    | 'NO_SEASON_PLAN';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  featurePath: 'transfer' | 'gameweek' | 'season' | 'gameweek-center';
}

export interface FantasyDashboardViewModel {
  gameweek: GameweekOverviewData;
  transferStatus: TransferPlanStatusData;
  gameweekStatus: GameweekPlanStatusData;
  seasonStatus: SeasonPlanStatusData;
  leagues: LeagueSnapshotData;
  nextActions: NextActionData[];
}

export class FantasyDashboardService {
  private bootstrapRepository: BootstrapRepository;
  private transferPlanRepository: TransferPlanRepository;
  private gameweekPlanRepository: GameweekPlanRepository;
  private seasonPlanRepository: SeasonPlanRepository;

  constructor(
    bootstrapRepository?: BootstrapRepository,
    transferPlanRepository?: TransferPlanRepository,
    gameweekPlanRepository?: GameweekPlanRepository,
    seasonPlanRepository?: SeasonPlanRepository
  ) {
    this.bootstrapRepository = bootstrapRepository || new BootstrapRepository();
    this.transferPlanRepository = transferPlanRepository || new TransferPlanRepository();
    this.gameweekPlanRepository = gameweekPlanRepository || new GameweekPlanRepository();
    this.seasonPlanRepository = seasonPlanRepository || new SeasonPlanRepository();
  }

  /**
   * Build complete Dashboard view model from application state
   */
  buildDashboardViewModel(): FantasyDashboardViewModel {
    const gameweek = this.buildGameweekOverview();
    const transferStatus = this.buildTransferPlanStatus();
    const gameweekStatus = this.buildGameweekPlanStatus(
      gameweek.nextGameweekId ?? gameweek.currentGameweekId
    );
    const seasonStatus = this.buildSeasonPlanStatus();
    const leagues = this.buildLeagueSnapshot();
    const nextActions = this.deriveNextActions(transferStatus, gameweekStatus, seasonStatus);

    return {
      gameweek,
      transferStatus,
      gameweekStatus,
      seasonStatus,
      leagues,
      nextActions,
    };
  }

  /**
   * Build gameweek overview from fixtures and repositories
   */
  private buildGameweekOverview(): GameweekOverviewData {
    const currentGW = fantasyGameFixtures.currentGameweek.gameweek;
    const nextGW = currentGW + 1;

    try {
      // Get gameweek data from bootstrap
      const currentGameweekData = this.bootstrapRepository.getGameweekById(currentGW);
      const nextGameweekData = this.bootstrapRepository.getGameweekById(nextGW);

      let currentDeadline: string | undefined;
      let nextDeadline: string | undefined;

      if (currentGameweekData && currentGameweekData.deadline) {
        currentDeadline = currentGameweekData.deadline;
      }

      if (nextGameweekData && nextGameweekData.deadline) {
        nextDeadline = nextGameweekData.deadline;
      }

      return {
        currentGameweekId: currentGW,
        nextGameweekId: nextGW,
        currentDeadline,
        nextDeadline,
        status: 'UPCOMING' as const,
      };
    } catch {
      return {
        currentGameweekId: currentGW,
        nextGameweekId: nextGW,
        status: 'UPCOMING' as const,
      };
    }
  }

  /**
   * Build transfer plan status from repository
   */
  private buildTransferPlanStatus(): TransferPlanStatusData {
    try {
      const allPlans = this.transferPlanRepository.loadAllPlans();

      // Get most recent plan for current gameweek
      const currentGW = fantasyGameFixtures.currentGameweek.gameweek;
      const relevantPlan = allPlans
        .filter((p) => p.gameweekId === currentGW)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

      if (!relevantPlan) {
        return {
          hasActivePlan: false,
          moveCount: 0,
          projectedBank: fantasyGameFixtures.manager.bank,
          isValid: true,
          errors: 0,
        };
      }

      return {
        hasActivePlan: true,
        planId: relevantPlan.id,
        moveCount: relevantPlan.transfers.length,
        projectedBank: relevantPlan.projectedBank,
        isValid: relevantPlan.validation.isValid,
        errors: relevantPlan.validation.errors.length,
      };
    } catch {
      return {
        hasActivePlan: false,
        moveCount: 0,
        projectedBank: fantasyGameFixtures.manager.bank,
        isValid: true,
        errors: 0,
      };
    }
  }

  /**
   * Build gameweek plan status from repository
   */
  private buildGameweekPlanStatus(gameweekId: number): GameweekPlanStatusData {
    try {
      const plans = this.gameweekPlanRepository.loadAll(gameweekId);

      // Get most recent plan for this gameweek
      const activePlan = plans.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];

      if (!activePlan) {
        return {
          hasActivePlan: false,
          gameweekId,
          isReady: false,
        };
      }

      const isReady =
        activePlan.captainPlayerId !== null && activePlan.viceCaptainPlayerId !== null;

      return {
        hasActivePlan: true,
        planId: activePlan.id,
        gameweekId,
        captainId: activePlan.captainPlayerId ?? undefined,
        viceCaptainId: activePlan.viceCaptainPlayerId ?? undefined,
        isReady,
      };
    } catch {
      return {
        hasActivePlan: false,
        gameweekId,
        isReady: false,
      };
    }
  }

  /**
   * Build season plan status from repository
   */
  private buildSeasonPlanStatus(): SeasonPlanStatusData {
    try {
      const allPlans = this.seasonPlanRepository.loadAllPlans();

      // Get most recent plan
      const activePlan = allPlans.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];

      if (!activePlan) {
        return {
          hasActivePlan: false,
          plannedTransfers: 0,
          plannedChips: 0,
          hasConflicts: false,
        };
      }

      const plannedTransfers = activePlan.entries.filter((e) => e.transferPlanId).length;
      const plannedChips = activePlan.entries.filter((e) => e.chipPlan).length;

      return {
        hasActivePlan: true,
        planId: activePlan.id,
        startGameweekId: activePlan.startGameweekId,
        endGameweekId: activePlan.endGameweekId,
        plannedTransfers,
        plannedChips,
        hasConflicts: false, // Would be true if validation had conflicts
      };
    } catch {
      return {
        hasActivePlan: false,
        plannedTransfers: 0,
        plannedChips: 0,
        hasConflicts: false,
      };
    }
  }

  /**
   * Build league snapshot from fixtures
   */
  private buildLeagueSnapshot(): LeagueSnapshotData {
    const leagues = fantasyGameFixtures.leagues || [];

    return {
      joinedLeagues: leagues.map((l) => ({
        id: l.id,
        name: l.name,
        rank: l.rank,
        totalMembers: l.members,
      })),
      primaryLeagueId: fantasyGameFixtures.manager.primaryLeagueId,
    };
  }

  /**
   * Derive next actions from application state
   * Returns actionable items sorted by priority
   */
  private deriveNextActions(
    transferStatus: TransferPlanStatusData,
    gameweekStatus: GameweekPlanStatusData,
    seasonStatus: SeasonPlanStatusData
  ): NextActionData[] {
    const actions: NextActionData[] = [];

    // Transfer plan actions
    if (!transferStatus.hasActivePlan) {
      actions.push({
        id: 'no-transfer-plan',
        type: 'NO_TRANSFER_PLAN',
        priority: 'MEDIUM',
        title: 'Plan your transfers',
        description: 'No transfer plan for this gameweek. Click to get started.',
        featurePath: 'transfer',
      });
    } else if (!transferStatus.isValid) {
      actions.push({
        id: 'invalid-transfer-plan',
        type: 'INVALID_TRANSFER_PLAN',
        priority: 'HIGH',
        title: 'Fix transfer plan',
        description: `Transfer plan has ${transferStatus.errors} validation error(s).`,
        featurePath: 'transfer',
      });
    }

    // Gameweek plan actions
    if (!gameweekStatus.hasActivePlan) {
      actions.push({
        id: 'no-gameweek-plan',
        type: 'NO_GAMEWEEK_PLAN',
        priority: 'HIGH',
        title: 'Plan your lineup',
        description: `No lineup plan for Gameweek ${gameweekStatus.gameweekId}.`,
        featurePath: 'gameweek',
      });
    } else if (!gameweekStatus.isReady) {
      if (!gameweekStatus.captainId) {
        actions.push({
          id: 'no-captain',
          type: 'NO_CAPTAIN',
          priority: 'HIGH',
          title: 'Select a captain',
          description: 'Captain not selected for your lineup plan.',
          featurePath: 'gameweek',
        });
      }
      if (!gameweekStatus.viceCaptainId) {
        actions.push({
          id: 'no-vice-captain',
          type: 'NO_VICE_CAPTAIN',
          priority: 'HIGH',
          title: 'Select a vice captain',
          description: 'Vice captain not selected for your lineup plan.',
          featurePath: 'gameweek',
        });
      }
    }

    // Season plan actions
    if (!seasonStatus.hasActivePlan) {
      actions.push({
        id: 'no-season-plan',
        type: 'NO_SEASON_PLAN',
        priority: 'LOW',
        title: 'Plan your season',
        description: 'No season plan exists. Create one to plan ahead.',
        featurePath: 'season',
      });
    } else if (seasonStatus.hasConflicts) {
      actions.push({
        id: 'season-conflict',
        type: 'SEASON_PLAN_CONFLICT',
        priority: 'MEDIUM',
        title: 'Resolve season plan conflict',
        description: 'Season plan has unresolved conflicts.',
        featurePath: 'season',
      });
    }

    // Sort by priority
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Get most recent transfer plan
   */
  getRecentTransferPlan(): TransferPlan | null {
    try {
      const allPlans = this.transferPlanRepository.loadAllPlans();
      if (allPlans.length === 0) return null;

      return allPlans.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
    } catch {
      return null;
    }
  }

  /**
   * Get gameweek plan for specific gameweek
   */
  getGameweekPlan(gameweekId: number): GameweekPlan | null {
    try {
      const plans = this.gameweekPlanRepository.loadAll(gameweekId);
      if (plans.length === 0) return null;

      return plans.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
    } catch {
      return null;
    }
  }

  /**
   * Get most recent season plan
   */
  getRecentSeasonPlan(): SeasonPlan | null {
    try {
      const allPlans = this.seasonPlanRepository.loadAllPlans();
      if (allPlans.length === 0) return null;

      return allPlans.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
    } catch {
      return null;
    }
  }
}
