/**
 * Season Plan Service
 * Orchestrates season planning operations
 */

import type {
  SeasonPlan,
  SeasonPlanEntry,
  ChipPlan,
  SeasonPlanSimulationResult,
  SeasonPlanSummary,
  BaseSquadSourceType,
} from '../domain/SeasonPlan';
import type { SquadPlayer } from '../domain/TransferPlan';
import { SeasonPlanRepository } from './season-plan-repository';
import { SeasonSquadSimulationService } from './season-squad-simulation.service';
import { SeasonPlanValidationService } from './season-plan-validation.service';
import { SquadSourceResolver } from './squad-source-resolver.service';
import { TransferPlanRepository } from './transfer-plan-repository';
import { PlayerRepository } from '@repositories/players';

/**
 * Service for managing season plans
 */
export class SeasonPlanService {
  private repository: SeasonPlanRepository;
  private simulationService: SeasonSquadSimulationService;
  private validationService: SeasonPlanValidationService;
  private squadSourceResolver: SquadSourceResolver;
  private transferPlanRepository: TransferPlanRepository;
  private playerRepository: PlayerRepository;

  constructor(
    repository?: SeasonPlanRepository,
    simulationService?: SeasonSquadSimulationService,
    validationService?: SeasonPlanValidationService,
    squadSourceResolver?: SquadSourceResolver,
    transferPlanRepository?: TransferPlanRepository,
    playerRepository?: PlayerRepository
  ) {
    this.repository = repository || new SeasonPlanRepository();
    this.simulationService = simulationService || new SeasonSquadSimulationService();
    this.validationService = validationService || new SeasonPlanValidationService();
    this.squadSourceResolver = squadSourceResolver || new SquadSourceResolver();
    this.transferPlanRepository = transferPlanRepository || new TransferPlanRepository();
    this.playerRepository = playerRepository || new PlayerRepository();
  }

