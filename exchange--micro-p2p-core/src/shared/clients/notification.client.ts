import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

/**
 * Cliente de notificaciones — fire-and-forget.
 * Si falla, loguea warning pero NO rompe el flujo principal.
 * No loguear datos sensibles: no tokens, no datos bancarios completos.
 */
@Injectable()
export class NotificationClient {
  private readonly logger = new Logger(NotificationClient.name);
  private readonly notificationsUrl: string;
  private readonly internalToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.notificationsUrl = this.configService.get<string>('services.notifications') || 'http://localhost:7004/api/v1';
    this.internalToken = this.configService.get<string>('internalAuthToken') || '';
  }

  private async send(userId: string, type: string, data: Record<string, any>): Promise<void> {
    try {
      await this.httpService.axiosRef.post(
        `${this.notificationsUrl}/notifications`,
        { userId, type, data },
        { headers: { 'x-internal-auth': this.internalToken }, timeout: 4000 },
      );
    } catch (err: any) {
      this.logger.warn(`[NotificationClient] Non-critical notification failed | type=${type} | userId=${userId} | ${err.message}`);
    }
  }

  async notifyOrderCreated(sellerId: string, orderId: string, buyerId: string): Promise<void> {
    await this.send(sellerId, 'P2P_ORDER_CREATED', { orderId, buyerId });
    this.logger.log(`[P2P] Notification sent: order created | orderId=${orderId} | sellerId=${sellerId}`);
  }

  async notifyPaymentMarked(sellerId: string, orderId: string): Promise<void> {
    await this.send(sellerId, 'P2P_PAYMENT_MARKED', { orderId });
    this.logger.log(`[P2P] Notification sent: payment marked | orderId=${orderId} | sellerId=${sellerId}`);
  }

  async notifySellerConfirmNeeded(sellerId: string, orderId: string): Promise<void> {
    await this.send(sellerId, 'P2P_CONFIRM_PAYMENT_NEEDED', { orderId });
  }

  async notifyOrderReleased(buyerId: string, orderId: string): Promise<void> {
    await this.send(buyerId, 'P2P_ORDER_RELEASED', { orderId });
    this.logger.log(`[P2P] Notification sent: order released | orderId=${orderId} | buyerId=${buyerId}`);
  }

  async notifyDisputeOpened(sellerId: string, buyerId: string, orderId: string): Promise<void> {
    await this.send(sellerId, 'P2P_DISPUTE_OPENED', { orderId });
    await this.send(buyerId, 'P2P_DISPUTE_OPENED', { orderId });
    this.logger.log(`[P2P] Notification sent: dispute opened | orderId=${orderId}`);
  }

  async notifyOrderCancelled(userId: string, orderId: string): Promise<void> {
    await this.send(userId, 'P2P_ORDER_CANCELLED', { orderId });
  }
}
