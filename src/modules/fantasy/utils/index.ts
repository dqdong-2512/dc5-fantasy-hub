// Fantasy Game utils
export { calculateFormation, groupPlayersByPosition } from './formationUtils';
export type { FormationInfo } from './formationUtils';
export {
  calculateRankMovement,
  formatRankMovement,
  getRankMovementColor,
} from './rankMovementUtils';
export type { RankMovementInfo } from './rankMovementUtils';
export {
  calculateFormation as calculateSquadFormation,
  getCaptain,
  getViceCaptain,
  getStartingXIPlayerIds,
  calculateDifferentials,
  calculateSquadGameweekPoints,
  getBenchPlayers,
} from './comparisonUtils';
export type { DifferentialSummary } from './comparisonUtils';
