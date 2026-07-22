/**
 * Gameweek Head-to-Head Service
 * Real FPL data-driven manager comparison for specific gameweeks
 * Fetches picks, calculates differentials, captain impact, etc.
 */

import { FantasyGameRepository } from '@repositories/fantasy';
import { FplClient } from '@shared/services/fpl-client';
import type { FantasyGameweekPicks } from '@domain/models';

export interface PlayerComparison {
  playerId: number;
  playerName: string;
  position: string;
  team: string;
  gameweekPoints: number;
  myTeamMultiplier: number;
  myTeamEffectivePoints: number;
  opponentMultiplier: number;
  opponentEffectivePoints: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  status: 'common' | 'myDifferential' | 'opponentDifferential';
}

export interface GameweekComparison {
  gameweekId: number;
  myManagerId: number;
  opponentManagerId: number;
  myManagerName: string;
  opponentManagerName: string;
  myGameweekPoints: number;
  opponentGameweekPoints: number;
  myTotalPoints: number;
  opponentTotalPoints: number;
  myLeagueRank: number;
  opponentLeagueRank: number;
  leagueRankDifference: number;
  totalPointsDifference: number;
  gameweekPointsDifference: number;
  commonPlayersCount: number;
  myDifferentialsCount: number;
  opponentDifferentialsCount: number;
  myCaptain: PlayerComparison | null;
  opponentCaptain: PlayerComparison | null;
  captainImpact: number;
  players: PlayerComparison[];
  keyDifferences: KeyDifference[];
}

export interface KeyDifference {
  type: 'differential' | 'captain' | 'multiplier';
  description: string;
  pointsImpact: number;
  isPositiveForMyTeam: boolean;
  player?: string;
}

export class GameweekHeadToHeadService {
  private repository: FantasyGameRepository;
  private fplClient: FplClient;
  private comparisonCache: Map<string, { data: GameweekComparison; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.repository = new FantasyGameRepository();
    this.fplClient = new FplClient();
  }

