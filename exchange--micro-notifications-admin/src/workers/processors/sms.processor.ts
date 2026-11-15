import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { HandlebarsTemplateRendererService } from '../../templates/services/handlebars-template-renderer.service';
import { TwilioSmsService } from '../../providers/services/twilio-sms.service';
import { SmsJob, QueueNames } from '../../queue/types/job.types';

@Processor(QueueNames.SMS)
export class SmsProcessor {
  private readonly logger = new Logger(SmsProcessor.name);

  constructor(
    private readonly templateRenderer: HandlebarsTemplateRendererService,
    private readonly smsService: TwilioSmsService,
  ) {}

  @Process('send-sms')
  async handleSendSms(job: Job<SmsJob>): Promise<void> {
    const { data } = job;
    const startTime = Date.now();

    this.logger.log('Processing SMS job', {
      jobId: job.id,
      template: data.template,
      to: this.maskPhoneNumber(data.to),
      correlationId: data.meta.correlationId,
      attempt: job.attemptsMade + 1,
    });

    try {
      // Render SMS template
      const renderedTemplate = await this.templateRenderer.renderSmsTemplate(
        data.template,
        data.variables,
      );

      // Send SMS
      const result = await this.smsService.sendSms({
        to: data.to,
        body: renderedTemplate.content,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send SMS');
      }

      const duration = Date.now() - startTime;
      this.logger.log('SMS sent successfully', {
        jobId: job.id,
        messageId: result.messageId,
        template: data.template,
        to: this.maskPhoneNumber(data.to),
        correlationId: data.meta.correlationId,
        duration: `${duration}ms`,
      });

      // Update job progress
      await job.progress(100);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Failed to process SMS job', {
        jobId: job.id,
        template: data.template,
        to: this.maskPhoneNumber(data.to),
        correlationId: data.meta.correlationId,
        attempt: job.attemptsMade + 1,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Check if this is a permanent error (already handled by TwilioSmsService)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.startsWith('PERMANENT:')) {
        this.logger.warn('Permanent error detected, not retrying', {
          jobId: job.id,
          error: errorMessage,
        });
        throw error; // Re-throw as permanent error
      }

      throw error;
    }
  }

  private maskPhoneNumber(phone: string): string {
    if (phone.length <= 4) {
      return '***';
    }
    return `***${phone.slice(-4)}`;
  }
}