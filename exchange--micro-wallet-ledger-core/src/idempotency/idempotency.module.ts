import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InboxEvent, InboxEventSchema } from './inbox.schema';
import { InboxService } from './inbox.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InboxEvent.name, schema: InboxEventSchema }]),
  ],
  providers: [InboxService],
  exports: [InboxService],
})
export class IdempotencyModule {}
