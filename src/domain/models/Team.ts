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
}
