/**
 * Team Repository
 * Provides access to team data
 * Returns domain models instead of raw normalized data
 */

import type { NormalizedTeam } from '../types';
import { getDataFiles } from '../data-loader';
import { TeamMapper } from '@domain/mappers';
import type { Team } from '@domain/models';

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

  getAll(): Team[] {
    return this.loadData().map((team) => TeamMapper.toDomain(team));
  }

  getById(id: number): Team | null {
    const teams = this.loadData();
    const team = teams.find((t) => t.id === id) || null;
    return team ? TeamMapper.toDomain(team) : null;
  }
}
