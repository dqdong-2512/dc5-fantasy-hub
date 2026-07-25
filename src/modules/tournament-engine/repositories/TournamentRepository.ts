import type {
  TournamentFixture,
  TournamentFixtureRaw,
  TournamentFixtureStatusRaw,
  TournamentGroupRaw,
  TournamentPlayer,
  TournamentPlayerRaw,
  TournamentTeam,
  TournamentSnapshotPayload,
} from '../models/tournament-engine.models';
import type { TournamentProvider } from '../providers/TournamentProvider';
import { TournamentDatasetNormalizer } from '../normalizer';
import { TournamentDatasetValidator } from '../validator';

export interface TournamentPlayerQuery {
  search?: string;
  nation?: string;
  position?: string;
  sortBy?:
    'name' | 'goals' | 'assists' | 'minutes' | 'yellowCards' | 'redCards' | 'appearances' | 'age';
  sortOrder?: 'asc' | 'desc';
}

export interface TournamentFixtureQuery {
  status?: TournamentFixture['status'];
  stageIncludes?: string;
  teamId?: number;
  localDateKey?: string;
  timeZone?: string;
}

export interface TournamentGroupQuery {
  groupId?: string;
}

export class TournamentRepository {
  private cache: TournamentSnapshotPayload | null = null;

  private inFlight: Promise<TournamentSnapshotPayload> | null = null;

  private readonly validator = new TournamentDatasetValidator();

  private readonly normalizer = new TournamentDatasetNormalizer();

  constructor(private readonly provider: TournamentProvider) {}

  public async getSnapshot(forceRefresh = false): Promise<TournamentSnapshotPayload> {
    const ttlMs = 30000;
    const now = Date.now();

    if (!forceRefresh && this.cache && now - this.cache.updatedAt < ttlMs) {
      return this.cache;
    }

    if (this.inFlight) {
      return this.inFlight;
    }

    this.inFlight = this.provider.loadSnapshot(forceRefresh);

    try {
      const payload = await this.inFlight;
      const warnings = this.validator.validate(payload.data).warnings;
      const normalizedData = this.normalizer.normalize(payload.data);
      const normalizedPayload: TournamentSnapshotPayload = {
        ...payload,
        data: normalizedData,
        warnings: [...(payload.warnings ?? []), ...warnings],
      };
      this.cache = normalizedPayload;
      return normalizedPayload;
    } finally {
      this.inFlight = null;
    }
  }

  public invalidate(): void {
    this.cache = null;
    this.provider.invalidate();
  }

