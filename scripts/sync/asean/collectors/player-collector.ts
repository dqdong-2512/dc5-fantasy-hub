import type { PlayerCollected, PlayerSeedCollected } from '../types';
import { ASEAN_BASE_URL, fetchHtml, normalizeName, stripTags } from '../utils';

const RANKING_PATHS = [
  'player-ranking/attack',
  'player-ranking/defence',
  'player-ranking/distribution',
  'player-ranking/discipline',
  'player-ranking/general',
] as const;

function inferPosition(label: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  const lowered = label.toLowerCase();
  if (lowered.includes('goalkeeper')) {
    return 'GK';
  }
  if (lowered.includes('defender')) {
    return 'DEF';
  }
  if (lowered.includes('attacker') || lowered.includes('forward')) {
    return 'FWD';
  }
  return 'MID';
}

function extractStatMap(html: string): Map<string, number> {
  const statMap = new Map<string, number>();
  const sectionMatch = html.match(
    /<div id="tab3" class="container-fluid team-gen-stats[\s\S]*?">([\s\S]*?)<!--tab 2 matches-->/i
  );
  const section = sectionMatch ? sectionMatch[1] : html;

  for (const pair of section.matchAll(/<h([34])>([\s\S]*?)<\/h\1>\s*<p>([\s\S]*?)<\/p>/gi)) {
    const rawValue = stripTags(pair[2]).replace(/,/g, '').trim();
    if (!/^[-+]?\d+(?:\.\d+)?$/.test(rawValue)) {
      continue;
    }

    const parsedValue = Number.parseFloat(rawValue);
    if (Number.isNaN(parsedValue)) {
      continue;
    }

    const value = Math.trunc(parsedValue);
    const label = normalizeName(stripTags(pair[3])).toLowerCase();
    if (!label || statMap.has(label)) {
      continue;
    }

    statMap.set(label, value);
  }

  return statMap;
}

function parseAge(overviewHtml: string): number | null {
  const match = overviewHtml.match(/Date of birth<\/h4>[\s\S]*?<p>[\s\S]*?\((\d{1,2})\)<\/p>/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

function parseOverviewValue(overviewHtml: string, label: string): number | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = overviewHtml.match(
    new RegExp(`<h3>\\s*([0-9]+)\\s*<\\/h3>\\s*<p>\\s*${escaped}\\s*<\\/p>`, 'i')
  );
  return match ? Number.parseInt(match[1], 10) : null;
}

function parseTeamFromPlayerPage(html: string): string {
  const profileBlockMatch = html.match(
    /<div class="plyr-info-top-insd">([\s\S]*?)<a href="https:\/\/aseanutdfc\.com\/asean-championship\/player-comparison"/i
  );
  if (!profileBlockMatch) {
    return 'Unknown';
  }

  const match = profileBlockMatch[1].match(
    /\/team\/[a-z0-9]+\/details"[^>]*>[\s\S]*?<p>([^<]+)<\/p>/i
  );
  return match ? normalizeName(stripTags(match[1])) : 'Unknown';
}

async function collectPlayerSeedsFromRankings(): Promise<PlayerSeedCollected[]> {
  const seedMap = new Map<string, PlayerSeedCollected>();

  for (const path of RANKING_PATHS) {
    const html = await fetchHtml(`${ASEAN_BASE_URL}/${path}`);
    for (const row of html.matchAll(
      /href="https:\/\/aseanutdfc\.com\/asean-championship\/player\/([a-z0-9]+)\/stats"[\s\S]*?<p>([\s\S]*?)<\/p>/gi
    )) {
      const slug = row[1];
      const name = normalizeName(stripTags(row[2]));
      if (!seedMap.has(slug)) {
        seedMap.set(slug, { slug, name });
      }
    }
  }

  return [...seedMap.values()];
}

export async function collectPlayers(): Promise<PlayerCollected[]> {
  const seeds = await collectPlayerSeedsFromRankings();
  const players: PlayerCollected[] = [];
  let playerId = 1;

  for (const seed of seeds) {
    try {
      const statsUrl = `${ASEAN_BASE_URL}/player/${seed.slug}/stats`;
      const overviewUrl = `${ASEAN_BASE_URL}/player/${seed.slug}/overview`;
      const [statsHtml, overviewHtml] = await Promise.all([
        fetchHtml(statsUrl),
        fetchHtml(overviewUrl),
      ]);
      const statMap = extractStatMap(statsHtml);

      const appearances =
        statMap.get('games played') ?? parseOverviewValue(overviewHtml, 'Games played') ?? 0;
      const minutes = statMap.get('minutes played') ?? 0;

      const positionMatch = overviewHtml.match(/Position<\/h4>[\s\S]*?<p>([\s\S]*?)<\/p>/i);
      const positionLabel = positionMatch
        ? normalizeName(stripTags(positionMatch[1]))
        : 'Midfielder';

      players.push({
        id: playerId,
        slug: seed.slug,
        name: seed.name,
        nationTeamName: parseTeamFromPlayerPage(statsHtml),
        position: inferPosition(positionLabel),
        age: parseAge(overviewHtml),
        appearances,
        goals: statMap.get('goals') ?? 0,
        assists: statMap.get('assists') ?? 0,
        minutes,
        yellowCards: statMap.get('yellow cards') ?? 0,
        redCards: statMap.get('red cards') ?? 0,
      });
      playerId += 1;
    } catch (error) {
      console.warn(`Failed to collect player ${seed.slug}:`, error);
    }
  }

  return players;
}
