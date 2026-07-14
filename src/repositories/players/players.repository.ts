/**
 * Player Repository
 * Provides access to player data with search capabilities
 */

import type { NormalizedPlayer } from '../types';
import { getDataFiles } from '../data-loader';

export class PlayerRepository {
  private cache: NormalizedPlayer[] | null = null;

  private loadData(): NormalizedPlayer[] {
    if (this.cache) {
      return this.cache;
    }

    const data = getDataFiles();
    this.cache = data.players as NormalizedPlayer[];
    return this.cache;
  }

  getAll(): NormalizedPlayer[] {
    return this.loadData();
  }

  getById(id: number): NormalizedPlayer | null {
    const players = this.loadData();
    return players.find((player) => player.id === id) || null;
  }

  search(name: string): NormalizedPlayer[] {
    const players = this.loadData();
    const lowerName = name.toLowerCase();

    return players.filter((player) => {
      const fullName = `${player.firstName} ${player.secondName}`.toLowerCase();
      const webName = player.webName.toLowerCase();

      return fullName.includes(lowerName) || webName.includes(lowerName);
    });
  }

  getByTeam(teamId: number): NormalizedPlayer[] {
    const players = this.loadData();
    return players.filter((player) => player.team === teamId);
  }
}
