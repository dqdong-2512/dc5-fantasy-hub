import { ASEAN_CUP_2026_TOURNAMENT_CONFIG } from '../config/tournament.config';
import { TournamentRepository } from '../repositories/TournamentRepository';
import { TournamentEngineService } from '../../tournament-engine/services/TournamentEngineService';

export class TournamentService extends TournamentEngineService {
  constructor(repository?: TournamentRepository) {
    super(ASEAN_CUP_2026_TOURNAMENT_CONFIG, repository ?? new TournamentRepository());
  }
}
