import { TournamentRepository as BaseTournamentRepository } from '../../tournament-engine/repositories/TournamentRepository';
import { AseanTournamentProvider } from '../providers';

export class TournamentRepository extends BaseTournamentRepository {
  constructor() {
    super(new AseanTournamentProvider());
  }
}
