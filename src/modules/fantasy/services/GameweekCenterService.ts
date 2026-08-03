/**
 * Gameweek Center Service
 * Resolves gameweek data architecture:
 * - Public FPL gameweek data (status, fixtures)
 * - Manager-specific snapshots (points, contributions)
 * - Derives gameweek status from available data
 */

import { BootstrapRepository } from '@repositories/bootstrap';
import { FixtureRepository } from '@repositories/fixtures';
import type { Gameweek } from '@domain/models';
import { GameweekStatus } from '@domain/models';
import type { GameweekCenterData, ManagerGameweekSnapshot } from '@domain/models';

export class GameweekCenterService {
  private bootstrapRepository: BootstrapRepository;
  private fixtureRepository: FixtureRepository;

  constructor() {
    this.bootstrapRepository = new BootstrapRepository();
    this.fixtureRepository = new FixtureRepository();
  }

  /**
   * Derive gameweek status from available data
   * Checks gameweek finished flag and fixture statuses
   */
  private deriveGameweekStatus(gameweek: Gameweek): GameweekStatus {
    if (gameweek.finished) {
      return GameweekStatus.Finished;
    }

    // Check if any fixtures are in progress
    try {
      const fixtures = this.fixtureRepository.getByGameweek(gameweek.id);
      const hasInProgressFixtures = fixtures.some((f) => f.started && !f.finished);

      if (hasInProgressFixtures) {
        return GameweekStatus.InProgress;
      }
    } catch {
      // If fixture data unavailable, use gameweek finished flag
    }

    return GameweekStatus.Upcoming;
  }

  /**
   * Get gameweek center data for a specific gameweek
   * Combines public FPL data with manager snapshot if available
   */
  getGameweekCenterData(gameweekId: number, managerId?: number): GameweekCenterData | null {
    // Get public gameweek data
    const gameweek = this.bootstrapRepository.getGameweekById(gameweekId);

    if (!gameweek) {
      return null;
    }

    const status = this.deriveGameweekStatus(gameweek);

    // Get manager snapshot if available
    let managerSnapshot: ManagerGameweekSnapshot | undefined;
    let hasMissingSnapshot = false;

    if (managerId) {
      // Manager data is loaded asynchronously by the page hooks. Never inject local demo
      // snapshots into a runtime route when the public picks endpoint is unavailable.
      managerSnapshot = undefined;
      hasMissingSnapshot = true;
    }

    return {
      gameweek: {
        id: gameweek.id,
        name: gameweek.name,
        deadline: gameweek.deadline,
        finished: gameweek.finished,
      },
      status,
      managerSnapshot,
      hasMissingSnapshot,
    };
  }

  /**
   * Get available gameweek IDs that have manager snapshots
   */
  getAvailableGameweekIds(): number[] {
    try {
      // This would eventually come from manager's history API
      // For now, use available snapshots
      const bootstrap = this.bootstrapRepository.getBootstrap();
      const allGameweeks = bootstrap.gameweeks.map((gw) => gw.id);
      return allGameweeks.sort((a, b) => b - a);
    } catch {
      return [];
    }
  }

  /**
   * Get the latest/current available gameweek
   */
  getLatestGameweek(): Gameweek | null {
    try {
      const current = this.bootstrapRepository.getCurrentGameweek();
      if (current) {
        return current;
      }

      // If no current gameweek (season finished), get latest.
      // During pre-season getCurrentGameweek resolves the first unfinished event (GW1).
      const bootstrap = this.bootstrapRepository.getBootstrap();
      return bootstrap.gameweeks[bootstrap.gameweeks.length - 1] || null;
    } catch {
      return null;
    }
  }

  /**
   * Format gameweek status for display
   */
  static formatStatus(status: GameweekStatus): string {
    switch (status) {
      case GameweekStatus.Finished:
        return 'Finished';
      case GameweekStatus.InProgress:
        return 'In Progress';
      case GameweekStatus.Upcoming:
        return 'Upcoming';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get status color for display
   */
  static getStatusColor(status: GameweekStatus): string {
    switch (status) {
      case GameweekStatus.Finished:
        return '#4caf50'; // Green
      case GameweekStatus.InProgress:
        return '#ff9800'; // Orange
      case GameweekStatus.Upcoming:
        return '#1976d2'; // Blue
      default:
        return '#757575'; // Grey
    }
  }
}
