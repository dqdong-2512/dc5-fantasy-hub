export type CompetitionType = 'premier-league' | 'champions-league';

export interface CompetitionInfo {
  type: CompetitionType;
  name: string;
  subtitle: string;
}

export const COMPETITIONS: Record<CompetitionType, CompetitionInfo> = {
  'premier-league': {
    type: 'premier-league',
    name: 'Fantasy Premier League',
    subtitle: 'Official Fantasy Premier League Hub',
  },
  'champions-league': {
    type: 'champions-league',
    name: 'Fantasy Champions League',
    subtitle: 'Official Fantasy Champions League Hub',
  },
};
