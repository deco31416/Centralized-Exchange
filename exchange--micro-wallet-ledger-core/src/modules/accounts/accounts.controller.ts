import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { InternalAuthGuard } from '../../shared/security/internal-auth.guard';

@Controller('internal/accounts')
@UseGuards(InternalAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('ensure/:userId')
  async ensure(@Param('userId') userId: string) {
    const account = await this.accountsService.ensureAccountForUser(userId);
    return {
      accountId: account.accountId,
      userId: account.userId,
      accountNumber: account.accountNumber,
      status: account.status,
    };
  }

  @Get('by-user/:userId')
  async byUser(@Param('userId') userId: string) {
    const account = await this.accountsService.getByUserId(userId);
    if (!account) return { found: false };
    return {
      found: true,
      accountId: account.accountId,
      accountNumber: account.accountNumber,
      status: account.status,
    };
  }
}
