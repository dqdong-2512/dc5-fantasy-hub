import type { NormalizedTeam } from '../../repositories/types';
import type { Team } from '../models';

/**
 * Maps normalized team data to domain team model
 */
export class TeamMapper {
  static toDomain(team: NormalizedTeam): Team {
    return {
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      code: team.code.toString(),
      strength: team.strength,
      leaguePosition: team.position,
      strengthOverallHome: team.strengthOverallHome,
      strengthOverallAway: team.strengthOverallAway,
      strengthAttackHome: team.strengthAttackHome,
      strengthAttackAway: team.strengthAttackAway,
      strengthDefenceHome: team.strengthDefenceHome,
      strengthDefenceAway: team.strengthDefenceAway,
    };
  }
}
