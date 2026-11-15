import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { OutboxEvent, OutboxEventDocument } from './outbox.schema';

@Injectable()
export class OutboxService {
  constructor(
    @InjectModel(OutboxEvent.name)
    private readonly model: Model<OutboxEventDocument>,
  ) {}

  async add(
    input: {
      eventName: string;
      version: string;
      correlationId: string;
      idempotencyKey: string;
      payload: Record<string, unknown>;
    },
    session?: ClientSession,
  ): Promise<{ created: true } | { created: false; reason: 'duplicate' }> {
    try {
      await this.model.create(
        [
          {
            eventName: input.eventName,
            version: input.version,
            correlationId: input.correlationId,
            idempotencyKey: input.idempotencyKey,
            payload: input.payload,
          },
        ],
        session ? { session } : undefined,
      );
      return { created: true };
    } catch (error: any) {
      if (error?.code === 11000) {
        return { created: false, reason: 'duplicate' };
      }
      throw error;
    }
  }
}