  /**
   * Build complete gameweek head-to-head comparison
   * Fetches real FPL data and calculates all metrics
   */
  async compareGameweek(
    gameweekId: number,
    myManagerId: number,
    opponentManagerId: number
  ): Promise<GameweekComparison> {
    // Check cache first
    const cacheKey = `${gameweekId}-${myManagerId}-${opponentManagerId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Fetch both managers' picks in parallel
      const [myPicks, opponentPicks, myEntry, opponentEntry, bootstrap] = await Promise.all([
        this.repository.getEntryPicks(myManagerId, gameweekId),
        this.repository.getEntryPicks(opponentManagerId, gameweekId),
        this.repository.getEntry(myManagerId),
        this.repository.getEntry(opponentManagerId),
        this.fplClient.getBootstrap(),
      ]);

      // Build player lookup map
      const playerMap = new Map(bootstrap.elements.map((p) => [p.id, p]));

      const teamMap = new Map(bootstrap.teams.map((t) => [t.id, t]));
      const elementTypeMap = new Map(bootstrap.element_types.map((et) => [et.id, et]));

      // Get entry history for this gameweek
      const [myHistory, opponentHistory] = await Promise.all([
        this.repository.getEntryHistory(myManagerId),
        this.repository.getEntryHistory(opponentManagerId),
      ]);

      const myGwHistory = myHistory.find((h) => h.event === gameweekId);
      const opponentGwHistory = opponentHistory.find((h) => h.event === gameweekId);

      // Calculate all comparison metrics
      const comparison: GameweekComparison = {
        gameweekId,
        myManagerId,
        opponentManagerId,
        myManagerName: myEntry.manager.name,
        opponentManagerName: opponentEntry.manager.name,
        myGameweekPoints: myGwHistory?.points ?? 0,
        opponentGameweekPoints: opponentGwHistory?.points ?? 0,
        myTotalPoints: myEntry.manager.totalPoints,
        opponentTotalPoints: opponentEntry.manager.totalPoints,
        myLeagueRank: myEntry.manager.overallRank ?? 0,
        opponentLeagueRank: opponentEntry.manager.overallRank ?? 0,
        leagueRankDifference:
          (opponentEntry.manager.overallRank ?? 0) - (myEntry.manager.overallRank ?? 0),
        totalPointsDifference: myEntry.manager.totalPoints - opponentEntry.manager.totalPoints,
        gameweekPointsDifference: (myGwHistory?.points ?? 0) - (opponentGwHistory?.points ?? 0),
        commonPlayersCount: 0,
        myDifferentialsCount: 0,
        opponentDifferentialsCount: 0,
        myCaptain: null,
        opponentCaptain: null,
        captainImpact: 0,
        players: [],
        keyDifferences: [],
      };

      // Build player comparison data
      const playerComparisons = this.buildPlayerComparisons(
        myPicks,
        opponentPicks,
        playerMap,
        teamMap,
        elementTypeMap
      );

      comparison.players = playerComparisons;

      // Count common and differentials
      comparison.commonPlayersCount = playerComparisons.filter((p) => p.status === 'common').length;
      comparison.myDifferentialsCount = playerComparisons.filter(
        (p) => p.status === 'myDifferential'
      ).length;
      comparison.opponentDifferentialsCount = playerComparisons.filter(
        (p) => p.status === 'opponentDifferential'
      ).length;

      // Find captains
      comparison.myCaptain =
        playerComparisons.find((p) => p.status === 'common' && p.isCaptain) ||
        playerComparisons.find((p) => p.status === 'myDifferential' && p.isCaptain) ||
        null;

      comparison.opponentCaptain =
        playerComparisons.find((p) => p.status === 'common' && p.isViceCaptain) ||
        playerComparisons.find((p) => p.status === 'opponentDifferential' && p.isViceCaptain) ||
        null;

      // Calculate captain impact
      const myCaptainPoints = comparison.myCaptain?.myTeamEffectivePoints ?? 0;
      const opponentCaptainPoints = comparison.opponentCaptain?.opponentEffectivePoints ?? 0;
      comparison.captainImpact = myCaptainPoints - opponentCaptainPoints;

      // Calculate key differences
      comparison.keyDifferences = this.calculateKeyDifferences(playerComparisons, comparison);

      // Cache the result
      this.setCache(cacheKey, comparison);

      return comparison;
    } catch (err) {
      throw new Error(
        `Failed to compare gameweek ${gameweekId}: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Build player comparison data
   * Maps picks to players and calculates effective points
   */
  private buildPlayerComparisons(
    myPicks: FantasyGameweekPicks,
    opponentPicks: FantasyGameweekPicks,
    playerMap: Map<number, any>,
    teamMap: Map<number, any>,
    elementTypeMap: Map<number, any>
  ): PlayerComparison[] {
    const myPickMap = new Map(myPicks.picks.map((p: any) => [p.element, p]));
    const opponentPickMap = new Map(opponentPicks.picks.map((p: any) => [p.element, p]));
    const allPlayerIds = new Set([...myPickMap.keys(), ...opponentPickMap.keys()]);

    const comparisons: PlayerComparison[] = [];

    allPlayerIds.forEach((playerId: number) => {
      const player = playerMap.get(playerId);
      if (!player) return;

      const myPick = myPickMap.get(playerId);
      const opponentPick = opponentPickMap.get(playerId);
      const team = teamMap.get(player.team);
      const position = elementTypeMap.get(player.element_type);

      const myPoints = player.total_points || 0;
      const myMultiplier = myPick?.multiplier ?? 0;
      const opponentMultiplier = opponentPick?.multiplier ?? 0;

      const myEffective = myPoints * myMultiplier;
      const opponentEffective = myPoints * opponentMultiplier;

      const status =
        myPick && opponentPick ? 'common' : myPick ? 'myDifferential' : 'opponentDifferential';

      comparisons.push({
        playerId,
        playerName: player.web_name,
        position: position?.singular_name || 'Unknown',
        team: team?.short_name || 'Unknown',
        gameweekPoints: myPoints,
        myTeamMultiplier: myMultiplier,
        myTeamEffectivePoints: myEffective,
        opponentMultiplier: opponentMultiplier,
        opponentEffectivePoints: opponentEffective,
        isCaptain: myPick?.isCaptain ?? false,
        isViceCaptain: opponentPick?.isViceCaptain ?? false,
        status,
      });
    });

    // Sort: common first, then by effective points difference
    return comparisons.sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === 'common') return -1;
        if (b.status === 'common') return 1;
      }

