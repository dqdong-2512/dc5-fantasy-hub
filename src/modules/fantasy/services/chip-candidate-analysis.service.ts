/**
 * Chip Candidate Analysis Service
 * Provides transparent signals for chip planning
 * Does not recommend chips, only highlights planning signals
 */

import type { SeasonSquadSnapshot, BGWDGWAnalysis } from '../domain/SeasonPlan';
import { PlayerRepository } from '@repositories/players';

export interface ChipCandidateSignals {
  gameweekId: number;
  benchBoostSignals?: BenchBoostSignals;
  tripleCaptainSignals?: TripleCaptainSignals;
  freeHitSignals?: FreeHitSignals;
  wildcardSignals?: WildcardSignals;
}

export interface BenchBoostSignals {
  squadFixtureCount: number;
  benchFixtureCount: number;
  dgwPlayersInSquad: number;
  dgwPlayersOnBench: number;
  blankPlayersInSquad: number;
  averageFixtureDifficulty?: number;
  signal: 'interesting' | 'neutral' | 'weak';
}

export interface TripleCaptainSignals {
  topFormPlayers: Array<{
    playerId: number;
    playerName: string;
    form: number;
    hasDouble: boolean;
    fixtureDifficulty?: number;
  }>;
  doubleFixtureCount: number;
  signal: 'interesting' | 'neutral' | 'weak';
}

export interface FreeHitSignals {
  squadPlayersWithoutFixtures: number;
  poorFixtureCoverageTeams: number;
  blankPlayersCount: number;
  signal: 'interesting' | 'neutral' | 'weak';
}

export interface WildcardSignals {
  largeFixtureSwing: boolean;
  multipleAdverseFixtures: number;
  adjacentFixtureSwitches: number;
  signal: 'interesting' | 'neutral' | 'weak';
}

/**
 * Service for analyzing chip candidate gameweeks
 */
export class ChipCandidateAnalysisService {
  private playerRepository: PlayerRepository;

  constructor(playerRepository?: PlayerRepository) {
    this.playerRepository = playerRepository || new PlayerRepository();
  }

  /**
   * Analyze chip candidates for a sequence of gameweeks
   *
   * @param squadSnapshots - Squad snapshots
   * @param bgwDgwAnalyses - BGW/DGW analyses
   * @returns Chip candidate signals by gameweek
   */
  analyzeChipCandidates(
    squadSnapshots: Map<number, SeasonSquadSnapshot>,
    bgwDgwAnalyses: BGWDGWAnalysis[]
  ): ChipCandidateSignals[] {
    const results: ChipCandidateSignals[] = [];

    for (const [gameweekId, snapshot] of squadSnapshots) {
      const bgwDgw = bgwDgwAnalyses.find((a) => a.gameweekId === gameweekId);

      const signals: ChipCandidateSignals = {
        gameweekId,
        benchBoostSignals: this.analyzeBenchBoostCandidacy(snapshot, bgwDgw),
        tripleCaptainSignals: this.analyzeTripleCaptainCandidacy(snapshot, bgwDgw),
        freeHitSignals: this.analyzeFreHitCandidacy(snapshot, bgwDgw),
        wildcardSignals: this.analyzeWildcardCandidacy(),
      };

      results.push(signals);
    }

    return results;
  }

