import fs from 'fs';
import path from 'path';
import { getFplSeasonPaths } from './competition-data-paths';

export interface AvatarSourcePlayer {
  id: number;
  code: number;
  photo?: string | null;
  webName?: string;
  web_name?: string;
  firstName?: string;
  secondName?: string;
  avatarPath?: string;
}

export interface PlayerAvatarManifestEntry {
  playerId: number;
  playerName: string;
  code: number;
  photoIdentifier: string;
  available: boolean;
  cached: boolean;
  file: string;
  sourceUrl?: string;
  error?: string;
}

export interface PlayerAvatarSyncResult {
  scanned: number;
  available: number;
  downloaded: number;
  cacheHits: number;
  missing: number;
  manifestPath: string;
}

export function getPlayerPhotoIdentifier(player: AvatarSourcePlayer): string {
  const fromPhoto = String(player.photo ?? '').match(/(\d+)/)?.[1];
  return fromPhoto ?? String(player.code);
}

export function isValidCachedPlayerPhoto(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  const stat = fs.statSync(filePath);
  if (!stat.isFile() || stat.size < 1024) return false;
  const header = Buffer.alloc(8);
  const file = fs.openSync(filePath, 'r');
  try {
    fs.readSync(file, header, 0, header.length, 0);
  } finally {
    fs.closeSync(file);
  }
  return header.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
}

function playerPhotoUrls(identifier: string, season: string): string[] {
  const seasonStart = Number(season.split('-')[0]);
  const currentEdition = Number.isFinite(seasonStart) ? String(seasonStart).slice(-2) : '';
  const previousEdition = Number.isFinite(seasonStart) ? String(seasonStart - 1).slice(-2) : '';
  const editions = [
    currentEdition && `premierleague${currentEdition}`,
    previousEdition && `premierleague${previousEdition}`,
    'premierleague',
  ].filter((edition): edition is string => Boolean(edition));
  const urls = editions.flatMap((edition) => {
    const identifiers = edition === 'premierleague' ? [`p${identifier}`, identifier] : [identifier, `p${identifier}`];
    return ['250x250', '110x140', '40x40'].flatMap((size) =>
      identifiers.map(
        (candidate) =>
          `https://resources.premierleague.com/${edition}/photos/players/${size}/${candidate}.png`
      )
    );
  });
  return [...new Set(urls)];
}

function playerName(player: AvatarSourcePlayer): string {
  const fullName = [player.firstName, player.secondName].filter(Boolean).join(' ');
  return (player.webName ?? player.web_name ?? fullName) || `Player ${player.id}`;
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  worker: (value: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let cursor = 0;
  async function runWorker(): Promise<void> {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, runWorker));
  return results;
}

function writeJson(filePath: string, payload: unknown): void {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(payload, null, 2), 'utf-8');
  fs.renameSync(temporaryPath, filePath);
}

async function downloadPortrait(identifier: string, season: string): Promise<{
  body: Buffer;
  sourceUrl: string;
}> {
  const errors: string[] = [];
  for (const sourceUrl of playerPhotoUrls(identifier, season)) {
    try {
      const response = await fetch(sourceUrl, {
        headers: {
          accept: 'image/avif,image/webp,image/apng,image/png,*/*;q=0.8',
          referer: 'https://fantasy.premierleague.com/',
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
        },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const body = Buffer.from(await response.arrayBuffer());
      const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      if (body.length < 1024 || !body.subarray(0, 8).equals(signature)) {
        throw new Error('response is not a valid PNG portrait');
      }
      return { body, sourceUrl };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error([...new Set(errors)].join(' | '));
}

export async function syncPlayerAvatars(options: {
  projectRoot: string;
  season: string;
  force?: boolean;
  concurrency?: number;
}): Promise<PlayerAvatarSyncResult> {
  const { projectRoot, season, force = false, concurrency = 8 } = options;
  const paths = getFplSeasonPaths(projectRoot, season);
  const playersPath = path.join(paths.normalizedDir, 'players.json');
  if (!fs.existsSync(playersPath)) {
    throw new Error(
      `Player snapshot not found at ${playersPath}. Run npm run sync:fpl before syncing avatars.`
    );
  }

  fs.mkdirSync(paths.playerPhotosDir, { recursive: true });
  fs.mkdirSync(paths.assetsDir, { recursive: true });
  const players = JSON.parse(fs.readFileSync(playersPath, 'utf-8')) as AvatarSourcePlayer[];
  const entries = await mapWithConcurrency(players, concurrency, async (player) => {
    const identifier = getPlayerPhotoIdentifier(player);
    const fileName = `${identifier}.png`;
    const outputPath = path.join(paths.playerPhotosDir, fileName);
    const file = `assets/player-photos/${fileName}`;
    if (!force && isValidCachedPlayerPhoto(outputPath)) {
      return {
        playerId: player.id,
        playerName: playerName(player),
        code: player.code,
        photoIdentifier: identifier,
        available: true,
        cached: true,
        file,
      } satisfies PlayerAvatarManifestEntry;
    }

    try {
      const downloaded = await downloadPortrait(identifier, season);
      fs.writeFileSync(outputPath, downloaded.body);
      return {
        playerId: player.id,
        playerName: playerName(player),
        code: player.code,
        photoIdentifier: identifier,
        available: true,
        cached: false,
        file,
        sourceUrl: downloaded.sourceUrl,
      } satisfies PlayerAvatarManifestEntry;
    } catch (error) {
      return {
        playerId: player.id,
        playerName: playerName(player),
        code: player.code,
        photoIdentifier: identifier,
        available: false,
        cached: false,
        file: '../../shared/player-photo-placeholder.svg',
        error: error instanceof Error ? error.message : String(error),
      } satisfies PlayerAvatarManifestEntry;
    }
  });

  const entryByPlayerId = new Map(entries.map((entry) => [entry.playerId, entry]));
  const updatedPlayers = players.map((player) => ({
    ...player,
    avatarPath:
      entryByPlayerId.get(player.id)?.file ?? '../../shared/player-photo-placeholder.svg',
  }));
  writeJson(playersPath, updatedPlayers);

  const manifestPath = path.join(paths.assetsDir, 'player-photos.manifest.json');
  writeJson(manifestPath, {
    competition: 'fpl',
    season,
    syncedAt: new Date().toISOString(),
    mode: force ? 'force-refresh' : 'missing-and-invalid-only',
    counts: {
      scanned: entries.length,
      available: entries.filter((entry) => entry.available).length,
      downloaded: entries.filter((entry) => entry.available && !entry.cached).length,
      cacheHits: entries.filter((entry) => entry.available && entry.cached).length,
      missing: entries.filter((entry) => !entry.available).length,
    },
    players: entries,
  });

  return {
    scanned: entries.length,
    available: entries.filter((entry) => entry.available).length,
    downloaded: entries.filter((entry) => entry.available && !entry.cached).length,
    cacheHits: entries.filter((entry) => entry.available && entry.cached).length,
    missing: entries.filter((entry) => !entry.available).length,
    manifestPath,
  };
}