      const diffA = Math.abs(a.myTeamEffectivePoints - a.opponentEffectivePoints);
      const diffB = Math.abs(b.myTeamEffectivePoints - b.opponentEffectivePoints);
      return diffB - diffA;
    });
  }

  /**
   * Calculate key differences that explain points swing
   */
  private calculateKeyDifferences(
    playerComparisons: PlayerComparison[],
    comparison: GameweekComparison
  ): KeyDifference[] {
    const differences: KeyDifference[] = [];

    // Captain differences
    if (comparison.myCaptain && comparison.opponentCaptain) {
      if (comparison.myCaptain.playerId !== comparison.opponentCaptain.playerId) {
        differences.push({
          type: 'captain',
          description: `Captain: ${comparison.myCaptain.playerName} vs ${comparison.opponentCaptain.playerName}`,
          pointsImpact: comparison.captainImpact,
          isPositiveForMyTeam: comparison.captainImpact > 0,
          player: comparison.myCaptain.playerName,
        });
      } else if (
        comparison.myCaptain.myTeamMultiplier !== comparison.opponentCaptain.opponentMultiplier
      ) {
        differences.push({
          type: 'multiplier',
          description: `${comparison.myCaptain.playerName} multiplier: ${comparison.myCaptain.myTeamMultiplier}x vs ${comparison.opponentCaptain.opponentMultiplier}x`,
          pointsImpact: comparison.captainImpact,
          isPositiveForMyTeam: comparison.captainImpact > 0,
        });
      }
    } else if (comparison.myCaptain) {
      differences.push({
        type: 'captain',
        description: `My captain: ${comparison.myCaptain.playerName} (${comparison.myCaptain.gameweekPoints}pts × 2)`,
        pointsImpact: comparison.myCaptain.myTeamEffectivePoints,
        isPositiveForMyTeam: true,
        player: comparison.myCaptain.playerName,
      });
    }

    // Top differentials (positive for my team)
    const myDifferentials = playerComparisons
      .filter((p) => p.status === 'myDifferential' && p.myTeamEffectivePoints > 0)
      .sort((a, b) => b.myTeamEffectivePoints - a.myTeamEffectivePoints)
      .slice(0, 3);

    myDifferentials.forEach((diff) => {
      if (diff.myTeamEffectivePoints >= 5) {
        differences.push({
          type: 'differential',
          description: `+${diff.myTeamEffectivePoints} ${diff.playerName}`,
          pointsImpact: diff.myTeamEffectivePoints,
          isPositiveForMyTeam: true,
          player: diff.playerName,
        });
      }
    });

    // Top opponent differentials (negative for my team)
    const opponentDifferentials = playerComparisons
      .filter((p) => p.status === 'opponentDifferential' && p.opponentEffectivePoints > 0)
      .sort((a, b) => b.opponentEffectivePoints - a.opponentEffectivePoints)
      .slice(0, 3);

    opponentDifferentials.forEach((diff) => {
      if (diff.opponentEffectivePoints >= 5) {
        differences.push({
          type: 'differential',
          description: `-${diff.opponentEffectivePoints} ${diff.playerName}`,
          pointsImpact: -diff.opponentEffectivePoints,
          isPositiveForMyTeam: false,
          player: diff.playerName,
        });
      }
    });

    return differences.sort((a, b) => Math.abs(b.pointsImpact) - Math.abs(a.pointsImpact));
  }

  /**
   * Get available gameweeks for comparison
   * Returns completed gameweeks and current if active
   */
  async getAvailableGameweeks(entryId: number): Promise<number[]> {
    try {
      const history = await this.repository.getEntryHistory(entryId);
      return history
        .filter((h) => h.event > 0)
        .map((h) => h.event)
        .sort((a, b) => b - a);
    } catch (err) {
      console.error('Failed to get available gameweeks:', err);
      return [];
    }
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): GameweekComparison | null {
    const cached = this.comparisonCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.comparisonCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: GameweekComparison): void {
    this.comparisonCache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(key?: string): void {
    if (key) {
      this.comparisonCache.delete(key);
    } else {
      this.comparisonCache.clear();
    }
  }
}
