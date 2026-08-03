import type { GroupCollected, TeamCollected } from '../types';

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

// These IDs are part of the checked-in manual schedule contract. They must never depend on the
// current standings order, otherwise teams swap identities whenever their league positions change.
const STABLE_TEAM_IDS: Record<string, number> = {
  Singapore: 1,
  Vietnam: 2,
  Indonesia: 3,
  Cambodia: 4,
  'Timor-Leste': 5,
  Thailand: 6,
  Malaysia: 7,
  Philippines: 8,
  Myanmar: 9,
  Laos: 10,
  'Brunei Darussalam': 11,
};

export function collectTeams(groups: GroupCollected[]): TeamCollected[] {
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

  let nextDynamicId = Math.max(...Object.values(STABLE_TEAM_IDS)) + 1;
  return namesInOrder
    .map((name) => ({
      id: STABLE_TEAM_IDS[name] ?? nextDynamicId++,
      name,
      countryCode: COUNTRY_CODES[name] ?? 'TBD',
    }))
    .sort((left, right) => left.id - right.id);
}
