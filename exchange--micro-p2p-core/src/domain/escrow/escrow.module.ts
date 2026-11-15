import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { P2PEscrow, P2PEscrowSchema } from './schemas/p2p-escrow.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: P2PEscrow.name, schema: P2PEscrowSchema }])],
  exports: [MongooseModule],
})
export class EscrowModule {}
