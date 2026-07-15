/**
 * Fantasy Game Live Service
 * Merges entry picks with live gameweek data to calculate squad performance
 * Reusable calculation layer for live squad scoring
 */

import type { LiveSquadPerformance, LiveSquadPlayer, LiveGameweekSummary } from '@domain/models';
import { PlayerMatchStatus } from '@domain/models';
import type { FantasyGameweekPicks, FantasyPick } from '@domain/models';
import type { Player } from '@domain/models';
import type {
  EventLiveData,
  LivePlayerStats as ApiLivePlayerStats,
} from '@shared/services/fpl-client';

export class FantasyGameLiveService {
  /**
   * Merge picks with live data to create squad performance
   * @param entryId - FPL entry ID
   * @param gameweekId - Gameweek number
   * @param picks - Entry picks for the gameweek
   * @param eventLiveData - Live stats from FPL API
   * @param fixtures - Fixture data for match status (optional enrichment)
   * @param playerMap - Map of player IDs to player data (optional enrichment)
   * @param gameweekData - Gameweek data (optional enrichment)
   * @returns Complete squad performance with live scores
   */
  calculateSquadPerformance(
    entryId: number,
    gameweekId: number,
    picks: FantasyGameweekPicks,
    eventLiveData: EventLiveData,
    playerMap?: Map<number, Player>
  ): LiveSquadPerformance {
    // Build live stats lookup for O(1) access
    const liveStatsMap = this.buildLiveStatsMap(eventLiveData);

    // Convert picks to squad players with live data
    const squadPlayers = picks.picks.map((pick) =>
      this.createLiveSquadPlayer(pick, liveStatsMap, playerMap)
    );

    // Split into starters and bench
    const starters = squadPlayers.filter((p) => !p.isBench);
    const bench = squadPlayers.filter((p) => p.isBench);

    // Calculate summary
    const summary = this.calculateGameweekSummary(
      gameweekId,
      starters,
      bench,
      picks,
      eventLiveData
    );

    // Calculate highlights
    const highlights = this.calculateHighlights(squadPlayers);

    return {
      entryId,
      gameweekId,
      summary,
      starters,
      bench,
      highlights,
    };
  }

  /**
   * Build efficient lookup map for live stats
   */
  private buildLiveStatsMap(eventLiveData: EventLiveData): Map<number, ApiLivePlayerStats> {
    const map = new Map<number, ApiLivePlayerStats>();
    for (const stats of eventLiveData.elements) {
      map.set(stats.id, stats);
    }
    return map;
  }

  /**
   * Convert a pick into a live squad player
   */
  private createLiveSquadPlayer(
    pick: FantasyPick,
    liveStatsMap: Map<number, ApiLivePlayerStats>,
    playerMap?: Map<number, Player>
  ): LiveSquadPlayer {
    const liveStats = liveStatsMap.get(pick.element);
    const player = playerMap?.get(pick.element);

    // Extract live stats
    const gameweekPoints = liveStats?.stats.total_points ?? 0;
    const minutes = liveStats?.stats.minutes ?? 0;

    // Calculate effective points based on multiplier
    let effectivePoints = gameweekPoints * pick.multiplier;

    // Only count captain/VC multiplier if player has played
    // Vice captain multiplier only applies if captain didn't play (automatic sub)
    if (pick.multiplier === 2 && minutes === 0) {
      // Captain didn't play, use base points
      effectivePoints = gameweekPoints;
    }

    // Determine match status
    const matchStatus = this.determineMatchStatus(minutes, player?.status);

    // Get enrichment data
    const playerName = player ? `${player.firstName} ${player.lastName}` : undefined;
    const playerPosition = player?.position;
    const clubCode = player?.clubCode?.toString();
    const clubName = player?.club;

    return {
      playerId: pick.element,
      squadPosition: pick.position,
      isCaptain: pick.isCaptain,
      isViceCaptain: pick.isViceCaptain,
      isBench: pick.isBench,
      benchOrder: pick.benchOrder,

      matchStatus,
      gameweekPoints,
      effectivePoints,

      minutes,
      goalsScored: liveStats?.stats.goals_scored ?? 0,
      assists: liveStats?.stats.assists ?? 0,
      cleanSheets: liveStats?.stats.clean_sheets ?? 0,
      goalsConceded: liveStats?.stats.goals_conceded ?? 0,
      ownGoals: liveStats?.stats.own_goals ?? 0,
      penaltiesSaved: liveStats?.stats.penalties_saved ?? 0,
      penaltiesMissed: liveStats?.stats.penalties_missed ?? 0,
      yellowCards: liveStats?.stats.yellow_cards ?? 0,
      redCards: liveStats?.stats.red_cards ?? 0,
      saves: liveStats?.stats.saves ?? 0,
      bonus: liveStats?.stats.bonus ?? 0,
      bps: liveStats?.stats.bps ?? 0,

      playerName,
      playerPosition,
      clubCode,
      clubName,
    };
  }

