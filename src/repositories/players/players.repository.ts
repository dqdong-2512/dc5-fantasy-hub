/**
 * Player Repository
 * Provides access to player data with search capabilities
 * Returns domain models instead of raw normalized data
 */

import type { NormalizedPlayer } from '../types';
import { getDataFiles } from '../data-loader';
import { PlayerMapper } from '@domain/mappers';
import type { Player } from '@domain/models';
import { TeamRepository } from '../teams';

export class PlayerRepository {
  private cache: NormalizedPlayer[] | null = null;
  private teamRepository: TeamRepository;

  constructor() {
    this.teamRepository = new TeamRepository();
  }

  private loadData(): NormalizedPlayer[] {
    if (this.cache) {
      return this.cache;
    }

    const data = getDataFiles();
    this.cache = data.players as NormalizedPlayer[];
    return this.cache;
  }

  private toDomainPlayer(normalized: NormalizedPlayer): Player {
    const team = this.teamRepository.getById(normalized.team);
    const teamName = team ? team.name : `Team ${normalized.team}`;

    return PlayerMapper.toDomain(normalized, teamName, normalized.elementType);
  }

  getAll(): Player[] {
    return this.loadData().map((player) => this.toDomainPlayer(player));
  }

  getById(id: number): Player | null {
    const players = this.loadData();
    const player = players.find((p) => p.id === id) || null;
    return player ? this.toDomainPlayer(player) : null;
  }

  search(name: string): Player[] {
    const players = this.loadData();
    const lowerName = name.toLowerCase();

    const filtered = players.filter((player) => {
      const fullName = `${player.firstName} ${player.secondName}`.toLowerCase();
      const webName = player.webName.toLowerCase();

      return fullName.includes(lowerName) || webName.includes(lowerName);
    });

    return filtered.map((player) => this.toDomainPlayer(player));
  }

  getByTeam(teamId: number): Player[] {
    const players = this.loadData();
    return players
      .filter((player) => player.team === teamId)
      .map((player) => this.toDomainPlayer(player));
  }
}
