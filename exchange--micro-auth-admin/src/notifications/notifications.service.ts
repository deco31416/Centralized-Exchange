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
      'http://localhost:7004';
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
        to: emailDto.to,
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to send email notification', {
        correlationId,
        template: emailDto.template,
        to: emailDto.to,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to send email notification: ${error.message}`);
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
        to: smsDto.to,
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to send SMS notification', {
        correlationId,
        template: smsDto.template,
        to: smsDto.to,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to send SMS notification: ${error.message}`);
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
        error: error.message,
      });
      return false;
    }
  }
}