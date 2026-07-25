import type { TournamentSnapshotPayload } from '../models/tournament-engine.models';

export interface TournamentProvider {
  loadSnapshot(forceRefresh?: boolean): Promise<TournamentSnapshotPayload>;
  invalidate(): void;
}