  /**
   * Determine player match status
   */
  private determineMatchStatus(minutes: number, playerStatus?: string): PlayerMatchStatus {
    // Player status from global data: 'a' (available), 'd' (doubt), 'i' (injured), 's' (suspended)
    // For live matching, we use minutes played

    if (minutes === 0) {
      // Player hasn't played
      // Status 'd' suggests upcoming fixture
      if (playerStatus === 'd' || playerStatus === 'a') {
        return PlayerMatchStatus.NotStarted;
      }
      return PlayerMatchStatus.Unknown;
    }

    if (minutes > 0 && minutes < 90) {
      // Actively playing or just finished
      return PlayerMatchStatus.Live;
    }

    if (minutes >= 90) {
      // Match finished
      return PlayerMatchStatus.Finished;
    }

    return PlayerMatchStatus.Unknown;
  }

  /**
   * Calculate gameweek summary
   */
  private calculateGameweekSummary(
    gameweekId: number,
    starters: LiveSquadPlayer[],
    bench: LiveSquadPlayer[],
    picks: FantasyGameweekPicks,
    eventLiveData: EventLiveData
  ): LiveGameweekSummary {
    const totalLivePoints =
      starters.reduce((sum, p) => sum + p.effectivePoints, 0) +
      bench.reduce((sum, p) => sum + (p.effectivePoints > 0 ? p.effectivePoints : 0), 0);

    const captainPlayer = starters.find((p) => p.isCaptain);
    const benchPlayers = bench.filter((p) => p.effectivePoints > 0);

    const playersPlayed = [...starters, ...bench].filter((p) => p.minutes > 0).length;
    const playersLive = [...starters, ...bench].filter(
      (p) => p.matchStatus === PlayerMatchStatus.Live
    ).length;
    const playersRemaining = [...starters, ...bench].filter(
      (p) => p.matchStatus === PlayerMatchStatus.NotStarted
    ).length;

    return {
      gameweekId,
      isLive: eventLiveData.state === 'live',
      isCompleted: eventLiveData.state === 'post',
      totalPoints: totalLivePoints,
      officialPoints: null, // Not available from event/live endpoint
      deductedPoints: picks.transfersCost,
      playersPlayed,
      playersLive,
      playersRemaining,
      captainPoints: captainPlayer ? captainPlayer.effectivePoints : 0,
      benchPoints: benchPlayers.reduce((sum, p) => sum + p.effectivePoints, 0),
      lastUpdated: new Date(),
      dataState: this.mapEventState(eventLiveData.state),
    };
  }

  /**
   * Map FPL event state to domain dataState
   */
  private mapEventState(eventState?: string): 'live' | 'completed' | 'unknown' {
    switch (eventState) {
      case 'live':
        return 'live';
      case 'post':
        return 'completed';
      default:
        return 'unknown';
    }
  }

  /**
   * Calculate deterministic highlights
   */
  private calculateHighlights(squadPlayers: LiveSquadPlayer[]): LiveSquadPerformance['highlights'] {
    const highlights: LiveSquadPerformance['highlights'] = {};

    // Top scorer
    const topScorer = [...squadPlayers].sort((a, b) => b.effectivePoints - a.effectivePoints)[0];
    if (topScorer) {
      highlights.topScorer = {
        playerId: topScorer.playerId,
        playerName: topScorer.playerName,
        points: topScorer.effectivePoints,
      };
    }

    // Captain contribution
    const captain = squadPlayers.find((p) => p.isCaptain);
    if (captain && captain.gameweekPoints > 0) {
      highlights.captainContribution = {
        playerId: captain.playerId,
        playerName: captain.playerName,
        effectivePoints: captain.effectivePoints,
        basePoints: captain.gameweekPoints,
      };
    }

    // Bench highlight (highest scorer on bench)
    const benchScorers = squadPlayers.filter((p) => p.isBench && p.effectivePoints > 0);
    if (benchScorers.length > 0) {
      const benchTop = benchScorers.sort((a, b) => b.effectivePoints - a.effectivePoints)[0];
      highlights.benchHighlight = {
        playerId: benchTop.playerId,
        playerName: benchTop.playerName,
        points: benchTop.effectivePoints,
      };
    }

    // Highest scoring defender
    const defenders = squadPlayers.filter((p) => p.playerPosition === 'DEFENDER');
    if (defenders.length > 0) {
      const defenderTop = defenders.sort((a, b) => b.effectivePoints - a.effectivePoints)[0];
      if (defenderTop.effectivePoints > 0) {
        highlights.highestScoringDefender = {
          playerId: defenderTop.playerId,
          playerName: defenderTop.playerName,
          points: defenderTop.effectivePoints,
        };
      }
    }

    // Highest scoring midfielder
    const midfielders = squadPlayers.filter((p) => p.playerPosition === 'MIDFIELDER');
    if (midfielders.length > 0) {
      const midfielderTop = midfielders.sort((a, b) => b.effectivePoints - a.effectivePoints)[0];
      if (midfielderTop.effectivePoints > 0) {
        highlights.highestScoringMidfielder = {
          playerId: midfielderTop.playerId,
          playerName: midfielderTop.playerName,
          points: midfielderTop.effectivePoints,
        };
      }
    }

    return highlights;
  }
}
