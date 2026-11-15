import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { P2PCode, P2PCodeSchema } from './p2p-code.schema';
import { P2PCodeService } from './p2p-code.service';
import { P2PController } from './p2p.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: P2PCode.name, schema: P2PCodeSchema }]),
    HttpModule,
  ],
  providers: [P2PCodeService],
  controllers: [P2PController],
  exports: [P2PCodeService],
})
export class P2PModule {}
