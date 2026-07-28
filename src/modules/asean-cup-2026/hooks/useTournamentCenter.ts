import { useTournamentEngine } from '../../tournament-engine/hooks';
import type { TournamentCenterData } from '../models/tournament.models';
import { TournamentService } from '../services/TournamentService';

export interface UseTournamentCenterOptions {
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

export interface UseTournamentCenterResult {
  data: TournamentCenterData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const tournamentService = new TournamentService();

export function useTournamentCenter(
  options?: UseTournamentCenterOptions
): UseTournamentCenterResult {
  return useTournamentEngine(tournamentService, options);
}
