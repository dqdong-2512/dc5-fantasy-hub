/**
 * HTTP Client
 * Centralized HTTP client using native fetch()
 * Abstracts base URL, headers, timeout, and error handling
 */

interface FetchOptions {
  timeout?: number;
  headers?: Record<string, string>;
  method?: string;
  body?: string;
  signal?: AbortSignal;
}

interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class HttpClient {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 30000;
    this.headers = config.headers || {};
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
          ...options?.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        // Extract endpoint type for better error messages
        const isEntryEndpoint = endpoint.includes('/entry/');

        if (response.status === 404) {
          const message = isEntryEndpoint
            ? 'FPL Team ID not found. Please verify your Entry ID is correct.'
            : 'Resource not found.';
          throw new Error(`Not Found: ${message}`, { cause: response });
        }

        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to access this resource.', {
            cause: response,
          });
        }

        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.', {
            cause: response,
          });
        }

        if (response.status === 503) {
          throw new Error('Fantasy Premier League API is temporarily unavailable.', {
            cause: response,
          });
        }

        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`, {
          cause: response,
        });
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
          'Unable to connect to FPL data service. ' +
            'Check your network connection or try again later.',
          { cause: error }
        );
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout: exceeded ${this.timeout}ms`, { cause: error });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async post<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: FetchOptions
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Resource not found.', { cause: response });
        }

        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to access this resource.', {
            cause: response,
          });
        }

        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.', {
            cause: response,
          });
        }

        if (response.status === 503) {
          throw new Error('Fantasy Premier League API is temporarily unavailable.', {
            cause: response,
          });
        }

        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`, {
          cause: response,
        });
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
          'Unable to connect to FPL data service. ' +
            'Check your network connection or try again later.',
          { cause: error }
        );
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout: exceeded ${this.timeout}ms`, { cause: error });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
