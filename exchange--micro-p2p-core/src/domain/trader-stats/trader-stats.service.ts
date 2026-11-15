import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { P2PTraderStats, P2PTraderStatsDocument } from './schemas/p2p-trader-stats.schema';

@Injectable()
export class TraderStatsService {
  private readonly logger = new Logger(TraderStatsService.name);

  constructor(
    @InjectModel(P2PTraderStats.name) private readonly statsModel: Model<P2PTraderStatsDocument>,
  ) {}

  async findOrCreate(userId: string): Promise<P2PTraderStats> {
    let stats = await this.statsModel.findOne({ userId });
    if (!stats) {
      stats = await this.statsModel.create({ userId });
    }
    return stats;
  }

  async findByUser(userId: string): Promise<P2PTraderStats> {
    return this.findOrCreate(userId);
  }

  async incrementCompleted(userId: string, volumeUsd: number): Promise<void> {
    await this.statsModel.updateOne(
      { userId },
      {
        $inc: { totalOrders: 1, completedOrders: 1, totalVolumeUsd: volumeUsd },
        $set: { lastOrderAt: new Date() },
      },
      { upsert: true },
    );
  }

  async incrementCancelled(userId: string): Promise<void> {
    await this.statsModel.updateOne(
      { userId },
      { $inc: { totalOrders: 1, cancelledOrders: 1 } },
      { upsert: true },
    );
  }

  async incrementDispute(userId: string): Promise<void> {
    await this.statsModel.updateOne(
      { userId },
      { $inc: { disputeCount: 1 } },
      { upsert: true },
    );
  }
}
