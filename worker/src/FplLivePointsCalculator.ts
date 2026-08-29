import type {
  FplEntryPicks,
  FplLivePlayer,
  FplManagerLiveScore,
  FplPick,
  FplPlayerAvailability,
} from './models';

export interface CalculateLivePointsOptions {
  provisional: boolean;
  availability?: ReadonlyMap<number, FplPlayerAvailability>;
}

export class FplLivePointsCalculator {
  calculate(
    picks: FplEntryPicks,
    livePlayers: FplLivePlayer[],
    options: CalculateLivePointsOptions
  ): FplManagerLiveScore {
    const liveByPlayer = new Map(livePlayers.map((player) => [player.playerId, player]));
    const multipliers = new Map(picks.picks.map((pick) => [pick.playerId, pick.multiplier]));
    const isBenchBoost = picks.activeChip === 'bboost';

    if (isBenchBoost) {
      for (const pick of picks.picks.filter((candidate) => candidate.position > 11)) {
        multipliers.set(pick.playerId, Math.max(1, multipliers.get(pick.playerId) ?? 0));
      }
    }

    // FPL's automatic_subs payload is authoritative. Keeping this as an explicit stage lets the
    // same calculator add formation-aware predicted substitutions later without changing scoring.
    for (const substitution of [...picks.automaticSubstitutions].sort(
      (a, b) => a.order - b.order
    )) {
      multipliers.set(substitution.playerOut, 0);
      multipliers.set(substitution.playerIn, 1);
    }

    this.applyViceCaptainFallback(picks.picks, multipliers, options.availability);

    const playerScores = picks.picks.map((pick) => {
      const live = liveByPlayer.get(pick.playerId);
      const points = live?.totalPoints ?? 0;
      const multiplier = multipliers.get(pick.playerId) ?? 0;
      return {
        playerId: pick.playerId,
        points,
        multiplier,
        effectivePoints: points * multiplier,
        position: pick.position,
        isCaptain: pick.isCaptain,
        isViceCaptain: pick.isViceCaptain,
        isBench: pick.position > 11,
      };
    });

    const grossPoints = playerScores.reduce((total, player) => total + player.effectivePoints, 0);
    const benchPoints = playerScores
      .filter((player) => player.isBench)
      .reduce((total, player) => total + player.points, 0);
    const captainPoints = playerScores
      .filter((player) => player.isCaptain || player.isViceCaptain)
      .reduce((total, player) => total + Math.max(0, player.multiplier - 1) * player.points, 0);

    return {
      entryId: picks.entryId,
      gameweek: picks.gameweek,
      grossPoints,
      transferHit: picks.transferCost,
      livePoints: grossPoints - picks.transferCost,
      benchPoints,
      captainPoints,
      provisional: options.provisional,
      activeChip: picks.activeChip,
      players: playerScores,
    };
  }

  buildOwnershipIndex(entries: FplEntryPicks[]): Map<number, Set<number>> {
    const ownership = new Map<number, Set<number>>();
    for (const entry of entries) {
      for (const pick of entry.picks) {
        const owners = ownership.get(pick.playerId) ?? new Set<number>();
        owners.add(entry.entryId);
        ownership.set(pick.playerId, owners);
      }
    }
    return ownership;
  }

  private applyViceCaptainFallback(
    picks: FplPick[],
    multipliers: Map<number, number>,
    availability?: ReadonlyMap<number, FplPlayerAvailability>
  ): void {
    if (!availability) return;
    const captain = picks.find((pick) => pick.isCaptain);
    const viceCaptain = picks.find((pick) => pick.isViceCaptain);
    if (!captain || !viceCaptain) return;

    const captainAvailability = availability.get(captain.playerId);
    const viceAvailability = availability.get(viceCaptain.playerId);
    if (
      captainAvailability?.fixtureFinal &&
      !captainAvailability.appeared &&
      viceAvailability?.appeared
    ) {
      const captainMultiplier = Math.max(2, multipliers.get(captain.playerId) ?? 2);
      multipliers.set(captain.playerId, 0);
      multipliers.set(viceCaptain.playerId, captainMultiplier);
    }
  }
}
