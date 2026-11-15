import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { P2PAd, P2PAdSchema } from './schemas/p2p-ad.schema';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: P2PAd.name, schema: P2PAdSchema }]),
    SharedModule,
  ],
  controllers: [AdsController],
  providers: [AdsService],
  exports: [AdsService, MongooseModule],
})
export class AdsModule {}
