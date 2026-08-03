import type { GroupCollected, StandingRowCollected } from '../types';
import { ASEAN_BASE_URL, fetchHtml, parseInteger, stripTags } from '../utils';

function parseStandingRow(rowHtml: string): StandingRowCollected | null {
  const nameMatch = rowHtml.match(
    /<th[^>]*class="flg-th[^"]*"[^>]*>[\s\S]*?<img[^>]*>\s*([\s\S]*?)\s*<\/th>/i
  );
  if (!nameMatch) {
    return null;
  }

  const teamName = stripTags(nameMatch[1]);
  const tdMatches = [...rowHtml.matchAll(/<td>\s*([\s\S]*?)\s*<\/td>/gi)];
  if (tdMatches.length < 8) {
    return null;
  }

  const values = tdMatches.map((td) => parseInteger(stripTags(td[1])) ?? 0);

  return {
    teamName,
    played: values[0],
    won: values[1],
    draw: values[2],
    lost: values[3],
    gf: values[4],
    ga: values[5],
    points: values[7],
  };
}

export async function collectStandings(): Promise<{ groups: GroupCollected[]; html: string }> {
  const standingsUrl = `${ASEAN_BASE_URL}/standings`;
  const html = await fetchHtml(standingsUrl);
  const tableRegex = /<table class="table trnament-cus-table">([\s\S]*?)<\/table>/gi;
  const groups: GroupCollected[] = [];

  for (const tableMatch of html.matchAll(tableRegex)) {
    const tableHtml = tableMatch[1];
    const headerMatch = tableHtml.match(/<th scope="col">\s*(Group\s+[A-Z])\s*<\/th>/i);
    if (!headerMatch) {
      continue;
    }

    const groupName = stripTags(headerMatch[1]);
    const groupId = groupName.replace('Group ', '').trim();
    const tbodyMatch = tableHtml.match(/<tbody>([\s\S]*?)<\/tbody>/i);
    if (!tbodyMatch) {
      continue;
    }

    const standings: StandingRowCollected[] = [];
    for (const rowMatch of tbodyMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
      const rowHtml = rowMatch[1];
      if (rowHtml.includes('class="qlfd"')) {
        continue;
      }

      const parsed = parseStandingRow(rowHtml);
      if (parsed) {
        standings.push(parsed);
      }
    }

    groups.push({
      id: groupId,
      name: groupName,
      standings,
    });
  }

  return { groups, html };
}
