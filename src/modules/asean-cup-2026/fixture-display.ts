import type { TournamentFixture, TournamentFixtureStatus } from './models';

export type FixtureStatusTone = 'default' | 'success' | 'warning' | 'error' | 'info';

export function getFixtureDisplayValue(fixture: TournamentFixture): string {
  if (fixture.homeScore !== null && fixture.awayScore !== null) {
    return `${fixture.homeScore} - ${fixture.awayScore}`;
  }

  return 'VS';
}

export function getFixtureStatusTone(status: TournamentFixtureStatus): FixtureStatusTone {
  if (status === 'live') {
    return 'error';
  }
  if (status === 'half-time') {
    return 'warning';
  }
  if (status === 'finished') {
    return 'success';
  }
  if (status === 'upcoming') {
    return 'info';
  }
  return 'default';
}

export function getFixtureStatusLabel(fixture: TournamentFixture): string {
  if (fixture.status === 'half-time') {
    return 'Hết hiệp một';
  }
  if (fixture.status === 'live') {
    if (fixture.minute !== null) {
      if (fixture.addedTime !== null && fixture.addedTime > 0) {
        return `${fixture.minute}+${fixture.addedTime}'`;
      }
      return `${fixture.minute}'`;
    }
    return 'Đang diễn ra';
  }
  if (fixture.status === 'finished') {
    return 'Đã kết thúc';
  }
  if (fixture.status === 'postponed') {
    return 'Tạm hoãn';
  }
  if (fixture.status === 'cancelled') {
    return 'Đã hủy';
  }
  return 'Sắp diễn ra';
}
