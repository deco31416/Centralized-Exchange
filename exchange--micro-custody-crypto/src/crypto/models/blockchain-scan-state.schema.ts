import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { SupportedBlockchain } from './user-address.schema';

/**
 * Blockchain scan state for tracking last scanned block per blockchain
 */
@Schema({ timestamps: true })
export class BlockchainScanState extends Document {
  @Prop({ required: true, unique: true, index: true, type: String })
  blockchain: SupportedBlockchain;

  @Prop({ required: true, default: 0 })
  lastScannedBlock: number;

  @Prop({ type: Date })
  lastScanAt: Date;
}

export const BlockchainScanStateSchema = SchemaFactory.createForClass(BlockchainScanState);
