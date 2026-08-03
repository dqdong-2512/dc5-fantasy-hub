export const ASEAN_BASE_URL = 'https://aseanutdfc.com/asean-championship';

const FETCH_ATTEMPTS = 4;
const FETCH_TIMEOUT_MS = 30_000;

const MONTH_MAP: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export function decodeHtml(raw: string): string {
  return raw
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripTags(raw: string): string {
  return decodeHtml(raw.replace(/<[^>]*>/g, ' '));
}

export async function fetchHtml(url: string): Promise<string> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DC5FantasyHub/1.0; +data-sync)',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < FETCH_ATTEMPTS) {
        const delayMs = attempt * 1_500;
        console.warn(
          `Fetch attempt ${attempt}/${FETCH_ATTEMPTS} failed for ${url}; retrying in ${delayMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `Unable to fetch ${url} after ${FETCH_ATTEMPTS} attempts. ` +
      'Check internet access, DNS/firewall settings, or whether aseanutdfc.com is available.',
    { cause: lastError }
  );
}

export function parseInteger(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[^0-9-]/g, '');
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function normalizeName(name: string): string {
  return decodeHtml(name).replace(/\s+/g, ' ').trim();
}

export function parseMinuteLabel(label: string): { minute: number; addedTime: number | null } {
  const normalized = decodeHtml(label).replace(/\s+/g, '');
  const match = normalized.match(/^(\d+)(?:'\+(\d+)')?'?$/);
  if (!match) {
    const direct = parseInteger(normalized);
    return { minute: direct ?? 0, addedTime: null };
  }

  const minute = Number.parseInt(match[1], 10);
  const addedTime = match[2] ? Number.parseInt(match[2], 10) : null;
  return { minute, addedTime };
}

export function toUtcIsoFromIct(dateLabel: string, timeLabel: string | null): string {
  const dateMatch = dateLabel.match(/^([A-Za-z]{3})\s(\d{1,2})\s(\d{4})$/);
  if (!dateMatch) {
    return new Date().toISOString();
  }

  const month = MONTH_MAP[dateMatch[1]];
  const day = Number.parseInt(dateMatch[2], 10);
  const year = Number.parseInt(dateMatch[3], 10);

  let hour = 12;
  let minute = 0;

  if (timeLabel) {
    const timeMatch = timeLabel.match(/(\d{1,2}):(\d{2})\s*([AaPp][Mm])/);
    if (timeMatch) {
      hour = Number.parseInt(timeMatch[1], 10);
      minute = Number.parseInt(timeMatch[2], 10);
      const period = timeMatch[3].toUpperCase();

      if (period === 'PM' && hour !== 12) {
        hour += 12;
      }
      if (period === 'AM' && hour === 12) {
        hour = 0;
      }
    }
  }

  // Indochina Time (ICT) is UTC+7 without DST. The aseanutdfc.com website
  // publishes all ASEAN Cup 2026 kickoff times in ICT (Vietnam/Thailand/Cambodia).
  const utcTimestamp = Date.UTC(year, month, day, hour - 7, minute, 0);
  return new Date(utcTimestamp).toISOString();
}

export function determineFixtureStatus(
  statusLabel: string,
  homeScore: number | null,
  awayScore: number | null
): 'UPCOMING' | 'LIVE' | 'HALF_TIME' | 'FINISHED' {
  const lowered = statusLabel.toLowerCase();
  if (lowered.includes('full time') || lowered === 'ft') {
    return 'FINISHED';
  }
  if (lowered.includes('half')) {
    return 'HALF_TIME';
  }
  if (
    homeScore !== null &&
    awayScore !== null &&
    !lowered.includes('pm') &&
    !lowered.includes('am')
  ) {
    return 'FINISHED';
  }
  if (lowered.includes('live') || lowered.includes("'")) {
    return 'LIVE';
  }
  return 'UPCOMING';
}
