export interface FplApiClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  maxAttempts?: number;
  fetcher?: typeof fetch;
  logger?: FplLogger;
}

interface FplLogger {
  warn(message: string): void;
  error(message: string): void;
}

export class FplUpstreamError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly retryable: boolean,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'FplUpstreamError';
  }
}

export class FplApiClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxAttempts: number;
  private readonly fetcher: typeof fetch;
  private readonly logger: FplLogger;

  constructor(options: FplApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? 'https://fantasy.premierleague.com/api';
    this.timeoutMs = options.timeoutMs ?? 10_000;
    this.maxAttempts = options.maxAttempts ?? 4;
    this.fetcher = options.fetcher ?? ((input, init) => fetch(input, init));
    this.logger = options.logger ?? console;
  }

  getBootstrap(): Promise<unknown> {
    return this.get('/bootstrap-static/');
  }

  getFixtures(gameweek: number): Promise<unknown> {
    return this.get(`/fixtures/?event=${gameweek}`);
  }

  getEventLive(gameweek: number): Promise<unknown> {
    return this.get(`/event/${gameweek}/live/`);
  }

  getEntry(entryId: number): Promise<unknown> {
    return this.get(`/entry/${entryId}/`);
  }

  getEntryHistory(entryId: number): Promise<unknown> {
    return this.get(`/entry/${entryId}/history/`);
  }

  getEntryPicks(entryId: number, gameweek: number): Promise<unknown> {
    return this.get(`/entry/${entryId}/event/${gameweek}/picks/`);
  }

  getLeagueStandings(leagueId: number, page: number): Promise<unknown> {
    return this.get(`/leagues-classic/${leagueId}/standings/?page_standings=${page}`);
  }

  private async get(path: string): Promise<unknown> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await this.fetcher(`${this.baseUrl}${path}`, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'DC5-Fantasy-Hub-Worker/1.0',
          },
          signal: controller.signal,
        });

        if (response.ok) return await response.json();

        const retryable = response.status === 429 || response.status >= 500;
        const error = new FplUpstreamError(
          `FPL upstream returned ${response.status} for ${path}`,
          response.status,
          retryable
        );
        if (!retryable) throw error;
        lastError = error;
      } catch (error) {
        const timeoutError = error instanceof Error && error.name === 'AbortError';
        const normalized =
          error instanceof FplUpstreamError
            ? error
            : new FplUpstreamError(
                timeoutError
                  ? `FPL upstream timeout for ${path}`
                  : `FPL upstream fetch failed for ${path}: ${
                      error instanceof Error ? error.message : String(error)
                    }`,
                null,
                true,
                { cause: error }
              );
        if (!normalized.retryable) throw normalized;
        lastError = normalized;
      } finally {
        clearTimeout(timeout);
      }

      if (attempt < this.maxAttempts) {
        const delayMs = 250 * 2 ** (attempt - 1) + Math.floor(Math.random() * 100);
        this.logger.warn(`FPL fetch attempt ${attempt}/${this.maxAttempts} failed for ${path}`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const failure =
      lastError instanceof Error
        ? lastError
        : new Error(`Unknown FPL upstream failure for ${path}`);
    this.logger.error(failure.message);
    throw failure;
  }
}
