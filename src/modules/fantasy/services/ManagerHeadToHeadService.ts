/**
 * Manager Head-to-Head Service
 * Calculates comprehensive head-to-head comparison between two managers
 * Reuses existing gameweek contribution logic via manager snapshots
 */

import { getManagerGameweekSnapshot } from '../fixtures';
import type {
  ManagerHeadToHeadComparison,
  OverallComparison,
  GameweekComparison,
  CaptainComparison,
  TransferComparison,
  BenchComparison,
  DifferentialAnalysis,
  PlayerDifferentialImpact,
  PlayerComparisonRow,
} from '@domain/models';
import type { LeagueStandingEntry, FantasySquadPick } from '../types';

export class ManagerHeadToHeadService {
  constructor() {}

  /**
   * Build complete head-to-head comparison
   */
  buildHeadToHeadComparison(
    leagueId: number,
    currentManagerId: number,
    opponentManagerId: number,
    gameweekId: number,
    standings: LeagueStandingEntry[],
    currentSquad: FantasySquadPick[],
    opponentSquad: FantasySquadPick[],
    gameweekStatus: 'live' | 'final' | 'snapshot' | 'upcoming'
  ): ManagerHeadToHeadComparison {
    const currentManagerSnapshot = (getManagerGameweekSnapshot(gameweekId) || undefined) as any;
    const opponentManagerSnapshot = (getManagerGameweekSnapshot(gameweekId) || undefined) as any;

    const currentManagerStanding = standings.find((e) => e.managerId === currentManagerId);
    const opponentManagerStanding = standings.find((e) => e.managerId === opponentManagerId);

    const hasMissingSnapshots = !currentManagerSnapshot || !opponentManagerSnapshot;

    return {
      leagueId,
      gameweekId,
      currentManagerId,
      opponentManagerId,
      dataStatus: gameweekStatus,
      overallComparison: this.calculateOverallComparison(
        currentManagerStanding,
        opponentManagerStanding
      ),
      gameweekComparison: this.calculateGameweekComparison(
        currentManagerSnapshot,
        opponentManagerSnapshot
      ),
      captainComparison: this.calculateCaptainComparison(
        currentManagerSnapshot,
        opponentManagerSnapshot
      ),
      transferComparison: this.calculateTransferComparison(
        currentManagerSnapshot,
        opponentManagerSnapshot
      ),
      benchComparison: this.calculateBenchComparison(
        currentManagerSnapshot,
        opponentManagerSnapshot
      ),
      differentialAnalysis: this.calculateDifferentialAnalysis(
        currentManagerSnapshot,
        opponentManagerSnapshot,
        currentSquad,
        opponentSquad
      ),
      historicalTrend: undefined, // TODO: Implement when historical data available
      currentManagerSnapshot,
      opponentManagerSnapshot,
      hasMissingSnapshots,
    };
  }

  /**
   * Calculate overall comparison metrics
   */
  private calculateOverallComparison(
    currentStanding: LeagueStandingEntry | undefined,
    opponentStanding: LeagueStandingEntry | undefined
  ): OverallComparison {
    const currentRank = currentStanding?.currentRank ?? 0;
    const currentTotal = currentStanding?.totalPoints ?? 0;
    const opponentRank = opponentStanding?.currentRank ?? 0;
    const opponentTotal = opponentStanding?.totalPoints ?? 0;

    return {
      currentManagerRank: currentRank,
      opponentManagerRank: opponentRank,
      currentManagerTotalPoints: currentTotal,
      opponentManagerTotalPoints: opponentTotal,
      pointsGap: currentTotal - opponentTotal,
      currentManagerTeamValue: 0, // TODO: Get from manager data
      opponentManagerTeamValue: 0, // TODO: Get from manager data
      currentManagerBank: 0, // TODO: Get from manager data
      opponentManagerBank: 0, // TODO: Get from manager data
    };
  }

