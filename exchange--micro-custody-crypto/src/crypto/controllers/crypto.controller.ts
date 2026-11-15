import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateAddressDto } from '../models/create-address.dto';
import { CreateWithdrawalDto } from '../models/create-withdrawal.dto';
import { AddressService } from '../services/address.service';
import { DepositService } from '../services/deposit.service';
import { WithdrawalService } from '../services/withdrawal.service';
import { CustodyService } from '../services/custody.service';
import { MultiSigService } from '../services/multi-sig.service';
import { ReconciliationService } from '../services/reconciliation.service';
import { WatchtowerService } from '../services/watchtower.service';

/**
 * Controller for cryptocurrency deposit/withdrawal operations
 */
@Controller('crypto')
export class CryptoController {
  constructor(
    private readonly addressService: AddressService,
    private readonly depositService: DepositService,
    private readonly withdrawalService: WithdrawalService,
    private readonly custodyService: CustodyService,
    private readonly multiSigService: MultiSigService,
    private readonly reconciliationService: ReconciliationService,
    private readonly watchtowerService: WatchtowerService,
  ) {}

  // ===== ADDRESS ENDPOINTS =====

  /**
   * Get all deposit addresses for current user
   */
  @Get('addresses')
  async getUserAddresses(@Request() req: any) {
    const userId = req.user?.userId || 'demo-user'; // TODO: Get from auth
    return this.addressService.getUserAddresses(userId);
  }

  /**
   * Generate a new deposit address
   */
  @Post('addresses/generate')
  async generateAddress(@Request() req: any, @Body() dto: CreateAddressDto) {
    const userId = req.user?.userId || 'demo-user'; // TODO: Get from auth

    return this.addressService.generateAddressForUser({
      userId,
      blockchain: dto.blockchain,
      assetCode: dto.assetCode,
    });
  }

  // ===== DEPOSIT ENDPOINTS =====

