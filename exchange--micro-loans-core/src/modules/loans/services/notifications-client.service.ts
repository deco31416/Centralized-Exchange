import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsClientService {
  private readonly logger = new Logger(NotificationsClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendLoanEmail(input: {
    to?: string;
    userId: string;
    subject: string;
    template?: string;
    variables: Record<string, unknown>;
  }) {
    const baseUrl = this.configService.get<string>('services.notifications');
    const internalAuthToken =
      this.configService.get<string>('security.internalAuthToken');

    if (!baseUrl || !input.to) {
      return {
        connected: Boolean(baseUrl),
        delivered: false,
        skipped: true,
        message: !input.to
          ? 'Notification skipped because the user does not have an email'
          : 'Notifications service URL is not configured',
      };
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${baseUrl.replace(/\/$/, '')}/notifications/email`,
          {
            to: input.to,
            template: input.template ?? 'loans/status-update',
            subject: input.subject,
            variables: input.variables,
            user_id: input.userId,
          },
          {
            headers: {
              Authorization: `Bearer ${internalAuthToken || ''}`,
              'x-internal-auth': internalAuthToken || '',
            },
            timeout: 10000,
          },
        ),
      );

      return {
        connected: true,
        delivered: true,
        skipped: false,
        response: data,
      };
    } catch (error: any) {
      this.logger.warn(
        `Notifications service call failed: ${JSON.stringify(
          error?.response?.data || error?.message,
        )}`,
      );

      return {
        connected: true,
        delivered: false,
        skipped: false,
        error:
          error?.response?.data ||
          error?.message ||
          'Unknown notification error',
      };
    }
  }
}
