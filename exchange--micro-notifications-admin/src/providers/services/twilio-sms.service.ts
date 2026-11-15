import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import {
  SmsProvider,
  SendSmsParams,
  SendSmsResult,
} from '../types/provider.types';

@Injectable()
export class TwilioSmsService implements SmsProvider {
  private readonly logger = new Logger(TwilioSmsService.name);
  private twilioClient?: Twilio;
  private readonly accountSid?: string;
  private readonly authToken?: string;
  private readonly defaultFromNumber?: string;

  constructor(private readonly configService: ConfigService) {
    this.accountSid = this.configService.get<string>('twilio.accountSid');
    this.authToken = this.configService.get<string>('twilio.authToken');
    this.defaultFromNumber = this.configService.get<string>('twilio.fromNumber');

    // IMPORTANT: Do not throw here.
    // We want the service to boot even if Twilio is not configured (email-only local dev).
    // Twilio is initialized lazily on first SMS send.
    if (!this.accountSid || !this.authToken || !this.defaultFromNumber) {
      this.logger.warn('Twilio SMS provider not fully configured; SMS sending will be disabled until configured');
      return;
    }

    if (!this.accountSid.startsWith('AC')) {
      this.logger.warn('Twilio accountSid is invalid (must start with AC); SMS sending will be disabled until fixed');
    }
  }

  async sendSms(params: SendSmsParams): Promise<SendSmsResult> {
    const { to, body, from } = params;

    const client = this.getClient();
    if (!client || !this.defaultFromNumber) {
      const errorMessage = 'Twilio is not configured; cannot send SMS';
      this.logger.warn(errorMessage, { to: this.maskPhoneNumber(to) });
      return { success: false, error: errorMessage };
    }
    
    try {
      const message = await client.messages.create({
        body,
        from: from || this.defaultFromNumber,
        to,
      });

      this.logger.log('SMS sent successfully', {
        messageId: message.sid,
        to: this.maskPhoneNumber(to),
        status: message.status,
      });

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      this.logger.error('Failed to send SMS', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: this.maskPhoneNumber(to),
        errorCode: (error as any).code,
        errorDetails: (error as any).moreInfo,
      });

      // Check if it's a permanent error (invalid number, etc.)
      const isPermanentError = this.isPermanentError(error);
      
      return {
        success: false,
        error: this.formatErrorMessage(error, isPermanentError),
      };
    }
  }

  private isPermanentError(error: any): boolean {
    // Twilio error codes for permanent failures
    const permanentErrorCodes = [
      21211, // Invalid 'To' phone number
      21612, // The 'To' phone number is not currently reachable via SMS
      21614, // 'To' number is not a valid mobile number
      30007, // Message filtered (spam)
      30008, // Unknown error
    ];

    return permanentErrorCodes.includes(error?.code);
  }

  private formatErrorMessage(error: any, isPermanent: boolean): string {
    const baseMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return isPermanent ? `PERMANENT: ${baseMessage}` : baseMessage;
  }

  private maskPhoneNumber(phone: string): string {
    if (phone.length <= 4) {
      return '***';
    }
    return `***${phone.slice(-4)}`;
  }

  private getClient(): Twilio | undefined {
    if (this.twilioClient) {
      return this.twilioClient;
    }

    if (!this.accountSid || !this.authToken) {
      return undefined;
    }

    // Twilio SDK enforces accountSid format and will throw if invalid.
    if (!this.accountSid.startsWith('AC')) {
      return undefined;
    }

    try {
      this.twilioClient = new Twilio(this.accountSid, this.authToken);
      return this.twilioClient;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      this.logger.warn('Failed to initialize Twilio client; SMS sending disabled', { message });
      return undefined;
    }
  }
}