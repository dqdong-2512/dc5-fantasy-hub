import type { GroupCollected, MatchDetailCollected, TeamCollected } from '../types';

const COUNTRY_CODES: Record<string, string> = {
  Vietnam: 'VN',
  Indonesia: 'ID',
  Singapore: 'SG',
  Cambodia: 'KH',
  'Timor-Leste': 'TL',
  Thailand: 'TH',
  Malaysia: 'MY',
  Philippines: 'PH',
  Myanmar: 'MM',
  Laos: 'LA',
  'Brunei Darussalam': 'BN',
};

export function collectTeams(
  groups: GroupCollected[],
  details: MatchDetailCollected[]
): TeamCollected[] {
  const namesInOrder: string[] = [];
  const pushName = (name: string): void => {
    if (!name || namesInOrder.includes(name)) {
      return;
    }

    if (name === 'Unknown Home' || name === 'Unknown Away') {
      return;
    }

    namesInOrder.push(name);
  };

  for (const group of groups) {
    for (const standing of group.standings) {
      pushName(standing.teamName);
    }
  }

  for (const detail of details) {
    pushName(detail.homeTeamName);
    pushName(detail.awayTeamName);
  }

  return namesInOrder.map((name, index) => ({
    id: index + 1,
    name,
    countryCode: COUNTRY_CODES[name] ?? 'TBD',
  }));
}
