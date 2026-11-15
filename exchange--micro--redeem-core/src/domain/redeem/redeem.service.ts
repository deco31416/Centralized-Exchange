import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetRegistryClientService } from '../../consumers/clients/asset-registry-client.service';
import { AuthClientService } from '../../consumers/clients/auth-client.service';
import { NotificationsClientService } from '../../consumers/clients/notifications-client.service';
import { PricingFeeAggregatorClientService } from '../../consumers/clients/pricing-fee-aggregator-client.service';
import { WalletLedgerClientService } from '../../consumers/clients/wallet-ledger-client.service';
import { ResponseHelper } from '../../shared/helpers/response.helper';
import { ConfirmRedeemDto } from './dto/confirm-redeem.dto';
import { GetQuoteDto } from './dto/get-quote.dto';
import { PreviewRedeemDto } from './dto/preview-redeem.dto';
import { RedeemQueryDto } from './dto/redeem-query.dto';

@Injectable()
export class RedeemService {
  constructor(
    private readonly authClientService: AuthClientService,
    private readonly walletLedgerClientService: WalletLedgerClientService,
    private readonly pricingFeeAggregatorClientService: PricingFeeAggregatorClientService,
    private readonly notificationsClientService: NotificationsClientService,
    private readonly assetRegistryClientService: AssetRegistryClientService,
  ) {}

  getInternalHealth() {
    return ResponseHelper.success('Redeem internal health check successful', {
      status: 'ok',
      service: 'exchange--micro-redeem-core',
      scope: 'internal',
      timestamp: new Date().toISOString(),
    });
  }

  findAll(query: RedeemQueryDto) {
    return ResponseHelper.success('Redeem operations retrieved successfully', {
      filters: query,
      items: [],
      total: 0,
    });
  }

  async getQuote(payload: GetQuoteDto) {
    await this.ensureValidUser(payload.userId);
    const pairValidation = await this.ensureValidPair(
      payload.sourceAsset,
      payload.targetAsset,
    );

    const sourceMin = pairValidation?.sourceAssetData?.minAmount;
    const sourceMax = pairValidation?.sourceAssetData?.maxAmount;

    if (typeof sourceMin === 'number' && payload.sourceAmount < sourceMin) {
      throw new BadRequestException(
        `Amount is below minimum allowed for ${payload.sourceAsset}`,
      );
    }

    if (typeof sourceMax === 'number' && payload.sourceAmount > sourceMax) {
      throw new BadRequestException(
        `Amount exceeds maximum allowed for ${payload.sourceAsset}`,
      );
    }

    const quote = await this.pricingFeeAggregatorClientService.getQuote({
      userId: payload.userId,
      sourceAsset: payload.sourceAsset,
      targetAsset: payload.targetAsset,
      sourceAmount: payload.sourceAmount,
    });

    return ResponseHelper.success('Redeem quote generated successfully', quote);
  }

  async preview(payload: PreviewRedeemDto) {
    await this.ensureValidUser(payload.userId);
    const pairValidation = await this.ensureValidPair(
      payload.sourceAsset,
      payload.targetAsset,
    );

    const balance = await this.walletLedgerClientService.getAvailableBalance(
      payload.userId,
      payload.sourceAsset,
    );

    if (balance.availableBalance < payload.sourceAmount) {
      throw new BadRequestException(
        `Insufficient balance in asset ${payload.sourceAsset}`,
      );
    }

    const sourceMin = pairValidation?.sourceAssetData?.minAmount;
    const sourceMax = pairValidation?.sourceAssetData?.maxAmount;

    if (typeof sourceMin === 'number' && payload.sourceAmount < sourceMin) {
      throw new BadRequestException(
        `Amount is below minimum allowed for ${payload.sourceAsset}`,
      );
    }

    if (typeof sourceMax === 'number' && payload.sourceAmount > sourceMax) {
      throw new BadRequestException(
        `Amount exceeds maximum allowed for ${payload.sourceAsset}`,
      );
    }

    const quote = await this.pricingFeeAggregatorClientService.getQuote({
      userId: payload.userId,
      sourceAsset: payload.sourceAsset,
      targetAsset: payload.targetAsset,
      sourceAmount: payload.sourceAmount,
    });

    const preview = {
      previewId: `preview_${Date.now()}`,
      status: 'PREVIEW',
      userId: payload.userId,
      sourceAsset: payload.sourceAsset,
      targetAsset: payload.targetAsset,
      sourceAmount: quote.sourceAmount,
      targetAmount: quote.targetAmount,
      fee: quote.fee,
      rate: quote.rate,
      expiresAt: quote.expiresAt,
      balanceSnapshot: balance,
    };

    return ResponseHelper.success(
      'Redeem preview generated successfully',
      preview,
    );
  }

  async confirm(payload: ConfirmRedeemDto) {
    const userValidation = await this.ensureValidUser(payload.userId);

    if (!payload.quoteId) {
      throw new NotFoundException('Quote identifier is required');
    }

    const quote = await this.pricingFeeAggregatorClientService.getQuoteById(
      payload.quoteId,
    );

    if (!quote?.raw) {
      throw new NotFoundException('Quote not found');
    }

    if (
      quote.raw.fromAsset !== payload.sourceAsset ||
      quote.raw.toAsset !== payload.targetAsset
    ) {
      throw new BadRequestException(
        'Quote assets do not match confirm payload',
      );
    }

    await this.ensureValidPair(payload.sourceAsset, payload.targetAsset);

    const balance = await this.walletLedgerClientService.getAvailableBalance(
      payload.userId,
      payload.sourceAsset,
    );

    const amountMinorUnits = String(quote.raw.fromAmount);

    if (Number(balance.availableMinorUnits) < Number(amountMinorUnits)) {
      throw new BadRequestException(
        `Insufficient balance in asset ${payload.sourceAsset}`,
      );
    }

    const reservation = await this.walletLedgerClientService.reserveBalance({
      userId: payload.userId,
      asset: payload.sourceAsset,
      amountMinorUnits,
      quoteId: payload.quoteId,
    });

    const redeemId = `redeem_${Date.now()}`;

    const notification =
      await this.notificationsClientService.notifyRedeemCreated({
        userId: payload.userId,
        redeemId,
        sourceAsset: payload.sourceAsset,
        targetAsset: payload.targetAsset,
        email: userValidation?.email,
      });

    return ResponseHelper.success('Redeem confirmed successfully', {
      redeemId,
      status: reservation?.reserved ? 'PENDING_EXECUTION' : 'REJECTED',
      createdAt: new Date().toISOString(),
      quoteId: payload.quoteId,
      sourceAsset: payload.sourceAsset,
      targetAsset: payload.targetAsset,
      sourceAmount: quote.sourceAmount,
      targetAmount: quote.targetAmount,
      fee: quote.fee,
      rate: quote.rate,
      balanceSnapshot: balance,
      reservation,
      notification,
    });
  }

  private async ensureValidUser(userId: string) {
    const validation = await this.authClientService.validateUser(userId);

    if (!validation.valid) {
      throw new BadRequestException('Invalid user');
    }

    return validation;
  }

  private async ensureValidPair(sourceAsset: string, targetAsset: string) {
    if (sourceAsset === targetAsset) {
      throw new BadRequestException(
        'Source asset and target asset must be different',
      );
    }

    const pairValidation =
      await this.assetRegistryClientService.validatePair(
        sourceAsset,
        targetAsset,
      );

    if (!pairValidation.enabled) {
      throw new BadRequestException(
        `Redeem pair ${sourceAsset}/${targetAsset} is not enabled`,
      );
    }

    return pairValidation;
  }
}