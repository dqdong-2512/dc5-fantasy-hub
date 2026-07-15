/**
 * Domain model for a team
 */
export interface Team {
  id: number;
  name: string;
  shortName: string;
  code: string;
  strength: number;
  leaguePosition: number;
  strengthOverallHome: number;
  strengthOverallAway: number;
  strengthAttackHome: number;
  strengthAttackAway: number;
  strengthDefenceHome: number;
  strengthDefenceAway: number;
}
