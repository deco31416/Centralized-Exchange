import { Module } from '@nestjs/common';
import { InternalP2PController } from './internal-p2p.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [InternalP2PController],
})
export class InternalP2PModule {}
