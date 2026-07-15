/**
 * Player Explorer Utilities
 * Filtering, sorting, and search logic
 */

import type { Player } from '@domain/models';
import type { PlayerFilters } from '../types';
import { PlayerFixtureIntelligenceService } from '../services';

export class PlayerFiltersUtil {
  private static fixtureService: PlayerFixtureIntelligenceService | null = null;

  private static getFixtureService(): PlayerFixtureIntelligenceService {
    if (!this.fixtureService) {
      this.fixtureService = new PlayerFixtureIntelligenceService();
    }
    return this.fixtureService;
  }

  static applyFilters(players: Player[], filters: PlayerFilters): Player[] {
    return players
      .filter((player) => this.matchesSearch(player, filters.search))
      .filter((player) => this.matchesPosition(player, filters.positions))
      .filter((player) => this.matchesPriceRange(player, filters.priceRange))
      .filter((player) => this.matchesAvailability(player, filters.availability));
  }

  static sortPlayers(players: Player[], sortBy: string, sortOrder: 'asc' | 'desc'): Player[] {
    const sorted = [...players].sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortBy) {
        case 'name':
          aVal = a.displayName;
          bVal = b.displayName;
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'form':
          aVal = a.form;
          bVal = b.form;
          break;
        case 'points':
          // Total points not yet available in domain model - use default 0 values
          break;
        case 'ownership':
          aVal = a.ownership;
          bVal = b.ownership;
          break;
        case 'avgFdr':
          const fixtureService = this.getFixtureService();
          const aSummary = fixtureService.getPlayerFixtureSummary(a);
          const bSummary = fixtureService.getPlayerFixtureSummary(b);
          aVal = aSummary.avgDifficulty;
          bVal = bSummary.avgDifficulty;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      const numA = typeof aVal === 'number' ? aVal : 0;
      const numB = typeof bVal === 'number' ? bVal : 0;

      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return sorted;
  }

  private static matchesSearch(player: Player, search: string): boolean {
    if (!search.trim()) return true;

    const query = search.toLowerCase();
    return (
      player.displayName.toLowerCase().includes(query) ||
      player.firstName.toLowerCase().includes(query) ||
      player.lastName.toLowerCase().includes(query)
    );
  }

  private static matchesPosition(player: Player, positions: string[]): boolean {
    if (!positions.length) return true;
    return positions.includes(player.position);
  }

  private static matchesPriceRange(player: Player, [min, max]: [number, number]): boolean {
    return player.price >= min && player.price <= max;
  }

  private static matchesAvailability(player: Player, availability: string): boolean {
    if (availability === 'all') return true;
    if (availability === 'expensive') return player.price >= 9;
    if (availability === 'cheap') return player.price <= 5;
    if (availability === 'available') return player.ownership < 50;
    return true;
  }
}
