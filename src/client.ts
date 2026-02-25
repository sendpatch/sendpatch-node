import {
  AuthenticationError,
  HttpRequestError,
  PermissionError,
  RateLimitError,
  TimeoutError,
  ValidationError,
} from './utils/errors';

const DEFAULT_BASE_URL = 'https://api.sendpatch.com/v1';
const DEFAULT_TIMEOUT_MS = 30_000;

export interface SendPatchClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

export class SendPatchClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: SendPatchClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT_MS;
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeoutMs: number,
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new TimeoutError();
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\//, '')}`;
  }

  private defaultHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'sendpatch-node/0.1.0',
      ...extra,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const body = await response.json().catch(() => null);

    if (response.ok) {
      return body as T;
    }

    const message =
      (body as { message?: string } | null)?.message ?? response.statusText;

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message, body);
      case 403:
        throw new PermissionError(message, body);
      case 422:
        throw new ValidationError(message, body);
      case 429:
        throw new RateLimitError(message, body);
      default:
        throw new HttpRequestError(message, response.status, body);
    }
  }

  async post<T>(path: string, payload: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildUrl(path);
    const timeout = config?.timeout ?? this.timeout;

    const response = await this.fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: this.defaultHeaders(config?.headers),
        body: JSON.stringify(payload),
      },
      timeout,
    );

    return this.handleResponse<T>(response);
  }
}
