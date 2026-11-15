import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InboxEvent, InboxEventDocument } from './inbox.schema';

@Injectable()
export class InboxService {
  constructor(
    @InjectModel(InboxEvent.name)
    private readonly model: Model<InboxEventDocument>,
  ) {}

  async tryInsert(input: {
    eventId: string;
    eventName: string;
    version: string;
    correlationId: string;
    payload: Record<string, unknown>;
  }): Promise<{ inserted: true } | { inserted: false; reason: 'duplicate' }> {
    try {
      await this.model.create({
        eventId: input.eventId,
        eventName: input.eventName,
        version: input.version,
        correlationId: input.correlationId,
        payload: input.payload,
      });
      return { inserted: true };
    } catch (error: any) {
      if (error?.code === 11000) {
        return { inserted: false, reason: 'duplicate' };
      }
      throw error;
    }
  }
}
