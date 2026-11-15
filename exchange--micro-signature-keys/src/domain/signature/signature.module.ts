import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SignatureController } from './signature.controller';
import { SignatureService } from './signature.service';
import { Signature, SignatureSchema } from './schemas/signature.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Signature.name, schema: SignatureSchema }]),
  ],
  controllers: [SignatureController],
  providers: [SignatureService],
  exports: [SignatureService],
})
export class SignatureModule {}
