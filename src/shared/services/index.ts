// Application services
export { HttpClient } from './http-client';
export {
  FplClient,
  type BootstrapStatic,
  type Event,
  type Team,
  type Player,
  type ElementType,
  type GameSettings,
} from './fpl-client';
export { FantasyGameLiveService } from './fantasy-game-live.service';
export { FantasyGameLiveLeagueService } from './fantasy-game-live-league.service';
export {
  LiveGameweekEngine,
  type LiveGameweekPerformance,
  type LivePlayerPerformance,
  type SquadSection,
  type GameStatus,
  type MatchStatus,
} from './live-gameweek-engine.service';

// Data freshness and season services
export {
  DataSeasonService,
  type SeasonMetadata,
  getCurrentSeason,
  getCurrentSeasonLabel,
  getSeasonMetadata,
} from './data-season.service';
export {
  GameweekStateService,
  GameweekStatus,
  type GameweekState,
  getGameweekState,
} from './gameweek-state.service';
export {
  DataFreshnessService,
  DataFreshness,
  type DataQualityStatus,
  getDataQualityStatus,
} from './data-freshness.service';

// Standings calculation
export {
  StandingsCalculatorService,
  type StandingsRow,
  type LeagueStandings,
} from './standings-calculator.service';
