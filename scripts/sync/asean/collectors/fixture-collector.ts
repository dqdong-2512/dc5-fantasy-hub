import type { FixtureSeedCollected } from '../types';
import { ASEAN_BASE_URL, fetchHtml } from '../utils';

export async function collectFixtureSeeds(): Promise<{
  fixtures: FixtureSeedCollected[];
  html: string;
}> {
  const matchesUrl = `${ASEAN_BASE_URL}/matches`;
  const html = await fetchHtml(matchesUrl);
  const seen = new Set<string>();
  const fixtures: FixtureSeedCollected[] = [];

  for (const match of html.matchAll(
    /href=["'][^"']*\/asean-championship\/match\/([a-z0-9]+)\/details(?:[^"']*)["']/gi
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

  if (fixtures.length === 0) {
    throw new Error('Matches page did not contain any ASEAN Cup fixture links');
  }

  return { fixtures, html };
}
