import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PricingConfiguration, PricingBand } from '../models/pricing-configuration.schema';
import { PricingBandLog, BandEventType } from '../models/pricing-band-log.schema';

interface BandValidationResult {
  band: PricingBand;
  totalSpread: number;
  isAllowed: boolean;
  requiresJustification: boolean;
  message: string;
}

interface SpreadResult {
  finalRate: number;
  baseRate: number;
  spread: number;
  band: PricingBand;
  requiresJustification: boolean;
}

/**
 * Service responsible for applying spreads and validating legal compliance bands.
 */
@Injectable()
export class SpreadManagerService {
  private readonly logger = new Logger(SpreadManagerService.name);
  private readonly GREEN_BAND_MAX = 10; // 0-10%
  private readonly YELLOW_BAND_MAX = 15; // 10-15%
  // RED_BAND > 15%

  constructor(
    @InjectModel(PricingConfiguration.name) private configModel: Model<PricingConfiguration>,
    @InjectModel(PricingBandLog.name) private bandLogModel: Model<PricingBandLog>,
  ) {}

  /**
   * Validate pricing band based on total spread.
   */
  validatePricingBand(buySpread: number, sellSpread: number): BandValidationResult {
    const totalSpread = buySpread + sellSpread;

    if (totalSpread <= this.GREEN_BAND_MAX) {
      return {
        band: PricingBand.GREEN,
        totalSpread,
        isAllowed: true,
        requiresJustification: false,
        message: 'Spread within green band - normal operation',
      };
    }

    if (totalSpread <= this.YELLOW_BAND_MAX) {
      return {
        band: PricingBand.YELLOW,
        totalSpread,
        isAllowed: true,
        requiresJustification: true,
        message: 'Spread in yellow band - requires justification and approval',
      };
    }

    return {
      band: PricingBand.RED,
      totalSpread,
      isAllowed: false,
      requiresJustification: false,
      message: `BLOCKED - Spread exceeds legal limit of ${this.YELLOW_BAND_MAX}%`,
    };
  }

  /**
   * Apply spread to base rate.
   */
  async applySpread(params: {
    baseRate: number;
    config: PricingConfiguration;
    direction: 'buy' | 'sell';
  }): Promise<SpreadResult> {
    const { baseRate, config, direction } = params;

    // Validate band
    const validation = this.validatePricingBand(config.buySpread, config.sellSpread);

    if (!validation.isAllowed) {
      throw new BadRequestException(validation.message);
    }

    // Calculate final rate
    let finalRate: number;
    let spread: number;

    if (direction === 'buy') {
      // Platform sells to user - apply sellSpread (markup)
      spread = config.sellSpread;
      finalRate = baseRate * (1 + spread / 100);
    } else {
      // Platform buys from user - apply buySpread (discount)
      spread = config.buySpread;
      finalRate = baseRate * (1 - spread / 100);
    }

    // Log usage if yellow or red band
    if (validation.band !== PricingBand.GREEN) {
      await this.logBandUsage(config, baseRate, finalRate, validation.band, direction);
    }

    return {
      finalRate,
      baseRate,
      spread,
      band: validation.band,
      requiresJustification: validation.requiresJustification,
    };
  }

  /**
   * Update configuration band status.
   */
  async updateConfigurationBand(configId: string): Promise<void> {
    const config = await this.configModel.findById(configId).exec();

    if (!config) {
      return;
    }

    const validation = this.validatePricingBand(config.buySpread, config.sellSpread);
    
    config.currentBand = validation.band;
    config.requiresJustification = validation.requiresJustification;
    config.lastBandCheck = new Date();

    await config.save();
  }

  /**
   * Log band usage for audit trail.
   */
  private async logBandUsage(
    config: PricingConfiguration,
    baseRate: number,
    finalRate: number,
    band: PricingBand,
    direction: 'buy' | 'sell',
  ): Promise<void> {
    const finalBuyRate = direction === 'sell' ? baseRate * (1 - config.buySpread / 100) : 0;
    const finalSellRate = direction === 'buy' ? baseRate * (1 + config.sellSpread / 100) : 0;

    const log = new this.bandLogModel({
      pricingConfigId: config._id,
      band,
      buySpread: config.buySpread,
      sellSpread: config.sellSpread,
      totalSpread: config.totalSpread,
      baseRate,
      finalBuyRate: finalBuyRate || finalRate,
      finalSellRate: finalSellRate || finalRate,
      justification: config.justificationReason,
      approvedBy: config.approvedBy,
      timestamp: new Date(),
      eventType: BandEventType.USAGE,
      metadata: {
        direction,
        assetPair: config.assetPair,
      },
    });

    await log.save();

    if (band === PricingBand.YELLOW) {
      this.logger.warn(`Yellow band usage logged for ${config.assetPair}`);
    }
  }

  /**
   * Log configuration change.
   */
  async logConfigurationChange(
    config: PricingConfiguration,
    baseRate: number,
    eventType: BandEventType,
  ): Promise<void> {
    const log = new this.bandLogModel({
      pricingConfigId: config._id,
      band: config.currentBand,
      buySpread: config.buySpread,
      sellSpread: config.sellSpread,
      totalSpread: config.totalSpread,
      baseRate,
      finalBuyRate: baseRate * (1 - config.buySpread / 100),
      finalSellRate: baseRate * (1 + config.sellSpread / 100),
      justification: config.justificationReason,
      approvedBy: config.approvedBy,
      timestamp: new Date(),
      eventType,
      metadata: {
        assetPair: config.assetPair,
      },
    });

    await log.save();
  }

  /**
   * Get band logs for a configuration.
   */
  async getBandLogs(configId: string, limit: number = 50): Promise<PricingBandLog[]> {
    return this.bandLogModel
      .find({ pricingConfigId: configId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get all logs by band type.
   */
  async getLogsByBand(band: PricingBand, limit: number = 100): Promise<PricingBandLog[]> {
    return this.bandLogModel
      .find({ band })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}