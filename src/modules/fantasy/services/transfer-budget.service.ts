/**
 * Transfer Budget Service
 * Handles budget calculations with honest selling price strategy
 */

import { PlayerRepository } from '@repositories/players';

/**
 * Service for calculating transfer budgets and selling prices
 * Uses estimated selling values with clear labeling when exact data unavailable
 */
export class TransferBudgetService {
  private playerRepo: PlayerRepository;

  constructor(playerRepo?: PlayerRepository) {
    this.playerRepo = playerRepo || new PlayerRepository();
  }

  /**
   * Calculate available budget for a transfer
   * Available Budget = Current Bank + Estimated Selling Value of Out Player
   *
   * @param currentBank - Current manager bank in millions (divided by 10 already)
   * @param outgoingPlayerId - Player being sold
   * @returns Available budget in millions
   */
  calculateAvailableBudget(currentBank: number, outgoingPlayerId: number): number {
    const outPlayer = this.playerRepo.getById(outgoingPlayerId);
    if (!outPlayer) {
      // If player not found, use bank only
      return currentBank;
    }

    const estimatedSellingPrice = this.estimateSellingPrice(outPlayer.price);
    const estimatedSellingValueInMm = estimatedSellingPrice / 10; // Convert from tenths to millions

    return currentBank + estimatedSellingValueInMm;
  }

  /**
   * Estimate selling price for a player
   * Fallback strategy: use current price with clear labeling as "estimated"
   *
   * @param currentPrice - Current player price in tenths (e.g., 75 = £7.5m)
   * @param purchasePrice - Optional: player's purchase price if known
   * @returns Estimated selling price in tenths
   */
  estimateSellingPrice(currentPrice: number, purchasePrice?: number): number {
    // Ideally: compare purchase vs current and use FPL's selling price formula
    // For now: fallback to current price as conservative estimate
    // This can be upgraded when exact selling price rules are known

    if (purchasePrice !== undefined && purchasePrice > 0) {
      // If purchase price known: selling price is often average of purchase and current
      // This is a guess; update when exact FPL formula known
      return Math.floor((purchasePrice + currentPrice) / 2);
    }

    // Without purchase history: use current price as selling estimate
    return currentPrice;
  }

  /**
   * Get selling price label for UI display
   * Clearly indicates whether exact or estimated
   *
   * @param hasExactData - Whether exact FPL selling price is available
   * @returns Label for UI
   */
  getSellingPriceLabel(hasExactData: boolean = false): string {
    return hasExactData ? 'Selling Price' : 'Estimated Selling Price';
  }

  /**
   * Format price for display
   *
   * @param priceInTenths - Price in tenths (e.g., 75 = £7.5m)
   * @returns Formatted string (e.g., "£7.5m")
   */
  formatPrice(priceInTenths: number): string {
    return `£${(priceInTenths / 10).toFixed(1)}m`;
  }

  /**
   * Check if transfer is affordable
   *
   * @param availableBudget - Available budget in millions
   * @param targetPrice - Target player price in millions
   * @returns true if affordable
   */
  isAffordable(availableBudget: number, targetPrice: number): boolean {
    return availableBudget >= targetPrice;
  }

  /**
   * Calculate budget after transfer
   *
   * @param bank - Current bank in millions
   * @param sellingPrice - Selling price in tenths
   * @param purchasePrice - Purchase price in tenths
   * @returns New bank value in millions
   */
  calculateBankAfterTransfer(bank: number, sellingPrice: number, purchasePrice: number): number {
    const sellingValueMm = sellingPrice / 10;
    const purchaseValueMm = purchasePrice / 10;
    return bank + sellingValueMm - purchaseValueMm;
  }
}
