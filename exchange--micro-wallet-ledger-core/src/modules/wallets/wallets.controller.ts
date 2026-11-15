import { Body, Controller, Get, Param, Post, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { WalletsService } from './wallets.service';
import { AccountsService } from '../accounts/accounts.service';
import { LedgerService } from '../ledger/ledger.service';
import { InternalAuthGuard } from '../../shared/security/internal-auth.guard';
import { PricingClientService } from '../../shared/pricing/pricing-client.service';
import { AddBalanceDto } from './dto/add-balance.dto';
import { UserBalancesResponse, WalletBalanceResponse } from './dto/list-balances.dto';
import { formatMinorUnits, CURRENCY_DECIMALS } from '../../shared/money/money';

@Controller('internal/wallets')
@UseGuards(InternalAuthGuard)
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly accountsService: AccountsService,
    private readonly ledgerService: LedgerService,
    private readonly pricingClient: PricingClientService,
  ) {}

  @Post('ensure')
  async ensure(@Body() body: { accountId: string; currency: string }) {
    const wallet = await this.walletsService.ensureWallet(body.accountId, body.currency);
    return {
      walletId: wallet.walletId,
      accountId: wallet.accountId,
      currency: wallet.currency,
      availableMinorUnits: wallet.availableMinorUnits,
      lockedMinorUnits: wallet.lockedMinorUnits,
      status: wallet.status,
    };
  }

  /**
   * Admin endpoint: Add balance manually to a user's wallet
   */
  @Post('admin/add-balance')
  async addBalance(@Body() dto: AddBalanceDto) {
    // Get user's account
    const account = await this.accountsService.ensureAccountForUser(dto.userId);

    // Ensure wallet exists
    await this.walletsService.ensureWallet(account.accountId, dto.currency);

    // Apply adjustment via ledger
    const correlationId = randomUUID();
    const idempotencyKey = `ADMIN_ADD_BALANCE:${dto.userId}:${dto.currency}:${Date.now()}`;

    const result = await this.ledgerService.applyAdjustment({
      accountId: account.accountId,
      currency: dto.currency,
      amountMinorUnits: dto.amountMinorUnits,
      correlationId,
      idempotencyKey,
      externalRef: {
        reason: dto.reason || 'Admin manual adjustment',
        adminId: dto.adminId,
        timestamp: new Date().toISOString(),
      },
    });

    if (!result.applied) {
      throw new BadRequestException('Adjustment already applied (duplicate)');
    }

    const decimals = CURRENCY_DECIMALS[dto.currency] || 2;

    return {
      success: true,
      txId: result.txId,
      userId: dto.userId,
      accountId: account.accountId,
      accountNumber: account.accountNumber,
      currency: dto.currency,
      amountFormatted: formatMinorUnits(dto.amountMinorUnits, decimals),
      balanceBefore: formatMinorUnits(result.balanceBeforeMinorUnits, decimals),
      balanceAfter: formatMinorUnits(result.balanceAfterMinorUnits, decimals),
      correlationId,
    };
  }

  /**
   * Admin endpoint: List all transactions across all users (paginated)
   */
  @Get('admin/transactions')
  async getAdminTransactions(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('type') type?: string,
    @Query('currency') currency?: string,
    @Query('accountId') accountId?: string,
    @Query('days') daysParam?: string,
  ) {
    const page = parseInt(pageParam || '1', 10) || 1;
    const limit = parseInt(limitParam || '20', 10) || 20;
    const days = daysParam ? Math.min(Math.max(parseInt(daysParam, 10) || 30, 1), 365) : undefined;
    const since = days ? (() => { const d = new Date(); d.setDate(d.getDate() - days); return d; })() : undefined;

    const result = await this.ledgerService.findAllPaginated({
      page,
      limit,
      type,
      currency,
      accountId,
      since,
    });

    const transactions = result.items.map((tx) => {
      const decimals = CURRENCY_DECIMALS[tx.currency] || 2;
      return {
        txId: tx.txId,
        type: tx.type,
        accountId: tx.accountId,
        currency: tx.currency,
        amountMinorUnits: tx.amountMinorUnits,
        amountFormatted: formatMinorUnits(tx.amountMinorUnits, decimals),
        balanceAfterFormatted: formatMinorUnits(tx.balanceAfterMinorUnits, decimals),
        correlationId: tx.correlationId,
        concept: tx.concept,
        externalRef: tx.externalRef,
        createdAt: (tx as any).createdAt,
      };
    });

    return {
      transactions,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  /**
   * Admin endpoint: List all wallets across all users (paginated)
   */
  @Get('admin/wallets')
  async getAdminWallets(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('currency') currency?: string,
    @Query('status') status?: string,
  ) {
    const page = parseInt(pageParam || '1', 10) || 1;
    const limit = parseInt(limitParam || '20', 10) || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (currency) filter.currency = currency;
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      this.walletsService.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.walletsService.model.countDocuments(filter).exec(),
    ]);

    const wallets = items.map((w) => {
      const decimals = CURRENCY_DECIMALS[w.currency] || 2;
      return {
        walletId: w.walletId,
        accountId: w.accountId,
        currency: w.currency,
        availableFormatted: formatMinorUnits(w.availableMinorUnits, decimals),
        lockedFormatted: formatMinorUnits(w.lockedMinorUnits, decimals),
        status: w.status,
        createdAt: (w as any).createdAt,
      };
    });

    return {
      wallets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all balances for a user (multi-currency)
   * IMPORTANT: This route MUST be before :accountId/:currency to avoid
   * NestJS matching "user" as :accountId param.
   */
  @Get('user/:userId')
  async getUserBalances(@Param('userId') userId: string): Promise<UserBalancesResponse> {
    // Get user's account
    const account = await this.accountsService.ensureAccountForUser(userId);

    // Get all wallets for this account
    const wallets = await this.walletsService.model.find({ accountId: account.accountId }).exec();

    const balances: WalletBalanceResponse[] = wallets.map((wallet) => {
      const decimals = CURRENCY_DECIMALS[wallet.currency] || 2;
      return {
        walletId: wallet.walletId,
        accountId: wallet.accountId,
        accountNumber: account.accountNumber,
        currency: wallet.currency,
        availableMinorUnits: wallet.availableMinorUnits,
        lockedMinorUnits: wallet.lockedMinorUnits,
        availableFormatted: formatMinorUnits(wallet.availableMinorUnits, decimals),
        lockedFormatted: formatMinorUnits(wallet.lockedMinorUnits, decimals),
        status: wallet.status,
      };
    });

    return {
      userId,
      accountId: account.accountId,
      accountNumber: account.accountNumber,
      balances,
      totalBalancesCount: balances.length,
    };
  }

  /**
   * Get a summary of all balances for a user
   * Returns totals in USD + fiat/crypto breakdown
   * IMPORTANT: Must be before :accountId/:currency
   */
  @Get('user/:userId/summary')
  async getUserBalanceSummary(@Param('userId') userId: string) {
    const account = await this.accountsService.ensureAccountForUser(userId);
    const wallets = await this.walletsService.model.find({ accountId: account.accountId }).exec();

    const FIAT_CURRENCIES = ['MXN', 'USD', 'COP', 'PEN', 'SVC', 'ARS', 'CLP', 'EUR', 'VES', 'BRL'];

    // Obtener precios reales de los microservicios de pricing
    const allCurrencies = wallets.map(w => w.currency);
    const priceUSD = await this.pricingClient.getPriceMap(allCurrencies);

    let fiatTotalUSD = 0;
    let cryptoTotalUSD = 0;

    // Acumular saldos reales por moneda
    const balancesByCurrency: Record<string, number> = {};

    for (const w of wallets) {
      const decimals = CURRENCY_DECIMALS[w.currency] || 2;
      const amount = Number(w.availableMinorUnits) / Math.pow(10, decimals);
      const usdValue = amount * (priceUSD[w.currency] || 0);

      // Acumular saldo real en su moneda original
      balancesByCurrency[w.currency] = (balancesByCurrency[w.currency] || 0) + amount;

      if (FIAT_CURRENCIES.includes(w.currency)) {
        fiatTotalUSD += usdValue;
      } else {
        cryptoTotalUSD += usdValue;
      }
    }

    const totalValueUSD = fiatTotalUSD + cryptoTotalUSD;

    return {
      totalValueUSD: totalValueUSD.toFixed(2),
      portfolioChange24h: '0.0', // TODO: implementar con snapshots
      fiatTotalUSD: fiatTotalUSD.toFixed(2),
      cryptoTotalUSD: cryptoTotalUSD.toFixed(2),
      // Saldos reales por moneda (no convertidos)
      balancesByCurrency,
    };
  }

  /**
   * Get paginated transaction list for a user.
   * Query params: page, limit, type (P2P_TRANSFER|FIAT_DEPOSIT_CONFIRMED|ADJUSTMENT), currency, days
   * IMPORTANT: Must be before :accountId/:currency
   */
  @Get('user/:userId/transactions')
  async getUserTransactions(
    @Param('userId') userId: string,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('type') type?: string,
    @Query('currency') currency?: string,
    @Query('days') daysParam?: string,
  ) {
    const account = await this.accountsService.ensureAccountForUser(userId);

    const page = parseInt(pageParam || '1', 10) || 1;
    const limit = parseInt(limitParam || '20', 10) || 20;
    const days = daysParam ? Math.min(Math.max(parseInt(daysParam, 10) || 30, 1), 365) : undefined;

    const since = days ? (() => { const d = new Date(); d.setDate(d.getDate() - days); return d; })() : undefined;

    const result = await this.ledgerService.findByAccountPaginated(account.accountId, {
      page,
      limit,
      type,
      currency,
      since,
    });

    // Enrich: resolve accountId → accountNumber for externalRef counterparties
    const counterpartyIds = new Set<string>();
    for (const tx of result.items) {
      const ref = (tx as any).externalRef as Record<string, unknown> | undefined;
      if (ref?.toAccountId) counterpartyIds.add(ref.toAccountId as string);
      if (ref?.fromAccountId) counterpartyIds.add(ref.fromAccountId as string);
    }

    // Batch resolve account numbers
    const accountNumberMap: Record<string, string> = {};
    if (counterpartyIds.size > 0) {
      const accounts = await Promise.all(
        [...counterpartyIds].map(async (accId) => {
          try {
            const acc = await this.accountsService.getByAccountId(accId);
            return acc ? { accountId: accId, accountNumber: acc.accountNumber } : null;
          } catch { return null; }
        }),
      );
      for (const acc of accounts) {
        if (acc?.accountNumber) accountNumberMap[acc.accountId] = acc.accountNumber;
      }
    }

    const transactions = result.items.map((tx) => {
      const ref = (tx as any).externalRef as Record<string, unknown> | undefined;
      const decimals = CURRENCY_DECIMALS[tx.currency] || 2;
      const amountFormatted = formatMinorUnits(tx.amountMinorUnits, decimals);

      // Determine direction: DEBIT (sent) has toAccountId, CREDIT (received) has fromAccountId
      const isDebit = !!ref?.toAccountId;
      const counterpartyAccountId = (isDebit ? ref?.toAccountId : ref?.fromAccountId) as string | undefined;
      const counterpartyAccountNumber = counterpartyAccountId ? accountNumberMap[counterpartyAccountId] : undefined;

      return {
        txId: tx.txId,
        type: tx.type,
        direction: isDebit ? 'sent' : 'received',
        currency: tx.currency,
        amountMinorUnits: tx.amountMinorUnits,
        amountFormatted,
        balanceAfterMinorUnits: tx.balanceAfterMinorUnits,
        balanceAfterFormatted: formatMinorUnits(tx.balanceAfterMinorUnits, decimals),
        correlationId: tx.correlationId,
        counterpartyAccountId,
        counterpartyAccountNumber,
        concept: tx.concept,
        externalRef: ref,
        createdAt: (tx as any).createdAt,
      };
    });

    return {
      transactions,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  /**
   * Get balance history for a user (from ledger transactions)
   * Returns daily aggregated points
   * IMPORTANT: Must be before :accountId/:currency
   */
  @Get('user/:userId/history')
  async getUserBalanceHistory(
    @Param('userId') userId: string,
    @Query('days') daysParam?: string,
  ) {
    const days = Math.min(Math.max(parseInt(daysParam || '30', 10) || 30, 1), 365);
    const account = await this.accountsService.ensureAccountForUser(userId);

    // Obtener todas las transacciones de los últimos N días
    const since = new Date();
    since.setDate(since.getDate() - days);

    const txs = await this.ledgerService.findByAccount(account.accountId, {
      since,
      sort: { createdAt: 1 },
    });

    // Obtener balances actuales para calcular hacia atrás
    const wallets = await this.walletsService.model.find({ accountId: account.accountId }).exec();

    // Obtener precios reales de los microservicios de pricing
    const allCurrencies = [...new Set(wallets.map(w => w.currency))];
    const priceUSD = await this.pricingClient.getPriceMap(allCurrencies);

    // Calcular valor total actual
    let currentTotalUSD = 0;
    for (const w of wallets) {
      const decimals = CURRENCY_DECIMALS[w.currency] || 2;
      const amount = Number(w.availableMinorUnits) / Math.pow(10, decimals);
      currentTotalUSD += amount * (priceUSD[w.currency] || 0);
    }

    // Generar puntos diarios (si no hay txs, línea plana con el valor actual)
    const history: Array<{ timestamp: string; totalValueUSD: string }> = [];
    const now = new Date();

    if (txs.length === 0) {
      // Sin transacciones: línea plana
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        history.push({
          timestamp: d.toISOString(),
          totalValueUSD: currentTotalUSD.toFixed(2),
        });
      }
    } else {
      // Reconstruir hacia atrás: acumular deltas por día
      const deltaByDay: Record<string, number> = {};
      for (const tx of txs) {
        const dayKey = (tx as any).createdAt.toISOString().slice(0, 10);
        const decimals = CURRENCY_DECIMALS[tx.currency] || 2;
        const delta = Number(tx.amountMinorUnits) / Math.pow(10, decimals);
        const deltaUSD = delta * (priceUSD[tx.currency] || 0);
        deltaByDay[dayKey] = (deltaByDay[dayKey] || 0) + deltaUSD;
      }

      // Reconstruir día a día (desde hoy hacia atrás)
      let rollingUSD = currentTotalUSD;
      const points: Array<{ timestamp: string; totalValueUSD: string }> = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dayKey = d.toISOString().slice(0, 10);
        points.push({
          timestamp: d.toISOString(),
          totalValueUSD: Math.max(0, rollingUSD).toFixed(2),
        });
        rollingUSD -= (deltaByDay[dayKey] || 0);
      }

      points.reverse();
      history.push(...points);
    }

    return { data: history };
  }

  @Get(':accountId/:currency')
  async get(@Param('accountId') accountId: string, @Param('currency') currency: string) {
    const wallet = await this.walletsService.getWallet(accountId, currency);
    if (!wallet) return { found: false };
    return {
      found: true,
      walletId: wallet.walletId,
      accountId: wallet.accountId,
      currency: wallet.currency,
      availableMinorUnits: wallet.availableMinorUnits,
      lockedMinorUnits: wallet.lockedMinorUnits,
      status: wallet.status,
    };
  }
}
