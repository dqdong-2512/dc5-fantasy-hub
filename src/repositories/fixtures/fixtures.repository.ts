/**
 * Fixture Repository
 * Provides access to fixture data with comprehensive query capabilities
 * Returns domain models instead of raw normalized data
 */

import type { NormalizedFixture } from '../types';
import { getDataFiles } from '../data-loader';
import { FixtureMapper } from '@domain/mappers';
import type { Fixture } from '@domain/models';
import { TeamRepository } from '../teams';

export class FixtureRepository {
  private cache: NormalizedFixture[] | null = null;
  private domainCache: Map<number, Fixture> = new Map();
  private teamRepository: TeamRepository;

  constructor() {
    this.teamRepository = new TeamRepository();
  }

  private loadData(): NormalizedFixture[] {
    if (this.cache) {
      return this.cache;
    }

    const data = getDataFiles();
    this.cache = (data.fixtures as NormalizedFixture[]) || [];
    return this.cache;
  }

  private toDomainFixture(normalized: NormalizedFixture): Fixture {
    if (this.domainCache.has(normalized.id)) {
      return this.domainCache.get(normalized.id)!;
    }

    const homeTeam = this.teamRepository.getById(normalized.homeTeamId);
    const awayTeam = this.teamRepository.getById(normalized.awayTeamId);

    if (!homeTeam || !awayTeam) {
      throw new Error(
        `Teams not found for fixture ${normalized.id} (home: ${normalized.homeTeamId}, away: ${normalized.awayTeamId})`
      );
    }

    const fixture = FixtureMapper.toDomain(normalized, homeTeam, awayTeam);
    this.domainCache.set(normalized.id, fixture);

    return fixture;
  }

  /**
   * Get all fixtures
   */
  getAll(): Fixture[] {
    return this.loadData().map((fixture) => this.toDomainFixture(fixture));
  }

  /**
   * Get fixtures by gameweek
   */
  getByGameweek(gameweek: number): Fixture[] {
    return this.loadData()
      .filter((fixture) => fixture.gameweek === gameweek)
      .map((fixture) => this.toDomainFixture(fixture));
  }

  /**
   * Get upcoming fixtures
   */
  getUpcoming(): Fixture[] {
    return this.loadData()
      .filter((fixture) => !fixture.finished)
      .map((fixture) => this.toDomainFixture(fixture));
  }

  /**
   * Get finished fixtures
   */
  getFinished(): Fixture[] {
    return this.loadData()
      .filter((fixture) => fixture.finished)
      .map((fixture) => this.toDomainFixture(fixture));
  }

  /**
   * Get fixtures for a specific team (home or away)
   */
  getByTeam(teamId: number): Fixture[] {
    return this.loadData()
      .filter((fixture) => fixture.homeTeamId === teamId || fixture.awayTeamId === teamId)
      .map((fixture) => this.toDomainFixture(fixture));
  }

  /**
   * Get upcoming fixtures for a specific team (home or away)
   */
  getUpcomingByTeam(teamId: number): Fixture[] {
    return this.loadData()
      .filter(
        (fixture) =>
          (fixture.homeTeamId === teamId || fixture.awayTeamId === teamId) && !fixture.finished
      )
      .map((fixture) => this.toDomainFixture(fixture));
  }

  /**
   * Get fixture by ID
   */
  getById(id: number): Fixture | null {
    const normalized = this.loadData().find((f) => f.id === id);
    return normalized ? this.toDomainFixture(normalized) : null;
  }
}
