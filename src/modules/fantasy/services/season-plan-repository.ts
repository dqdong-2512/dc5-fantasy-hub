/**
 * Season Plan Repository
 * Handles localStorage persistence of season plans
 * Uses stable IDs and references instead of duplicating full plan data
 */

import type { SeasonPlan } from '../domain/SeasonPlan';

const STORAGE_KEY = 'fpl_season_plans';

/**
 * Repository for persisting season plans to localStorage
 */
export class SeasonPlanRepository {
  /**
   * Save a season plan
   *
   * @param plan - Plan to save
   * @returns Saved plan
   */
  savePlan(plan: SeasonPlan): SeasonPlan {
    try {
      const plans = this.loadAllPlans();

      // Check if updating existing
      const existingIndex = plans.findIndex((p) => p.id === plan.id);
      if (existingIndex >= 0) {
        plans[existingIndex] = {
          ...plan,
          updatedAt: new Date(),
        };
      } else {
        plans.push({
          ...plan,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
      return plan;
    } catch (err) {
      console.error('Failed to save season plan:', err);
      throw new Error('Failed to save season plan');
    }
  }

  /**
   * Load a single season plan by ID
   *
   * @param planId - Plan ID
   * @returns Plan or null if not found
   */
  loadPlan(planId: string): SeasonPlan | null {
    try {
      const plans = this.loadAllPlans();
      return plans.find((p) => p.id === planId) || null;
    } catch (err) {
      console.error('Failed to load season plan:', err);
      return null;
    }
  }

  /**
   * Load all saved season plans
   *
   * @returns Array of all plans
   */
  loadAllPlans(): SeasonPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const plans = JSON.parse(data) as SeasonPlan[];

      // Restore dates
      return plans.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
    } catch (err) {
      console.warn('Failed to load season plans from localStorage:', err);
      return [];
    }
  }

  /**
   * Delete a season plan
   *
   * @param planId - Plan ID
   */
  deletePlan(planId: string): void {
    try {
      const plans = this.loadAllPlans();
      const filtered = plans.filter((p) => p.id !== planId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.error('Failed to delete season plan:', err);
      throw new Error('Failed to delete season plan');
    }
  }

  /**
   * Rename a season plan
   *
   * @param planId - Plan ID
   * @param newName - New name
   */
  renamePlan(planId: string, newName: string): SeasonPlan | null {
    const plan = this.loadPlan(planId);
    if (!plan) return null;

    const updated = { ...plan, name: newName, updatedAt: new Date() };
    this.savePlan(updated);
    return updated;
  }

  /**
   * Duplicate a season plan
   *
   * @param planId - Plan ID to duplicate
   * @param newName - Name for duplicated plan
   * @returns New duplicated plan
   */
  duplicatePlan(planId: string, newName: string): SeasonPlan | null {
    const original = this.loadPlan(planId);
    if (!original) return null;

    const duplicated: SeasonPlan = {
      ...original,
      id: this.generatePlanId(),
      name: newName,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Keep all entries and references as-is (don't duplicate referenced plans)
    };

    this.savePlan(duplicated);
    return duplicated;
  }

  /**
   * Generate a unique plan ID
   */
  private generatePlanId(): string {
    return `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
