import type { Player, Team } from '@domain/models';
import { Position } from '@domain/enums';
import type { PlayerAnalyticsRecord } from '@domain/models';
import { FixtureRepository } from '@repositories/fixtures';
import { TeamRepository } from '@repositories/teams';
import { PlayerFormService } from './player-form.service';
import { DECISION_HUB_CONFIG } from '../config/decision-config';
import type {
  CaptainCandidate,
  DifferentialPick,
  PlayerFormProfile,
  PlayerRiskFlag,
  TeamFixtureDifficulty,
  TeamFixtureRun,
  TeamInsightSummary,
  TransferCandidate,
  ValueIndexRecord,
} from '../types/decision-hub';

export class DecisionHubService {
  private fixtureRepository: FixtureRepository;
  private teamRepository: TeamRepository;
  private playerFormService: PlayerFormService;

  constructor() {
    this.fixtureRepository = new FixtureRepository();
    this.teamRepository = new TeamRepository();
    this.playerFormService = new PlayerFormService();
  }

  buildPlayerFormProfiles(players: Player[]): PlayerFormProfile[] {
    return this.playerFormService.buildProfiles(players);
  }

  private getTeamByClubName(clubName: string): Team | null {
    return this.teamRepository.getAll().find((team) => team.name === clubName) ?? null;
  }

  private getUpcomingFixtures(teamId: number, horizon: number): TeamFixtureDifficulty[] {
    return this.fixtureRepository
      .getUpcomingByTeam(teamId)
      .slice(0, horizon)
      .map((fixture) => {
        const isHome = fixture.homeTeam.id === teamId;
        const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
        return {
          gameweek: fixture.gameweek,
          opponentCode: opponent.code,
          homeAway: isHome ? 'H' : 'A',
          difficulty: isHome ? fixture.homeDifficulty : fixture.awayDifficulty,
        };
      });
  }

  private averageDifficulty(fixtures: TeamFixtureDifficulty[], horizon: number): number {
    if (fixtures.length === 0) {
      return 5;
    }

    const target = fixtures.slice(0, horizon);
    if (target.length === 0) {
      return 5;
    }

    const total = target.reduce((sum, item) => sum + item.difficulty, 0);
    return Number((total / target.length).toFixed(2));
  }

  private fixtureRating(averageDifficulty: number): number {
    return Math.max(0, Math.min(100, Math.round(((5 - averageDifficulty) / 4) * 100)));
  }

  private captainConfidence(score: number, reliability: number): 'High' | 'Medium' | 'Low' {
    if (score >= 76 && reliability >= 0.8) {
      return 'High';
    }
    if (score >= 58 && reliability >= 0.65) {
      return 'Medium';
    }
    return 'Low';
  }

  private formatFixtureSummary(fixtures: TeamFixtureDifficulty[]): string {
    if (fixtures.length === 0) {
      return 'No upcoming fixtures';
    }

    return fixtures
      .slice(0, 3)
      .map((fixture) => `${fixture.opponentCode}(${fixture.homeAway}) ${fixture.difficulty}`)
      .join(' • ');
  }

  private formatPriceTrend(player: PlayerAnalyticsRecord): number {
    if (typeof player.price !== 'number') {
      return 0;
    }

    if (player.formScore >= 7 && player.ownership >= 20) {
      return 0.1;
    }

    if (player.formScore <= 4) {
      return -0.1;
    }

    return 0;
  }

