import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { QueueNames } from './types/job.types';
import { QueueService } from './services/queue.service';
import { EmailProcessor } from '../workers/processors/email.processor';
import { SmsProcessor } from '../workers/processors/sms.processor';
import { TemplatesModule } from '../templates/templates.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUri = configService.get<string>('redis.uri');
        if (!redisUri) {
          throw new Error('Redis URI is required');
        }
        const url = new URL(redisUri);
        
        return {
          redis: {
            host: url.hostname,
            port: parseInt(url.port, 10),
            password: url.password || undefined,
            // keyPrefix removido temporalmente para debugging
          },
          defaultJobOptions: {
            removeOnComplete: 50,
            removeOnFail: 100,
          },
        };
      },
    }),
    BullModule.registerQueue(
      { name: QueueNames.EMAIL },
      { name: QueueNames.SMS },
    ),
    // Necesarios para los processors
    TemplatesModule,
    ProvidersModule,
  ],
  providers: [
    QueueService,
    // Processors deben estar en el mismo módulo donde se registran las queues
    EmailProcessor,
    SmsProcessor,
  ],
  exports: [QueueService, BullModule], // Exportar BullModule para que otros módulos puedan inyectar queues
})
export class QueueModule {}