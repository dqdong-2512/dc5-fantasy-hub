import type { TournamentEngineConfiguration } from '../../tournament-engine/models/tournament-engine.models';

export const ASEAN_CUP_2026_TOURNAMENT_CONFIG: TournamentEngineConfiguration = {
  key: 'asean-cup-2026',
  name: 'ASEAN Cup 2026',
  season: '2026',
  logoSrc: '/2026_ASEAN_Championship-logo.svg',
  championAssetSrc: '/champion_asean_cup_2026_final.png',
  brandColor: '#00695c',
  timezone: 'Asia/Ho_Chi_Minh',
  qualificationPositions: 2,
  competitionFormat: 'group-and-knockout',
  roadLayout: 'semi-final-final',
  matchDurationMs: 120 * 60 * 1000,
  completedFixturesPreviewLimit: 2,
  todayFixturesPreviewLimit: 2,
  upcomingFixturesPreviewLimit: 2,
};
