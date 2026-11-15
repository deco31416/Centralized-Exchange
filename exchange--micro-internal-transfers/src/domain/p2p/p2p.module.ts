import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { P2PCode, P2PCodeSchema } from './p2p-code.schema';
import { P2PCodeService } from './p2p-code.service';
import { P2PController } from './p2p.controller';
import { WalletLedgerClient } from './wallet-ledger.client';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: P2PCode.name, schema: P2PCodeSchema },
    ]),
    HttpModule.register({ timeout: 15000 }),
  ],
  providers: [P2PCodeService, WalletLedgerClient],
  controllers: [P2PController],
  exports: [P2PCodeService, WalletLedgerClient],
})
export class P2PModule {}
