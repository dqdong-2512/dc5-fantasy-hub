/**
 * Bootstrap Repository
 * Provides access to bootstrap information
 * Returns domain models instead of raw normalized data
 */

import type {
  BootstrapData,
  NormalizedGameweek,
  NormalizedElementType,
  NormalizedTeam,
  NormalizedPlayer,
} from '../types';
import { getDataFiles } from '../data-loader';
import { GameweekMapper, PlayerMapper, TeamMapper } from '@domain/mappers';
import type { Player, Team, Gameweek } from '@domain/models';

export interface DomainBootstrapData {
  teams: Team[];
  players: Player[];
  gameweeks: Gameweek[];
  elementTypes: NormalizedElementType[];
}

export class BootstrapRepository {
  private cache: BootstrapData | null = null;
  private domainCache: DomainBootstrapData | null = null;

  private loadData(): BootstrapData {
    if (this.cache) {
      return this.cache;
    }

    const data = getDataFiles();

    this.cache = {
      teams: data.teams as NormalizedTeam[],
      players: data.players as NormalizedPlayer[],
      gameweeks: data.gameweeks as NormalizedGameweek[],
      elementTypes: data.elementTypes as NormalizedElementType[],
    };

    return this.cache as BootstrapData;
  }

  getBootstrap(): DomainBootstrapData {
    if (this.domainCache) {
      return this.domainCache;
    }

    const normalized = this.loadData();
    const teamMap = new Map(normalized.teams.map((t: NormalizedTeam) => [t.id, t]));

    this.domainCache = {
      teams: normalized.teams.map((t: NormalizedTeam) => TeamMapper.toDomain(t)),
      players: normalized.players.map((p: NormalizedPlayer) => {
        const team = teamMap.get(p.team);
        const teamName = team ? team.name : `Team ${p.team}`;
        return PlayerMapper.toDomain(p, teamName, p.elementType);
      }),
      gameweeks: normalized.gameweeks.map((gw: NormalizedGameweek) => GameweekMapper.toDomain(gw)),
      elementTypes: normalized.elementTypes,
    };

    return this.domainCache;
  }

  getCurrentGameweek(): Gameweek | null {
    const normalized = this.loadData();
    // Try to find the first unfinished gameweek
    let current = normalized.gameweeks.find((gw: NormalizedGameweek) => !gw.finished);

    // If all gameweeks are finished (completed season), use the latest gameweek
    if (!current && normalized.gameweeks.length > 0) {
      current = normalized.gameweeks[normalized.gameweeks.length - 1];
    }

    return current ? GameweekMapper.toDomain(current) : null;
  }

  getLatestGameweek(): Gameweek | null {
    const normalized = this.loadData();
    if (normalized.gameweeks.length === 0) {
      return null;
    }
    const latest = normalized.gameweeks[normalized.gameweeks.length - 1];
    return GameweekMapper.toDomain(latest);
  }

  getGameweekById(id: number): Gameweek | null {
    const normalized = this.loadData();
    const gameweek = normalized.gameweeks.find((gw: NormalizedGameweek) => gw.id === id);
    return gameweek ? GameweekMapper.toDomain(gameweek) : null;
  }

  getElementType(id: number): NormalizedElementType | null {
    const normalized = this.loadData();
    return normalized.elementTypes.find((et: NormalizedElementType) => et.id === id) || null;
  }
}
