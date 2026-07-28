import type {
  FixtureSeedCollected,
  GoalEventCollected,
  MatchDetailCollected,
  MatchPageSnapshot,
} from '../types';
import {
  determineFixtureStatus,
  fetchHtml,
  normalizeName,
  parseInteger,
  parseMinuteLabel,
  stripTags,
} from '../utils';

function parseGoals(overviewHtml: string): GoalEventCollected[] {
  const goals: GoalEventCollected[] = [];
  const goalBlockStart = overviewHtml.indexOf('goal-comm-div-top');
  if (goalBlockStart === -1) {
    return goals;
  }

  const goalBlockEnd = overviewHtml.indexOf('<!--goals details ends-->', goalBlockStart);
  const wrapper =
    goalBlockEnd > goalBlockStart
      ? overviewHtml.slice(goalBlockStart, goalBlockEnd)
      : overviewHtml.slice(goalBlockStart);

  const firstStart = wrapper.indexOf('first-hlf-goal-comm');
  const midStart = wrapper.indexOf('mid-prt-goal-comm');
  const secondStart = wrapper.indexOf('scnd-hlf-goal-comm');

  const parseSide = (sectionHtml: string, side: 'home' | 'away'): void => {
    for (const playerMatch of sectionHtml.matchAll(
      /<div class="plyr-info d-flex">([\s\S]*?)<\/div>/gi
    )) {
      const chunk = playerMatch[1];
      const nameMatch = chunk.match(/<h4>([\s\S]*?)<\/h4>/i);
      const minuteMatch = chunk.match(/<span>([\s\S]*?)<\/span>/i);
      if (!nameMatch || !minuteMatch) {
        continue;
      }

      const parsedMinute = parseMinuteLabel(stripTags(minuteMatch[1]));
      goals.push({
        playerName: normalizeName(stripTags(nameMatch[1])),
        minute: parsedMinute.minute,
        addedTime: parsedMinute.addedTime,
        side,
      });
    }
  };

  if (firstStart !== -1 && midStart !== -1 && midStart > firstStart) {
    parseSide(wrapper.slice(firstStart, midStart), 'home');
  }

  if (secondStart !== -1 && secondStart > 0) {
    parseSide(wrapper.slice(secondStart), 'away');
  }

  return goals;
}

function parseLocalDateAndStatus(html: string): {
  dateLabel: string;
  localTimeLabel: string | null;
  statusLabel: string;
} {
  const dateMatch = html.match(
    /<div class="mtch-dtl-mo">[\s\S]*?<p>([A-Za-z]{3}\s+\d{1,2}\s+\d{4})<\/p>/i
  );
  const dateLabel = dateMatch ? normalizeName(stripTags(dateMatch[1])) : 'Jan 01 1970';

  const statusMatch = html.match(/<div class="time-dtl">[\s\S]*?<p>([\s\S]*?)<\/p>/i);
  const statusLabel = statusMatch ? normalizeName(stripTags(statusMatch[1])) : 'Unknown';

  const stageDateBlockMatch = html.match(/<h4>Stage<\/h4>[\s\S]*?<h6>([\s\S]*?)<\/h6>/i);
  let localTimeLabel: string | null = null;
  if (stageDateBlockMatch) {
    const cleaned = normalizeName(stripTags(stageDateBlockMatch[1]));
    const timeMatch = cleaned.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
    localTimeLabel = timeMatch ? timeMatch[1].toUpperCase() : null;
  }

  return { dateLabel, localTimeLabel, statusLabel };
}

