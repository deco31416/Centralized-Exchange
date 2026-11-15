import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type UpstreamResult<T> =
  | {
      ok: true;
      data: T;
      elapsedMs: number;
      status: number;
    }
  | {
      ok: false;
      error: string;
      elapsedMs: number;
      status?: number;
    };

@Injectable()
export class UpstreamClientService {
  constructor(private readonly configService: ConfigService) {}

  async get<T>(
    baseUrl: string | undefined,
    path: string,
    timeoutMs = 3500,
  ): Promise<UpstreamResult<T>> {
    const startedAt = Date.now();
    const url = this.buildUrl(baseUrl, path);

    if (!url) {
      return {
        ok: false,
        error: 'upstream_url_not_configured',
        elapsedMs: Date.now() - startedAt,
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.internalHeaders(),
        signal: controller.signal,
      });
      const text = await response.text();

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: text || response.statusText,
          elapsedMs: Date.now() - startedAt,
        };
      }

      return {
        ok: true,
        status: response.status,
        data: (text ? JSON.parse(text) : {}) as T,
        elapsedMs: Date.now() - startedAt,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'upstream_request_failed',
        elapsedMs: Date.now() - startedAt,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private internalHeaders(): Record<string, string> {
    const token =
      this.configService.get<string>('INTERNAL_AUTH_TOKEN') ||
      process.env.INTERNAL_AUTH_TOKEN ||
      '';

    return {
      accept: 'application/json',
      'x-internal-auth': token,
      'x-internal-token': token,
      authorization: token ? `Bearer ${token}` : '',
    };
  }

  private buildUrl(baseUrl: string | undefined, path: string): string | undefined {
    const cleanBase = baseUrl?.trim().replace(/\/+$/, '');
    if (!cleanBase) return undefined;

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }
}