  /**
   * Analyze Bench Boost candidacy
   * Looks for gameweeks with many bench players with fixtures
   */
  private analyzeBenchBoostCandidacy(
    snapshot: SeasonSquadSnapshot,
    bgwDgw?: BGWDGWAnalysis
  ): BenchBoostSignals {
    const benchPlayers = snapshot.squad.filter((p) => !p.isStarter);
    const benchWithFixtures = bgwDgw
      ? benchPlayers.filter((p) => !bgwDgw.blankPlayerIds.includes(p.playerId)).length
      : 0;
    const benchDGWCount = bgwDgw
      ? benchPlayers.filter((p) => bgwDgw.dgwPlayerIds.includes(p.playerId)).length
      : 0;

    const squadFixtures = snapshot.squad.length - (bgwDgw?.blankPlayerIds.length || 0);
    const blankCount = bgwDgw?.blankPlayerIds.length || 0;

    let signal: 'interesting' | 'neutral' | 'weak' = 'neutral';
    if (benchWithFixtures >= 3 || benchDGWCount > 0) {
      signal = 'interesting';
    } else if (benchWithFixtures <= 1 || blankCount > 5) {
      signal = 'weak';
    }

    return {
      squadFixtureCount: squadFixtures,
      benchFixtureCount: benchWithFixtures,
      dgwPlayersInSquad: bgwDgw?.dgwPlayerIds.length || 0,
      dgwPlayersOnBench: benchDGWCount,
      blankPlayersInSquad: blankCount,
      signal,
    };
  }

  /**
   * Analyze Triple Captain candidacy
   * Looks for players in form with good fixtures or double gameweeks
   */
  private analyzeTripleCaptainCandidacy(
    snapshot: SeasonSquadSnapshot,
    bgwDgw?: BGWDGWAnalysis
  ): TripleCaptainSignals {
    const starters = snapshot.squad.filter((p) => p.isStarter);

    // Get top form players
    const topFormPlayers = starters
      .sort((a, b) => (b.form || 0) - (a.form || 0))
      .slice(0, 3)
      .map((p) => {
        const fullPlayer = this.playerRepository.getById(p.playerId);
        return {
          playerId: p.playerId,
          playerName: fullPlayer?.displayName || `Player ${p.playerId}`,
          form: p.form || 0,
          hasDouble: bgwDgw?.dgwPlayerIds.includes(p.playerId) || false,
          fixtureDifficulty: undefined,
        };
      });

    const dgwCount = bgwDgw?.dgwPlayerIds.length || 0;

    let signal: 'interesting' | 'neutral' | 'weak' = 'neutral';
    if (
      topFormPlayers[0]?.form >= 6 ||
      (topFormPlayers[0]?.hasDouble && topFormPlayers[0]?.form >= 5)
    ) {
      signal = 'interesting';
    } else if (topFormPlayers[0]?.form <= 3) {
      signal = 'weak';
    }

    return {
      topFormPlayers,
      doubleFixtureCount: dgwCount,
      signal,
    };
  }

  /**
   * Analyze Free Hit candidacy
   * Looks for gameweeks with many squad players blanking or poor fixtures
   */
  private analyzeFreHitCandidacy(
    snapshot: SeasonSquadSnapshot,
    bgwDgw?: BGWDGWAnalysis
  ): FreeHitSignals {
    const blankCount = bgwDgw?.blankPlayerIds.length || 0;
    const squadSize = snapshot.squad.length;
    const blankPercentage = (blankCount / squadSize) * 100;

    let poorFixtureCoverageTeams = 0;
    if (blankCount > 3) {
      poorFixtureCoverageTeams = Math.ceil(blankCount / 3);
    }

    let signal: 'interesting' | 'neutral' | 'weak' = 'neutral';
    if (blankPercentage > 20 || blankCount >= 5) {
      signal = 'interesting';
    } else if (blankCount === 0) {
      signal = 'weak';
    }

    return {
      squadPlayersWithoutFixtures: blankCount,
      poorFixtureCoverageTeams,
      blankPlayersCount: blankCount,
      signal,
    };
  }

  /**
   * Analyze Wildcard candidacy
   * Looks for major fixture swings or problems
   */
  private analyzeWildcardCandidacy(): WildcardSignals {
    // This would ideally use fixture swing data
    // For now, provide basic structure

    return {
      largeFixtureSwing: false,
      multipleAdverseFixtures: 0,
      adjacentFixtureSwitches: 0,
      signal: 'neutral',
    };
  }
}
