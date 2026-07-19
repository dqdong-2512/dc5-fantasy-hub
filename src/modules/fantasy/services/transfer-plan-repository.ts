/**
 * Transfer Plan Repository
 * Handles localStorage persistence of transfer plans
 * Uses stable player IDs instead of full player objects
 */

import type { TransferPlan } from '../domain/TransferPlan';

const STORAGE_KEY = 'fpl_transfer_plans';

/**
 * Repository for persisting transfer plans to localStorage
 */
export class TransferPlanRepository {
  /**
   * Save a transfer plan
   * Returns the saved plan with ID
   *
   * @param plan - Plan to save
   * @returns Saved plan
   */
  savePlan(plan: TransferPlan): TransferPlan {
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
      console.error('Failed to save transfer plan:', err);
      throw new Error('Failed to save transfer plan');
    }
  }

  /**
   * Load a single transfer plan by ID
   *
   * @param planId - Plan ID
   * @returns Plan or null if not found
   */
  loadPlan(planId: string): TransferPlan | null {
    try {
      const plans = this.loadAllPlans();
      const plan = plans.find((p) => p.id === planId);

      if (plan) {
        // Revalidate on load (in case player data changed)
        return this.revalidatePlan(plan);
      }

      return null;
    } catch (err) {
      console.error('Failed to load transfer plan:', err);
      return null;
    }
  }

  /**
   * Load all saved transfer plans
   *
   * @returns Array of all plans
   */
  loadAllPlans(): TransferPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const plans = JSON.parse(data) as TransferPlan[];

      // Restore dates
      return plans.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
    } catch (err) {
      console.warn('Failed to load transfer plans from localStorage:', err);
      return [];
    }
  }

  /**
   * Delete a transfer plan
   *
   * @param planId - Plan ID
   * @returns true if deleted
   */
  deletePlan(planId: string): boolean {
    try {
      const plans = this.loadAllPlans();
      const filtered = plans.filter((p) => p.id !== planId);

      if (filtered.length === plans.length) {
        // Nothing was deleted
        return false;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error('Failed to delete transfer plan:', err);
      return false;
    }
  }

  /**
   * Rename a transfer plan
   *
   * @param planId - Plan ID
   * @param newName - New name
   * @returns Updated plan or null if not found
   */
  renamePlan(planId: string, newName: string): TransferPlan | null {
    try {
      const plan = this.loadPlan(planId);
      if (!plan) return null;

      const updated = {
        ...plan,
        name: newName,
        updatedAt: new Date(),
      };

      this.savePlan(updated);
      return updated;
    } catch (err) {
      console.error('Failed to rename transfer plan:', err);
      return null;
    }
  }

  /**
   * Duplicate a transfer plan
   *
   * @param planId - Plan ID to duplicate
   * @param newName - Name for duplicate
   * @returns New plan or null if source not found
   */
  duplicatePlan(planId: string, newName?: string): TransferPlan | null {
    try {
      const originalPlan = this.loadPlan(planId);
      if (!originalPlan) return null;

      const duplicate: TransferPlan = {
        ...originalPlan,
        id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newName || `${originalPlan.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.savePlan(duplicate);
      return duplicate;
    } catch (err) {
      console.error('Failed to duplicate transfer plan:', err);
      return null;
    }
  }

  /**
   * Clear all transfer plans
   *
   * @returns Number of plans cleared
   */
  clearAllPlans(): number {
    try {
      const plans = this.loadAllPlans();
      const count = plans.length;
      localStorage.removeItem(STORAGE_KEY);
      return count;
    } catch (err) {
      console.error('Failed to clear transfer plans:', err);
      return 0;
    }
  }

  /**
   * Revalidate a plan against current player data
   * Checks if all player IDs still exist
   *
   * @param plan - Plan to revalidate
   * @returns Revalidated plan (may have validation errors if players no longer exist)
   */
  private revalidatePlan(plan: TransferPlan): TransferPlan {
    // This is where we'd check if referenced player IDs still exist
    // For now, just return the plan as-is
    // In a full implementation, would check each player ID against current database
    return plan;
  }
}
