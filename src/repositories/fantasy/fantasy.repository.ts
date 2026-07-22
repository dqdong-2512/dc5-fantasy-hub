/**
 * Fantasy Game Repository
 * Service layer for personal FPL Entry data
 * Fetches from FPL API and converts to domain models
 */

import {
  FplClient,
  type EntryData,
  type EntryPicksData,
  type LeagueStandingsData,
} from '@shared/services/fpl-client';
import { FantasyGameLiveService } from '@shared/services/fantasy-game-live.service';
import type {
  FantasyEntry,
  FantasyManager,
  FantasyTeam,
  FantasyGameweekHistory,
  FantasyGameweekPicks,
  FantasyPick,
  FantasyLeagueStanding,
  FantasyLeagueStandings,
  LiveSquadPerformance,
} from '@domain/models';

export class FantasyGameRepository {
  private fplClient: FplClient;
  private liveService: FantasyGameLiveService;

  constructor() {
    this.fplClient = new FplClient();
    this.liveService = new FantasyGameLiveService();
  }

  /**
   * Get entry profile and information
   */
  async getEntry(entryId: number): Promise<FantasyEntry> {
    const data = await this.fplClient.getEntry(entryId);
    return this.mapEntryToModel(data);
  }

  /**
   * Get entry gameweek history
   */
  async getEntryHistory(entryId: number): Promise<FantasyGameweekHistory[]> {
    const data = await this.fplClient.getEntryHistory(entryId);
    return data.current.map((h) => ({
      event: h.event,
      points: h.points,
      totalPoints: h.total_points,
      rank: h.rank,
      prevRank: h.rank_sort,
      rankSort: h.rank_sort,
      transfers: h.transfers_made,
      transfersCost: h.transfers_cost,
      benchPoints: 0, // Not provided in history endpoint
      eventTransfers: h.event_transfers,
      eventTransfersCost: h.event_transfers_cost,
    }));
  }

  /**
   * Get gameweek picks for entry
   */
  async getEntryPicks(entryId: number, eventId: number): Promise<FantasyGameweekPicks> {
    const data = await this.fplClient.getEntryPicks(entryId, eventId);
    return this.mapPicksToModel(data, entryId, eventId);
  }

  /**
   * Get league standings
   */
  async getLeagueStandings(leagueId: number, page?: number): Promise<FantasyLeagueStandings> {
    const data = await this.fplClient.getLeagueStandings(leagueId, page);
    return this.mapLeagueStandingsToModel(data);
  }

  /**
   * Get live squad performance for a gameweek
   * Merges picks with live event data
   */
  async getLiveSquadPerformance(
    entryId: number,
    gameweekId: number,
    playerMap?: Map<number, any>
  ): Promise<LiveSquadPerformance> {
    // Fetch picks and live data in parallel
    const [picks, eventLiveData] = await Promise.all([
      this.getEntryPicks(entryId, gameweekId),
      this.fplClient.getEventLive(gameweekId),
    ]);

    // Calculate squad performance
    return this.liveService.calculateSquadPerformance(
      entryId,
      gameweekId,
      picks,
      eventLiveData,
      playerMap
    );
  }

  // Mappers

  private mapEntryToModel(data: EntryData): FantasyEntry {
    // Defensive: Handle cases where manager object might be missing or incomplete
    const managerName = data.manager?.name || `${data.player_first_name} ${data.player_last_name}`;
    const joinDate = data.manager?.join_date;

    if (!managerName || managerName.trim().length === 0) {
      throw new Error(
        `Failed to map entry data: Manager name not found. Entry ID: ${data.id}`
      );
    }

    const manager: FantasyManager = {
      id: data.id,
      name: managerName,
      totalPoints: data.summary_overall_points,
      overallRank: data.summary_overall_rank,
      region: data.player_region_name,
      joinedDate: joinDate,
    };

    const team: FantasyTeam = {
      id: data.id,
      entryId: data.id,
      name: data.name || 'Team',
      transfersMade: 0,
      transfersBudget: 0,
    };

    const classicLeagues = data.leagues?.classic?.map((league) => league.id) || [];

    return {
      id: data.id,
      manager,
      team,
      joinedLeaguesIds: classicLeagues,
    };
  }

  private mapPicksToModel(
    data: EntryPicksData,
    entryId: number,
    eventId: number
  ): FantasyGameweekPicks {
    const picks: FantasyPick[] = data.picks.map((pick) => ({
      element: pick.element,
      position: pick.position,
      multiplier: pick.multiplier,
      isCaptain: pick.is_captain,
      isViceCaptain: pick.is_vice_captain,
      isBench: pick.position > 11,
      benchOrder: pick.position > 11 ? pick.position - 11 : undefined,
    }));

    return {
      eventId,
      entryId,
      picks,
      transfersMade: data.entry_history.event_transfers,
      transfersCost: data.entry_history.event_transfers_cost,
      bankValue: data.entry_history.bank,
      teamValue: data.entry_history.value,
      status: 'active',
      activeChip: data.active_chip,
      autoSubs: data.automatic_subs.map((sub) => ({
        elementIn: sub.element_in,
        elementOut: sub.element_out,
        subOrder: sub.sub_order,
      })),
    };
  }

  private mapLeagueStandingsToModel(data: LeagueStandingsData): FantasyLeagueStandings {
    const standings: FantasyLeagueStanding[] = data.standings.results.map((result) => ({
      rank: result.rank,
      prevRank: result.previous_rank,
      entryId: result.entry,
      entryName: result.entry_name,
      playerName: result.player_name,
      teamName: result.entry_name,
      points: result.total,
      eventPoints: result.event_total,
      totalPoints: result.total,
      lastRank: result.last_rank || undefined,
    }));

    return {
      leagueId: data.league.id,
      leagueName: data.league.name,
      standings,
      pageStandings: standings,
      leagueType: data.league.leagueType || 'classic',
      results: standings,
      hasNext: data.standings.has_next,
      pageNumber: data.standings.page,
      pageSize: standings.length,
    };
  }
}
