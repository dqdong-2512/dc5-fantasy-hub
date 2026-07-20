/**
 * Data Quality Validator
 * Validates synced FPL data for integrity and consistency
 * Detects missing fields, duplicates, and broken references
 */

export type IssueSeverity = 'ERROR' | 'WARNING' | 'INFO';
export type IssueCategory =
  'PLAYERS' | 'TEAMS' | 'GAMEWEEKS' | 'FIXTURES' | 'ELEMENT_TYPES' | 'CROSS_ENTITY';

export interface DataQualityIssue {
  severity: IssueSeverity;
  category: IssueCategory;
  message: string;
  context?: {
    [key: string]: any;
  };
}

export interface DataQualitySummary {
  errors: number;
  warnings: number;
  info: number;
  total: number;
}

export interface DataQualityReport {
  status: 'PASS' | 'FAIL' | 'WARNING';
  summary: DataQualitySummary;
  issues: DataQualityIssue[];
  timestamp: string;
}

export interface ValidationData {
  players: any[];
  teams: any[];
  gameweeks: any[];
  fixtures: any[];
  elementTypes: any[];
  season: string;
  managerId: number | null;
}

export class DataQualityValidator {
  /**
   * Validate all data integrity
   */
  validate(data: ValidationData): DataQualityReport {
    const issues: DataQualityIssue[] = [];
    const startTime = Date.now();

    // Run all validators
    issues.push(
      ...this.validatePlayers(data.players),
      ...this.validateTeams(data.teams),
      ...this.validateGameweeks(data.gameweeks),
      ...this.validateElementTypes(data.elementTypes),
      ...this.validateFixtures(data.fixtures),
      ...this.validateCrossEntity(data)
    );

    // Summarize
    const summary: DataQualitySummary = {
      errors: issues.filter((i) => i.severity === 'ERROR').length,
      warnings: issues.filter((i) => i.severity === 'WARNING').length,
      info: issues.filter((i) => i.severity === 'INFO').length,
      total: issues.length,
    };

    // Determine status
    let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    if (summary.errors > 0) status = 'FAIL';
    else if (summary.warnings > 0) status = 'WARNING';

    return {
      status,
      summary,
      issues,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate players data
   */
  private validatePlayers(players: any[]): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];
    const playerIds = new Set<number>();

    for (const player of players) {
      // Check required fields
      if (!player.id || !player.firstName || !player.secondName || !player.webName) {
        issues.push({
          severity: 'ERROR',
          category: 'PLAYERS',
          message: `Player missing required fields (id: ${player.id})`,
          context: { player },
        });
      }

      // Check for duplicates
      if (playerIds.has(player.id)) {
        issues.push({
          severity: 'ERROR',
          category: 'PLAYERS',
          message: `Duplicate player ID: ${player.id}`,
        });
      }
      playerIds.add(player.id);

      // Validate cost (should be reasonable)
      if (player.nowCost && (player.nowCost < 35 || player.nowCost > 155)) {
        issues.push({
          severity: 'WARNING',
          category: 'PLAYERS',
          message: `Player ${player.id} has unusual cost: £${(player.nowCost / 10).toFixed(1)}m`,
          context: { playerId: player.id, cost: player.nowCost },
        });
      }
    }

    // Check total count is reasonable (should be ~800+)
    if (players.length < 700) {
      issues.push({
        severity: 'WARNING',
        category: 'PLAYERS',
        message: `Unusually low player count: ${players.length} (expected ~840)`,
      });
    }

    return issues;
  }

