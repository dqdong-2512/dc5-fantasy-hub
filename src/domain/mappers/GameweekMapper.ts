import type { NormalizedGameweek } from '../../repositories/types';
import type { Gameweek } from '../models';

/**
 * Maps normalized gameweek data to domain gameweek model
 */
export class GameweekMapper {
  static toDomain(gameweek: NormalizedGameweek): Gameweek {
    return {
      id: gameweek.id,
      name: gameweek.name,
      deadline: gameweek.deadlineTime,
      finished: gameweek.finished,
      averageScore: gameweek.averageEntryScore ?? 0,
    };
  }
}
