import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationsClient {
  private readonly logger = new Logger(NotificationsClient.name);
  private readonly baseUrl: string;
  private readonly internalSecret: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('NOTIFICATIONS_SERVICE_URL') || 'http://localhost:7004';
    this.internalSecret = this.config.get<string>('NOTIFICATIONS_INTERNAL_SECRET') || '';
  }

  /** Enviar OTP al usuario (para verificar cambio de firma) */
  async sendOtp(userId: string, email: string, templateName: string, channel: 'email' | 'sms' = 'email') {
    const endpoint = channel === 'sms' ? 'sms' : 'email';
    try {
      const res = await axios.post(
        `${this.baseUrl}/api/v1/notifications/${endpoint}`,
        {
          to: email,
          template: templateName,
          subject: 'Signature Verification Code',
          variables: { action: 'signature_change' },
          user_id: userId,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.internalSecret}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        },
      );
      this.logger.log(`OTP enviado a usuario ${userId} via ${channel}`);
      return res.data;
    } catch (error: any) {
      this.logger.error(`Error enviando OTP: ${error.message}`);
      throw error;
    }
  }
}
