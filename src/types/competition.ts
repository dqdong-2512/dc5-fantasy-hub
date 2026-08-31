export type CompetitionType = 'premier-league' | 'asean-cup-2026' | 'champions-league';

export interface CompetitionInfo {
  type: CompetitionType;
  name: string;
  subtitle: string;
  path: string;
  logoSrc: string;
  logoAlt: string;
  accentColor: string;
}

export const COMPETITIONS: Record<CompetitionType, CompetitionInfo> = {
  'premier-league': {
    type: 'premier-league',
    name: 'Fantasy Premier League',
    subtitle: 'Official Fantasy Premier League Hub',
    path: '/premier-league/home',
    logoSrc: '/fpl-logo.png',
    logoAlt: 'Premier League lion',
    accentColor: '#37003c',
  },
  'champions-league': {
    type: 'champions-league',
    name: 'Fantasy Champions League',
    subtitle: 'Official Fantasy Champions League Hub',
    path: '/champions-league/dashboard',
    logoSrc: '/uefa-champions-league-logo.svg',
    logoAlt: 'UEFA Champions League',
    accentColor: '#001b5e',
  },
  'asean-cup-2026': {
    type: 'asean-cup-2026',
    name: 'ASEAN Cup 2026',
    subtitle: 'Official ASEAN Hyundai Cup Hub',
    path: '/asean-cup-2026',
    logoSrc: '/2026_ASEAN_Championship-logo.svg',
    logoAlt: 'ASEAN Hyundai Cup',
    accentColor: '#00aad2',
  },
};
