/**
 * Squad Source Resolver Service
 * Handles loading squad data from different sources (current squad, planned squad)
 */

import type { Player } from '@domain/models';
import { fantasyGameFixtures } from '../fixtures';
import { PlayerRepository } from '@repositories/players';
import { GameweekPlanRepository } from './gameweek-plan-repository.service';
import type { SquadSourceType } from '../domain/GameweekPlan';

export interface ResolvedSquadSource {
  sourceType: SquadSourceType;
  sourceTransferPlanId?: string;
  startingPlayerIds: number[];
  benchPlayerIds: number[];
  captainPlayerId: number | null;
  viceCaptainPlayerId: number | null;
  players: Map<number, Player>;
}

export class SquadSourceResolver {
  private playerRepository: PlayerRepository;
  private gameweekPlanRepository: GameweekPlanRepository;

  constructor() {
    this.playerRepository = new PlayerRepository();
    this.gameweekPlanRepository = new GameweekPlanRepository();
  }

  /**
   * Resolve current squad from fixtures
   */
  resolveCurrentSquad(): ResolvedSquadSource | null {
    try {
      const squad = fantasyGameFixtures.squad;
      if (!squad || !Array.isArray(squad)) {
        return null;
      }

      const startingPlayerIds: number[] = [];
      const benchPlayerIds: number[] = [];

      squad.forEach((pick: any) => {
        if (pick.isStarter) {
          startingPlayerIds.push(pick.playerId);
        } else {
          benchPlayerIds.push(pick.playerId);
        }
      });

      // Get player objects
      const players = new Map<number, Player>();
      const allPlayers = this.playerRepository.getAll();
      allPlayers.forEach((p) => {
        players.set(p.id, p);
      });

      // Get captain and vice captain from squad if marked
      let captain: number | null = null;
      let viceCaptain: number | null = null;

      squad.forEach((pick: any) => {
        if (pick.isCaptain) {
          captain = pick.playerId;
        }
        if (pick.isViceCaptain) {
          viceCaptain = pick.playerId;
        }
      });

      return {
        sourceType: 'current',
        startingPlayerIds,
        benchPlayerIds,
        captainPlayerId: captain,
        viceCaptainPlayerId: viceCaptain,
        players,
      };
    } catch (e) {
      console.error('Failed to resolve current squad', e);
      return null;
    }
  }

  /**
   * Resolve planned squad from gameweek plan (from another gameweek)
   */
  resolvePlannedSquad(gameweekPlanId: string, gameweekId: number): ResolvedSquadSource | null {
    try {
      const plan = this.gameweekPlanRepository.getById(gameweekId, gameweekPlanId);
      if (!plan) {
        return null;
      }

      // Get player objects
      const players = new Map<number, Player>();
      const allPlayers = this.playerRepository.getAll();
      allPlayers.forEach((p) => {
        players.set(p.id, p);
      });

      return {
        sourceType: 'planned',
        sourceTransferPlanId: gameweekPlanId,
        startingPlayerIds: plan.startingPlayerIds,
        benchPlayerIds: plan.benchPlayerIds,
        captainPlayerId: plan.captainPlayerId,
        viceCaptainPlayerId: plan.viceCaptainPlayerId,
        players,
      };
    } catch (e) {
      console.error('Failed to resolve planned squad', e);
      return null;
    }
  }

  /**
   * Get available gameweek plans
   */
  getAvailableGameweekPlans(gameweekId: number): Array<{ id: string; name: string }> {
    try {
      const plans = this.gameweekPlanRepository.loadAll(gameweekId);
      return plans.map((p) => ({
        id: p.id,
        name: p.name,
      }));
    } catch (e) {
      console.error('Failed to get gameweek plans', e);
      return [];
    }
  }

  /**
   * Validate squad source is still valid
   */
  isSourceValid(
    sourceType: SquadSourceType,
    sourceTransferPlanId?: string,
    gameweekId?: number
  ): boolean {
    if (sourceType === 'current') {
      return this.resolveCurrentSquad() !== null;
    }

    if (sourceType === 'planned' && sourceTransferPlanId && gameweekId) {
      return this.resolvePlannedSquad(sourceTransferPlanId, gameweekId) !== null;
    }

    return false;
  }
}
