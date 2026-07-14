/**
 * Bootstrap Repository
 * Provides access to normalized bootstrap information
 */

import type {
  BootstrapData,
  NormalizedGameweek,
  NormalizedElementType,
  NormalizedTeam,
  NormalizedPlayer,
} from '../types';
import { getDataFiles } from '../data-loader';

export class BootstrapRepository {
  private cache: BootstrapData | null = null;

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

  getBootstrap(): BootstrapData {
    return this.loadData();
  }

  getCurrentGameweek(): NormalizedGameweek | null {
    const bootstrap = this.loadData();
    const current = bootstrap.gameweeks.find((gw: NormalizedGameweek) => !gw.finished);
    return current || null;
  }

  getGameweekById(id: number): NormalizedGameweek | null {
    const bootstrap = this.loadData();
    return bootstrap.gameweeks.find((gw: NormalizedGameweek) => gw.id === id) || null;
  }

  getElementType(id: number): NormalizedElementType | null {
    const bootstrap = this.loadData();
    return bootstrap.elementTypes.find((et: NormalizedElementType) => et.id === id) || null;
  }
}
