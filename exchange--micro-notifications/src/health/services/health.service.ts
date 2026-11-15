import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import Redis from 'ioredis';
import { QueueNames } from '../../queue/types/job.types';
import { ResendEmailService } from '../../providers/services/resend-email.service';
import { TwilioSmsService } from '../../providers/services/twilio-sms.service';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks: {
    redis: 'ok' | 'error';
    queues: 'ok' | 'error';
    providers: 'ok' | 'error';
  };
  version: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    @InjectQueue(QueueNames.EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QueueNames.SMS) private readonly smsQueue: Queue,
    private readonly configService: ConfigService,
    private readonly resendService: ResendEmailService,
    private readonly twilioService: TwilioSmsService,
  ) {}

  async getHealthStatus(): Promise<HealthResponse> {
    const checks = await Promise.allSettled([
      this.checkRedis(),
      this.checkQueues(),
      this.checkProviders(),
    ]);

    const redisStatus = checks[0].status === 'fulfilled' && checks[0].value ? 'ok' : 'error';
    const queuesStatus = checks[1].status === 'fulfilled' && checks[1].value ? 'ok' : 'error';
    const providersStatus = checks[2].status === 'fulfilled' && checks[2].value ? 'ok' : 'error';

    const overallStatus = 
      redisStatus === 'ok' && queuesStatus === 'ok' && providersStatus === 'ok' 
        ? 'ok' 
        : 'error';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks: {
        redis: redisStatus,
        queues: queuesStatus,
        providers: providersStatus,
      },
      version: process.env.npm_package_version || '0.0.1',
    };
  }

  private async checkRedis(): Promise<boolean> {
    try {
      const redisUri = this.configService.get<string>('redis.uri');
      if (!redisUri) {
        throw new Error('Redis URI is required');
      }
      
      const redis = new Redis(redisUri);
      
      const result = await redis.ping();
      await redis.disconnect();
      
      return result === 'PONG';
    } catch (error) {
      this.logger.warn('Redis health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  private async checkQueues(): Promise<boolean> {
    try {
      // Check if queues are accessible
      const [emailWaiting, smsWaiting] = await Promise.all([
        this.emailQueue.getWaiting(),
        this.smsQueue.getWaiting(),
      ]);

      return Array.isArray(emailWaiting) && Array.isArray(smsWaiting);
    } catch (error) {
      this.logger.warn('Queue health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  private async checkProviders(): Promise<boolean> {
    try {
      // Basic provider instantiation check
      // In production, you might want to make actual test API calls
      // but that could be expensive, so we'll just check if they're properly configured
      const hasResend = this.configService.get<string>('resend.apiKey') !== undefined;
      const hasTwilio = this.configService.get<string>('twilio.accountSid') !== undefined;

      return hasResend && hasTwilio;
    } catch (error) {
      this.logger.warn('Provider health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}