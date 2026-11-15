import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hold, HoldState } from '../models/hold.schema';
import { CreateHoldDto } from '../models/create-hold.dto';
import { BalanceService } from './balance.service';

/**
 * Service responsible for managing holds (escrow) on accounts.
 * Holds temporarily lock funds without creating journal entries.
 */
@Injectable()
export class HoldService {
  constructor(
    @InjectModel(Hold.name)
    private readonly holdModel: Model<Hold>,
    private readonly balanceService: BalanceService,
  ) {}

  /**
   * Creates a new hold on an account.
   * Validates that sufficient balance is available.
   */
  async createHold(dto: CreateHoldDto): Promise<Hold> {
    if (!Types.ObjectId.isValid(dto.accountId)) {
      throw new BadRequestException('Invalid account ID format');
    }
    const hasSufficientBalance = await this.balanceService.hasSufficientBalance(
      {
        accountId: dto.accountId,
        requiredAmount: dto.amountMinor,
      },
    );
    if (!hasSufficientBalance) {
      throw new BadRequestException('Insufficient available balance for hold');
    }
    const hold = new this.holdModel({
      ...dto,
      accountId: new Types.ObjectId(dto.accountId),
      state: HoldState.ACTIVE,
    });
    return hold.save();
  }

  /**
   * Finds a hold by its ID.
   */
  async findHoldById(holdId: string): Promise<Hold> {
    if (!Types.ObjectId.isValid(holdId)) {
      throw new NotFoundException('Invalid hold ID format');
    }
    const hold = await this.holdModel.findById(holdId).exec();
    if (!hold) {
      throw new NotFoundException('Hold not found');
    }
    return hold;
  }

  /**
   * Releases a hold, making the funds available again.
   */
  async releaseHold(holdId: string): Promise<Hold> {
    const hold = await this.findHoldById(holdId);
    if (hold.state !== HoldState.ACTIVE) {
      throw new BadRequestException('Hold is not active');
    }
    hold.state = HoldState.RELEASED;
    return hold.save();
  }

  /**
   * Cancels a hold, making the funds available again.
   */
  async cancelHold(holdId: string): Promise<Hold> {
    const hold = await this.findHoldById(holdId);
    if (hold.state !== HoldState.ACTIVE) {
      throw new BadRequestException('Hold is not active');
    }
    hold.state = HoldState.CANCELED;
    return hold.save();
  }

  /**
   * Gets all active holds for an account.
   */
  async getActiveHoldsForAccount(accountId: string): Promise<Hold[]> {
    if (!Types.ObjectId.isValid(accountId)) {
      return [];
    }
    return this.holdModel
      .find({
        accountId: new Types.ObjectId(accountId),
        state: HoldState.ACTIVE,
      })
      .exec();
  }
}
