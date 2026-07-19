/**
 * Gameweek Plan Repository
 * Manages persistence of gameweek plans to localStorage
 */

import type { GameweekPlan } from '../domain/GameweekPlan';

const STORAGE_KEY_PREFIX = 'gameweek_plans';

interface StoredGameweekPlan {
  id: string;
  name: string;
  gameweekId: number;
  sourceType: 'current' | 'planned';
  sourceTransferPlanId?: string;
  createdAt: string;
  updatedAt: string;
  startingPlayerIds: number[];
  benchPlayerIds: number[];
  captainPlayerId: number | null;
  viceCaptainPlayerId: number | null;
  sourceStartingPlayerIds: number[];
  sourceBenchPlayerIds: number[];
  sourceCaptainPlayerId: number | null;
  sourceViceCaptainPlayerId: number | null;
}

export class GameweekPlanRepository {
  /**
   * Get storage key for a specific gameweek
   */
  private getStorageKey(gameweekId: number): string {
    return `${STORAGE_KEY_PREFIX}_gw${gameweekId}`;
  }

  /**
   * Save a plan
   */
  savePlan(plan: GameweekPlan): void {
    const key = this.getStorageKey(plan.gameweekId);
    const stored = this.loadAll(plan.gameweekId);

    // Remove if exists and add new version
    const filtered = stored.filter((p) => p.id !== plan.id);
    const storedPlan = this.toStorageFormat(plan);
    filtered.push(storedPlan as any);

    try {
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to save gameweek plan', e);
    }
  }

  /**
   * Load all plans for a gameweek
   */
  loadAll(gameweekId: number): GameweekPlan[] {
    const key = this.getStorageKey(gameweekId);

    try {
      const data = localStorage.getItem(key);
      if (!data) {
        return [];
      }

      const stored: StoredGameweekPlan[] = JSON.parse(data);
      return stored.map((p) => this.fromStorageFormat(p));
    } catch (e) {
      console.error('Failed to load gameweek plans', e);
      return [];
    }
  }

  /**
   * Get a specific plan
   */
  getById(gameweekId: number, planId: string): GameweekPlan | null {
    const plans = this.loadAll(gameweekId);
    return plans.find((p) => p.id === planId) || null;
  }

  /**
   * Delete a plan
   */
  deletePlan(gameweekId: number, planId: string): void {
    const key = this.getStorageKey(gameweekId);
    const plans = this.loadAll(gameweekId);
    const filtered = plans.filter((p) => p.id !== planId);

    try {
      if (filtered.length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(filtered.map((p) => this.toStorageFormat(p))));
      }
    } catch (e) {
      console.error('Failed to delete gameweek plan', e);
    }
  }

  /**
   * Convert plan to storage format (ISO strings for dates)
   */
  private toStorageFormat(plan: GameweekPlan): StoredGameweekPlan {
    return {
      id: plan.id,
      name: plan.name,
      gameweekId: plan.gameweekId,
      sourceType: plan.sourceType,
      sourceTransferPlanId: plan.sourceTransferPlanId,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
      startingPlayerIds: plan.startingPlayerIds,
      benchPlayerIds: plan.benchPlayerIds,
      captainPlayerId: plan.captainPlayerId,
      viceCaptainPlayerId: plan.viceCaptainPlayerId,
      sourceStartingPlayerIds: plan.sourceStartingPlayerIds,
      sourceBenchPlayerIds: plan.sourceBenchPlayerIds,
      sourceCaptainPlayerId: plan.sourceCaptainPlayerId,
      sourceViceCaptainPlayerId: plan.sourceViceCaptainPlayerId,
    };
  }

  /**
   * Convert storage format to plan (parse ISO strings)
   */
  private fromStorageFormat(stored: StoredGameweekPlan): GameweekPlan {
    return {
      id: stored.id,
      name: stored.name,
      gameweekId: stored.gameweekId,
      sourceType: stored.sourceType,
      sourceTransferPlanId: stored.sourceTransferPlanId,
      createdAt: new Date(stored.createdAt),
      updatedAt: new Date(stored.updatedAt),
      startingPlayerIds: stored.startingPlayerIds,
      benchPlayerIds: stored.benchPlayerIds,
      captainPlayerId: stored.captainPlayerId,
      viceCaptainPlayerId: stored.viceCaptainPlayerId,
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
      },
      sourceStartingPlayerIds: stored.sourceStartingPlayerIds,
      sourceBenchPlayerIds: stored.sourceBenchPlayerIds,
      sourceCaptainPlayerId: stored.sourceCaptainPlayerId,
      sourceViceCaptainPlayerId: stored.sourceViceCaptainPlayerId,
    };
  }
}
