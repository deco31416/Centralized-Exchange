import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type SendOtpEmailParams = {
  to: string;
  userId: string;
  code: string;
  expirationMinutes: number;
  correlationId: string;
};

@Injectable()
export class NotificationsClientService {
  constructor(private readonly configService: ConfigService) {}

  async sendOtpEmail(params: SendOtpEmailParams): Promise<{ ok: boolean; jobId?: string; error?: string }> {
    const baseUrl = this.configService.get<string>('NOTIFICATIONS_BASE_URL');
    const bearerToken = this.configService.get<string>('NOTIFICATIONS_BEARER_TOKEN');

    if (!baseUrl || !bearerToken) {
      return {
        ok: false,
        error: 'NOTIFICATIONS_BASE_URL or NOTIFICATIONS_BEARER_TOKEN not configured',
      };
    }

    try {
      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/notifications/email`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          to: params.to,
          template: 'auth.otp',
          subject: 'Verification code',
          variables: {
            code: params.code,
            expirationMinutes: params.expirationMinutes,
          },
          user_id: params.userId,
          idempotency_key: params.correlationId,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { ok: false, error: `notifications responded ${res.status}: ${text}` };
      }

      const json = (await res.json().catch(() => ({}))) as { job_id?: string };
      return { ok: true, jobId: json.job_id };
    } catch (error: any) {
      return { ok: false, error: error?.message ?? String(error) };
    }
  }
}
