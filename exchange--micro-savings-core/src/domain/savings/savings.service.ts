import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { CreateSavingDto } from './dto/create-saving.dto';
import { ContributeSavingDto } from './dto/contribute-saving.dto';
import { WithdrawSavingDto } from './dto/withdraw-saving.dto';
import { SavingsQueryDto } from './dto/savings-query.dto';
import { SavingsProjectionDto } from './dto/savings-projection.dto';
import {
  SavingAccount,
  SavingAccountDocument,
} from './schemas/saving-account.schema';
import { SignatureKeysClientService } from '../../shared/clients/signature-keys-client.service';
import { AuthClientService } from '../../shared/clients/auth-client.service';
import { NotificationsClientService } from '../../shared/clients/notifications-client.service';
import { WalletLedgerClientService } from '../../shared/clients/wallet-ledger-client.service';

@Injectable()
export class SavingsService {
  constructor(
    @InjectModel(SavingAccount.name)
    private readonly savingAccountModel: Model<SavingAccountDocument>,
    private readonly authClientService: AuthClientService,
    private readonly signatureKeysClientService: SignatureKeysClientService,
    private readonly walletLedgerClientService: WalletLedgerClientService,
    private readonly notificationsClientService: NotificationsClientService,
  ) {}

  getInternalHealth() {
    return {
      status: 'ok',
      service: 'savings-core',
      scope: 'internal',
      timestamp: new Date().toISOString(),
    };
  }

  async findAll(query: SavingsQueryDto) {
    const filter: Record<string, unknown> = {};

    if (query.userId) filter.userId = query.userId;
    if (query.status) filter.status = query.status.toUpperCase();
    if (query.currency) filter.currency = query.currency.toUpperCase();

    const savings = await this.savingAccountModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return {
      message: 'Savings list retrieved successfully',
      filters: query,
      total: savings.length,
      data: savings.map((item) => this.serializeSaving(item)),
    };
  }

  async getSummary(userId?: string) {
    const filter = userId ? { userId } : {};
    const savings = await this.savingAccountModel.find(filter).lean().exec();

    const totals = savings.reduce(
      (acc, item) => {
        acc.totalPrincipal += item.principalAmount;
        acc.totalEarned += item.earnedAmount;
        acc.totalBalance += item.totalBalance;
        return acc;
      },
      { totalPrincipal: 0, totalEarned: 0, totalBalance: 0 },
    );

    return {
      message: 'Savings summary retrieved successfully',
      userId,
      data: {
        activeSavings: savings.filter((item) => item.status === 'ACTIVE').length,
        totalSavings: savings.length,
        ...totals,
        averageMonthlyRate:
          savings.length > 0
            ? Number(
                (
                  savings.reduce((sum, item) => sum + item.monthlyRate, 0) /
                  savings.length
                ).toFixed(2),
              )
            : 0,
      },
    };
  }

  async getById(savingId: string) {
    const saving = await this.findSavingOrFail(savingId);

    return {
      message: 'Saving detail retrieved successfully',
      data: {
        ...this.serializeSaving(saving),
        performanceDays: this.calculatePerformanceDays((saving as any).createdAt),
        projectionHint:
          'Projection based on monthly rate configured for this saving',
      },
    };
  }

