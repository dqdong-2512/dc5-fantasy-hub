import type { Player } from '@domain/models';
import type { Team } from '@domain/models';
import { Position } from '@domain/enums';
import type { PlayerAnalyticsRecord } from '@domain/models';
import { FixtureRepository } from '@repositories/fixtures';
import { TeamRepository } from '@repositories/teams';
import { DECISION_HUB_CONFIG } from '../config/decision-config';
import type {
  CaptainCandidate,
  PlayerRiskFlag,
  TeamFixtureRun,
  TeamInsightSummary,
  TransferCandidate,
} from '../types/decision-hub';

export class DecisionHubService {
  private fixtureRepository: FixtureRepository;
  private teamRepository: TeamRepository;

  constructor() {
    this.fixtureRepository = new FixtureRepository();
    this.teamRepository = new TeamRepository();
  }

  getCaptainCandidates(records: PlayerAnalyticsRecord[], managerOnly: boolean): CaptainCandidate[] {
    const basePool = managerOnly ? records.filter((record) => Boolean(record.isInMyTeam)) : records;

    return basePool
      .filter((record) => record.minutesPlayed >= DECISION_HUB_CONFIG.CAPTAIN.MIN_MINUTES)
      .map((record) => {
        const reliability = Math.min(10, record.minutesPlayed / 270);
        const score =
          record.formScore * DECISION_HUB_CONFIG.CAPTAIN.FORM_WEIGHT +
          record.fixtureScore * DECISION_HUB_CONFIG.CAPTAIN.FIXTURE_WEIGHT +
          reliability * DECISION_HUB_CONFIG.CAPTAIN.RELIABILITY_WEIGHT;

        return {
          playerId: record.playerId,
          playerName: record.playerName,
          club: record.club,
          score: Math.max(0, Math.min(10, score)),
          reason: `Form ${record.formScore.toFixed(1)}, fixtures ${record.fixtureScore.toFixed(1)}, minutes ${record.minutesPlayed}`,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, DECISION_HUB_CONFIG.CAPTAIN.MAX_RESULTS);
  }

  getTransferCandidates(
    records: PlayerAnalyticsRecord[],
    managerPlayerIds: number[],
    bankInMillions?: number | null
  ): TransferCandidate[] {
    const owned = new Set(managerPlayerIds);

    return records
      .filter((record) => !owned.has(record.playerId))
      .filter((record) => record.minutesPlayed >= DECISION_HUB_CONFIG.TRANSFERS.MIN_MINUTES)
      .filter(
        (record) => record.transferTargetScore >= DECISION_HUB_CONFIG.TRANSFERS.MIN_TRANSFER_SCORE
      )
      .filter((record) => {
        if (!bankInMillions || bankInMillions <= 0) {
          return true;
        }
        return record.price / 10 <= bankInMillions + 8;
      })
      .sort((a, b) => b.transferTargetScore - a.transferTargetScore)
      .slice(0, DECISION_HUB_CONFIG.TRANSFERS.MAX_RESULTS)
      .map((record) => ({
        playerId: record.playerId,
        playerName: record.playerName,
        club: record.club,
        position: record.position,
        price: record.price / 10,
        transferTargetScore: record.transferTargetScore,
        summary: `Score ${record.transferTargetScore.toFixed(1)} from form ${record.formScore.toFixed(1)} + value ${record.valueScore.toFixed(1)} + fixtures ${record.fixtureScore.toFixed(1)}`,
      }));
  }

  getFixtureRuns(limit: number = DECISION_HUB_CONFIG.FIXTURE_RUNS.MAX_TEAMS): TeamFixtureRun[] {
    const teams = this.teamRepository.getAll();

    return teams
      .map((team) => this.buildTeamFixtureRun(team))
      .filter((run): run is TeamFixtureRun => run !== null)
      .sort((a, b) => a.averageDifficulty - b.averageDifficulty)
      .slice(0, limit);
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
    const fixtures = this.fixtureRepository
      .getUpcomingByTeam(team.id)
      .slice(0, DECISION_HUB_CONFIG.FIXTURE_RUNS.HORIZON);

    if (fixtures.length === 0) {
      return null;
    }

    const upcoming = fixtures.map((fixture) => {
      const isHome = fixture.homeTeam.id === team.id;
      const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
      const difficulty = isHome ? fixture.homeDifficulty : fixture.awayDifficulty;

      return {
        gameweek: fixture.gameweek,
        opponentCode: opponent.code,
        homeAway: isHome ? ('H' as const) : ('A' as const),
        difficulty,
      };
    });

    const averageDifficulty =
      upcoming.reduce((total, fixture) => total + fixture.difficulty, 0) / upcoming.length;

    return {
      teamId: team.id,
      teamName: team.name,
      teamShortName: team.shortName,
      averageDifficulty,
      runLabel: this.classifyRunLabel(averageDifficulty),
      upcoming,
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
