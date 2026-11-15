import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InternalAuthGuard } from '../../shared/security/internal-auth.guard';
import { IpWhitelistGuard } from '../../shared/security/ip-whitelist.guard';
import { OtpService } from '../../shared/security/otp.service';
import { NotificationsClientService } from '../../shared/notifications/notifications-client.service';
import { LedgerService } from '../ledger/ledger.service';
import { AccountsService } from '../accounts/accounts.service';
import { WalletsService } from '../wallets/wallets.service';

const MAX_TRANSFER_MINOR_UNITS = '100000000'; // 1,000 MXN (100 pesos * 10^6)

@Controller('internal/transfers')
@UseGuards(InternalAuthGuard, IpWhitelistGuard)
export class TransfersController {
  constructor(
    private readonly otpService: OtpService,
    private readonly notificationsClient: NotificationsClientService,
    private readonly accountsService: AccountsService,
    private readonly walletsService: WalletsService,
    private readonly ledgerService: LedgerService,
  ) {}

  @Post('p2p/request-otp')
  async requestP2POtp(
    @Body()
    body: {
      userId: string;
      email?: string;
      correlationId?: string;
    },
  ) {
    const correlationId = body.correlationId ?? randomUUID();

    const { code, expiresInSeconds } = await this.otpService.generateForUser('P2P', body.userId);
    const expirationMinutes = Math.max(1, Math.ceil(expiresInSeconds / 60));

    let notification: { status: 'skipped' | 'accepted' | 'failed'; jobId?: string; error?: string } = {
      status: 'skipped',
    };

    if (body.email) {
      const result = await this.notificationsClient.sendOtpEmail({
        to: body.email,
        userId: body.userId,
        code,
        expirationMinutes,
        correlationId,
      });

      notification =
        result.ok ? { status: 'accepted', jobId: result.jobId } : { status: 'failed', error: result.error };
    }

    return {
      status: 'created',
      correlationId,
      expiresInSeconds,
      notification,
      ...(this.otpService.shouldReturnOtpInResponse() ? { otp: code } : {}),
    };
  }

  @Post('p2p')
  async p2p(
    @Body()
    body: {
      fromUserId: string;
      toUserId: string;
      currency: string;
      amountMinorUnits: string;
      otp?: string;
      correlationId?: string;
      concept?: string;
    },
  ) {
    const correlationId = body.correlationId ?? randomUUID();

    // OTP
    if (this.otpService.requireOtpFor('P2P')) {
      const ok = await this.otpService.verifyForUser('P2P', body.fromUserId, body.otp);
      if (!ok) {
        return { status: 'rejected', reason: 'INVALID_OTP' };
      }
    }

    // Límite v1 (1,000 MXN)
    if (BigInt(body.amountMinorUnits) > BigInt(MAX_TRANSFER_MINOR_UNITS)) {
      return { status: 'rejected', reason: 'AMOUNT_EXCEEDS_LIMIT' };
    }

    const fromAccount = await this.accountsService.ensureAccountForUser(body.fromUserId);
    const toAccount = await this.accountsService.ensureAccountForUser(body.toUserId);

    // Ensure wallets
    await this.walletsService.ensureWallet(fromAccount.accountId, body.currency);
    await this.walletsService.ensureWallet(toAccount.accountId, body.currency);

    try {
      const result = await this.ledgerService.applyP2PTransfer({
        fromAccountId: fromAccount.accountId,
        toAccountId: toAccount.accountId,
        currency: body.currency,
        amountMinorUnits: body.amountMinorUnits,
        correlationId,
        concept: body.concept,
      });

      return {
        status: 'applied',
        correlationId,
        txId: result.txId,
        fromAccountNumber: fromAccount.accountNumber,
        toAccountNumber: toAccount.accountNumber,
      };
    } catch (error: any) {
      if (error?.message === 'INSUFFICIENT_FUNDS') {
        return { status: 'rejected', reason: 'INSUFFICIENT_FUNDS' };
      }
      throw error;
    }
  }
}