  /**
   * Calculate gameweek-specific comparison
   */
  private calculateGameweekComparison(
    currentSnapshot: any,
    opponentSnapshot: any
  ): GameweekComparison {
    const currentRaw = currentSnapshot?.totalPoints ?? 0;
    const currentTransfer = currentSnapshot?.transferCost ?? 0;
    const currentNet = currentRaw - currentTransfer;
    const currentBench = currentSnapshot?.benchPoints ?? 0;

    const opponentRaw = opponentSnapshot?.totalPoints ?? 0;
    const opponentTransfer = opponentSnapshot?.transferCost ?? 0;
    const opponentNet = opponentRaw - opponentTransfer;
    const opponentBench = opponentSnapshot?.benchPoints ?? 0;

    const gap = currentNet - opponentNet;
    let winner: 'current' | 'opponent' | 'draw' = 'draw';
    if (gap > 0) winner = 'current';
    if (gap < 0) winner = 'opponent';

    return {
      currentManagerRawPoints: currentRaw,
      opponentManagerRawPoints: opponentRaw,
      currentManagerTransferCost: currentTransfer,
      opponentManagerTransferCost: opponentTransfer,
      currentManagerNetPoints: currentNet,
      opponentManagerNetPoints: opponentNet,
      currentManagerBenchPoints: currentBench,
      opponentManagerBenchPoints: opponentBench,
      gameweekPointsGap: gap,
      gameweekWinner: winner,
    };
  }

  /**
   * Calculate captain comparison
   */
  private calculateCaptainComparison(
    currentSnapshot: any,
    opponentSnapshot: any
  ): CaptainComparison {
    const currentCaptainContribution = this.calculateCaptainContribution(currentSnapshot);
    const opponentCaptainContribution = this.calculateCaptainContribution(opponentSnapshot);

    const sameCaptain =
      currentSnapshot?.captainId === opponentSnapshot?.captainId && currentSnapshot?.captainId;

    return {
      currentManagerCaptainId: currentSnapshot?.captainId,
      currentManagerCaptainContribution: currentCaptainContribution,
      opponentManagerCaptainId: opponentSnapshot?.captainId,
      opponentManagerCaptainContribution: opponentCaptainContribution,
      sameCaptain,
      captainSwing: currentCaptainContribution - opponentCaptainContribution,
    };
  }

  /**
   * Get captain contribution from snapshot
   */
  private calculateCaptainContribution(snapshot: any): number {
    if (!snapshot || !snapshot.playerContributions) return 0;

    const captain = snapshot.playerContributions.find((p: any) => p.isCaptain);
    return captain ? captain.managerPoints : 0;
  }

  /**
   * Calculate transfer cost comparison
   */
  private calculateTransferComparison(
    currentSnapshot: any,
    opponentSnapshot: any
  ): TransferComparison {
    const currentTransfers = currentSnapshot?.transfers ?? 0;
    const currentCost = currentSnapshot?.transferCost ?? 0;
    const opponentTransfers = opponentSnapshot?.transfers ?? 0;
    const opponentCost = opponentSnapshot?.transferCost ?? 0;

    return {
      currentManagerTransfers: currentTransfers,
      opponentManagerTransfers: opponentTransfers,
      currentManagerTransferCost: currentCost,
      opponentManagerTransferCost: opponentCost,
      transferCostSwing: -currentCost - -opponentCost,
    };
  }

  /**
   * Calculate bench comparison
   */
  private calculateBenchComparison(currentSnapshot: any, opponentSnapshot: any): BenchComparison {
    const currentBench = currentSnapshot?.benchPoints ?? 0;
    const opponentBench = opponentSnapshot?.benchPoints ?? 0;

    return {
      currentManagerBenchPoints: currentBench,
      opponentManagerBenchPoints: opponentBench,
      benchPointsSwing: currentBench - opponentBench,
    };
  }

