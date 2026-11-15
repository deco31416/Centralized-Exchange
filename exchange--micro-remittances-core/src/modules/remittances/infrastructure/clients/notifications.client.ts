import {
  BadGatewayException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { NotificationsClientPort } from '../../domain/ports/notifications-client.port';

@Injectable()
export class NotificationsClient implements NotificationsClientPort {
  private readonly logger = new Logger(NotificationsClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async notify(event: string, payload: Record<string, unknown>): Promise<void> {
    const baseUrl = this.configService.get<string>('services.notifications');
    const path = this.configService.get<string>('paths.notificationsNotify');
    const token = this.configService.get<string>('internalAuthToken');
    const timeout = this.configService.get<number>('requestTimeoutMs');

    if (!baseUrl) {
      this.logger.warn('NOTIFICATIONS_SERVICE_URL no configurado. Se omite notify.');
      return;
    }

    try {
      await lastValueFrom(
        this.httpService.post(
          `${baseUrl}${path}`,
          { event, payload },
          {
            timeout,
            headers: {
              Authorization: `Bearer ${token}`,
              'x-internal-auth': token,
            },
          },
        ),
      );
    } catch (error: any) {
      throw new BadGatewayException(
        error?.response?.data?.message ||
          'Error consumiendo notifications',
      );
    }
  }
}