/**
 * Team Repository
 * Provides access to team data
 */

import type { NormalizedTeam } from '../types';
import { getDataFiles } from '../data-loader';

export class TeamRepository {
  private cache: NormalizedTeam[] | null = null;

  private loadData(): NormalizedTeam[] {
    if (this.cache) {
      return this.cache;
    }

    const data = getDataFiles();
    this.cache = data.teams as NormalizedTeam[];
    return this.cache;
  }

  getAll(): NormalizedTeam[] {
    return this.loadData();
  }

  getById(id: number): NormalizedTeam | null {
    const teams = this.loadData();
    return teams.find((team) => team.id === id) || null;
  }
}
