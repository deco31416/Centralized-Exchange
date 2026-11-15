import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PricingConfiguration, PricingBand } from '../models/pricing-configuration.schema';
import { SpreadManagerService } from './spread-manager.service';
import { BandEventType } from '../models/pricing-band-log.schema';
import { CreatePricingConfigDto, UpdateSpreadsDto } from '../models/pricing.dto';

/**
 * Service responsible for managing pricing configurations.
 */
@Injectable()
export class PricingConfigurationService {
  constructor(
    @InjectModel(PricingConfiguration.name) private configModel: Model<PricingConfiguration>,
    private spreadManager: SpreadManagerService,
  ) {}

  /**
   * Create a new pricing configuration.
   */
  async createConfiguration(dto: CreatePricingConfigDto): Promise<PricingConfiguration> {
    // Check if configuration already exists
    const existing = await this.configModel.findOne({ assetPair: dto.assetPair }).exec();
    
    if (existing) {
      throw new ConflictException(`Configuration already exists for ${dto.assetPair}`);
    }

    // Validate band
    const validation = this.spreadManager.validatePricingBand(dto.buySpread, dto.sellSpread);

    if (!validation.isAllowed) {
      throw new BadRequestException(validation.message);
    }

    const config = new this.configModel({
      assetPair: dto.assetPair,
      buySpread: dto.buySpread,
      sellSpread: dto.sellSpread,
      totalSpread: dto.buySpread + dto.sellSpread,
      currentBand: validation.band,
      enabled: true,
      requiresJustification: validation.requiresJustification,
      lastBandCheck: new Date(),
    });

    await config.save();

    // Log creation
    await this.spreadManager.logConfigurationChange(config, 0, BandEventType.CONFIG_CHANGE);

    return config;
  }

  /**
   * Update spreads with band validation.
   */
  async updateSpreads(configId: string, dto: UpdateSpreadsDto): Promise<PricingConfiguration> {
    const config = await this.configModel.findById(configId).exec();

    if (!config) {
      throw new NotFoundException(`Configuration ${configId} not found`);
    }

    // Validate new spreads
    const validation = this.spreadManager.validatePricingBand(dto.buySpread, dto.sellSpread);

    if (!validation.isAllowed) {
      // Log violation attempt
      await this.spreadManager.logConfigurationChange(config, 0, BandEventType.VIOLATION_ATTEMPT);
      throw new BadRequestException(validation.message);
    }

    // If yellow band, require justification
    if (validation.band === PricingBand.YELLOW && !dto.justification) {
      throw new BadRequestException('Justification required for yellow band spreads');
    }

    config.buySpread = dto.buySpread;
    config.sellSpread = dto.sellSpread;
    config.totalSpread = dto.buySpread + dto.sellSpread;
    config.currentBand = validation.band;
    config.requiresJustification = validation.requiresJustification;
    if (dto.justification) {
      config.justificationReason = dto.justification;
    }
    config.lastBandCheck = new Date();

    await config.save();

    // Log change
    await this.spreadManager.logConfigurationChange(config, 0, BandEventType.CONFIG_CHANGE);

    return config;
  }

  /**
   * Get configuration by asset pair.
   */
  async getConfigurationByPair(assetPair: string): Promise<PricingConfiguration> {
    const config = await this.configModel.findOne({ assetPair }).exec();

    if (!config) {
      throw new NotFoundException(`Configuration for ${assetPair} not found`);
    }

    return config;
  }

  /**
   * Get configuration by ID.
   */
  async getConfigurationById(configId: string): Promise<PricingConfiguration> {
    const config = await this.configModel.findById(configId).exec();

    if (!config) {
      throw new NotFoundException(`Configuration ${configId} not found`);
    }

    return config;
  }

  /**
   * Get all configurations.
   */
  async getAllConfigurations(filters?: { enabled?: boolean; band?: PricingBand }): Promise<PricingConfiguration[]> {
    const query: any = {};

    if (filters?.enabled !== undefined) {
      query.enabled = filters.enabled;
    }

    if (filters?.band) {
      query.currentBand = filters.band;
    }

    return this.configModel.find(query).exec();
  }

  /**
   * Toggle configuration enabled status.
   */
  async toggleConfiguration(configId: string, enabled: boolean): Promise<PricingConfiguration> {
    const config = await this.configModel.findById(configId).exec();

    if (!config) {
      throw new NotFoundException(`Configuration ${configId} not found`);
    }

    config.enabled = enabled;
    await config.save();

    return config;
  }

  /**
   * Approve yellow band usage.
   */
  async approveYellowBandUsage(configId: string, approvedBy: string, justification: string): Promise<PricingConfiguration> {
    const config = await this.configModel.findById(configId).exec();

    if (!config) {
      throw new NotFoundException(`Configuration ${configId} not found`);
    }

    if (config.currentBand !== PricingBand.YELLOW) {
      throw new BadRequestException('Configuration is not in yellow band');
    }

    config.approvedBy = approvedBy;
    config.approvedAt = new Date();
    config.justificationReason = justification;

    await config.save();

    return config;
  }

  /**
   * Delete a configuration.
   */
  async deleteConfiguration(configId: string): Promise<void> {
    const result = await this.configModel.findByIdAndDelete(configId).exec();

    if (!result) {
      throw new NotFoundException(`Configuration ${configId} not found`);
    }
  }
}