import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SwapRequest, SwapStatus } from '../models/swap-request.schema';
import { CreateSwapDto, GetQuoteDto } from '../models/create-swap.dto';
import {
  SwapQuoteResponseDto,
  SwapExecutionResponseDto,
} from '../models/swap-response.dto';
import { SwapValidationService } from './swap-validation.service';
import { SwapCalculationService } from './swap-calculation.service';
import { PlatformReservesService } from './platform-reserves.service';
import { PostingService } from '../../ledger/services/posting.service';
import { AccountService } from '../../ledger/services/account.service';
import { CreateJournalEntryDto } from '../../ledger/models/create-journal-entry.dto';
import { LineDirection } from '../../ledger/models/journal-line.schema';
import { OwnerType, AccountType } from '../../ledger/models/account.schema';
import { PriceOracleService } from '../../pricing/services/price-oracle.service';
import { SpreadManagerService } from '../../pricing/services/spread-manager.service';
import { PricingConfigurationService } from '../../pricing/services/pricing-configuration.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Pricing quote result from pricing module.
 */
interface PricingQuote {
  rate: number;
  spread: number;
  band: string;
}

/**
 * Main service for swap execution.
 * Orchestrates validation, calculation, and ledger posting.
 */
@Injectable()
export class SwapExecutionService {
  private readonly logger = new Logger(SwapExecutionService.name);
  private readonly QUOTE_TTL_SECONDS = 30;
  private quoteCache: Map<
    string,
    { quote: SwapQuoteResponseDto; expiresAt: Date }
  > = new Map();

  constructor(
    @InjectModel(SwapRequest.name) private swapRequestModel: Model<SwapRequest>,
    private validationService: SwapValidationService,
    private calculationService: SwapCalculationService,
    private reservesService: PlatformReservesService,
    private postingService: PostingService,
    private accountService: AccountService,
    private priceOracleService: PriceOracleService,
    private spreadManagerService: SpreadManagerService,
    private pricingConfigService: PricingConfigurationService,
  ) {}

  /**
   * Get a quote for a swap without executing it.
   */
  async getQuote(
    dto: GetQuoteDto,
    userId: string,
  ): Promise<SwapQuoteResponseDto> {
    // Get pricing from Pricing Module (mocked for now)
    const pricing = await this.getPricing(dto.fromAsset, dto.toAsset);

    // Calculate amounts
    const calculation = this.calculationService.calculateSwap({
      fromAsset: dto.fromAsset,
      toAsset: dto.toAsset,
      fromAmount: dto.fromAmount,
      toAmount: dto.toAmount,
      rate: pricing.rate,
    });

    this.calculationService.validateAmounts(
      calculation.fromAmount,
      calculation.toAmount,
    );

    // Create quote
    const quoteId = `quote_${uuidv4()}`;
    const expiresAt = new Date(Date.now() + this.QUOTE_TTL_SECONDS * 1000);

    const quote: SwapQuoteResponseDto = {
      quoteId,
      fromAsset: dto.fromAsset,
      fromAmount: calculation.fromAmount,
      toAsset: dto.toAsset,
      toAmount: calculation.toAmount,
      rate: pricing.rate,
      spread: pricing.spread,
      pricingBand: pricing.band,
      expiresAt,
    };

    // Cache quote
    this.quoteCache.set(quoteId, { quote, expiresAt });

    // Clean expired quotes
    this.cleanExpiredQuotes();

    return quote;
  }

