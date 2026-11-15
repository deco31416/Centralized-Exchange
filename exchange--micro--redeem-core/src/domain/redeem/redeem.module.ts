import { Module } from '@nestjs/common';
import { ConsumersModule } from '../../consumers/consumers.module';
import { RedeemController } from './redeem.controller';
import { RedeemService } from './redeem.service';

@Module({
  imports: [ConsumersModule],
  controllers: [RedeemController],
  providers: [RedeemService],
  exports: [RedeemService],
})
export class RedeemModule {}