/**
 * useStandings Hook
 * Provides access to league standings with support for gameweek navigation
 */

import { BootstrapRepository } from '@repositories/bootstrap';
import { FixtureRepository } from '@repositories/fixtures';
import {
  StandingsCalculatorService,
  type StandingsRow,
} from '@shared/services/standings-calculator.service';

export interface UseStandingsState {
  standings: StandingsRow[] | null;
  gameweekId: number | null;
  isPreSeason: boolean;
  message: string | null;
}

export function useStandings(): UseStandingsState {
  try {
    const bootstrapRepository = new BootstrapRepository();
    const fixtureRepository = new FixtureRepository();
    const bootstrap = bootstrapRepository.getBootstrap();
    const fixtures = fixtureRepository.getAll();
    const teams = bootstrap.teams;

    const currentGameweek = bootstrapRepository.getCurrentGameweek();
    const seasonState = bootstrapRepository.getSeasonState();

    if (seasonState === 'pre-season' || !currentGameweek) {
      return {
        standings: null,
        gameweekId: null,
        isPreSeason: true,
        message: 'League standings will be available after the first completed matches.',
      };
    }

    const lastCompletedGameweek = Math.max(
      0,
      ...fixtures.filter((f) => f.finished).map((f) => f.gameweek)
    );

    if (lastCompletedGameweek === 0) {
      return {
        standings: null,
        gameweekId: null,
        isPreSeason: true,
        message: 'League standings will be available after the first completed matches.',
      };
    }

    const standings = StandingsCalculatorService.calculate(fixtures, teams, lastCompletedGameweek);
    const prevStandings = StandingsCalculatorService.getPreviousGameweekStandings(
      fixtures,
      teams,
      lastCompletedGameweek
    );

    const standingsWithMovement = StandingsCalculatorService.addPositionMovement(
      standings,
      prevStandings
    );

    return {
      standings: standingsWithMovement.rows,
      gameweekId: standings.gameweekId,
      isPreSeason: false,
      message: null,
    };
  } catch (error) {
    console.error('Error calculating standings:', error);
    return {
      standings: null,
      gameweekId: null,
      isPreSeason: false,
      message: 'Error loading standings. Please try again.',
    };
  }
}

export function useStandingsByGameweek(gameweekId: number): UseStandingsState {
  try {
    const bootstrapRepository = new BootstrapRepository();
    const fixtureRepository = new FixtureRepository();
    const bootstrap = bootstrapRepository.getBootstrap();
    const fixtures = fixtureRepository.getAll();
    const teams = bootstrap.teams;

    const standings = StandingsCalculatorService.calculate(fixtures, teams, gameweekId);

    if (standings.rows.length === 0 || standings.rows.every((r) => r.played === 0)) {
      return {
        standings: standings.rows,
        gameweekId,
        isPreSeason: true,
        message: `No matches completed by Gameweek ${gameweekId}`,
      };
    }

    const prevStandings = StandingsCalculatorService.getPreviousGameweekStandings(
      fixtures,
      teams,
      gameweekId
    );

    const standingsWithMovement = StandingsCalculatorService.addPositionMovement(
      standings,
      prevStandings
    );

    return {
      standings: standingsWithMovement.rows,
      gameweekId: standings.gameweekId,
      isPreSeason: false,
      message: null,
    };
  } catch (error) {
    console.error('Error calculating standings for gameweek:', gameweekId, error);
    return {
      standings: null,
      gameweekId: null,
      isPreSeason: false,
      message: 'Error loading standings. Please try again.',
    };
  }
}
