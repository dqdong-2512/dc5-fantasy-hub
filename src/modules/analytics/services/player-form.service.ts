import type { Player } from '@domain/models';
import type { FormBand, FormTrend, PlayerFormProfile } from '../types/decision-hub';
import { DECISION_HUB_CONFIG } from '../config/decision-config';

interface WindowProjection {
  averagePoints: number;
  minutesPlayed: number;
  starts: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  bonus: number;
  ict: number | null;
  xg: number | null;
  xa: number | null;
}

export class PlayerFormService {
  private estimateStarts(player: Player): number {
    return Math.max(1, Math.round(player.minutesPlayed / 80));
  }

  private projectWindow(player: Player, window: 3 | 5 | 8): WindowProjection {
    const starts = this.estimateStarts(player);
    const perStartGoals = (player.goalsScored ?? 0) / starts;
    const perStartAssists = (player.assists ?? 0) / starts;
    const perStartCleanSheets = (player.cleanSheets ?? 0) / starts;
    const perStartBonus = ((player.totalPoints ?? 0) * 0.08) / starts;

    const normalizedForm = Math.max(0, Math.min(10, player.form));
    const blendedAverage = normalizedForm * 0.62 + player.pointsPerGame * 0.38;
    const trendAdjust = window === 3 ? 1.03 : window === 5 ? 1 : 0.97;

    const projectedStarts = Math.max(1, Math.round((window / 8) * starts));
    const minutesPlayed = Math.round(projectedStarts * 78);

    return {
      averagePoints: Number((blendedAverage * trendAdjust).toFixed(2)),
      minutesPlayed,
      starts: projectedStarts,
      goals: Number((perStartGoals * projectedStarts).toFixed(2)),
      assists: Number((perStartAssists * projectedStarts).toFixed(2)),
      cleanSheets: Number((perStartCleanSheets * projectedStarts).toFixed(2)),
      bonus: Number((perStartBonus * projectedStarts).toFixed(2)),
      ict: player.ictIndex ?? null,
      xg: null,
      xa: null,
    };
  }

  private classifyBand(last5Average: number): FormBand {
    if (last5Average >= DECISION_HUB_CONFIG.FORM.EXCELLENT_THRESHOLD) {
      return 'Excellent';
    }
    if (last5Average >= DECISION_HUB_CONFIG.FORM.GOOD_THRESHOLD) {
      return 'Good';
    }
    if (last5Average >= DECISION_HUB_CONFIG.FORM.AVERAGE_THRESHOLD) {
      return 'Average';
    }
    return 'Poor';
  }

  private classifyTrend(last3Average: number, last8Average: number): FormTrend {
    const delta = last3Average - last8Average;
    if (delta >= 0.5) {
      return 'rising';
    }
    if (delta <= -0.5) {
      return 'falling';
    }
    return 'stable';
  }

  buildProfile(player: Player): PlayerFormProfile {
    const last3Projection = this.projectWindow(player, 3);
    const last5Projection = this.projectWindow(player, 5);
    const last8Projection = this.projectWindow(player, 8);

    return {
      playerId: player.id,
      playerName: player.displayName,
      trend: this.classifyTrend(last3Projection.averagePoints, last8Projection.averagePoints),
      band: this.classifyBand(last5Projection.averagePoints),
      last3: {
        window: 3,
        ...last3Projection,
      },
      last5: {
        window: 5,
        ...last5Projection,
      },
      last8: {
        window: 8,
        ...last8Projection,
      },
    };
  }

  buildProfiles(players: Player[]): PlayerFormProfile[] {
    return players.map((player) => this.buildProfile(player));
  }
}
