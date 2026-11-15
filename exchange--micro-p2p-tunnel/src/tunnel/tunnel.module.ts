import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { TunnelGateway } from './tunnel.gateway';
import { TunnelService } from './tunnel.service';
import {
  TunnelSession,
  TunnelSessionSchema,
} from './tunnel-session.schema';
import { SignatureKeysClient } from '../shared/clients/signature-keys.client';
import { WalletLedgerClient } from '../shared/clients/wallet-ledger.client';
import { AuthClient } from '../shared/clients/auth.client';

@Module({
  imports: [
    HttpModule.register({ timeout: 15000 }),
    MongooseModule.forFeature([
      { name: TunnelSession.name, schema: TunnelSessionSchema },
    ]),
  ],
  providers: [
    TunnelGateway,
    TunnelService,
    SignatureKeysClient,
    WalletLedgerClient,
    AuthClient,
  ],
})
export class TunnelModule {}
