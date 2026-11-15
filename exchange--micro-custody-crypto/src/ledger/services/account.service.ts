import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account, AccountStatus } from '../models/account.schema';
import { CreateAccountDto } from '../models/create-account.dto';

/**
 * Service responsible for managing ledger accounts.
 * Handles account creation, retrieval, and status management.
 */
@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<Account>,
  ) {}

  /**
   * Creates a new ledger account.
   * Ensures uniqueness per owner and asset.
   */
  async createAccount(dto: CreateAccountDto): Promise<Account> {
    const existingAccount = await this.findAccountByOwnerAndAsset({
      ownerId: dto.ownerId,
      assetCode: dto.assetCode,
    });
    if (existingAccount) {
      throw new ConflictException(
        'Account already exists for this owner and asset',
      );
    }
    const account = new this.accountModel({
      ...dto,
      status: AccountStatus.ACTIVE,
    });
    return account.save();
  }

  /**
   * Finds an account by its ID.
   */
  async findAccountById(accountId: string): Promise<Account> {
    if (!Types.ObjectId.isValid(accountId)) {
      throw new NotFoundException('Invalid account ID format');
    }
    const account = await this.accountModel.findById(accountId).exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  /**
   * Finds an account by owner ID and asset code.
   */
  async findAccountByOwnerAndAsset(params: {
    ownerId: string;
    assetCode: string;
  }): Promise<Account | null> {
    return this.accountModel
      .findOne({
        ownerId: params.ownerId,
        assetCode: params.assetCode,
      })
      .exec();
  }

  /**
   * Gets or creates an account for a specific owner and asset.
   */
  async getOrCreateAccount(dto: CreateAccountDto): Promise<Account> {
    const existing = await this.findAccountByOwnerAndAsset({
      ownerId: dto.ownerId,
      assetCode: dto.assetCode,
    });
    if (existing) {
      return existing;
    }
    return this.createAccount(dto);
  }

  /**
   * Blocks an account, preventing further transactions.
   */
  async blockAccount(accountId: string): Promise<Account> {
    const account = await this.findAccountById(accountId);
    account.status = AccountStatus.BLOCKED;
    return account.save();
  }

  /**
   * Activates a previously blocked account.
   */
  async activateAccount(accountId: string): Promise<Account> {
    const account = await this.findAccountById(accountId);
    account.status = AccountStatus.ACTIVE;
    return account.save();
  }

  /**
   * Checks if an account is active.
   */
  async isAccountActive(accountId: string): Promise<boolean> {
    const account = await this.findAccountById(accountId);
    return account.status === AccountStatus.ACTIVE;
  }
}
