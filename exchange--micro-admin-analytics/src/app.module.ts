import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminAnalyticsController } from './admin-analytics/admin-analytics.controller';
import { AdminAnalyticsService } from './admin-analytics/admin-analytics.service';
import { UpstreamClientService } from './admin-analytics/upstream-client.service';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController, AdminAnalyticsController],
  providers: [AdminAnalyticsService, UpstreamClientService],
})
export class AppModule {}
