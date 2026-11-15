import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { SendEmailDto, SendSmsDto, NotificationResponse } from './dto/send-email.dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly baseUrl: string;
  private readonly serviceToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('NOTIFICATIONS_BASE_URL') ||
      this.configService.get<string>('NOTIFICATIONS_SERVICE_URL') ||
      'http://localhost:7002';
    this.serviceToken = this.configService.get<string>('NOTIFICATIONS_SERVICE_TOKEN') || '';
    
    if (!this.serviceToken) {
      this.logger.warn('NOTIFICATIONS_SERVICE_TOKEN not configured - notifications will fail');
    }
  }

  async onModuleInit(): Promise<void> {
    // Best-effort health check: we warn but do not block startup.
    if (process.env.NODE_ENV === 'test') return;

    const ok = await this.checkHealth();
    if (ok) {
      this.logger.log('Notifications service health check OK', {
        baseUrl: this.baseUrl,
      });
    } else {
      this.logger.warn('Notifications service health check FAILED (startup)', {
        baseUrl: this.baseUrl,
      });
    }
  }

  /**
   * Send an email notification via notifications microservice
   */
  async sendEmail(emailDto: SendEmailDto): Promise<NotificationResponse> {
    const correlationId = uuidv4();
    
    try {
      const response: AxiosResponse<NotificationResponse> = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/api/v1/notifications/email`,
          emailDto,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Correlation-Id': correlationId,
            },
            timeout: 10000,
          },
        ),
      );

      this.logger.log('Email notification queued successfully', {
        correlationId,
        jobId: response.data.job_id,
        template: emailDto.template,
        to: this.maskEmail(emailDto.to),
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to send email notification', {
        correlationId,
        template: emailDto.template,
        to: this.maskEmail(emailDto.to),
        error: this.getErrorMessage(error),
      });
      throw new Error(
        `Failed to send email notification: ${this.getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Send an SMS notification via notifications microservice
   */
  async sendSms(smsDto: SendSmsDto): Promise<NotificationResponse> {
    const correlationId = uuidv4();
    
    try {
      const response: AxiosResponse<NotificationResponse> = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/api/v1/notifications/sms`,
          smsDto,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.serviceToken}`,
              'X-Correlation-Id': correlationId,
            },
            timeout: 10000,
          },
        ),
      );

      this.logger.log('SMS notification queued successfully', {
        correlationId,
        jobId: response.data.job_id,
        template: smsDto.template,
        to: this.maskPhone(smsDto.to),
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to send SMS notification', {
        correlationId,
        template: smsDto.template,
        to: this.maskPhone(smsDto.to),
        error: this.getErrorMessage(error),
      });
      throw new Error(
        `Failed to send SMS notification: ${this.getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Health check for notifications service
   */
  async checkHealth(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v1/health`, {
          headers: {
            'Authorization': `Bearer ${this.serviceToken}`,
          },
          timeout: 5000,
        }),
      );
      return true;
    } catch (error) {
      this.logger.warn('Notifications service health check failed', {
        error: this.getErrorMessage(error),
      });
      return false;
    }
  }

  private maskEmail(email: string): string {
    const [local, domain] = String(email || '').split('@');
    if (!domain) return 'invalid-email';
    const maskedLocal =
      local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***';
    return `${maskedLocal}@${domain}`;
  }

  private maskPhone(phone: string): string {
    const value = String(phone || '').replace(/\s+/g, '');
    if (value.length <= 4) return '***';
    return `${'*'.repeat(Math.max(value.length - 4, 3))}${value.slice(-4)}`;
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