  /**
   * Calculate differential analysis
   */
  private calculateDifferentialAnalysis(
    currentSnapshot: any,
    opponentSnapshot: any,
    currentSquad: FantasySquadPick[],
    opponentSquad: FantasySquadPick[]
  ): DifferentialAnalysis {
    const currentPlayerIds = new Set(currentSquad.map((p) => p.playerId));
    const opponentPlayerIds = new Set(opponentSquad.map((p) => p.playerId));

    const shared: number[] = [];
    const currentDiffs: number[] = [];
    const opponentDiffs: number[] = [];

    currentPlayerIds.forEach((id) => {
      if (opponentPlayerIds.has(id)) {
        shared.push(id);
      } else {
        currentDiffs.push(id);
      }
    });

    opponentPlayerIds.forEach((id) => {
      if (!currentPlayerIds.has(id)) {
        opponentDiffs.push(id);
      }
    });

    const currentDifferentialImpacts = this.buildDifferentialImpacts(
      currentDiffs,
      currentSnapshot,
      'current'
    );
    const opponentDifferentialImpacts = this.buildDifferentialImpacts(
      opponentDiffs,
      opponentSnapshot,
      'opponent'
    );

    const currentTotal = currentDifferentialImpacts.reduce(
      (sum, p) => sum + p.gameweekContribution,
      0
    );
    const opponentTotal = opponentDifferentialImpacts.reduce(
      (sum, p) => sum + p.gameweekContribution,
      0
    );

    const biggestSwing = this.calculateBiggestSwing(
      currentDifferentialImpacts,
      opponentDifferentialImpacts
    );

    return {
      sharedPlayerIds: shared,
      currentManagerDifferentials: currentDifferentialImpacts,
      opponentManagerDifferentials: opponentDifferentialImpacts,
      currentManagerDifferentialTotal: currentTotal,
      opponentManagerDifferentialTotal: opponentTotal,
      differentialSwing: currentTotal - opponentTotal,
      biggestSwingPlayer: biggestSwing,
    };
  }

  /**
   * Build differential impacts for a set of player IDs
   */
  private buildDifferentialImpacts(
    playerIds: number[],
    snapshot: any,
    manager: 'current' | 'opponent'
  ): PlayerDifferentialImpact[] {
    if (!snapshot || !snapshot.playerContributions) {
      return [];
    }

    return playerIds
      .map((playerId) => {
        const contribution = snapshot.playerContributions.find((p: any) => p.playerId === playerId);

        if (!contribution) {
          return {
            playerId,
            manager,
            gameweekContribution: 0,
            minutesPlayed: 0,
            isCaptain: false,
            captainMultiplier: 1,
          };
        }

        return {
          playerId,
          playerName: contribution.playerName,
          manager,
          gameweekContribution: contribution.managerPoints,
          minutesPlayed: contribution.minutesPlayed,
          isCaptain: contribution.isCaptain,
          captainMultiplier: contribution.multiplier,
        };
      })
      .sort((a, b) => Math.abs(b.gameweekContribution) - Math.abs(a.gameweekContribution));
  }