  public async queryPlayers(query: TournamentPlayerQuery = {}): Promise<TournamentPlayer[]> {
    const payload = await this.getSnapshot();
    const teamMap = this.createTeamMap(payload.data.teams);
    const players = this.clonePlayers(payload.data.players, teamMap);
    const normalizedSearch = query.search?.trim().toLowerCase() ?? '';

    return players
      .filter((player) => {
        if (query.position && player.position !== query.position) {
          return false;
        }

        if (query.nation && player.nation.name !== query.nation) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return (
          player.name.toLowerCase().includes(normalizedSearch) ||
          player.nation.name.toLowerCase().includes(normalizedSearch) ||
          player.club.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((left, right) => this.sortPlayers(left, right, query.sortBy, query.sortOrder));
  }

  public async queryFixtures(query: TournamentFixtureQuery = {}): Promise<TournamentFixture[]> {
    const payload = await this.getSnapshot();
    const teamMap = this.createTeamMap(payload.data.teams);
    const fixtures = this.cloneFixtures(payload.data.fixtures, teamMap);

    return fixtures.filter((fixture) => {
      if (query.status && fixture.status !== query.status) {
        return false;
      }

      if (
        query.stageIncludes &&
        !fixture.stage.toLowerCase().includes(query.stageIncludes.toLowerCase())
      ) {
        return false;
      }

      if (
        query.teamId &&
        fixture.homeTeam.id !== query.teamId &&
        fixture.awayTeam.id !== query.teamId
      ) {
        return false;
      }

      if (query.localDateKey && query.timeZone) {
        const dateKey = new Intl.DateTimeFormat('en-CA', {
          timeZone: query.timeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(fixture.kickoff));

        if (dateKey !== query.localDateKey) {
          return false;
        }
      }

      return true;
    });
  }

  public async queryGroups(query: TournamentGroupQuery = {}): Promise<TournamentGroupRaw[]> {
    const payload = await this.getSnapshot();
    const groups = payload.data.groups.map((group) => ({
      ...group,
      standings: group.standings.map((standing) => ({ ...standing })),
    }));

    if (!query.groupId) {
      return groups;
    }

    return groups.filter((group) => group.id === query.groupId);
  }

  private clonePlayers(
    players: TournamentPlayerRaw[],
    teamMap: Map<number, TournamentTeam>
  ): TournamentPlayer[] {
    return players.map((player) => ({
      id: player.id,
      name: player.name,
      nation: teamMap.get(player.nationTeamId) ?? this.createUnknownTeam(player.nationTeamId),
      club: player.club,
      position: player.position,
      age: this.toOptionalNumber(player.age),
      appearances: this.toOptionalNumber(player.appearances),
      goals: player.goals,
      assists: player.assists,
      minutes: player.minutes,
      yellowCards: player.yellowCards,
      redCards: player.redCards,
    }));
  }

  private cloneFixtures(
    fixtures: TournamentFixtureRaw[],
    teamMap: Map<number, TournamentTeam>
  ): TournamentFixture[] {
    return fixtures.map((fixture) => ({
      id: fixture.id,
      stage: fixture.stage,
      kickoff: fixture.kickoff,
      venue: fixture.venue,
      homeTeam: teamMap.get(fixture.homeTeamId) ?? this.createUnknownTeam(fixture.homeTeamId),
      awayTeam: teamMap.get(fixture.awayTeamId) ?? this.createUnknownTeam(fixture.awayTeamId),
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      status: this.mapFixtureStatus(fixture.status),
      minute: fixture.minute ?? null,
      addedTime: fixture.addedTime ?? null,
      note: fixture.note ?? null,
    }));
  }

  private sortPlayers(
    left: TournamentPlayer,
    right: TournamentPlayer,
    sortBy?: TournamentPlayerQuery['sortBy'],
    sortOrder: TournamentPlayerQuery['sortOrder'] = 'desc'
  ): number {
    if (!sortBy || sortBy === 'name') {
      const result = left.name.localeCompare(right.name);
      return sortOrder === 'asc' ? result : -result;
    }

    const leftValue = this.getPlayerSortValue(left, sortBy);
    const rightValue = this.getPlayerSortValue(right, sortBy);
    if (leftValue === rightValue) {
      return left.name.localeCompare(right.name);
    }

    return sortOrder === 'asc' ? leftValue - rightValue : rightValue - leftValue;
  }

  private getPlayerSortValue(
    player: TournamentPlayer,
    sortBy: Exclude<TournamentPlayerQuery['sortBy'], undefined>
  ): number {
    if (sortBy === 'goals') {
      return player.goals;
    }
    if (sortBy === 'assists') {
      return player.assists;
    }
    if (sortBy === 'minutes') {
      return player.minutes;
    }
    if (sortBy === 'yellowCards') {
      return player.yellowCards;
    }
    if (sortBy === 'redCards') {
      return player.redCards;
    }
    if (sortBy === 'appearances') {
      return player.appearances ?? -1;
    }
    if (sortBy === 'age') {
      return player.age ?? -1;
    }

    return 0;
  }

  private createTeamMap(
    teams: Array<{ id: number; name: string; countryCode: string }>
  ): Map<number, TournamentTeam> {
    return new Map(
      teams.map((team) => [
        team.id,
        { id: team.id, name: team.name, countryCode: team.countryCode },
      ])
    );
  }

  private createUnknownTeam(id: number): TournamentTeam {
    return {
      id,
      name: 'TBD',
      countryCode: 'TBD',
    };
  }

  private mapFixtureStatus(status: TournamentFixtureStatusRaw): TournamentFixture['status'] {
    switch (status) {
      case 'LIVE':
        return 'live';
      case 'HALF_TIME':
        return 'half-time';
      case 'FINISHED':
        return 'finished';
      case 'POSTPONED':
        return 'postponed';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'upcoming';
    }
  }

  private toOptionalNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }
}
