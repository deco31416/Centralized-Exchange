import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookInboxEntry, WebhookInboxEntryDocument } from './webhook-inbox.schema';

@Injectable()
export class WebhookInboxService {
  constructor(
    @InjectModel(WebhookInboxEntry.name)
    private readonly model: Model<WebhookInboxEntryDocument>,
  ) {}

  async tryInsert(input: {
    provider: string;
    routeKey: string;
    idempotencyKey: string;
    headers: Record<string, unknown>;
    body: Record<string, unknown>;
  }): Promise<{ inserted: true; id: string } | { inserted: false; reason: 'duplicate' }> {
    try {
      const doc = await this.model.create({
        provider: input.provider,
        routeKey: input.routeKey,
        idempotencyKey: input.idempotencyKey,
        headers: input.headers,
        body: input.body,
      });
      return { inserted: true, id: String(doc._id) };
    } catch (error: any) {
      if (error?.code === 11000) {
        return { inserted: false, reason: 'duplicate' };
      }
      throw error;
    }
  }

  async setStatus(inboxId: string, status: WebhookInboxEntry['status']): Promise<void> {
    await this.model.updateOne({ _id: inboxId }, { $set: { status } }).exec();
  }
}
