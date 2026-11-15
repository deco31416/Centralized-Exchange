import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { QueueService } from '../../queue/services/queue.service';
import { HandlebarsTemplateRendererService } from '../../templates/services/handlebars-template-renderer.service';
import { JobPriority, QueueNames, EmailJob, SmsJob } from '../../queue/types/job.types';
import { TemplateType } from '../../templates/types/template.types';
import { SendEmailDto, NotificationPriority } from '../models/send-email.dto';
import { SendSmsDto } from '../models/send-sms.dto';
import { NotificationResponseDto, JobStatusResponseDto } from '../models/notification-response.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly templateRenderer: HandlebarsTemplateRendererService,
  ) {}

  async sendEmail(
    dto: SendEmailDto,
    requestedBy: string,
    correlationId?: string,
  ): Promise<NotificationResponseDto> {
    // Validate template exists
    const templateExists = await this.templateRenderer.validateTemplate(
      dto.template,
      TemplateType.EMAIL,
    );

    if (!templateExists) {
      throw new NotFoundException(`Email template not found: ${dto.template}`);
    }

    const jobData: EmailJob = {
      channel: 'email',
      to: dto.to,
      template: dto.template,
      subject: dto.subject,
      variables: dto.variables,
      user: {
        id: dto.user_id,
        orgId: dto.org_id,
      },
      meta: {
        idempotencyKey: dto.idempotency_key,
        correlationId: correlationId || uuidv4(),
        requestedBy,
      },
    };

    const priority = this.mapPriorityToJobPriority(dto.priority);
    const jobId = await this.queueService.enqueueEmail(jobData, priority);

    this.logger.log('Email notification enqueued', {
      jobId,
      template: dto.template,
      to: this.maskEmail(dto.to),
      userId: dto.user_id,
      correlationId: jobData.meta.correlationId,
    });

    return {
      job_id: jobId,
      status: 'enqueued',
      message: 'Email notification has been enqueued for processing',
    };
  }

  async sendSms(
    dto: SendSmsDto,
    requestedBy: string,
    correlationId?: string,
  ): Promise<NotificationResponseDto> {
    // Validate template exists
    const templateExists = await this.templateRenderer.validateTemplate(
      dto.template,
      TemplateType.SMS,
    );

    if (!templateExists) {
      throw new NotFoundException(`SMS template not found: ${dto.template}`);
    }

    const jobData: SmsJob = {
      channel: 'sms',
      to: dto.to,
      template: dto.template,
      variables: dto.variables,
      user: {
        id: dto.user_id,
        orgId: dto.org_id,
      },
      meta: {
        idempotencyKey: dto.idempotency_key,
        correlationId: correlationId || uuidv4(),
        requestedBy,
      },
    };

    const priority = this.mapPriorityToJobPriority(dto.priority);
    const jobId = await this.queueService.enqueueSms(jobData, priority);

    this.logger.log('SMS notification enqueued', {
      jobId,
      template: dto.template,
      to: this.maskPhoneNumber(dto.to),
      userId: dto.user_id,
      correlationId: jobData.meta.correlationId,
    });

    return {
      job_id: jobId,
      status: 'enqueued',
      message: 'SMS notification has been enqueued for processing',
    };
  }

  async getJobStatus(queueName: string, jobId: string): Promise<JobStatusResponseDto | null> {
    const queueEnum = queueName === 'email' ? QueueNames.EMAIL : QueueNames.SMS;
    const status = await this.queueService.getJobStatus(queueEnum, jobId);
    
    if (!status) {
      return null;
    }

    return status;
  }

  async getQueueStats(): Promise<any> {
    return this.queueService.getQueueStats();
  }

  private mapPriorityToJobPriority(priority?: NotificationPriority): JobPriority {
    switch (priority) {
      case NotificationPriority.HIGH:
        return JobPriority.HIGH;
      case NotificationPriority.NORMAL:
      default:
        return JobPriority.NORMAL;
    }
  }

  async getFailedJobs(): Promise<any> {
    const emailFailed = await this.queueService.getFailedJobs(QueueNames.EMAIL);
    const smsFailed = await this.queueService.getFailedJobs(QueueNames.SMS);
    
    return {
      email: emailFailed.map(job => ({
        id: job.id,
        data: job.data,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        attemptsMade: job.attemptsMade,
      })),
      sms: smsFailed.map(job => ({
        id: job.id,
        data: job.data,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        attemptsMade: job.attemptsMade,
      })),
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