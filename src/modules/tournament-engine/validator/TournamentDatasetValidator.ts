import type { TournamentRawDataset } from '../models/tournament-engine.models';

export interface TournamentValidationResult {
  warnings: string[];
}

export class TournamentDatasetValidator {
  public validate(dataset: TournamentRawDataset): TournamentValidationResult {
    const warnings: string[] = [];
    const teamIds = new Set<number>();
    const playerIds = new Set<number>();
    const teamIdSet = new Set(dataset.teams.map((team) => team.id));

    dataset.teams.forEach((team) => {
      if (teamIds.has(team.id)) {
        warnings.push(`Duplicate team id ${team.id}.`);
      }
      teamIds.add(team.id);
    });

    dataset.players.forEach((player) => {
      if (playerIds.has(player.id)) {
        warnings.push(`Duplicate player id ${player.id}.`);
      }
      playerIds.add(player.id);

      if (!teamIdSet.has(player.nationTeamId)) {
        warnings.push(`Missing player nation reference for player ${player.id}.`);
      }
    });

    dataset.groups.forEach((group) => {
      group.standings.forEach((standing) => {
        if (!teamIdSet.has(standing.teamId)) {
          warnings.push(
            `Invalid standings reference for team ${standing.teamId} in group ${group.id}.`
          );
        }
      });
    });

    dataset.fixtures.forEach((fixture) => {
      if (!teamIdSet.has(fixture.homeTeamId) && fixture.homeTeamId !== 0) {
        warnings.push(`Invalid home team reference in fixture ${fixture.id}.`);
      }
      if (!teamIdSet.has(fixture.awayTeamId) && fixture.awayTeamId !== 0) {
        warnings.push(`Invalid away team reference in fixture ${fixture.id}.`);
      }
    });

    if (dataset.events) {
      dataset.events.forEach((event, index) => {
        if (!playerIds.has(event.playerId)) {
          warnings.push(`Missing event player reference at index ${index}.`);
        }
      });
    }

    return { warnings };
  }
}
