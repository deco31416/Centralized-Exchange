import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AccountService } from '../services/account.service';
import { BalanceService } from '../services/balance.service';
import { HoldService } from '../services/hold.service';
import { PostingService } from '../services/posting.service';
import { CreateAccountDto } from '../models/create-account.dto';
import { CreateJournalEntryDto } from '../models/create-journal-entry.dto';
import { CreateHoldDto } from '../models/create-hold.dto';
import { BalanceResponseDto } from '../models/balance-response.dto';
import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';

/**
 * Controller for ledger operations.
 * Handles accounts, journal entries, holds, and balance queries.
 *
 * SECURITY: All endpoints protected by InternalAuthGuard.
 * Callers must include header: x-internal-auth: <INTERNAL_AUTH_TOKEN>
 */
@Controller('ledger')
@UseGuards(InternalAuthGuard)
export class LedgerController {
  constructor(
    private readonly accountService: AccountService,
    private readonly balanceService: BalanceService,
    private readonly holdService: HoldService,
    private readonly postingService: PostingService,
  ) {}

  /**
   * Test endpoint to verify controller is working.
   */
  @Get('test')
  getTestMessage(): { message: string } {
    return { message: 'Ledger controller is operational' };
  }

  /**
   * Creates a new account.
   */
  @Post('accounts')
  async createAccount(@Body() dto: CreateAccountDto) {
    return this.accountService.createAccount(dto);
  }

  /**
   * Gets an account by ID.
   */
  @Get('accounts/:id')
  async getAccount(@Param('id') id: string) {
    return this.accountService.findAccountById(id);
  }

  /**
   * Gets account balance.
   */
  @Get('accounts/:id/balance')
  async getBalance(
    @Param('id') id: string,
    @Query('assetCode') assetCode: string,
  ): Promise<BalanceResponseDto> {
    return this.balanceService.getAccountBalance({
      accountId: id,
      assetCode,
    });
  }

  /**
   * Posts a new journal entry.
   */
  @Post('entries')
  async postEntry(@Body() dto: CreateJournalEntryDto) {
    return this.postingService.postJournalEntry(dto);
  }

  /**
   * Reverses a journal entry.
   */
  @Post('entries/:id/reverse')
  async reverseEntry(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.postingService.reverseEntry({
      entryId: id,
      reason: body.reason,
    });
  }

  /**
   * Gets lines for a journal entry.
   */
  @Get('entries/:id/lines')
  async getEntryLines(@Param('id') id: string) {
    return this.postingService.getEntryLines(id);
  }

  /**
   * Creates a new hold.
   */
  @Post('holds')
  async createHold(@Body() dto: CreateHoldDto) {
    return this.holdService.createHold(dto);
  }

  /**
   * Releases a hold.
   */
  @Post('holds/:id/release')
  async releaseHold(@Param('id') id: string) {
    return this.holdService.releaseHold(id);
  }

  /**
   * Cancels a hold.
   */
  @Post('holds/:id/cancel')
  async cancelHold(@Param('id') id: string) {
    return this.holdService.cancelHold(id);
  }

  /**
   * Gets active holds for an account.
   */
  @Get('accounts/:id/holds')
  async getAccountHolds(@Param('id') id: string) {
    return this.holdService.getActiveHoldsForAccount(id);
  }

  /**
   * Gets or creates a ledger account for an owner + asset combination.
   * Idempotent: safe to call multiple times with the same params.
   * Used by p2p-core CryptoEscrowClient to ensure escrow accounts exist.
   */
  @Post('accounts/ensure')
  async ensureAccount(@Body() dto: CreateAccountDto) {
    return this.accountService.getOrCreateAccount(dto);
  }
}