  /**
   * Get user deposit history
   */
  @Get('deposits')
  async getUserDeposits(
    @Request() req: any,
    @Query('assetCode') assetCode?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user?.userId || 'demo-user'; // TODO: Get from auth

    return this.depositService.getUserDeposits(userId, {
      assetCode,
      status: status as any,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  /**
   * Get deposit by ID
   */
  @Get('deposits/:id')
  async getDepositById(@Param('id') id: string) {
    return this.depositService.getDepositById(id);
  }

  /**
   * Get deposit statistics
   */
  @Get('deposits/stats/summary')
  async getDepositStatistics() {
    return this.depositService.getDepositStatistics();
  }

  // ===== WITHDRAWAL ENDPOINTS =====

  /**
   * Request a withdrawal
   */
  @Post('withdrawals')
  async requestWithdrawal(
    @Request() req: any,
    @Body() dto: CreateWithdrawalDto,
  ) {
    const userId = req.user?.userId || 'demo-user'; // TODO: Get from auth

    return this.withdrawalService.requestWithdrawal({
      userId,
      assetCode: dto.assetCode,
      amount: dto.amount,
      destinationAddress: dto.destinationAddress,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  /**
   * Get user withdrawal history
   */
  @Get('withdrawals')
  async getUserWithdrawals(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user?.userId || 'demo-user'; // TODO: Get from auth

    return this.withdrawalService.getUserWithdrawals(userId, {
      status: status as any,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  /**
   * Get withdrawal by ID
   */
  @Get('withdrawals/:id')
  async getWithdrawalById(@Param('id') id: string) {
    return this.withdrawalService.getWithdrawalById(id);
  }

  /**
   * Cancel a pending withdrawal
   */
  @Post('withdrawals/:id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelWithdrawal(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || 'demo-user'; // TODO: Get from auth
    await this.withdrawalService.cancelWithdrawal(id, userId);
    return { message: 'Withdrawal cancelled successfully' };
  }

  // ===== ADMIN ENDPOINTS =====

  /**
   * Get all deposits (admin)
   */
  @Get('admin/deposits')
  async getAllDeposits(
    @Query('status') status?: string,
    @Query('blockchain') blockchain?: string,
    @Query('assetCode') assetCode?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.depositService.getAllDeposits({
      status: status as any,
      blockchain,
      assetCode,
      limit: limit ? parseInt(limit) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    });
  }

  /**
   * Get pending withdrawal approvals (admin)
   */
  @Get('admin/withdrawals/pending')
  async getPendingWithdrawals() {
    // TODO: Implement filtering for pending approvals
    return { message: 'Not yet implemented' };
  }

  /**
   * Get custody wallet balances (admin)
   */
  @Get('admin/custody/balances')
  async getCustodyBalances() {
    return this.custodyService.getAllWallets();
  }

  /**
   * Update custody wallet limits (admin)
   */
  @Put('admin/custody/limits/:assetCode')
  async updateCustodyLimits(
    @Param('assetCode') assetCode: string,
    @Body() limits: any,
  ) {
    return this.custodyService.updateLimits(assetCode, limits);
  }

  /**
   * Lock a custody wallet (admin - emergency)
   */
  @Post('admin/custody/:assetCode/lock')
  @HttpCode(HttpStatus.OK)
  async lockWallet(
    @Param('assetCode') assetCode: string,
    @Body('reason') reason: string,
  ) {
    await this.custodyService.lockWallet(assetCode, reason);
    return { message: `Wallet ${assetCode} locked successfully` };
  }

  /**
   * Unlock a custody wallet (admin)
   */
  @Post('admin/custody/:assetCode/unlock')
  @HttpCode(HttpStatus.OK)
  async unlockWallet(@Param('assetCode') assetCode: string) {
    await this.custodyService.unlockWallet(assetCode);
    return { message: `Wallet ${assetCode} unlocked successfully` };
  }

  /**
   * Run reconciliation manually (admin)
   */
  @Post('admin/reconciliation/run')
  @HttpCode(HttpStatus.OK)
  async runReconciliation() {
    const report = await this.reconciliationService.runReconciliation(
      new Date(),
    );
    return report;
  }

  /**
   * Start watchtower (admin)
   */
  @Post('admin/watchtower/start')
  @HttpCode(HttpStatus.OK)
  async startWatchtower() {
    await this.watchtowerService.start();
    return { message: 'Watchtower started successfully' };
  }

  /**
   * Stop watchtower (admin)
   */
  @Post('admin/watchtower/stop')
  @HttpCode(HttpStatus.OK)
  async stopWatchtower() {
    await this.watchtowerService.stop();
    return { message: 'Watchtower stopped successfully' };
  }

  /**
   * Get watchtower status (admin)
   */
  @Get('admin/watchtower/status')
  async getWatchtowerStatus() {
    return this.watchtowerService.getStatus();
  }

  // ===== MULTI-SIG ENDPOINTS =====

  /**
   * Get pending multi-sig requests (for authorized signers)
   */
  @Get('multisig/requests')
  async getPendingMultiSigRequests() {
    return this.multiSigService.getPendingMultiSigRequests();
  }

  /**
   * Get multi-sig request details
   */
  @Get('multisig/requests/:id')
  async getMultiSigRequest(@Param('id') id: string) {
    return this.multiSigService.getMultiSigRequest(id);
  }

  /**
   * Sign a multi-sig request
   */
  @Post('multisig/requests/:id/sign')
  @HttpCode(HttpStatus.OK)
  async signMultiSigRequest(
    @Request() req: any,
    @Param('id') id: string,
    @Body('signature') signature: string,
  ) {
    const signerId = req.user?.userId || 'admin-demo'; // TODO: Get from auth

    return this.multiSigService.addSignature({
      multiSigRequestId: id,
      signerId,
      signature,
    });
  }

  /**
   * Reject a multi-sig request
   */
  @Post('multisig/requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectMultiSigRequest(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const signerId = req.user?.userId || 'admin-demo'; // TODO: Get from auth

    return this.multiSigService.rejectMultiSig(id, signerId, reason);
  }

  /**
   * Get list of authorized signers
   */
  @Get('multisig/signers')
  async getAuthorizedSigners() {
    return {
      signers: this.multiSigService.getAuthorizedSigners(),
    };
  }
}
