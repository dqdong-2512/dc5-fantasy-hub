/**
 * Utility functions for club intelligence
 */

import type { Team } from '@domain/models';

/**
 * Sort clubs by a given field
 */
export class ClubFilterUtil {
  static sortClubs(clubs: Team[], sortBy: string, sortOrder: 'asc' | 'desc'): Team[] {
    const sorted = [...clubs].sort((a, b) => {
      switch (sortBy) {
        case 'name': {
          const comparison = a.name.localeCompare(b.name);
          return sortOrder === 'asc' ? comparison : -comparison;
        }
        case 'strength': {
          const numA = a.strength;
          const numB = b.strength;
          const comparison = numA - numB;
          return sortOrder === 'asc' ? comparison : -comparison;
        }
        default:
          return 0;
      }
    });

    return sorted;
  }
}