  async getHistory(savingId: string) {
    const saving = await this.findSavingOrFail(savingId);

    return {
      message: 'Saving history retrieved successfully',
      savingId,
      data: (saving.movements || [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map((movement) => ({
          id: movement.id,
          type: movement.type,
          amount: movement.amount,
          currency: movement.currency,
          createdAt: movement.createdAt,
          note: movement.note,
          balanceAfter: movement.balanceAfter,
          metadata: movement.metadata,
        })),
    };
  }

  project(payload: SavingsProjectionDto) {
    const months = payload.months ?? 12;
    const monthlyRate = payload.monthlyRate ?? 1.5;
    const currency = (payload.currency ?? 'MXN').toUpperCase();

    const yearlyBreakdown: Array<{
      period: number;
      estimatedYield: number;
      estimatedBalance: number;
    }> = [];

    let runningBalance = payload.amount;
    let totalYield = 0;

    for (let period = 1; period <= months; period += 1) {
      const estimatedYield = Number(
        (runningBalance * (monthlyRate / 100)).toFixed(2),
      );
      totalYield = Number((totalYield + estimatedYield).toFixed(2));
      runningBalance = Number((runningBalance + estimatedYield).toFixed(2));

      yearlyBreakdown.push({
        period,
        estimatedYield,
        estimatedBalance: runningBalance,
      });
    }

    return {
      message: 'Savings projection generated successfully',
      data: {
        input: {
          amount: payload.amount,
          months,
          monthlyRate,
          currency,
        },
        projection: {
          totalYield,
          estimatedFinalBalance: runningBalance,
        },
        yearlyBreakdown,
      },
    };
  }

  async create(payload: CreateSavingDto) {
    const currency = payload.currency.toUpperCase();
    const monthlyRate = payload.monthlyRate ?? 1.5;

    const profile = await this.ensureValidUser(payload.userId);
    const signature = await this.signatureKeysClientService.verifySignature(
      payload.userId,
      payload.signatureToken,
    );
    const wallet = await this.walletLedgerClientService.ensureWallet(
      payload.userId,
      currency,
    );
    const balanceValidation =
      await this.walletLedgerClientService.assertEnoughBalance(
        payload.userId,
        currency,
        payload.initialAmount,
      );

    const earnedAmount = Number(
      (payload.initialAmount * (monthlyRate / 100)).toFixed(2),
    );
    const totalBalance = Number(
      (payload.initialAmount + earnedAmount).toFixed(2),
    );
    const movementId = randomUUID();

    const saving = await this.savingAccountModel.create({
      userId: payload.userId,
      holderName: payload.holderName,
      currency,
      principalAmount: payload.initialAmount,
      earnedAmount,
      totalBalance,
      status: 'ACTIVE',
      monthlyRate,
      goalName: payload.goalName ?? null,
      goalAmount: payload.goalAmount ?? null,
      description: payload.description ?? null,
      lastContributionAt: new Date(),
      movements: [
        {
          id: movementId,
          type: 'CREATE',
          amount: payload.initialAmount,
          currency,
          note: 'Initial saving creation',
          balanceAfter: totalBalance,
          createdAt: new Date(),
          metadata: {
            sourceWalletId: payload.sourceWalletId ?? null,
            walletBalanceValidated: balanceValidation.checked,
            signatureVerified: signature.verified,
          },
        },
      ],
    });

    const notification = await this.notificationsClientService.sendSavingsEmail({
      to: profile?.email,
      userId: payload.userId,
      subject: 'Ahorro creado exitosamente',
      template: 'auth/welcome',
      variables: {
        holderName: payload.holderName,
        savingId: saving.id,
        amount: payload.initialAmount,
        currency,
        totalBalance,
      },
    });

    return {
      message: 'Saving created successfully',
      status: 'ACTIVE',
      data: this.serializeSaving(saving),
      integrations: {
        auth: { connected: Boolean(profile), userId: payload.userId },
        signature,
        wallet,
        balanceValidation,
        notification,
      },
    };
  }

  async contribute(payload: ContributeSavingDto) {
    const saving = await this.findSavingOrFail(payload.savingId);

    if (saving.userId !== payload.userId) {
      throw new BadRequestException(
        'Saving does not belong to the provided user',
      );
    }

    const signature = await this.signatureKeysClientService.verifySignature(
      payload.userId,
      payload.signatureToken,
    );
    const wallet = await this.walletLedgerClientService.ensureWallet(
      payload.userId,
      saving.currency,
    );
    const balanceValidation =
      await this.walletLedgerClientService.assertEnoughBalance(
        payload.userId,
        saving.currency,
        payload.amount,
      );

    const additionalYield = Number(
      (payload.amount * (saving.monthlyRate / 100)).toFixed(2),
    );

    saving.principalAmount = Number(
      (saving.principalAmount + payload.amount).toFixed(2),
    );
    saving.earnedAmount = Number(
      (saving.earnedAmount + additionalYield).toFixed(2),
    );
    saving.totalBalance = Number(
      (saving.totalBalance + payload.amount + additionalYield).toFixed(2),
    );
    saving.status = 'ACTIVE';
    saving.lastContributionAt = new Date();
    saving.movements.push({
      id: randomUUID(),
      type: 'CONTRIBUTE',
      amount: payload.amount,
      currency: saving.currency,
      note: payload.note ?? 'Saving contribution',
      balanceAfter: saving.totalBalance,
      createdAt: new Date(),
      metadata: {
        sourceWalletId: payload.sourceWalletId ?? null,
        estimatedAdditionalYield: additionalYield,
        signatureVerified: signature.verified,
        walletBalanceValidated: balanceValidation.checked,
      },
    } as any);

    await saving.save();

    return {
      message: 'Saving contribution registered successfully',
      status: saving.status,
      data: {
        savingId: saving.id,
        userId: payload.userId,
        contributedAmount: payload.amount,
        contributedAt: saving.lastContributionAt,
        estimatedAdditionalYield: additionalYield,
        totalBalance: saving.totalBalance,
      },
      integrations: {
        signature,
        wallet,
        balanceValidation,
      },
    };
  }

  async withdraw(payload: WithdrawSavingDto) {
    const saving = await this.findSavingOrFail(payload.savingId);

    if (saving.userId !== payload.userId) {
      throw new BadRequestException(
        'Saving does not belong to the provided user',
      );
    }

    if (payload.amount > saving.totalBalance) {
      throw new BadRequestException(
        'Withdrawal amount exceeds current saving balance',
      );
    }

    const signature = await this.signatureKeysClientService.verifySignature(
      payload.userId,
      payload.signatureToken,
    );

    saving.totalBalance = Number((saving.totalBalance - payload.amount).toFixed(2));
    saving.principalAmount = Number(
      Math.max(0, saving.principalAmount - payload.amount).toFixed(2),
    );
    saving.status =
      saving.totalBalance > 0 ? 'PARTIALLY_WITHDRAWN' : 'WITHDRAWN';
    saving.lastWithdrawalAt = new Date();

    const movementId = randomUUID();

    saving.movements.push({
      id: movementId,
      type: 'WITHDRAW',
      amount: payload.amount,
      currency: saving.currency,
      note: payload.reason ?? 'Savings withdrawal',
      balanceAfter: saving.totalBalance,
      createdAt: new Date(),
      metadata: {
        destinationWalletId: payload.destinationWalletId ?? null,
        signatureVerified: signature.verified,
      },
    } as any);

    await saving.save();

    const walletCredit =
      await this.walletLedgerClientService.creditUserWalletFromSavings({
        userId: payload.userId,
        currency: saving.currency,
        amount: payload.amount,
        savingId: saving.id,
        movementId,
      });

    return {
      message: 'Saving withdrawal registered successfully',
      status: saving.status,
      data: {
        savingId: saving.id,
        userId: payload.userId,
        withdrawnAmount: payload.amount,
        withdrawnAt: saving.lastWithdrawalAt,
        destinationWalletId: payload.destinationWalletId ?? null,
        totalBalance: saving.totalBalance,
      },
      integrations: {
        signature,
        walletCredit,
      },
    };
  }

  private async findSavingOrFail(savingId: string) {
    const saving = await this.savingAccountModel.findById(savingId).exec();

    if (!saving) {
      throw new NotFoundException(`Saving ${savingId} not found`);
    }

    return saving;
  }

  private async ensureValidUser(userId: string) {
    const profile = await this.authClientService.getUserProfile(userId);

    if (!profile) {
      return null;
    }

    if (profile.status && profile.status.toLowerCase() !== 'active') {
      throw new BadRequestException('User is not active');
    }

    return profile;
  }

  private calculatePerformanceDays(createdAt?: Date) {
    if (!createdAt) return 0;
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    return Math.max(
      0,
      Math.floor((now - created) / (1000 * 60 * 60 * 24)),
    );
  }

  private serializeSaving(saving: any) {
    return {
      id: saving._id?.toString?.() || saving.id,
      userId: saving.userId,
      holderName: saving.holderName,
      currency: saving.currency,
      principalAmount: saving.principalAmount,
      earnedAmount: saving.earnedAmount,
      totalBalance: saving.totalBalance,
      monthlyRate: saving.monthlyRate,
      status: saving.status,
      goalName: saving.goalName ?? null,
      goalAmount: saving.goalAmount ?? null,
      description: saving.description ?? null,
      lastContributionAt: saving.lastContributionAt ?? null,
      lastWithdrawalAt: saving.lastWithdrawalAt ?? null,
      createdAt: saving.createdAt,
      updatedAt: saving.updatedAt,
      movementsCount: Array.isArray(saving.movements)
        ? saving.movements.length
        : 0,
    };
  }
}