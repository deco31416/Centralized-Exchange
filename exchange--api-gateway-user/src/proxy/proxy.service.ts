import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

function joinUrl(baseUrl: string, path: string): string {
  const base = String(baseUrl || '').replace(/\/+$/, '');
  let nextPath = String(path || '');

  if (!nextPath.startsWith('/')) {
    nextPath = '/' + nextPath;
  }

  const prefixMatch = base.match(/\/(api\/v\d+)$/i);
  if (prefixMatch) {
    const prefix = '/' + prefixMatch[1];

    if (nextPath.toLowerCase().startsWith(prefix.toLowerCase() + '/')) {
      nextPath = nextPath.slice(prefix.length);
    } else if (nextPath.toLowerCase() === prefix.toLowerCase()) {
      nextPath = '';
    }
  }

  return base + nextPath;
}

@Injectable()
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async forwardRequest(
    service:
      | 'auth'
      | 'notifications'
      | 'wallet-ledger'
      | 'payments'
      | 'internal-transfers'
      | 'signature-keys'
      | 'send'
      | 'movements'
      | 'remittances'
      | 'savings'
      | 'loans'
      | 'DECOPAY'
      | 'redeem'
      | 'funding'
      | 'pricing'
      | 'p2p-core',
    method: string,
    path: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<{ statusCode: number; data: any; headers: Record<string, any> }> {
    const serviceUrl = this.configService.get<string>(`config.services.${service}`);
    const internalToken = this.configService.get<string>('config.internalAuthToken');
    const url = joinUrl(serviceUrl ?? '', path);

    const shouldLog = Math.random() < 0.1;
    if (shouldLog) {
      console.log(`[GATEWAY][PROXY] Forwarding to ${service}: ${method} ${path}`);
    }

    const requestHeaders = {
      ...headers,
      'X-Internal-Auth': internalToken,
    };

    const headersToRemove = [
      'x-railway-edge',
      'x-railway-request-id',
      'x-railway-static-host',
      'x-railway-deployment-id',
      'x-railway-service-id',
      'x-railway-environment-id',
      'x-railway-project-id',
      'content-security-policy',
      'host',
      'connection',
      'content-length',
    ];

    headersToRemove.forEach((header) => {
      delete requestHeaders[header];
      delete requestHeaders[header.toLowerCase()];
    });

    if (
      service === 'wallet-ledger' ||
      service === 'payments' ||
      service === 'internal-transfers' ||
      service === 'signature-keys' ||
      service === 'send' ||
      service === 'remittances' ||
      service === 'loans' ||
      service === 'DECOPAY' ||
      service === 'redeem' ||
      service === 'funding' ||
      service === 'movements' ||
      service === 'savings' ||
      service === 'pricing' ||
      service === 'p2p-core'
    ) {
      requestHeaders['Authorization'] = `Bearer ${internalToken}`;
    }

    try {
      const response = await firstValueFrom(
        this.httpService
          .request({
            method,
            url,
            data: body,
            headers: requestHeaders,
            validateStatus: () => true,
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error(`[GATEWAY][PROXY] Request failed:`, {
                service,
                url,
                error: error.message,
                code: error.code,
                response: error.response?.data,
                status: error.response?.status,
              });

              throw new HttpException(
                {
                  statusCode:
                    error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                  message: error.message || 'Internal server error',
                  service,
                },
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }),
          ),
      );

      if (shouldLog) {
        console.log(`[GATEWAY][PROXY] Success: ${service} ${response.status}`);
      }

      return {
        statusCode: response.status,
        data: response.data,
        headers: response.headers,
      };
    } catch (error: any) {
      console.error(`[GATEWAY][PROXY] Unexpected error:`, {
        service,
        url,
        error: error.message,
        stack: error.stack,
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: `Service ${service} is unavailable`,
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}