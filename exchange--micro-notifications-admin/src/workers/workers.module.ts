import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { TemplatesModule } from '../templates/templates.module';
import { ProvidersModule } from '../providers/providers.module';
import { EmailProcessor } from './processors/email.processor';
import { SmsProcessor } from './processors/sms.processor';

@Module({
  imports: [
    QueueModule,  // QueueModule ya registró las queues, solo las importamos
    TemplatesModule,
    ProvidersModule,
  ],
  providers: [EmailProcessor, SmsProcessor],
})
export class WorkersModule {}