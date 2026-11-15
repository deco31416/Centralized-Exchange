import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private joinUrl(baseUrl: string, path: string): string {
    const cleanBase = String(baseUrl || '').replace(/\/+$/, '');
    const cleanPath = String(path || '').replace(/^\/+/, '');

    if (/\/api\/v\d+$/i.test(cleanBase)) {
      return `${cleanBase}/${cleanPath}`;
    }

    const apiPrefix =
      this.configService.get<string>('apiPrefix') || 'api/v1';

    return `${cleanBase}/${apiPrefix}/${cleanPath}`;
  }

  async sendDECOPAYPaymentEmail(input: {
    to?: string;
    userId: string;
    amount: number;
    currency: string;
    concept?: string;
    requestId: string;
    paidAt: string;
    transactionId?: string | null;
  }) {
    const template =
      this.configService.get<string>('DECOPAYNotificationTemplate') || '';

    if (!input.to) {
      return {
        ok: false,
        skipped: true,
        reason: 'NO_EMAIL',
      };
    }

    if (!template) {
      return {
        ok: false,
        skipped: true,
        reason: 'NO_TEMPLATE_CONFIGURED',
      };
    }

    const baseUrl =
      this.configService.get<string>('notificationsBaseUrl') || '';
    const bearerToken =
      this.configService.get<string>('notificationsBearerToken') || '';
    const subject =
      this.configService.get<string>('DECOPAYNotificationSubject') ||
      'DECOPAY payment confirmed';

    const url = this.joinUrl(baseUrl, 'notifications/email');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            to: input.to,
            template,
            subject,
            user_id: input.userId,
            variables: {
              dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000',
              currentYear: new Date().getFullYear(),
              amount: input.amount,
              currency: input.currency,
              concept: input.concept || '',
              requestId: input.requestId,
              paidAt: input.paidAt,
              transactionId: input.transactionId || '',
            },
          },
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
            timeout: this.configService.get<number>('apiTimeout') || 30000,
            validateStatus: () => true,
          },
        ),
      );

      if (response.status < 200 || response.status >= 300) {
        return {
          ok: false,
          skipped: false,
          reason: 'NOTIFICATION_REQUEST_FAILED',
          statusCode: response.status,
          raw: response.data,
        };
      }

      return {
        ok: true,
        skipped: false,
        raw: response.data,
      };
    } catch (error: any) {
      return {
        ok: false,
        skipped: false,
        reason: 'NOTIFICATION_CONNECTION_FAILED',
        detail: error?.response?.data || error?.message || null,
      };
    }
  }
}