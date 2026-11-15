import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue, JobOptions } from 'bull';
import { ConfigService } from '@nestjs/config';
import {
  NotificationJob,
  EmailJob,
  SmsJob,
  QueueNames,
  JobPriority,
} from '../types/job.types';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QueueNames.EMAIL) private readonly emailQueue: Queue<EmailJob>,
    @InjectQueue(QueueNames.SMS) private readonly smsQueue: Queue<SmsJob>,
    private readonly configService: ConfigService,
  ) {}

  async enqueueEmail(jobData: EmailJob, priority: JobPriority = JobPriority.NORMAL): Promise<string> {
    const jobOptions = this.createJobOptions(priority, jobData.meta.idempotencyKey);
    
    try {
      const job = await this.emailQueue.add('send-email', jobData, jobOptions);
      
      this.logger.log('Email job enqueued', {
        jobId: job.id,
        to: this.maskEmail(jobData.to),
        template: jobData.template,
        correlationId: jobData.meta.correlationId,
        priority,
      });

      return job.id.toString();
    } catch (error) {
      this.logger.error('Failed to enqueue email job', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: this.maskEmail(jobData.to),
        template: jobData.template,
        correlationId: jobData.meta.correlationId,
      });
      throw error;
    }
  }

  async enqueueSms(jobData: SmsJob, priority: JobPriority = JobPriority.NORMAL): Promise<string> {
    const jobOptions = this.createJobOptions(priority, jobData.meta.idempotencyKey);
    
    try {
      const job = await this.smsQueue.add('send-sms', jobData, jobOptions);
      
      this.logger.log('SMS job enqueued', {
        jobId: job.id,
        to: this.maskPhoneNumber(jobData.to),
        template: jobData.template,
        correlationId: jobData.meta.correlationId,
        priority,
      });

      return job.id.toString();
    } catch (error) {
      this.logger.error('Failed to enqueue SMS job', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: this.maskPhoneNumber(jobData.to),
        template: jobData.template,
        correlationId: jobData.meta.correlationId,
      });
      throw error;
    }
  }

  async getJobStatus(queueName: QueueNames, jobId: string): Promise<any> {
    const queue = queueName === QueueNames.EMAIL ? this.emailQueue : this.smsQueue;
    const job = await queue.getJob(jobId);
    
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress(),
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
    };
  }

  async getQueueStats(): Promise<any> {
    const [emailStats, smsStats] = await Promise.all([
      this.getQueueCounts(this.emailQueue),
      this.getQueueCounts(this.smsQueue),
    ]);

    return {
      email: emailStats,
      sms: smsStats,
    };
  }

  private createJobOptions(priority: JobPriority, idempotencyKey?: string): JobOptions {
    const maxAttempts = this.configService.get<number>('queue.maxAttempts', 6);
    
    return {
      priority,
      attempts: maxAttempts,
      backoff: {
        type: 'exponential',
        delay: 5000, // Start with 5 seconds
      },
      removeOnComplete: 50, // Keep 50 successful jobs
      removeOnFail: 100, // Keep 100 failed jobs
      jobId: idempotencyKey, // Use idempotency key as job ID if provided
    };
  }

  async getFailedJobs(queueName: string): Promise<any[]> {
    const queue = queueName === QueueNames.EMAIL ? this.emailQueue : this.smsQueue;
    return await queue.getFailed();
  }

  private async getQueueCounts(queue: Queue): Promise<any> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
    };
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2 
      ? `${local[0]}***${local[local.length - 1]}`
      : '***';
    return `${maskedLocal}@${domain}`;
  }

  private maskPhoneNumber(phone: string): string {
    if (phone.length <= 4) {
      return '***';
    }
    return `***${phone.slice(-4)}`;
  }
}