  /**
   * Create a new season plan
   *
   * @param name - Plan name
   * @param startGameweekId - Starting gameweek
   * @param endGameweekId - Ending gameweek
   * @param baseSquadSource - Base squad source (current or active_planned)
   * @returns New season plan
   */
  createSeasonPlan(
    name: string,
    startGameweekId: number,
    endGameweekId: number,
    baseSquadSource: BaseSquadSourceType = 'current'
  ): SeasonPlan {
    return {
      id: this.generatePlanId(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      startGameweekId,
      endGameweekId,
      baseSquadSource,
      entries: [],
    };
  }

  /**
   * Save a season plan
   *
   * @param plan - Plan to save
   * @returns Saved plan
   */
  savePlan(plan: SeasonPlan): SeasonPlan {
    return this.repository.savePlan(plan);
  }

  /**
   * Load a season plan by ID
   *
   * @param planId - Plan ID
   * @returns Loaded plan or null
   */
  loadPlan(planId: string): SeasonPlan | null {
    return this.repository.loadPlan(planId);
  }

  /**
   * Load all season plans
   *
   * @returns Array of all plans
   */
  loadAllPlans(): SeasonPlan[] {
    return this.repository.loadAllPlans();
  }

  /**
   * Delete a season plan
   *
   * @param planId - Plan ID
   */
  deletePlan(planId: string): void {
    this.repository.deletePlan(planId);
  }

  /**
   * Rename a season plan
   *
   * @param planId - Plan ID
   * @param newName - New name
   */
  renamePlan(planId: string, newName: string): SeasonPlan | null {
    return this.repository.renamePlan(planId, newName);
  }

  /**
   * Duplicate a season plan
   *
   * @param planId - Plan ID
   * @param newName - Name for duplicate
   */
  duplicatePlan(planId: string, newName: string): SeasonPlan | null {
    return this.repository.duplicatePlan(planId, newName);
  }

  /**
   * Add or update an entry in a season plan
   *
   * @param plan - Plan to modify
   * @param entry - Entry to add/update
   * @returns Updated plan
   */
  updateEntry(plan: SeasonPlan, entry: SeasonPlanEntry): SeasonPlan {
    const existingIndex = plan.entries.findIndex((e) => e.gameweekId === entry.gameweekId);

    if (existingIndex >= 0) {
      plan.entries[existingIndex] = entry;
    } else {
      plan.entries.push(entry);
    }

    plan.updatedAt = new Date();
    return plan;
  }

  /**
   * Remove an entry from a season plan
   *
   * @param plan - Plan to modify
   * @param gameweekId - Gameweek to remove
   * @returns Updated plan
   */
  removeEntry(plan: SeasonPlan, gameweekId: number): SeasonPlan {
    plan.entries = plan.entries.filter((e) => e.gameweekId !== gameweekId);
    plan.updatedAt = new Date();
    return plan;
  }

  /**
   * Assign a chip to a gameweek
   *
   * @param plan - Plan to modify
   * @param gameweekId - Gameweek
   * @param chipPlan - Chip to assign
   * @returns Updated plan
   */
  assignChip(plan: SeasonPlan, gameweekId: number, chipPlan: ChipPlan): SeasonPlan {
    let entry = plan.entries.find((e) => e.gameweekId === gameweekId);

    if (!entry) {
      entry = { gameweekId };
      plan.entries.push(entry);
    }

    entry.chipPlan = chipPlan;
    plan.updatedAt = new Date();
    return plan;
  }

  /**
   * Remove a chip from a gameweek
   *
   * @param plan - Plan to modify
   * @param gameweekId - Gameweek
   * @returns Updated plan
   */
  removeChip(plan: SeasonPlan, gameweekId: number): SeasonPlan {
    const entry = plan.entries.find((e) => e.gameweekId === gameweekId);
    if (entry) {
      delete entry.chipPlan;
      plan.updatedAt = new Date();
    }
    return plan;
  }

  /**
   * Simulate and validate a complete season plan
   *
   * @param plan - Plan to simulate
   * @returns Simulation result
   */
  simulateSeasonPlan(plan: SeasonPlan): SeasonPlanSimulationResult {
    // Resolve base squad
    let baseSquad: SquadPlayer[] = [];
    let baseBank = 0;

    if (plan.baseSquadSource === 'current') {
      const resolved = this.squadSourceResolver.resolveCurrentSquad();
      if (resolved) {
        // Convert to SquadPlayer format
        baseSquad = this.buildSquadPlayersFromSource(
          resolved.startingPlayerIds,
          resolved.benchPlayerIds
        );
        baseBank = 0; // Will get from fixtures
      }
    } else if (plan.baseSquadSource === 'active_planned' && plan.baseSquadSourceTransferPlanId) {
      const transferPlan = this.transferPlanRepository.loadPlan(plan.baseSquadSourceTransferPlanId);
      if (transferPlan) {
        baseSquad = transferPlan.validation.isValid ? (transferPlan.transfers as any) : [];
        baseBank = transferPlan.projectedBank;
      }
    }

    // Get actual current squad data to fill in missing pieces
    const resolved = this.squadSourceResolver.resolveCurrentSquad();
    if (resolved) {
      baseSquad = this.buildSquadPlayersFromSource(
        resolved.startingPlayerIds,
        resolved.benchPlayerIds
      );
      baseBank = 0.0; // Default, would be set from manager data
    }

    // Simulate squad evolution
    const { snapshots, conflicts } = this.simulationService.simulateSeasonSquadEvolution(
      plan,
      baseSquad,
      baseBank
    );

    // Validate season plan
    const validation = this.validationService.validateSeasonPlan(plan, snapshots);

    // Build summary
    const summary = this.buildSeasonPlanSummary(plan);

    return {
      seasonPlan: plan,
      gameweeks: [],
      squadSnapshots: snapshots,
      validation,
      conflicts,
      summary,
    };
  }

  /**
   * Build squad players from source IDs
   */
  private buildSquadPlayersFromSource(startingIds: number[], benchIds: number[]): SquadPlayer[] {
    const players = this.playerRepository.getAll();
    const squad: SquadPlayer[] = [];

    startingIds.forEach((playerId) => {
      const player = players.find((p) => p.id === playerId);
      if (player) {
        squad.push({
          playerId,
          position: this.mapPositionToNumber(player.position),
          isStarter: true,
          benchOrder: undefined,
          price: player.price,
          teamId: 0,
          totalPoints: player.totalPoints,
          form: player.form,
        });
      }
    });

    benchIds.forEach((playerId, index) => {
      const player = players.find((p) => p.id === playerId);
      if (player) {
        squad.push({
          playerId,
          position: this.mapPositionToNumber(player.position),
          isStarter: false,
          benchOrder: index,
          price: player.price,
          teamId: 0,
          totalPoints: player.totalPoints,
          form: player.form,
        });
      }
    });

    return squad;
  }

  /**
   * Map position string to FPL number
   */
  private mapPositionToNumber(position: string): number {
    const map: Record<string, number> = {
      GOALKEEPER: 1,
      DEFENDER: 2,
      MIDFIELDER: 6,
      FORWARD: 9,
    };
    return map[position] || 1;
  }

  /**
   * Build season plan summary
   */
  private buildSeasonPlanSummary(plan: SeasonPlan): SeasonPlanSummary {
    const plannedChips = plan.entries
      .filter((e) => e.chipPlan)
      .map((e) => ({
        chipType: e.chipPlan!.chipType,
        gameweekId: e.gameweekId,
      }));

    const gameweekPlans = plan.entries.filter((e) => e.gameweekPlanId).length;
    const plannedTransfers = plan.entries.filter((e) => e.transferPlanId).length;

    return {
      planningHorizon: {
        startGameweekId: plan.startGameweekId,
        endGameweekId: plan.endGameweekId,
        totalGameweeks: plan.endGameweekId - plan.startGameweekId + 1,
      },
      plannedTransfers,
      gameweekPlans,
      plannedChips,
      potentialBGWs: 0, // Will be calculated from fixtures
      potentialDGWs: 0, // Will be calculated from fixtures
      validationIssues: 0, // Will be calculated from validation service
    };
  }

  /**
   * Generate unique plan ID
   */
  private generatePlanId(): string {
    return `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