  /**
   * Execute a swap.
   * Uses idempotency key to prevent duplicate executions.
   */
  async executeSwap(
    dto: CreateSwapDto,
    userId: string,
  ): Promise<SwapExecutionResponseDto> {
    // Check idempotency
    const existing = await this.swapRequestModel
      .findOne({ externalIdempotencyKey: dto.idempotencyKey })
      .exec();

    if (existing) {
      if (existing.status === SwapStatus.EXECUTED) {
        return this.toExecutionResponse(existing);
      }
      throw new ConflictException(
        'Swap request already exists with different status',
      );
    }

    // Get pricing
    const pricing = await this.getPricing(dto.fromAsset, dto.toAsset);

    // Calculate amounts
    const calculation = this.calculationService.calculateSwap({
      fromAsset: dto.fromAsset,
      toAsset: dto.toAsset,
      fromAmount: dto.fromAmount,
      toAmount: dto.toAmount,
      rate: pricing.rate,
    });

    this.calculationService.validateAmounts(
      calculation.fromAmount,
      calculation.toAmount,
    );

    // Validate swap
    await this.validationService.validateSwap({
      userId,
      fromAsset: dto.fromAsset,
      toAsset: dto.toAsset,
      fromAmount: calculation.fromAmount,
      toAmount: calculation.toAmount,
    });

    // Create swap request record
    const swapRequest = new this.swapRequestModel({
      userId,
      fromAsset: dto.fromAsset,
      toAsset: dto.toAsset,
      fromAmount: calculation.fromAmount,
      toAmount: calculation.toAmount,
      executedRate: pricing.rate,
      spread: pricing.spread,
      pricingBand: pricing.band,
      status: SwapStatus.PENDING,
      externalIdempotencyKey: dto.idempotencyKey,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    await swapRequest.save();

    try {
      // Execute in ledger
      const ledgerEntryId = await this.executeInLedger({
        userId,
        swapRequest,
        fromAmount: calculation.fromAmount,
        toAmount: calculation.toAmount,
      });

      // Update swap request
      swapRequest.status = SwapStatus.EXECUTED;
      swapRequest.executedAt = new Date();
      swapRequest.ledgerEntryId = ledgerEntryId;
      await swapRequest.save();

      // Update daily usage
      await this.validationService.updateDailyUsage(
        userId,
        dto.fromAsset,
        dto.toAsset,
        calculation.fromAmount,
      );

      return this.toExecutionResponse(swapRequest);
    } catch (error) {
      // Mark as failed
      swapRequest.status = SwapStatus.FAILED;
      swapRequest.metadata = {
        ...swapRequest.metadata,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      await swapRequest.save();
      throw error;
    }
  }

  /**
   * Execute swap in ledger using double-entry bookkeeping.
   */
  private async executeInLedger(params: {
    userId: string;
    swapRequest: SwapRequest;
    fromAmount: number;
    toAmount: number;
  }): Promise<string> {
    const { userId, swapRequest, fromAmount, toAmount } = params;

    // Get or create user accounts
    const userFromAccount = await this.accountService.getOrCreateAccount({
      ownerType: OwnerType.USER,
      ownerId: userId,
      assetCode: swapRequest.fromAsset,
      accountType: AccountType.ASSET,
    });

    const userToAccount = await this.accountService.getOrCreateAccount({
      ownerType: OwnerType.USER,
      ownerId: userId,
      assetCode: swapRequest.toAsset,
      accountType: AccountType.ASSET,
    });

    // Get platform reserve accounts
    const platformFromAccount = await this.accountService.getOrCreateAccount({
      ownerType: OwnerType.PLATFORM,
      ownerId: 'PLATFORM',
      assetCode: swapRequest.fromAsset,
      accountType: AccountType.ASSET,
    });

    const platformToAccount = await this.accountService.getOrCreateAccount({
      ownerType: OwnerType.PLATFORM,
      ownerId: 'PLATFORM',
      assetCode: swapRequest.toAsset,
      accountType: AccountType.ASSET,
    });

    // Create journal entry with 4 lines (double-entry for 2 assets)
    const journalEntry: CreateJournalEntryDto = {
      externalIdempotencyKey: `swap_${String(swapRequest._id)}`,
      narration: `Swap: ${fromAmount} ${swapRequest.fromAsset} → ${toAmount} ${swapRequest.toAsset}`,
      lines: [
        // User gives fromAsset
        {
          accountId: String(userFromAccount._id),
          direction: LineDirection.DEBIT,
          amountMinor: this.calculationService.toMinorUnits(
            fromAmount,
            swapRequest.fromAsset,
          ),
          assetCode: swapRequest.fromAsset,
        },
        // Platform receives fromAsset
        {
          accountId: String(platformFromAccount._id),
          direction: LineDirection.CREDIT,
          amountMinor: this.calculationService.toMinorUnits(
            fromAmount,
            swapRequest.fromAsset,
          ),
          assetCode: swapRequest.fromAsset,
        },
        // Platform gives toAsset
        {
          accountId: String(platformToAccount._id),
          direction: LineDirection.DEBIT,
          amountMinor: this.calculationService.toMinorUnits(
            toAmount,
            swapRequest.toAsset,
          ),
          assetCode: swapRequest.toAsset,
        },
        // User receives toAsset
        {
          accountId: String(userToAccount._id),
          direction: LineDirection.CREDIT,
          amountMinor: this.calculationService.toMinorUnits(
            toAmount,
            swapRequest.toAsset,
          ),
          assetCode: swapRequest.toAsset,
        },
      ],
      correlationId: String(swapRequest._id),
      metadata: {
        swapId: String(swapRequest._id),
        rate: swapRequest.executedRate,
        spread: swapRequest.spread,
        pricingBand: swapRequest.pricingBand,
      },
    };

    const entry = await this.postingService.postJournalEntry(journalEntry);

    return String(entry._id);
  }

  /**
   * Get swap history for a user.
   */
  async getSwapHistory(
    userId: string,
    limit: number = 50,
  ): Promise<SwapRequest[]> {
    return this.swapRequestModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get single swap by ID.
   */
  async getSwapById(swapId: string): Promise<SwapRequest> {
    const swap = await this.swapRequestModel.findById(swapId).exec();
    if (!swap) {
      throw new BadRequestException(`Swap not found: ${swapId}`);
    }
    return swap;
  }

  /**
   * Get pricing from Pricing Module with compliance validation.
   * Integrates with Price Oracle, Spread Manager, and Pricing Configuration services.
   */
  private async getPricing(
    fromAsset: string,
    toAsset: string,
  ): Promise<PricingQuote> {
    const assetPair = `${fromAsset}/${toAsset}`;

    try {
      // 1. Get base rate from Price Oracle
      this.logger.debug(`Getting base rate for ${assetPair}`);
      const baseRate = await this.priceOracleService.getBaseRate(
        fromAsset,
        toAsset,
      );

      // 2. Get pricing configuration for the asset pair
      this.logger.debug(`Getting pricing configuration for ${assetPair}`);
      const config = await this.pricingConfigService.getConfigurationByPair(
        assetPair,
      );

      if (!config.enabled) {
        throw new BadRequestException(
          `Pricing configuration disabled for ${assetPair}`,
        );
      }

      // 3. Apply spread with compliance validation
      // Direction is 'buy' because platform is SELLING to the user (user receives toAsset)
      this.logger.debug(`Applying spread for ${assetPair} (direction: buy)`);
      const spreadResult = await this.spreadManagerService.applySpread({
        baseRate,
        config,
        direction: 'buy', // Platform sells toAsset to user
      });

      this.logger.log(
        `Pricing for ${assetPair}: baseRate=${baseRate}, finalRate=${spreadResult.finalRate}, spread=${spreadResult.spread}%, band=${spreadResult.band}`,
      );

      return {
        rate: spreadResult.finalRate,
        spread: spreadResult.spread,
        band: spreadResult.band,
      };
    } catch (error) {
      // If configuration doesn't exist, provide helpful error
      if (error instanceof Error && error.message.includes('not found')) {
        throw new BadRequestException(
          `No pricing configuration found for ${assetPair}. Please configure pricing for this asset pair first.`,
        );
      }
      // Re-throw any other errors (including red band blocking)
      throw error;
    }
  }

  /**
   * Convert swap request to execution response DTO.
   */
  private toExecutionResponse(swap: SwapRequest): SwapExecutionResponseDto {
    return {
      swapId: String(swap._id),
      status: swap.status,
      fromAsset: swap.fromAsset,
      fromAmount: swap.fromAmount,
      toAsset: swap.toAsset,
      toAmount: swap.toAmount,
      executedRate: swap.executedRate,
      spread: swap.spread,
      pricingBand: swap.pricingBand,
      executedAt: swap.executedAt || new Date(),
      ledgerEntryId: swap.ledgerEntryId || '',
    };
  }

  /**
   * Clean expired quotes from cache.
   */
  private cleanExpiredQuotes(): void {
    const now = new Date();
    for (const [quoteId, cached] of this.quoteCache.entries()) {
      if (cached.expiresAt < now) {
        this.quoteCache.delete(quoteId);
      }
    }
  }
}