  /**
   * Validate teams data
   */
  private validateTeams(teams: any[]): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];
    const teamIds = new Set<number>();

    for (const team of teams) {
      // Check required fields
      if (!team.id || !team.name || !team.shortName) {
        issues.push({
          severity: 'ERROR',
          category: 'TEAMS',
          message: `Team missing required fields (id: ${team.id})`,
        });
      }

      // Check for duplicates
      if (teamIds.has(team.id)) {
        issues.push({
          severity: 'ERROR',
          category: 'TEAMS',
          message: `Duplicate team ID: ${team.id}`,
        });
      }
      teamIds.add(team.id);
    }

    // Premier League has exactly 20 teams
    if (teams.length !== 20) {
      issues.push({
        severity: 'ERROR',
        category: 'TEAMS',
        message: `Invalid team count: ${teams.length} (expected exactly 20)`,
      });
    }

    return issues;
  }

  /**
   * Validate gameweeks data
   */
  private validateGameweeks(gameweeks: any[]): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];
    const gameweekIds = new Set<number>();

    for (const gw of gameweeks) {
      // Check required fields
      if (!gw.id || !gw.name || !gw.deadlineTime) {
        issues.push({
          severity: 'ERROR',
          category: 'GAMEWEEKS',
          message: `Gameweek missing required fields (id: ${gw.id})`,
        });
      }

      // Check for duplicates
      if (gameweekIds.has(gw.id)) {
        issues.push({
          severity: 'ERROR',
          category: 'GAMEWEEKS',
          message: `Duplicate gameweek ID: ${gw.id}`,
        });
      }
      gameweekIds.add(gw.id);
    }

    // Premier League season has exactly 38 gameweeks
    if (gameweeks.length !== 38) {
      issues.push({
        severity: 'ERROR',
        category: 'GAMEWEEKS',
        message: `Invalid gameweek count: ${gameweeks.length} (expected exactly 38)`,
      });
    }

    return issues;
  }

  /**
   * Validate element types data
   */
  private validateElementTypes(elementTypes: any[]): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];

    for (const type of elementTypes) {
      // Check required fields
      if (!type.id || !type.name) {
        issues.push({
          severity: 'ERROR',
          category: 'ELEMENT_TYPES',
          message: `Element type missing id or name`,
        });
      }
    }

    // Should have 4 element types: GK, DEF, MID, FWD
    if (elementTypes.length !== 4) {
      issues.push({
        severity: 'ERROR',
        category: 'ELEMENT_TYPES',
        message: `Invalid element type count: ${elementTypes.length} (expected exactly 4)`,
      });
    }

    return issues;
  }

  /**
   * Validate fixtures data
   */
  private validateFixtures(fixtures: any[]): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];
    const fixtureIds = new Set<number>();

    for (const fixture of fixtures) {
      // Check required fields
      if (!fixture.id || fixture.gameweek === undefined || fixture.homeTeamId === undefined) {
        issues.push({
          severity: 'ERROR',
          category: 'FIXTURES',
          message: `Fixture ${fixture.id} missing required fields`,
        });
      }

      // Check for duplicates
      if (fixtureIds.has(fixture.id)) {
        issues.push({
          severity: 'ERROR',
          category: 'FIXTURES',
          message: `Duplicate fixture ID: ${fixture.id}`,
        });
      }
      fixtureIds.add(fixture.id);

      // Check home and away teams are different
      if (fixture.homeTeamId === fixture.awayTeamId) {
        issues.push({
          severity: 'ERROR',
          category: 'FIXTURES',
          message: `Fixture ${fixture.id}: home team equals away team`,
        });
      }

      // Check team IDs are valid (1-20)
      if (fixture.homeTeamId && (fixture.homeTeamId < 1 || fixture.homeTeamId > 20)) {
        issues.push({
          severity: 'ERROR',
          category: 'FIXTURES',
          message: `Fixture ${fixture.id} references invalid home team ${fixture.homeTeamId}`,
        });
      }
      if (fixture.awayTeamId && (fixture.awayTeamId < 1 || fixture.awayTeamId > 20)) {
        issues.push({
          severity: 'ERROR',
          category: 'FIXTURES',
          message: `Fixture ${fixture.id} references invalid away team ${fixture.awayTeamId}`,
        });
      }

      // If finished, must have scores
      if (
        fixture.finished &&
        (fixture.homeTeamScore === undefined || fixture.awayTeamScore === undefined)
      ) {
        issues.push({
          severity: 'WARNING',
          category: 'FIXTURES',
          message: `Finished fixture ${fixture.id} missing score data`,
        });
      }
    }

    // Premier League season typically has 380 fixtures
    if (fixtures.length !== 380) {
      issues.push({
        severity: 'WARNING',
        category: 'FIXTURES',
        message: `Unusual fixture count: ${fixtures.length} (expected 380)`,
      });
    }

    return issues;
  }

  /**
   * Validate cross-entity relationships
   */
  private validateCrossEntity(data: ValidationData): DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];

    // Create sets of valid IDs
    const validTeamIds = new Set(data.teams.map((t) => t.id));
    const validGameweekIds = new Set(data.gameweeks.map((gw) => gw.id));
    const validElementTypeIds = new Set(data.elementTypes.map((et) => et.id));

    // Validate players reference valid teams and element types
    for (const player of data.players) {
      if (!validTeamIds.has(player.team)) {
        issues.push({
          severity: 'ERROR',
          category: 'CROSS_ENTITY',
          message: `Player ${player.id} references invalid team ${player.team}`,
        });
      }

      if (!validElementTypeIds.has(player.elementType)) {
        issues.push({
          severity: 'ERROR',
          category: 'CROSS_ENTITY',
          message: `Player ${player.id} references invalid element type ${player.elementType}`,
        });
      }
    }

    // Validate fixtures reference valid teams and gameweeks
    for (const fixture of data.fixtures) {
      if (!validTeamIds.has(fixture.homeTeamId)) {
        issues.push({
          severity: 'ERROR',
          category: 'CROSS_ENTITY',
          message: `Fixture ${fixture.id} references invalid home team ${fixture.homeTeamId}`,
        });
      }

      if (!validTeamIds.has(fixture.awayTeamId)) {
        issues.push({
          severity: 'ERROR',
          category: 'CROSS_ENTITY',
          message: `Fixture ${fixture.id} references invalid away team ${fixture.awayTeamId}`,
        });
      }

      if (!validGameweekIds.has(fixture.gameweek)) {
        issues.push({
          severity: 'ERROR',
          category: 'CROSS_ENTITY',
          message: `Fixture ${fixture.id} references invalid gameweek ${fixture.gameweek}`,
        });
      }
    }

    return issues;
  }
}
