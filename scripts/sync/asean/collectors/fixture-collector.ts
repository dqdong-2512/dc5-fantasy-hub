import type { FixtureSeedCollected } from '../types';
import { ASEAN_BASE_URL } from '../utils';

export async function collectFixtureSeeds(): Promise<{
  fixtures: FixtureSeedCollected[];
  html: string;
}> {
  const matchesUrl = `${ASEAN_BASE_URL}/matches`;
  const response = await fetch(matchesUrl, {
    headers: {
      'User-Agent': 'dc5-fantasy-hub-collector/1.0',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch matches page: ${response.status}`);
  }

  const html = await response.text();
  const seen = new Set<string>();
  const fixtures: FixtureSeedCollected[] = [];

  for (const match of html.matchAll(
    /href="https:\/\/aseanutdfc\.com\/asean-championship\/match\/([a-z0-9]+)\/details"/gi
  )) {
    const fixtureId = match[1];
    if (seen.has(fixtureId)) {
      continue;
    }

    seen.add(fixtureId);
    fixtures.push({
      id: fixtureId,
      detailUrl: `${ASEAN_BASE_URL}/match/${fixtureId}/details`,
    });
  }

  return { fixtures, html };
}
