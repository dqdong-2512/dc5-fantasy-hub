import path from 'path';

export type CompetitionDataId = 'fpl' | 'asean-cup-2026';

export function getCompetitionSeasonDir(
  projectRoot: string,
  competition: CompetitionDataId,
  season: string
): string {
  return path.join(projectRoot, 'data', 'competitions', competition, 'seasons', season);
}

export function getFplSeasonPaths(projectRoot: string, season: string) {
  const seasonDir = getCompetitionSeasonDir(projectRoot, 'fpl', season);
  return {
    seasonDir,
    rawDir: path.join(seasonDir, 'raw'),
    normalizedDir: path.join(seasonDir, 'normalized'),
    assetsDir: path.join(seasonDir, 'assets'),
    playerPhotosDir: path.join(seasonDir, 'assets', 'player-photos'),
    elementSummariesDir: path.join(seasonDir, 'raw', 'element-summaries'),
    eventLiveDir: path.join(seasonDir, 'raw', 'event-live'),
  };
}

export function getAseanSeasonPaths(projectRoot: string, season: string) {
  const seasonDir = getCompetitionSeasonDir(projectRoot, 'asean-cup-2026', season);
  return {
    seasonDir,
    manualDir: path.join(seasonDir, 'manual'),
    normalizedDir: path.join(seasonDir, 'normalized'),
  };
}
