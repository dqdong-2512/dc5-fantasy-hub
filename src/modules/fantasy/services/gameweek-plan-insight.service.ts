/**
 * Gameweek Plan Insight Service
 * Generates transparent, deterministic insights about lineup decisions
 */

import type { LineupInsight, GameweekPlanPlayer, CaptainCandidate } from '../domain/GameweekPlan';

export class GameweekPlanInsightService {
  /**
   * Generate lineup insights
   */
  generateLineupInsights(
    startingXi: GameweekPlanPlayer[],
    bench: GameweekPlanPlayer[],
    captainPlayerId: number | null
  ): LineupInsight[] {
    const insights: LineupInsight[] = [];

    // 1. Strong bench option - bench player with higher form than a starter
    bench.forEach((benchPlayer) => {
      if (benchPlayer.form <= 0) return; // No form data

      const matchedStarter = startingXi.find(
        (s) => s.position === benchPlayer.position && s.form < benchPlayer.form && s.form > 0 // Has form data
      );

      if (matchedStarter) {
        insights.push({
          type: 'strong_bench_option',
          message: `${benchPlayer.playerId ? `Player ${benchPlayer.playerId}` : 'A bench player'} has higher form (${benchPlayer.form.toFixed(1)}) than starting ${this.getPositionLabel(matchedStarter.position)}`,
          playerId: benchPlayer.playerId,
          severity: 'consideration',
        });
      }
    });

    // 2. Difficult fixture in starting XI
    startingXi.forEach((player) => {
      if (player.fixture && player.fixture.difficulty >= 4) {
        insights.push({
          type: 'difficult_fixture_starting',
          message: `Starting player has difficult fixture: ${player.fixture.opponent} (${player.fixture.homeAway}) FDR ${player.fixture.difficulty}`,
          playerId: player.playerId,
          severity: 'info',
        });
      }
    });

    // 3. Easier fixture on bench
    bench.forEach((benchPlayer) => {
      if (!benchPlayer.fixture) return;

      const benchFixtureDifficulty = benchPlayer.fixture.difficulty;
      const avgStartingDifficulty =
        startingXi
          .filter((s) => s.fixture)
          .reduce((sum, s) => sum + (s.fixture?.difficulty ?? 0), 0) / startingXi.length;

      if (benchFixtureDifficulty < avgStartingDifficulty) {
        insights.push({
          type: 'easier_bench_fixture',
          message: `Bench player has easier fixture (FDR ${benchFixtureDifficulty}) than average starting XI (FDR ${avgStartingDifficulty.toFixed(1)})`,
          playerId: benchPlayer.playerId,
          severity: 'consideration',
        });
      }
    });

    // 4. High form player on bench
    bench.forEach((benchPlayer) => {
      if (benchPlayer.form >= 7) {
        insights.push({
          type: 'high_form_bench',
          message: `Bench player is in high form (${benchPlayer.form.toFixed(1)})`,
          playerId: benchPlayer.playerId,
          severity: 'info',
        });
      }
    });

    // 5. Blank gameweek player starting
    startingXi.forEach((player) => {
      if (player.hasBlank) {
        insights.push({
          type: 'blank_gameweek_starting',
          message: `Starting player has no fixture this gameweek`,
          playerId: player.playerId,
          severity: 'warning',
        });
      }
    });

    // 6. Double gameweek on bench
    bench.forEach((benchPlayer) => {
      if (benchPlayer.doubleFixture) {
        insights.push({
          type: 'double_gameweek_bench',
          message: `Bench player has double fixture this gameweek`,
          playerId: benchPlayer.playerId,
          severity: 'consideration',
        });
      }
    });

    // 7. Captain has blank gameweek
    if (captainPlayerId) {
      const captain = startingXi.find((p) => p.playerId === captainPlayerId);
      if (captain && captain.hasBlank) {
        insights.push({
          type: 'captain_has_blank',
          message: `Captain has no fixture this gameweek`,
          severity: 'warning',
        });
      }
    }

    // 8. Low form captain
    if (captainPlayerId) {
      const captain = startingXi.find((p) => p.playerId === captainPlayerId);
      if (captain && captain.form < 3 && captain.form > 0) {
        insights.push({
          type: 'low_form_captain',
          message: `Captain is in low form (${captain.form.toFixed(1)})`,
          severity: 'consideration',
        });
      }
    }

    return insights.slice(0, 5); // Limit to 5 insights for UI
  }

  /**
   * Generate captain suitability score
   * Combines form, PPG, and fixture difficulty
   */
  generateCaptainSuitabilityScore(candidate: CaptainCandidate): number {
    // Normalize form (0-10)
    const formScore = Math.max(0, Math.min(10, candidate.form));

    // Normalize PPG (cap at 10 for scoring)
    const ppgScore = Math.max(0, Math.min(10, candidate.pointsPerGame));

    // Fixture score (already normalized 0-10, higher is easier)
    const fixtureScore = candidate.fixtureScore;

    // Weighted calculation
    // Form: 35%, PPG: 40%, Fixtures: 25%
    const score = formScore * 0.35 + ppgScore * 0.4 + fixtureScore * 0.25;

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Get position label
   */
  private getPositionLabel(position: number): string {
    switch (position) {
      case 1:
        return 'GK';
      case 2:
        return 'DEF';
      case 6:
        return 'MID';
      case 9:
        return 'FWD';
      default:
        return 'Player';
    }
  }
}
