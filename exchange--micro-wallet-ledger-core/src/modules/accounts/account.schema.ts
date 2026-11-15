import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<Account>;

@Schema({
  collection: 'accounts',
  timestamps: true,
})
export class Account {
  @Prop({ required: true, unique: true, index: true })
  accountId!: string;

  @Prop({ unique: true, sparse: true, index: true })
  userId?: string;

  @Prop({ unique: true, sparse: true, index: true })
  accountNumber?: string;

  @Prop({ index: true })
  alias?: string;

  @Prop({ default: 'USER', index: true })
  type!: 'USER' | 'SYSTEM';

  @Prop({ default: 'ACTIVE', index: true })
  status!: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
}

export const AccountSchema = SchemaFactory.createForClass(Account);
