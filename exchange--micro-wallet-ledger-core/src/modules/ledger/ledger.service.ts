import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { LedgerTx, LedgerTxDocument } from './ledger-tx.schema';
import { WalletsService } from '../wallets/wallets.service';
import { OutboxService } from '../../outbox/outbox.service';

@Injectable()
export class LedgerService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(LedgerTx.name) private readonly model: Model<LedgerTxDocument>,
    private readonly walletsService: WalletsService,
    private readonly outboxService: OutboxService,
  ) {}

  /**
   * Query ledger transactions by accountId with optional date filter
   */
  async findByAccount(
    accountId: string,
    opts?: { since?: Date; sort?: Record<string, 1 | -1> },
  ): Promise<LedgerTxDocument[]> {
    const filter: Record<string, any> = { accountId };
    if (opts?.since) {
      filter.createdAt = { $gte: opts.since };
    }
    return this.model
      .find(filter)
      .sort(opts?.sort || { createdAt: 1 })
      .exec();
  }

  /**
   * Paginated transaction list for a user account.
   * Supports filtering by type and currency.
   */
  async findByAccountPaginated(
    accountId: string,
    opts?: {
      page?: number;
      limit?: number;
      type?: string;
      currency?: string;
      since?: Date;
    },
  ): Promise<{ items: LedgerTxDocument[]; total: number; page: number; limit: number }> {
    const page = Math.max(opts?.page ?? 1, 1);
    const limit = Math.min(Math.max(opts?.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { accountId };
    if (opts?.type) filter.type = opts.type;
    if (opts?.currency) filter.currency = opts.currency;
    if (opts?.since) filter.createdAt = { $gte: opts.since };

    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Admin: paginated transaction list across ALL accounts.
   */
  async findAllPaginated(
    opts?: {
      page?: number;
      limit?: number;
      type?: string;
      currency?: string;
      accountId?: string;
      since?: Date;
    },
  ): Promise<{ items: LedgerTxDocument[]; total: number; page: number; limit: number }> {
    const page = Math.max(opts?.page ?? 1, 1);
    const limit = Math.min(Math.max(opts?.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (opts?.accountId) filter.accountId = opts.accountId;
    if (opts?.type) filter.type = opts.type;
    if (opts?.currency) filter.currency = opts.currency;
    if (opts?.since) filter.createdAt = { $gte: opts.since };

    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit };
  }

  async applyFiatDepositConfirmed(input: {
    accountId: string;
    currency: string;
    amountMinorUnits: string;
    correlationId: string;
    idempotencyKey: string;
    externalRef?: Record<string, unknown>;
  }): Promise<
    | { applied: true; txId: string; balanceBeforeMinorUnits: string; balanceAfterMinorUnits: string }
    | { applied: false; reason: 'duplicate' }
  > {
    const session = await this.connection.startSession();

    try {
      let result:
        | { applied: true; txId: string; balanceBeforeMinorUnits: string; balanceAfterMinorUnits: string }
        | { applied: false; reason: 'duplicate' };

      await session.withTransaction(async () => {
        // Ensure wallet exists inside the same transaction
        await this.walletsService.ensureWallet(input.accountId, input.currency, session);

        const credit = await this.walletsService.creditAvailable(
          {
            accountId: input.accountId,
            currency: input.currency,
            amountMinorUnits: input.amountMinorUnits,
          },
          session,
        );

        const txId = randomUUID();

        try {
          await this.model.create(
            [
              {
                txId,
                type: 'FIAT_DEPOSIT_CONFIRMED',
                accountId: input.accountId,
                currency: input.currency,
                amountMinorUnits: input.amountMinorUnits,
                balanceBeforeMinorUnits: credit.before,
                balanceAfterMinorUnits: credit.after,
                correlationId: input.correlationId,
                idempotencyKey: input.idempotencyKey,
                externalRef: input.externalRef,
              },
            ],
            { session },
          );
        } catch (error: any) {
          if (error?.code === 11000) {
            result = { applied: false, reason: 'duplicate' };
            return;
          }
          throw error;
        }

        await this.outboxService.add(
          {
            eventName: 'LEDGER_BALANCE_UPDATED',
            version: 'v1',
            correlationId: input.correlationId,
            idempotencyKey: `LEDGER_BALANCE_UPDATED:${input.idempotencyKey}`,
            payload: {
              accountId: input.accountId,
              currency: input.currency,
              availableMinorUnits: credit.after,
            },
          },
          session,
        );

        result = {
          applied: true,
          txId,
          balanceBeforeMinorUnits: credit.before,
          balanceAfterMinorUnits: credit.after,
        };
      });

      // session.withTransaction guarantees result set in both branches
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return result!;
    } finally {
      session.endSession();
    }
  }

  async applyP2PTransfer(input: {
    fromAccountId: string;
    toAccountId: string;
    currency: string;
    amountMinorUnits: string;
    correlationId: string;
    concept?: string;
  }): Promise<{ txId: string; success: true }> {
    const session = await this.connection.startSession();

    try {
      let txId: string;

      await session.withTransaction(async () => {
        txId = randomUUID();
        const idempotencyKey = `P2P:${txId}`;

        // Debit sender
        const debit = await this.walletsService.debitAvailable(
          {
            accountId: input.fromAccountId,
            currency: input.currency,
            amountMinorUnits: input.amountMinorUnits,
          },
          session,
        );

        await this.model.create(
          [
            {
              txId: `${txId}:DEBIT`,
              type: 'P2P_TRANSFER',
              accountId: input.fromAccountId,
              currency: input.currency,
              amountMinorUnits: input.amountMinorUnits,
              balanceBeforeMinorUnits: debit.before,
              balanceAfterMinorUnits: debit.after,
              correlationId: input.correlationId,
              idempotencyKey: `${idempotencyKey}:DEBIT`,
              concept: input.concept,
              externalRef: { toAccountId: input.toAccountId },
            },
          ],
          { session },
        );

        // Credit receiver
        const credit = await this.walletsService.creditAvailable(
          {
            accountId: input.toAccountId,
            currency: input.currency,
            amountMinorUnits: input.amountMinorUnits,
          },
          session,
        );

        await this.model.create(
          [
            {
              txId: `${txId}:CREDIT`,
              type: 'P2P_TRANSFER',
              accountId: input.toAccountId,
              currency: input.currency,
              amountMinorUnits: input.amountMinorUnits,
              balanceBeforeMinorUnits: credit.before,
              balanceAfterMinorUnits: credit.after,
              correlationId: input.correlationId,
              idempotencyKey: `${idempotencyKey}:CREDIT`,
              concept: input.concept,
              externalRef: { fromAccountId: input.fromAccountId },
            },
          ],
          { session },
        );

        // Outbox sender
        await this.outboxService.add(
          {
            eventName: 'LEDGER_BALANCE_UPDATED',
            version: 'v1',
            correlationId: input.correlationId,
            idempotencyKey: `LEDGER_BALANCE_UPDATED:${idempotencyKey}:DEBIT`,
            payload: {
              accountId: input.fromAccountId,
              currency: input.currency,
              availableMinorUnits: debit.after,
            },
          },
          session,
        );

        // Outbox receiver
        await this.outboxService.add(
          {
            eventName: 'LEDGER_BALANCE_UPDATED',
            version: 'v1',
            correlationId: input.correlationId,
            idempotencyKey: `LEDGER_BALANCE_UPDATED:${idempotencyKey}:CREDIT`,
            payload: {
              accountId: input.toAccountId,
              currency: input.currency,
              availableMinorUnits: credit.after,
            },
          },
          session,
        );
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return { txId: txId!, success: true };
    } finally {
      session.endSession();
    }
  }

  /**
   * Apply manual balance adjustment (admin operation)
   * Can be positive (add) or negative (deduct)
   */
  async applyAdjustment(input: {
    accountId: string;
    currency: string;
    amountMinorUnits: string; // Can be negative or positive
    correlationId: string;
    idempotencyKey: string;
    externalRef?: Record<string, unknown>;
  }): Promise<
    | { applied: true; txId: string; balanceBeforeMinorUnits: string; balanceAfterMinorUnits: string }
    | { applied: false; reason: 'duplicate' }
  > {
    const session = await this.connection.startSession();

    try {
      let result:
        | { applied: true; txId: string; balanceBeforeMinorUnits: string; balanceAfterMinorUnits: string }
        | { applied: false; reason: 'duplicate' };

      await session.withTransaction(async () => {
        // Ensure wallet exists
        await this.walletsService.ensureWallet(input.accountId, input.currency, session);

        // Determine if credit or debit based on sign
        const isNegative = input.amountMinorUnits.startsWith('-');
        const absoluteAmount = isNegative ? input.amountMinorUnits.substring(1) : input.amountMinorUnits;

        let balance: { before: string; after: string; walletId: string };

        if (isNegative) {
          // Deduct balance
          balance = await this.walletsService.debitAvailable(
            {
              accountId: input.accountId,
              currency: input.currency,
              amountMinorUnits: absoluteAmount,
            },
            session,
          );
        } else {
          // Add balance
          balance = await this.walletsService.creditAvailable(
            {
              accountId: input.accountId,
              currency: input.currency,
              amountMinorUnits: absoluteAmount,
            },
            session,
          );
        }

        const txId = randomUUID();

        try {
          await this.model.create(
            [
              {
                txId,
                type: 'ADJUSTMENT',
                accountId: input.accountId,
                currency: input.currency,
                amountMinorUnits: input.amountMinorUnits, // Keep sign
                balanceBeforeMinorUnits: balance.before,
                balanceAfterMinorUnits: balance.after,
                correlationId: input.correlationId,
                idempotencyKey: input.idempotencyKey,
                externalRef: input.externalRef,
              },
            ],
            { session },
          );
        } catch (error: any) {
          if (error?.code === 11000) {
            result = { applied: false, reason: 'duplicate' };
            return;
          }
          throw error;
        }

        await this.outboxService.add(
          {
            eventName: 'LEDGER_BALANCE_UPDATED',
            version: 'v1',
            correlationId: input.correlationId,
            idempotencyKey: `LEDGER_BALANCE_UPDATED:${input.idempotencyKey}`,
            payload: {
              accountId: input.accountId,
              currency: input.currency,
              availableMinorUnits: balance.after,
            },
          },
          session,
        );

        result = {
          applied: true,
          txId,
          balanceBeforeMinorUnits: balance.before,
          balanceAfterMinorUnits: balance.after,
        };
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return result!;
    } finally {
      session.endSession();
    }
  }

  /**
   * Returns total ledger transaction count (aggregate stat — no PII).
   */
  async countAll(): Promise<number> {
    return this.model.estimatedDocumentCount().exec();
  }
}
