import { OwnershipCategory, type PlayerAnalyticsRecord } from '../../src/domain/models';
import { Position } from '../../src/domain/enums';
import { DecisionHubService } from '../../src/modules/analytics/services/decision-hub.service';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function createRecord(
  playerId: number,
  overrides: Partial<PlayerAnalyticsRecord> = {}
): PlayerAnalyticsRecord {
  return {
    playerId,
    playerName: `Player ${playerId}`,
    position: Position.Midfielder,
    club: 'Team',
    price: 75,
    totalPoints: 100,
    form: 6,
    ownership: 15,
    pointsPerGame: 5.4,
    minutesPlayed: 900,
    valueScore: 15,
    ownershipCategory: OwnershipCategory.Differential,
    formScore: 6,
    differentialScore: 6,
    fixtureScore: 6,
    fixtureOutlook: 'Favorable',
    overallScore: 6,
    transferTargetScore: 6,
    isInMyTeam: false,
    isDifferential: true,
    isValuePick: false,
    hasGoodFixtures: true,
    ...overrides,
  };
}

function runCaptainRankingTest(): void {
  const service = new DecisionHubService();
  const candidates = service.getCaptainCandidates(
    [
      createRecord(1, { formScore: 8, fixtureScore: 7, minutesPlayed: 1800 }),
      createRecord(2, { formScore: 5, fixtureScore: 5, minutesPlayed: 400 }),
      createRecord(3, { formScore: 7, fixtureScore: 8, minutesPlayed: 1700 }),
    ],
    false
  );

  assert(candidates.length === 2, 'Captain ranking should filter low-minute players');
  assert(
    candidates[0].playerId === 1 || candidates[0].playerId === 3,
    'Captain ranking should sort by score'
  );
}

function runTransferFilterTest(): void {
  const service = new DecisionHubService();
  const transfers = service.getTransferCandidates(
    [
      createRecord(11, { transferTargetScore: 7.4, price: 78 }),
      createRecord(12, { transferTargetScore: 5.5, price: 70 }),
      createRecord(13, { transferTargetScore: 7.9, price: 95 }),
    ],
    [11],
    8.5
  );

  assert(
    transfers.every((candidate) => candidate.playerId !== 11),
    'Owned players must be excluded'
  );
  assert(
    transfers.every((candidate) => candidate.transferTargetScore >= 6),
    'Transfer score threshold should apply'
  );
}

function runTeamSummaryTest(): void {
  const service = new DecisionHubService();
  const summary = service.getTeamInsightSummary([
    createRecord(21, { formScore: 7, fixtureScore: 8 }),
    createRecord(22, { formScore: 3, fixtureScore: 2 }),
    createRecord(23, { formScore: 6, fixtureScore: 4 }),
  ]);

  assert(summary.squadSize === 3, 'Squad size should equal record count');
  assert(summary.playersAtRisk === 1, 'One player should be flagged as risk');
  assert(summary.playersWithGoodRuns === 1, 'One player should be flagged with good run');
}

export function runAnalyticsDecisionEngineTests(): void {
  runCaptainRankingTest();
  runTransferFilterTest();
  runTeamSummaryTest();
  console.log('analytics-decision-engine.test.ts: all tests passed');
}

runAnalyticsDecisionEngineTests();
