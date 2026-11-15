import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { HandlebarsTemplateRendererService } from '../../templates/services/handlebars-template-renderer.service';
import { ResendEmailService } from '../../providers/services/resend-email.service';
import { EmailJob, QueueNames } from '../../queue/types/job.types';

@Processor(QueueNames.EMAIL)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly templateRenderer: HandlebarsTemplateRendererService,
    private readonly emailService: ResendEmailService,
  ) {
    this.logger.log('✅ EmailProcessor initialized and ready to process jobs');
    this.logger.log(`📋 Registered to process jobs from queue: ${QueueNames.EMAIL}`);
  }

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJob>): Promise<void> {
    this.logger.log(`🔔 RECEIVED JOB: ${job.name} (ID: ${job.id})`);

    const { data } = job;
    const startTime = Date.now();

    this.logger.log('Processing email job', {
      jobId: job.id,
      template: data.template,
      to: this.maskEmail(data.to),
      correlationId: data.meta.correlationId,
      attempt: job.attemptsMade + 1,
    });

    try {
      // Render email template
      const renderedTemplate = await this.templateRenderer.renderEmailTemplate(
        data.template,
        data.variables,
      );

      // Send email
      const result = await this.emailService.sendEmail({
        to: data.to,
        subject: data.subject || renderedTemplate.subject || 'Notification',
        html: renderedTemplate.html,
        text: renderedTemplate.text,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      const duration = Date.now() - startTime;
      this.logger.log('Email sent successfully', {
        jobId: job.id,
        messageId: result.messageId,
        template: data.template,
        to: this.maskEmail(data.to),
        correlationId: data.meta.correlationId,
        duration: `${duration}ms`,
      });

      // Update job progress
      await job.progress(100);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Failed to process email job', {
        jobId: job.id,
        template: data.template,
        to: this.maskEmail(data.to),
        correlationId: data.meta.correlationId,
        attempt: job.attemptsMade + 1,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Check if this is a permanent error
      if (this.isPermanentError(error)) {
        this.logger.warn('Permanent error detected, not retrying', {
          jobId: job.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new Error(`PERMANENT: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      throw error;
    }
  }

  private isPermanentError(error: any): boolean {
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    // Common permanent email errors
    const permanentErrors = [
      'invalid email',
      'email address not found',
      'mailbox does not exist',
      'user unknown',
      'domain not found',
      'blocked',
      'spam',
      'bounced',
    ];

    return permanentErrors.some(permanentError => errorMessage.includes(permanentError));
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2 
      ? `${local[0]}***${local[local.length - 1]}`
      : '***';
    return `${maskedLocal}@${domain}`;
  }
}