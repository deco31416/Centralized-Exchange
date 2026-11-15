import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  EmailProvider,
  SendEmailParams,
  SendEmailResult,
} from '../types/provider.types';

@Injectable()
export class ResendEmailService implements EmailProvider {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly resend: Resend;
  private readonly defaultFromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('resend.apiKey');
    const fromEmail = this.configService.get<string>('resend.fromEmail');
    
    if (!apiKey) {
      throw new Error('Resend API key is required');
    }
    
    if (!fromEmail) {
      throw new Error('Resend from email is required');
    }
    
    this.defaultFromEmail = fromEmail;
    this.resend = new Resend(apiKey);
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const { to, subject, html, text, from } = params;
    
    try {
      const result = await this.resend.emails.send({
        from: from || this.defaultFromEmail,
        to: [to],
        subject,
        html,
        text,
      });

      if (result.error) {
        this.logger.error('Resend API error', {
          error: result.error.message,
          to: this.maskEmail(to),
          subject,
        });

        return {
          success: false,
          error: result.error.message,
        };
      }

      this.logger.log('Email sent successfully', {
        messageId: result.data?.id,
        to: this.maskEmail(to),
        subject,
      });

      return {
        success: true,
        messageId: result.data?.id,
      };
    } catch (error) {
      this.logger.error('Failed to send email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: this.maskEmail(to),
        subject,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2 
      ? `${local[0]}***${local[local.length - 1]}`
      : '***';
    return `${maskedLocal}@${domain}`;
  }
}