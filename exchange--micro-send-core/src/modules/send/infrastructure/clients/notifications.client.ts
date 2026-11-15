import { Injectable, Logger } from '@nestjs/common';
import { NotificationsPort } from '../../application/ports/notifications.port';
import { BaseHttpClientService } from '../services/base-http-client.service';

@Injectable()
export class NotificationsClient
  extends BaseHttpClientService
  implements NotificationsPort
{
  

  async notifyExecution(payload: {
    userId: string;
    operationId: string;
    destinationType: string;
    amount: number;
    currency: string;
    message: string;
  }): Promise<void> {
    const baseUrl = this.configService.get<string>('NOTIFICATIONS_SERVICE_URL');
    const template = this.configService.get<string>('SEND_EXECUTION_EMAIL_TEMPLATE');
    const email = this.configService.get<string>('SEND_EXECUTION_FALLBACK_EMAIL');

    if (!baseUrl || !template || !email) {
      this.logger.log(
        `Notification skipped for ${payload.operationId}. Configure NOTIFICATIONS_SERVICE_URL, SEND_EXECUTION_EMAIL_TEMPLATE and SEND_EXECUTION_FALLBACK_EMAIL to enable outbound email.`,
      );
      return;
    }

    await this.request({
      baseUrl,
      path: '/notifications/email',
      method: 'POST',
      source: 'notifications',
      headers: this.buildInternalHeaders(),
      data: {
        to: email,
        template,
        subject: `Send execution ${payload.destinationType}`,
        variables: {
          operationId: payload.operationId,
          destinationType: payload.destinationType,
          amount: payload.amount,
          currency: payload.currency,
          message: payload.message,
        },
        user_id: payload.userId,
        idempotency_key: payload.operationId,
      },
    });
  }
}