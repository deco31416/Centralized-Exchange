import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /** All service keys that the proxy can forward to */
  private static readonly SERVICE_KEYS = [
    'auth', 'notifications', 'wallet-ledger', 'payments', 'internal-transfers',
    'send', 'movements', 'savings', 'loans', 'redeem', 'DECOPAY',
    'remittances', 'funding', 'signature', 'pricing', 'p2p-core',
  ] as const;

  async forwardRequest(
    service: (typeof ProxyService.SERVICE_KEYS)[number],
    method: string,
    path: string,
    body?: any,
    headers?: Record<string, string>,
  ) {
    const serviceUrl = this.configService.get<string>(`config.services.${service}`);
    const internalToken = this.configService.get<string>('config.internalAuthToken');
    const notificationsServiceToken = this.configService.get<string>(
      'config.serviceTokens.notifications',
    );
    const url = `${serviceUrl}${path}`;

    // Add internal auth headers (compat with microservices)
    const requestHeaders: Record<string, string> = {
      ...(headers || {}),
      // legacy/header variants kept for compatibility
      'X-Internal-Auth': internalToken,
      'X-Internal-Auth-Token': internalToken,
      'X-Internal-Token': internalToken,
    };

    // Notifications microservice uses service-to-service auth (Bearer token)
    if (service === 'notifications' && notificationsServiceToken) {
      requestHeaders['Authorization'] = `Bearer ${notificationsServiceToken}`;
    }

    // All other microservices use Bearer token with INTERNAL_AUTH_TOKEN
    if (service !== 'auth' && service !== 'notifications') {
      requestHeaders['Authorization'] = `Bearer ${internalToken}`;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          data: body,
          headers: requestHeaders,
          validateStatus: () => true, // Handle all status codes
        }).pipe(
          catchError((error: AxiosError) => {
            throw new HttpException(
              {
                statusCode: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message || 'Internal server error',
                service,
              },
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      return {
        statusCode: response.status,
        data: response.data,
        headers: response.headers,
      };
    } catch (error) {
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
