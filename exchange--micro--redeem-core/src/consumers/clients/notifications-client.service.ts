import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

type NotificationAcceptedResponse = {
  success?: boolean;
  message?: string;
  job_id?: string;
  jobId?: string;
};

@Injectable()
export class NotificationsClientService {
  private readonly logger = new Logger(NotificationsClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async notifyRedeemCreated(payload: {
    userId: string;
    redeemId: string;
    sourceAsset: string;
    targetAsset: string;
    email?: string;
  }) {
    const baseUrl =
      this.configService
        .get<string>('services.notifications')
        ?.replace(/\/$/, '') || '';
    const token =
      this.configService.get<string>('internalAuthToken') || '';

    if (!baseUrl || !token) {
      throw new ServiceUnavailableException(
        'Notifications service is not configured correctly',
      );
    }

    if (!payload.email) {
      return {
        source: 'notifications',
        connected: true,
        delivered: false,
        skipped: true,
        payload,
        message:
          'Notification skipped because the user email is not available',
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<NotificationAcceptedResponse>(
          `${baseUrl}/notifications/email`,
          {
            to: payload.email,
            subject: 'Canje creado en DECO EXCHANGE',
            template: 'auth.otp',
            variables: {
              code: payload.redeemId.slice(-6).toUpperCase(),
              expirationMinutes: 10,
              redeemId: payload.redeemId,
              sourceAsset: payload.sourceAsset,
              targetAsset: payload.targetAsset,
            },
            user_id: payload.userId,
            idempotency_key: payload.redeemId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000,
          },
        ),
      );

      return {
        source: 'notifications',
        connected: true,
        delivered: true,
        jobId: response.data?.job_id || response.data?.jobId,
        payload,
        message: 'Redeem notification accepted by notifications service',
      };
    } catch (error: any) {
      this.logger.error(
        `Redeem notification failed for redeemId=${payload.redeemId}: ${error?.message || error}`,
      );

      return {
        source: 'notifications',
        connected: true,
        delivered: false,
        payload,
        message: 'Notifications service rejected the redeem notification',
        error: error?.response?.data || error?.message || 'unknown error',
      };
    }
  }
}