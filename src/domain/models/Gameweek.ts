/**
 * Domain model for a gameweek
 */
export interface Gameweek {
  id: number;
  name: string;
  deadline: string;
  finished: boolean;
  averageScore: number;
}
