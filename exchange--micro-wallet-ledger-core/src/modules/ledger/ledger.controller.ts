import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InternalAuthGuard } from '../../shared/security/internal-auth.guard';
import { InboxService } from '../../idempotency/inbox.service';
import { AccountsService } from '../accounts/accounts.service';
import { LedgerService } from './ledger.service';

@Controller('internal/ledger')
@UseGuards(InternalAuthGuard)
export class LedgerController {
  constructor(
    private readonly inboxService: InboxService,
    private readonly accountsService: AccountsService,
    private readonly ledgerService: LedgerService,
  ) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats(): Promise<{ totalTransactions: number }> {
    const totalTransactions = await this.ledgerService.countAll();
    return { totalTransactions };
  }

  @Post('fiat-deposit-confirmed')
  async fiatDepositConfirmed(
    @Body()
    body: {
      eventId: string;
      correlationId?: string;
      userId: string;
      currency: string;
      amountMinorUnits: string;
      externalRef?: Record<string, unknown>;
    },
  ) {
    const correlationId = body.correlationId ?? randomUUID();

    const inbox = await this.inboxService.tryInsert({
      eventId: body.eventId,
      eventName: 'FIAT_DEPOSIT_CONFIRMED',
      version: 'v1',
      correlationId,
      payload: {
        userId: body.userId,
        currency: body.currency,
        amountMinorUnits: body.amountMinorUnits,
        externalRef: body.externalRef,
      },
    });

    if (!inbox.inserted) {
      return { status: 'duplicate', reason: inbox.reason };
    }

    const account = await this.accountsService.ensureAccountForUser(body.userId);

    const applied = await this.ledgerService.applyFiatDepositConfirmed({
      accountId: account.accountId,
      currency: body.currency,
      amountMinorUnits: body.amountMinorUnits,
      correlationId,
      idempotencyKey: body.eventId,
      externalRef: body.externalRef,
    });

    return {
      status: applied.applied ? 'applied' : 'duplicate',
      correlationId,
      accountId: account.accountId,
      accountNumber: account.accountNumber,
      ...applied,
    };
  }
}