  /**
   * Find biggest differential swing
   */
  private calculateBiggestSwing(
    currentDiffs: PlayerDifferentialImpact[],
    opponentDiffs: PlayerDifferentialImpact[]
  ):
    | {
        playerId: number;
        playerName?: string;
        manager: 'current' | 'opponent';
        swing: number;
        contribution: number;
      }
    | undefined {
    const allDiffs = [
      ...currentDiffs.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        manager: 'current' as const,
        swing: p.gameweekContribution,
        contribution: p.gameweekContribution,
      })),
      ...opponentDiffs.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        manager: 'opponent' as const,
        swing: -p.gameweekContribution,
        contribution: p.gameweekContribution,
      })),
    ];

    if (allDiffs.length === 0) return undefined;

    const biggestByAbsSwing = allDiffs.reduce((prev, current) =>
      Math.abs(current.swing) > Math.abs(prev.swing) ? current : prev
    );

    return biggestByAbsSwing;
  }

  /**
   * Build player contribution comparison table
   */
  buildPlayerContributionComparison(
    currentSnapshot: any,
    opponentSnapshot: any,
    currentSquad: FantasySquadPick[],
    opponentSquad: FantasySquadPick[],
    differentialAnalysis: DifferentialAnalysis
  ): PlayerComparisonRow[] {
    if (!currentSnapshot || !opponentSnapshot) {
      return [];
    }

    const allPlayerIds = new Set<number>();
    currentSquad.forEach((p) => allPlayerIds.add(p.playerId));
    opponentSquad.forEach((p) => allPlayerIds.add(p.playerId));

    const rows: PlayerComparisonRow[] = [];

    allPlayerIds.forEach((playerId) => {
      const currentContribution = this.getPlayerContribution(currentSnapshot, playerId);
      const opponentContribution = this.getPlayerContribution(opponentSnapshot, playerId);

      const isShared = differentialAnalysis.sharedPlayerIds.includes(playerId);
      const isCurrent = currentSquad.some((p) => p.playerId === playerId);
      const isOpponent = opponentSquad.some((p) => p.playerId === playerId);

      // Skip if player not in either squad
      if (!isCurrent && !isOpponent) return;

      // Get player name from snapshots (they contain player names in contributions)
      let playerName = '';
      let isCaptain = false;

      if (currentSnapshot?.playerContributions) {
        const playerContrib = currentSnapshot.playerContributions.find(
          (p: any) => p.playerId === playerId
        );
        if (playerContrib) {
          playerName = playerContrib.playerName || `Player ${playerId}`;
          if (playerContrib.isCaptain) {
            isCaptain = true;
          }
        }
      }

      if (!playerName && opponentSnapshot?.playerContributions) {
        const playerContrib = opponentSnapshot.playerContributions.find(
          (p: any) => p.playerId === playerId
        );
        if (playerContrib) {
          playerName = playerContrib.playerName || `Player ${playerId}`;
          if (playerContrib.isCaptain) {
            isCaptain = true;
          }
        }
      }

      if (!playerName) {
        playerName = `Player ${playerId}`;
      }

      rows.push({
        playerId,
        playerName,
        position: '',
        currentManagerContribution: isCurrent ? currentContribution : 0,
        opponentManagerContribution: isOpponent ? opponentContribution : 0,
        pointsDifference: currentContribution - opponentContribution,
        isShared,
        isCaptain,
      });
    });

    // Sort by absolute difference descending
    rows.sort((a, b) => Math.abs(b.pointsDifference) - Math.abs(a.pointsDifference));

    return rows;
  }

  /**
   * Get player contribution from snapshot
   */
  private getPlayerContribution(snapshot: any, playerId: number): number {
    if (!snapshot || !snapshot.playerContributions) return 0;

    const contribution = snapshot.playerContributions.find((p: any) => p.playerId === playerId);
    return contribution ? contribution.managerPoints : 0;
  }

  /**
   * Get available gameweeks for comparison
   */
  getAvailableGameweeks(): number[] {
    // Return gameweeks with snapshot data
    return [37, 38];
  }

  /**
   * Format status for display
   */
  static formatStatus(status: 'live' | 'final' | 'snapshot' | 'upcoming'): string {
    const statusMap: Record<string, string> = {
      live: 'LIVE',
      final: 'FINAL',
      snapshot: 'SNAPSHOT',
      upcoming: 'UPCOMING',
    };
    return statusMap[status] || 'UNKNOWN';
  }

  /**
   * Get status display color
   */
  static getStatusColor(status: 'live' | 'final' | 'snapshot' | 'upcoming'): string {
    const colorMap: Record<string, string> = {
      live: '#f44336',
      final: '#4caf50',
      snapshot: '#ff9800',
      upcoming: '#bdbdbd',
    };
    return colorMap[status] || '#666';
  }
}
