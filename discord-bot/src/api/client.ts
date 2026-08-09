import { ApiError, type ApiErrorCode } from './errors.js';

export interface ApiClientOptions {
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
}

interface RequestOptions extends RequestInit {
  retryable?: boolean;
}

const defaultSleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export class ApiClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly sleep: (milliseconds: number) => Promise<void>;

  public constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.endsWith('/')
      ? options.baseUrl.slice(0, -1)
      : options.baseUrl;
    if (options.apiKey !== undefined) this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs ?? 8_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.sleep = options.sleep ?? defaultSleep;
  }

  public async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const retryable =
      options.retryable ?? (!options.method || options.method.toUpperCase() === 'GET');
    const attempts = retryable ? 3 : 1;
    let lastError: unknown;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await this.performRequest<T>(path, options);
      } catch (error) {
        lastError = error;
        if (
          !(error instanceof ApiError) ||
          !['RATE_LIMITED', 'UNAVAILABLE'].includes(error.code) ||
          attempt === attempts - 1
        )
          throw error;
        await this.sleep(error.retryAfterMs ?? 250 * 2 ** attempt);
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new ApiError('UNKNOWN', 'Request failed');
  }

  private async performRequest<T>(path: string, options: RequestOptions): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    if (this.apiKey) headers.set('X-API-Key', this.apiKey);
    if (options.body && !headers.has('Content-Type'))
      headers.set('Content-Type', 'application/json');

    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      if (!response.ok) throw await this.toApiError(response);
      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('UNAVAILABLE', 'Platform API request failed');
    } finally {
      clearTimeout(timeout);
    }
  }

  private async toApiError(response: Response): Promise<ApiError> {
    let detail = 'Platform API request failed';
    try {
      const payload = (await response.json()) as { detail?: unknown };
      if (typeof payload.detail === 'string') detail = payload.detail;
    } catch {
      // Error bodies are optional and never trusted for control flow.
    }
    const codeByStatus: Record<number, ApiErrorCode> = {
      401: 'AUTHENTICATION',
      403: 'AUTHORIZATION',
      404: 'NOT_FOUND',
      422: 'VALIDATION',
      429: 'RATE_LIMITED',
    };
    const code =
      codeByStatus[response.status] ??
      (response.status >= 500 ? 'UNAVAILABLE' : 'UNKNOWN');
    const retryAfter = response.headers.get('retry-after');
    const retryAfterMs = retryAfter
      ? Math.max(0, Number(retryAfter) * 1_000)
      : undefined;
    return new ApiError(code, detail, response.status, retryAfterMs);
  }
}
