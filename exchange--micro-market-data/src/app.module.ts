import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { MarketDataController } from './market-data/market-data.controller';
import { MarketDataService } from './market-data/market-data.service';
import { UpstreamClientService } from './market-data/upstream-client.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController, MarketDataController],
  providers: [MarketDataService, UpstreamClientService],
})
export class AppModule {}
