import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { P2PCode, P2PCodeDocument } from '../domain/p2p-code.schema';

@Injectable()
export class P2PCodeService {
  constructor(
    @InjectModel(P2PCode.name)
    private readonly model: Model<P2PCodeDocument>,
  ) {}

  /**
   * Generate a unique 6-digit code
   */
  private async generateUniqueCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Generate 6 random digits
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Check if exists
      const existing = await this.model.findOne({ code, status: 'PENDING' }).exec();
      if (!existing) {
        return code;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique code after ' + maxAttempts + ' attempts');
  }

  /**
   * Create P2P transfer code
   */
  async createCode(input: {
    fromUserId: string;
    currency: string;
    amountMinorUnits: string;
    ttlMinutes?: number;
  }): Promise<{ code: string; expiresAt: Date; qrData: string }> {
    const code = await this.generateUniqueCode();
    const ttl = input.ttlMinutes || 10; // Default 10 minutes
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    const qrData = JSON.stringify({
      type: 'P2P_TRANSFER',
      code,
      fromUserId: input.fromUserId,
      currency: input.currency,
      amount: input.amountMinorUnits,
      expiresAt: expiresAt.toISOString(),
    });

    await this.model.create({
      code,
      fromUserId: input.fromUserId,
      currency: input.currency,
      amountMinorUnits: input.amountMinorUnits,
      status: 'PENDING',
      expiresAt,
      qrData,
    });

    return { code, expiresAt, qrData };
  }

  /**
   * Validate and consume code
   */
  async consumeCode(input: {
    code: string;
    toUserId: string;
  }): Promise<
    | { valid: true; fromUserId: string; currency: string; amountMinorUnits: string }
    | { valid: false; reason: string }
  > {
    const { code, toUserId } = input;
    const doc = await this.model.findOne({ code, status: 'PENDING' }).exec();

    if (!doc) {
      return { valid: false, reason: 'INVALID_CODE' };
    }

    if (doc.expiresAt < new Date()) {
      await this.model.updateOne({ _id: doc._id }, { status: 'EXPIRED' }).exec();
      return { valid: false, reason: 'EXPIRED' };
    }

    if (doc.fromUserId === toUserId) {
      return { valid: false, reason: 'CANNOT_SEND_TO_SELF' };
    }

    // Mark as used
    await this.model
      .updateOne(
        { _id: doc._id },
        {
          status: 'USED',
          usedBy: toUserId,
          usedAt: new Date(),
        },
      )
      .exec();

    return {
      valid: true,
      fromUserId: doc.fromUserId,
      currency: doc.currency,
      amountMinorUnits: doc.amountMinorUnits,
    };
  }
}