  getCaptainCandidates(
    records: PlayerAnalyticsRecord[],
    formProfiles: PlayerFormProfile[],
    managerOnly: boolean
  ): CaptainCandidate[] {
    const profileByPlayerId = new Map(formProfiles.map((profile) => [profile.playerId, profile]));
    const basePool = managerOnly ? records.filter((record) => Boolean(record.isInMyTeam)) : records;

    return basePool
      .filter((record) => record.minutesPlayed >= DECISION_HUB_CONFIG.CAPTAIN.MIN_MINUTES)
      .map((record) => {
        const profile = profileByPlayerId.get(record.playerId);
        const team = this.getTeamByClubName(record.club);
        const nextFixture = team ? this.getUpcomingFixtures(team.id, 1)[0] : null;
        const next3 = team
          ? this.getUpcomingFixtures(team.id, DECISION_HUB_CONFIG.FIXTURE_RUNS.SHORT_HORIZON)
          : [];

        const homeAwayFactor = nextFixture ? (nextFixture.homeAway === 'H' ? 1 : 0.72) : 0.8;
        const reliabilityFactor = Math.max(0, Math.min(1, record.minutesPlayed / 720));
        const involvementFactor = Math.max(
          0,
          Math.min(
            1,
            ((profile?.last5.goals ?? 0) + (profile?.last5.assists ?? 0) + record.pointsPerGame) /
              12
          )
        );
        const penaltyFactor =
          (record.position === Position.Forward || record.position === Position.Midfielder) &&
          (profile?.last8.goals ?? 0) >= 1.8
            ? 1
            : 0;
        const setPieceFactor = (profile?.last8.assists ?? 0) >= 1.6 ? 1 : 0;
        const ownershipFactor = 1 - Math.min(1, Math.abs(record.ownership - 35) / 40);
        const differentialFactor = record.ownership <= 15 ? 1 : 0;

        const score = Math.round(
          (record.formScore / 10) * DECISION_HUB_CONFIG.CAPTAIN.FORM_WEIGHT * 100 +
            (record.fixtureScore / 10) * DECISION_HUB_CONFIG.CAPTAIN.FIXTURE_WEIGHT * 100 +
            homeAwayFactor * DECISION_HUB_CONFIG.CAPTAIN.HOME_AWAY_WEIGHT * 100 +
            reliabilityFactor * DECISION_HUB_CONFIG.CAPTAIN.RELIABILITY_WEIGHT * 100 +
            involvementFactor * DECISION_HUB_CONFIG.CAPTAIN.INVOLVEMENT_WEIGHT * 100 +
            penaltyFactor * DECISION_HUB_CONFIG.CAPTAIN.PENALTY_WEIGHT * 100 +
            setPieceFactor * DECISION_HUB_CONFIG.CAPTAIN.SET_PIECE_WEIGHT * 100 +
            ownershipFactor * DECISION_HUB_CONFIG.CAPTAIN.OWNERSHIP_WEIGHT * 100 +
            differentialFactor * DECISION_HUB_CONFIG.CAPTAIN.DIFFERENTIAL_WEIGHT * 100
        );

        const confidence = this.captainConfidence(score, reliabilityFactor);
        const reason = [
          `Form ${record.formScore.toFixed(1)}`,
          `Fixture ${record.fixtureScore.toFixed(1)}`,
          `Reliability ${(reliabilityFactor * 100).toFixed(0)}%`,
          differentialFactor > 0 ? 'Differential upside' : 'Template safety',
        ].join(' • ');

        return {
          playerId: record.playerId,
          playerName: record.playerName,
          club: record.club,
          score: Math.max(0, Math.min(100, score)),
          confidence,
          ownership: record.ownership,
          fixtureSummary: this.formatFixtureSummary(next3),
          reason,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, DECISION_HUB_CONFIG.CAPTAIN.MAX_RESULTS);
  }

  buildTransferRecommendations(
    records: PlayerAnalyticsRecord[],
    formProfiles: PlayerFormProfile[],
    managerPlayerIds: number[],
    bankInMillions?: number | null
  ): TransferCandidate[] {
    const profileByPlayerId = new Map(formProfiles.map((profile) => [profile.playerId, profile]));
    const owned = new Set(managerPlayerIds);

    const recommendations: TransferCandidate[] = records
      .filter((record) => record.minutesPlayed >= DECISION_HUB_CONFIG.TRANSFERS.MIN_MINUTES)
      .map((record) => {
        const profile = profileByPlayerId.get(record.playerId);
        const team = this.getTeamByClubName(record.club);
        const fixtures = team
          ? this.getUpcomingFixtures(team.id, DECISION_HUB_CONFIG.FIXTURE_RUNS.SHORT_HORIZON)
          : [];

        const buyScore =
          (record.formScore / 10) * 36 +
          (record.valueScore / 30) * 22 +
          (record.fixtureScore / 10) * 22 +
          Math.min(1, record.minutesPlayed / 1200) * 20;

        const sellScore =
          Math.max(0, (5 - record.formScore) / 5) * 45 +
          Math.max(0, (4 - record.fixtureScore) / 4) * 35 +
          Math.max(0, (700 - record.minutesPlayed) / 700) * 20;

        let action: TransferCandidate['action'];
        let score: number;

        if (owned.has(record.playerId)) {
          if (sellScore >= DECISION_HUB_CONFIG.TRANSFERS.SELL_THRESHOLD) {
            action = 'sell';
            score = sellScore;
          } else {
            action = 'hold';
            score = 100 - sellScore;
          }
        } else if (buyScore >= DECISION_HUB_CONFIG.TRANSFERS.BUY_THRESHOLD) {
          action = 'buy';
          score = buyScore;
        } else {
          action = 'watchlist';
          score = Math.max(buyScore, DECISION_HUB_CONFIG.TRANSFERS.WATCHLIST_THRESHOLD - 1);
        }

        const price = record.price / 10;
        const affordable =
          !bankInMillions || bankInMillions <= 0 ? true : price <= bankInMillions + 8;

        return {
          playerId: record.playerId,
          playerName: record.playerName,
          club: record.club,
          position: record.position,
          price,
          transferTargetScore: Number(score.toFixed(2)),
          action,
          priceTrend: this.formatPriceTrend(record),
          fixtureSummary: this.formatFixtureSummary(fixtures),
          formSummary: `${profile?.band ?? 'Average'} (${profile?.last5.averagePoints.toFixed(2) ?? record.formScore.toFixed(2)} avg)`,
          summary: `${action.toUpperCase()} • ${affordable ? 'budget-safe' : 'budget-stretch'}`,
        };
      })
      .filter((candidate) => {
        if (!bankInMillions || bankInMillions <= 0) {
          return true;
        }
        if (candidate.action === 'buy' || candidate.action === 'watchlist') {
          return candidate.price <= bankInMillions + 8;
        }
        return true;
      });

    return recommendations
      .sort((a, b) => b.transferTargetScore - a.transferTargetScore)
      .slice(0, DECISION_HUB_CONFIG.TRANSFERS.MAX_RESULTS);
  }

  getFixtureRuns(limit: number = DECISION_HUB_CONFIG.FIXTURE_RUNS.MAX_TEAMS): TeamFixtureRun[] {
    const teams = this.teamRepository.getAll();

    return teams
      .map((team) => this.buildTeamFixtureRun(team))
      .filter((run): run is TeamFixtureRun => run !== null)
      .sort((a, b) => a.averageDifficulty5 - b.averageDifficulty5)
      .slice(0, limit);
  }

  getDifferentialPicks(
    records: PlayerAnalyticsRecord[],
    formProfiles: PlayerFormProfile[]
  ): DifferentialPick[] {
    const profileByPlayerId = new Map(formProfiles.map((profile) => [profile.playerId, profile]));

    return records
      .filter((record) => record.ownership <= DECISION_HUB_CONFIG.DIFFERENTIALS.MAX_OWNERSHIP)
      .filter((record) => record.minutesPlayed >= DECISION_HUB_CONFIG.DIFFERENTIALS.MIN_MINUTES)
      .filter((record) => record.formScore >= DECISION_HUB_CONFIG.DIFFERENTIALS.MIN_FORM_SCORE)
      .map((record) => {
        const profile = profileByPlayerId.get(record.playerId);
        const score =
          (record.formScore / 10) * 38 +
          (record.fixtureScore / 10) * 24 +
          (record.valueScore / 30) * 20 +
          (1 - record.ownership / 100) * 18;

        return {
          playerId: record.playerId,
          playerName: record.playerName,
          club: record.club,
          position: record.position,
          ownership: record.ownership,
          formScore: profile?.last5.averagePoints ?? record.formScore,
          fixtureScore: record.fixtureScore,
          valueScore: record.valueScore,
          score: Number(score.toFixed(2)),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, DECISION_HUB_CONFIG.DIFFERENTIALS.LIMIT);
  }

  getValueIndex(
    records: PlayerAnalyticsRecord[],
    formProfiles: PlayerFormProfile[]
  ): ValueIndexRecord[] {
    const profileByPlayerId = new Map(formProfiles.map((profile) => [profile.playerId, profile]));

    return records
      .map((record) => {
        const price = record.price / 10;
        const pointsPerMillion = price > 0 ? record.totalPoints / price : 0;
        const minutesPerPrice = price > 0 ? record.minutesPlayed / price : 0;
        const expectedValue =
          (profileByPlayerId.get(record.playerId)?.last5.averagePoints ?? record.formScore) * 5.5 +
          record.fixtureScore * 2 +
          Math.min(20, record.minutesPlayed / 90);

        return {
          playerId: record.playerId,
          playerName: record.playerName,
          club: record.club,
          position: record.position,
          price,
          pointsPerMillion: Number(pointsPerMillion.toFixed(2)),
          expectedValue: Number(expectedValue.toFixed(2)),
          minutesPerPrice: Number(minutesPerPrice.toFixed(2)),
        };
      })
      .sort((a, b) => b.pointsPerMillion - a.pointsPerMillion)
      .slice(0, DECISION_HUB_CONFIG.VALUE_INDEX.LIMIT);
  }

  getTeamInsightSummary(records: PlayerAnalyticsRecord[]): TeamInsightSummary {
    if (records.length === 0) {
      return {
        squadSize: 0,
        averageForm: 0,
        averageFixtureScore: 0,
        playersAtRisk: 0,
        playersWithGoodRuns: 0,
      };
    }

    const averageForm =
      records.reduce((total, record) => total + record.formScore, 0) / records.length;
    const averageFixtureScore =
      records.reduce((total, record) => total + record.fixtureScore, 0) / records.length;
    const playersAtRisk = records.filter(
      (record) => record.fixtureScore <= 3 || record.formScore < 4
    ).length;
    const playersWithGoodRuns = records.filter((record) => record.fixtureScore >= 6).length;

    return {
      squadSize: records.length,
      averageForm,
      averageFixtureScore,
      playersAtRisk,
      playersWithGoodRuns,
    };
  }

  getRiskFlags(players: Player[], records: PlayerAnalyticsRecord[]): PlayerRiskFlag[] {
    const playerById = new Map(players.map((player) => [player.id, player]));

    return records
      .flatMap((record) => {
        const source = playerById.get(record.playerId);
        if (!source) {
          return [];
        }

        const flags: PlayerRiskFlag[] = [];

        if (record.fixtureScore <= 3) {
          flags.push({
            playerId: record.playerId,
            playerName: record.playerName,
            reason: `Tough fixture run (${record.fixtureOutlook})`,
          });
        }

        if (source.minutesPlayed < DECISION_HUB_CONFIG.TEAM_INSIGHTS.LOW_MINUTES_THRESHOLD) {
          flags.push({
            playerId: record.playerId,
            playerName: record.playerName,
            reason: `Low minutes floor (${source.minutesPlayed} mins)`,
          });
        }

        if (source.status && source.status !== 'a') {
          flags.push({
            playerId: record.playerId,
            playerName: record.playerName,
            reason: `Availability flag (${source.status})`,
          });
        }

        return flags;
      })
      .slice(0, 20);
  }

  getPositionCounts(records: PlayerAnalyticsRecord[]): Record<Position, number> {
    return {
      [Position.Goalkeeper]: records.filter((record) => record.position === Position.Goalkeeper)
        .length,
      [Position.Defender]: records.filter((record) => record.position === Position.Defender).length,
      [Position.Midfielder]: records.filter((record) => record.position === Position.Midfielder)
        .length,
      [Position.Forward]: records.filter((record) => record.position === Position.Forward).length,
    };
  }

  private buildTeamFixtureRun(team: Team): TeamFixtureRun | null {
    const fixtures = this.getUpcomingFixtures(
      team.id,
      DECISION_HUB_CONFIG.FIXTURE_RUNS.LONG_HORIZON
    );

    if (fixtures.length === 0) {
      return null;
    }

    const averageDifficulty3 = this.averageDifficulty(
      fixtures,
      DECISION_HUB_CONFIG.FIXTURE_RUNS.SHORT_HORIZON
    );
    const averageDifficulty5 = this.averageDifficulty(
      fixtures,
      DECISION_HUB_CONFIG.FIXTURE_RUNS.MEDIUM_HORIZON
    );
    const averageDifficulty8 = this.averageDifficulty(
      fixtures,
      DECISION_HUB_CONFIG.FIXTURE_RUNS.LONG_HORIZON
    );

    const attackingRunRating = this.fixtureRating(
      Number(
        (averageDifficulty5 - (team.strengthAttackHome + team.strengthAttackAway) / 200).toFixed(2)
      )
    );
    const defensiveRunRating = this.fixtureRating(
      Number(
        (averageDifficulty5 - (team.strengthDefenceHome + team.strengthDefenceAway) / 200).toFixed(
          2
        )
      )
    );

    const swing = Number((averageDifficulty3 - averageDifficulty8).toFixed(2));

    return {
      teamId: team.id,
      teamName: team.name,
      teamShortName: team.shortName,
      averageDifficulty3,
      averageDifficulty5,
      averageDifficulty8,
      fixtureRating: this.fixtureRating(averageDifficulty5),
      attackingRunRating,
      defensiveRunRating,
      runLabel: this.classifyRunLabel(averageDifficulty5),
      swing,
      upcoming: fixtures,
    };
  }

  private classifyRunLabel(averageDifficulty: number): TeamFixtureRun['runLabel'] {
    if (averageDifficulty <= 2) {
      return 'excellent';
    }
    if (averageDifficulty <= 2.6) {
      return 'good';
    }
    if (averageDifficulty <= 3.4) {
      return 'mixed';
    }
    return 'tough';
  }
}
