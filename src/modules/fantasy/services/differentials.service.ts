/**
 * Differentials Analysis Service
 * Compares two teams and identifies player differentials
 * Helps understand which players are creating/destroying points vs opponent
 */

import type { FantasyGameweekPicks } from '@domain/models';

export interface PlayerDifferential {
  playerId: number;
  playerName: string;
  team: string;

  // My team data
  myMultiplier: number;
  myPoints: number;
  myEffectivePoints: number;
  myPosition: 'starter' | 'bench' | 'sub';
  myIsCaptain: boolean;
  myIsViceCaptain: boolean;

  // Opponent data
  opponentMultiplier: number;
  opponentPoints: number;
  opponentEffectivePoints: number;
  opponentPosition: 'starter' | 'bench' | 'sub';
  opponentIsCaptain: boolean;
  opponentIsViceCaptain: boolean;

  // Impact
  pointsDifference: number; // My points - Opponent points
  isCommon: boolean;
  isDifferential: boolean;
}

export interface DifferentialsAnalysis {
  commonPlayers: PlayerDifferential[];
  myDifferentials: PlayerDifferential[]; // Players that help me
  opponentDifferentials: PlayerDifferential[]; // Players that help opponent
  totalMyPoints: number;
  totalOpponentPoints: number;
}

export class DifferentialsService {
  /**
   * Analyze differentials between two teams
   */
  static analyzeDifferentials(
    myPicks: FantasyGameweekPicks,
    opponentPicks: FantasyGameweekPicks,
    myEnrichedPicks?: any,
    opponentEnrichedPicks?: any
  ): DifferentialsAnalysis {
    const myPlayerMap = this.createPlayerMap(myPicks, myEnrichedPicks);
    const opponentPlayerMap = this.createPlayerMap(opponentPicks, opponentEnrichedPicks);

    const allPlayerIds = new Set([...myPlayerMap.keys(), ...opponentPlayerMap.keys()]);
    const differentials: PlayerDifferential[] = [];

    allPlayerIds.forEach((playerId) => {
      const myData = myPlayerMap.get(playerId);
      const opponentData = opponentPlayerMap.get(playerId);

      if (myData || opponentData) {
        const differential = this.createDifferential(playerId, myData, opponentData);
        differentials.push(differential);
      }
    });

    // Classify differentials
    const commonPlayers = differentials.filter((d) => d.isCommon);
    const myDifferentials = differentials.filter((d) => d.isDifferential && d.pointsDifference > 0);
    const opponentDifferentials = differentials.filter(
      (d) => d.isDifferential && d.pointsDifference < 0
    );

    // Calculate totals
    const totalMyPoints = differentials.reduce((sum, d) => sum + d.myEffectivePoints, 0);
    const totalOpponentPoints = differentials.reduce(
      (sum, d) => sum + d.opponentEffectivePoints,
      0
    );

    return {
      commonPlayers,
      myDifferentials,
      opponentDifferentials,
      totalMyPoints,
      totalOpponentPoints,
    };
  }

  /**
   * Create a map of player ID -> player data
   */
  private static createPlayerMap(
    picks: FantasyGameweekPicks,
    enrichedPicks?: any
  ): Map<number, any> {
    const map = new Map();

    picks.picks.forEach((pick) => {
      const enrichedData = enrichedPicks?.picks?.find((p: any) => p.element === pick.element);

      map.set(pick.element, {
        playerId: pick.element,
        isCaptain: pick.isCaptain,
        isViceCaptain: pick.isViceCaptain,
        position: pick.position,
        multiplier: pick.multiplier,
        points: enrichedData?.playerEventPoints ?? 0,
        effectivePoints: enrichedData?.playerEffectivePoints ?? 0,
      });
    });

    return map;
  }

  /**
   * Create a differential entry for a player
   */
  private static createDifferential(
    playerId: number,
    myData: any,
    opponentData: any
  ): PlayerDifferential {
    const myExists = !!myData;
    const opponentExists = !!opponentData;
    const isCommon = myExists && opponentExists;

    return {
      playerId,
      playerName: '', // Will be populated by component using PlayerRepository
      team: '', // Will be populated by component using PlayerRepository

      // My team
      myMultiplier: myData?.multiplier ?? 0,
      myPoints: myData?.points ?? 0,
      myEffectivePoints: myData?.effectivePoints ?? 0,
      myPosition: myData
        ? myData.position <= 11
          ? 'starter'
          : myData.position > 14
            ? 'sub'
            : 'bench'
        : 'bench',
      myIsCaptain: myData?.isCaptain ?? false,
      myIsViceCaptain: myData?.isViceCaptain ?? false,

      // Opponent
      opponentMultiplier: opponentData?.multiplier ?? 0,
      opponentPoints: opponentData?.points ?? 0,
      opponentEffectivePoints: opponentData?.effectivePoints ?? 0,
      opponentPosition: opponentData
        ? opponentData.position <= 11
          ? 'starter'
          : opponentData.position > 14
            ? 'sub'
            : 'bench'
        : 'bench',
      opponentIsCaptain: opponentData?.isCaptain ?? false,
      opponentIsViceCaptain: opponentData?.isViceCaptain ?? false,

      // Impact
      pointsDifference: (myData?.effectivePoints ?? 0) - (opponentData?.effectivePoints ?? 0),
      isCommon,
      isDifferential: !isCommon,
    };
  }
}
