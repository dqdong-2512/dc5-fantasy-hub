/**
 * Configuration Types
 * Defines the structure for application and competition configuration
 */

export type Season = '2025-2026' | '2026-2027';
export type CompetitionId = 'fpl' | 'ucl';

export interface CompetitionProfile {
  id: CompetitionId;
  name: string;
  displayName: string;
  description: string;
  logo: string;
  modules: {
    dashboard: boolean;
    players: boolean;
    fixtures: boolean;
    analytics: boolean;
  };
}

export interface AppConfig {
  activeSeason: Season;
  activeCompetition: CompetitionId;
  apiBaseUrl: string;
  assetsBaseUrl: string;
  competitionProfiles: Record<CompetitionId, CompetitionProfile>;
  dataPath: {
    raw: string;
    normalized: string;
  };
}
