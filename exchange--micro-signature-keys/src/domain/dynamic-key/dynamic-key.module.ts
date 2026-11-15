import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DynamicKeyController } from './dynamic-key.controller';
import { DynamicKeyService } from './dynamic-key.service';
import { DynamicKey, DynamicKeySchema } from './schemas/dynamic-key.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DynamicKey.name, schema: DynamicKeySchema }]),
  ],
  controllers: [DynamicKeyController],
  providers: [DynamicKeyService],
  exports: [DynamicKeyService],
})
export class DynamicKeyModule {}