function parseHomeAway(html: string): {
  homeTeamName: string;
  awayTeamName: string;
  homeTeamSlug: string | null;
  awayTeamSlug: string | null;
} {
  const anchorMatches = [
    ...html.matchAll(
      /<a href="https:\/\/aseanutdfc\.com\/asean-championship\/team\/([a-z0-9]+)\/details">[\s\S]*?<h4>\s*([^<]+?)\s*<\/h4>/gi
    ),
  ];
  if (anchorMatches.length >= 2) {
    return {
      homeTeamSlug: anchorMatches[0][1],
      homeTeamName: normalizeName(stripTags(anchorMatches[0][2])),
      awayTeamSlug: anchorMatches[1][1],
      awayTeamName: normalizeName(stripTags(anchorMatches[1][2])),
    };
  }

  return {
    homeTeamName: 'Unknown Home',
    awayTeamName: 'Unknown Away',
    homeTeamSlug: null,
    awayTeamSlug: null,
  };
}

function parseScores(html: string): { homeScore: number | null; awayScore: number | null } {
  const homeMatch = html.match(/<p[^>]*id="home-score"[^>]*>\s*([0-9-]+)\s*<\/p>/i);
  const awayMatch = html.match(/<p[^>]*id="away-score"[^>]*>\s*([0-9-]+)\s*<\/p>/i);

  const homeValue = homeMatch ? parseInteger(homeMatch[1]) : null;
  const awayValue = awayMatch ? parseInteger(awayMatch[1]) : null;

  return {
    homeScore: homeValue,
    awayScore: awayValue,
  };
}

function parseStage(html: string): string {
  const stageMatch = html.match(/<div class="grp-dtl">[\s\S]*?<p>([\s\S]*?)<\/p>/i);
  return stageMatch ? normalizeName(stripTags(stageMatch[1])) : 'Unknown Stage';
}

function parseVenue(html: string): string {
  const venueMatch = html.match(/<h4>Stadium<\/h4>[\s\S]*?<h5>([\s\S]*?)<\/h5>/i);
  return venueMatch ? normalizeName(stripTags(venueMatch[1])) : 'Not Available';
}

export async function collectMatchPageSnapshots(
  fixtureSeeds: FixtureSeedCollected[]
): Promise<Map<string, MatchPageSnapshot>> {
  const snapshots = new Map<string, MatchPageSnapshot>();
  const htmlBySourceUrl = new Map<string, { fetchedAt: string; html: string }>();

  for (const fixture of fixtureSeeds) {
    let cachedPage = htmlBySourceUrl.get(fixture.detailUrl);
    if (!cachedPage) {
      cachedPage = {
        fetchedAt: new Date().toISOString(),
        html: await fetchHtml(fixture.detailUrl),
      };
      htmlBySourceUrl.set(fixture.detailUrl, cachedPage);
    }

    snapshots.set(fixture.id, {
      fixtureId: fixture.id,
      fetchedAt: cachedPage.fetchedAt,
      sourceUrl: fixture.detailUrl,
      html: cachedPage.html,
    });
  }

  return snapshots;
}

export function collectMatchDetails(
  fixtureSeeds: FixtureSeedCollected[],
  snapshots: Map<string, MatchPageSnapshot>
): MatchDetailCollected[] {
  return fixtureSeeds.map((fixture) => {
    const snapshot = snapshots.get(fixture.id);
    if (!snapshot) {
      throw new Error(`Missing cached match page snapshot for fixture ${fixture.id}`);
    }

    const teams = parseHomeAway(snapshot.html);
    const score = parseScores(snapshot.html);
    const stage = parseStage(snapshot.html);
    const venue = parseVenue(snapshot.html);
    const { dateLabel, localTimeLabel, statusLabel } = parseLocalDateAndStatus(snapshot.html);

    return {
      fixtureId: fixture.id,
      detailUrl: snapshot.sourceUrl,
      homeTeamName: teams.homeTeamName,
      awayTeamName: teams.awayTeamName,
      homeTeamSlug: teams.homeTeamSlug,
      awayTeamSlug: teams.awayTeamSlug,
      stage,
      dateLabel,
      localTimeLabel,
      statusLabel: determineFixtureStatus(statusLabel, score.homeScore, score.awayScore),
      venue,
      homeScore: score.homeScore,
      awayScore: score.awayScore,
      goals: parseGoals(snapshot.html),
    };
  });
}
