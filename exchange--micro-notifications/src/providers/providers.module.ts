import { Module } from '@nestjs/common';
import { ResendEmailService } from './services/resend-email.service';
import { TwilioSmsService } from './services/twilio-sms.service';

@Module({
  providers: [ResendEmailService, TwilioSmsService],
  exports: [ResendEmailService, TwilioSmsService],
})
export class ProvidersModule {}