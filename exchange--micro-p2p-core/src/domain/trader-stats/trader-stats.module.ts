import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { P2PTraderStats, P2PTraderStatsSchema } from './schemas/p2p-trader-stats.schema';
import { TraderStatsService } from './trader-stats.service';
import { TraderStatsController } from './trader-stats.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: P2PTraderStats.name, schema: P2PTraderStatsSchema }]),
    SharedModule,
  ],
  controllers: [TraderStatsController],
  providers: [TraderStatsService],
  exports: [TraderStatsService],
})
export class TraderStatsModule {}
