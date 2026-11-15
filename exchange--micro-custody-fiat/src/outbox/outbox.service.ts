import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OutboxEvent, OutboxEventDocument } from './outbox.schema';

@Injectable()
export class OutboxService {
  constructor(
    @InjectModel(OutboxEvent.name)
    private readonly model: Model<OutboxEventDocument>,
  ) {}

  async add(input: {
    eventName: string;
    version: string;
    correlationId: string;
    idempotencyKey: string;
    payload: Record<string, unknown>;
  }): Promise<{ created: true } | { created: false; reason: 'duplicate' }> {
    try {
      await this.model.create({
        eventName: input.eventName,
        version: input.version,
        correlationId: input.correlationId,
        idempotencyKey: input.idempotencyKey,
        payload: input.payload,
        status: 'pending',
        attempts: 0,
        nextAttemptAt: new Date(),
      });
      return { created: true };
    } catch (error: any) {
      if (error?.code === 11000) {
        return { created: false, reason: 'duplicate' };
      }
      throw error;
    }
  }

  async claimNext(input: {
    workerId: string;
    lockMs: number;
    now?: Date;
  }): Promise<OutboxEventDocument | null> {
    const now = input.now ?? new Date();
    const lockExpiredBefore = new Date(now.getTime() - input.lockMs);

    return this.model
      .findOneAndUpdate(
        {
          status: { $in: ['pending', 'failed'] },
          nextAttemptAt: { $lte: now },
          $or: [{ lockedAt: { $exists: false } }, { lockedAt: { $lte: lockExpiredBefore } }],
        },
        {
          $set: {
            lockedAt: now,
            lockedBy: input.workerId,
          },
        },
        { new: true },
      )
      .exec();
  }

  async markPublished(input: { id: string; workerId: string; now?: Date }): Promise<void> {
    const now = input.now ?? new Date();
    await this.model
      .updateOne(
        { _id: input.id, lockedBy: input.workerId },
        {
          $set: {
            status: 'published',
            publishedAt: now,
          },
          $unset: {
            lockedAt: 1,
            lockedBy: 1,
            lastError: 1,
          },
        },
      )
      .exec();
  }

  async markRetry(input: {
    id: string;
    workerId: string;
    attempts: number;
    nextAttemptAt: Date;
    lastError: string;
    status: 'pending' | 'dead_letter';
  }): Promise<void> {
    await this.model
      .updateOne(
        { _id: input.id, lockedBy: input.workerId },
        {
          $set: {
            status: input.status,
            attempts: input.attempts,
            nextAttemptAt: input.nextAttemptAt,
            lastError: input.lastError,
          },
          $unset: {
            lockedAt: 1,
            lockedBy: 1,
          },
        },
      )
      .exec();
  }

  async listStuck(input: { olderThanMs: number; limit: number; now?: Date }): Promise<OutboxEventDocument[]> {
    const now = input.now ?? new Date();
    const cutoff = new Date(now.getTime() - input.olderThanMs);

    return this.model
      .find({ status: { $in: ['pending', 'failed', 'dead_letter'] }, createdAt: { $lte: cutoff } })
      .sort({ createdAt: 1 })
      .limit(input.limit)
      .exec();
  }
}
