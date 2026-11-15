import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PriceOracleService } from '../services/price-oracle.service';
import { SpreadManagerService } from '../services/spread-manager.service';
import { PricingConfigurationService } from '../services/pricing-configuration.service';
import { ComplianceService } from '../services/compliance.service';
import {
  CreateProviderDto,
  UpdateProviderDto,
  CreatePricingConfigDto,
  UpdateSpreadsDto,
  ApproveYellowBandDto,
  RateResponseDto,
} from '../models/pricing.dto';
import { PricingBand } from '../models/pricing-configuration.schema';

/**
 * Controller for pricing operations including rates, configurations, and compliance.
 */
@Controller('pricing')
export class PricingController {
  constructor(
    private priceOracle: PriceOracleService,
    private spreadManager: SpreadManagerService,
    private configService: PricingConfigurationService,
    private complianceService: ComplianceService,
  ) {}

  // ==================== Price Oracle Endpoints ====================

  /**
   * Get base rate for an asset pair.
   * GET /pricing/oracle/rate?from=USD&to=BSS
   */
  @Get('oracle/rate')
  async getRate(
    @Query('from') fromAsset: string,
    @Query('to') toAsset: string,
  ): Promise<RateResponseDto> {
    const rate = await this.priceOracle.getBaseRate(fromAsset, toAsset);
    const cachedInfo = this.priceOracle.getCachedRateInfo(fromAsset, toAsset);

    return {
      rate,
      sources: cachedInfo?.sources || [],
      timestamp: new Date(),
      cached: cachedInfo?.cached || false,
    };
  }

  /**
   * Get all price providers.
   * GET /pricing/oracle/providers
   */
  @Get('oracle/providers')
  async getProviders(): Promise<{ providers: unknown[] }> {
    const providers = await this.priceOracle.getAllProviders();
    return { providers };
  }

  /**
   * Create a new price provider.
   * POST /pricing/oracle/providers
   */
  @Post('oracle/providers')
  async createProvider(@Body() dto: CreateProviderDto): Promise<unknown> {
    return this.priceOracle.createProvider(dto);
  }

  /**
   * Update a price provider.
   * PUT /pricing/oracle/providers/:id
   */
  @Put('oracle/providers/:id')
  async updateProvider(
    @Param('id') id: string,
    @Body() dto: UpdateProviderDto,
  ): Promise<unknown> {
    return this.priceOracle.updateProvider(id, dto);
  }

  // ==================== Pricing Configuration Endpoints ====================

  /**
   * Create a new pricing configuration.
   * POST /pricing/configurations
   */
  @Post('configurations')
  async createConfiguration(@Body() dto: CreatePricingConfigDto): Promise<unknown> {
    return this.configService.createConfiguration(dto);
  }

  /**
   * Get configuration by asset pair.
   * GET /pricing/configurations/pair?assetPair=USD/BSS
   */
  @Get('configurations/pair')
  async getConfigurationByPair(@Query('assetPair') assetPair: string): Promise<unknown> {
    return this.configService.getConfigurationByPair(assetPair);
  }

  /**
   * Get configuration by ID.
   * GET /pricing/configurations/:id
   */
  @Get('configurations/:id')
  async getConfigurationById(@Param('id') id: string): Promise<unknown> {
    return this.configService.getConfigurationById(id);
  }

  /**
   * Get all configurations with optional filters.
   * GET /pricing/configurations?enabled=true&band=green
   */
  @Get('configurations')
  async getAllConfigurations(
    @Query('enabled') enabled?: string,
    @Query('band') band?: PricingBand,
  ): Promise<{ configurations: unknown[] }> {
    const filters: any = {};
    
    if (enabled !== undefined) {
      filters.enabled = enabled === 'true';
    }
    
    if (band) {
      filters.band = band;
    }

    const configurations = await this.configService.getAllConfigurations(filters);
    return { configurations };
  }

  /**
   * Update spreads for a configuration.
   * PUT /pricing/configurations/:id/spreads
   */
  @Put('configurations/:id/spreads')
  async updateSpreads(
    @Param('id') id: string,
    @Body() dto: UpdateSpreadsDto,
  ): Promise<unknown> {
    return this.configService.updateSpreads(id, dto);
  }

  /**
   * Toggle configuration enabled status.
   * PUT /pricing/configurations/:id/toggle
   */
  @Put('configurations/:id/toggle')
  async toggleConfiguration(
    @Param('id') id: string,
    @Body('enabled') enabled: boolean,
  ): Promise<unknown> {
    return this.configService.toggleConfiguration(id, enabled);
  }

  /**
   * Approve yellow band usage.
   * POST /pricing/configurations/:id/approve
   */
  @Post('configurations/:id/approve')
  async approveYellowBand(
    @Param('id') id: string,
    @Body() dto: ApproveYellowBandDto,
  ): Promise<unknown> {
    return this.configService.approveYellowBandUsage(id, dto.approvedBy, dto.justification);
  }

  /**
   * Delete a configuration.
   * DELETE /pricing/configurations/:id
   */
  @Delete('configurations/:id')
  async deleteConfiguration(@Param('id') id: string): Promise<{ message: string }> {
    await this.configService.deleteConfiguration(id);
    return { message: 'Configuration deleted successfully' };
  }

  // ==================== Compliance Endpoints ====================

  /**
   * Get active compliance alerts.
   * GET /pricing/compliance/alerts
   */
  @Get('compliance/alerts')
  async getAlerts(): Promise<{ alerts: unknown[] }> {
    const alerts = await this.complianceService.getActiveAlerts();
    return { alerts };
  }

  /**
   * Get daily regulatory report.
   * GET /pricing/compliance/reports/daily?date=2025-10-01
   */
  @Get('compliance/reports/daily')
  async getDailyReport(@Query('date') dateStr?: string): Promise<unknown> {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.complianceService.generateDailyReport(date);
  }

  /**
   * Get compliance statistics.
   * GET /pricing/compliance/stats?days=30
   */
  @Get('compliance/stats')
  async getComplianceStats(@Query('days') days?: string): Promise<unknown> {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.complianceService.getComplianceStats(daysNum);
  }

  /**
   * Resolve a compliance alert.
   * POST /pricing/compliance/alerts/:id/resolve
   */
  @Post('compliance/alerts/:id/resolve')
  async resolveAlert(
    @Param('id') id: string,
    @Body('resolution') resolution: string,
  ): Promise<{ message: string }> {
    await this.complianceService.resolveAlert(id, resolution);
    return { message: 'Alert resolved successfully' };
  }

  // ==================== Band Logs Endpoints ====================

  /**
   * Get band logs for a configuration.
   * GET /pricing/logs/:configId?limit=50
   */
  @Get('logs/:configId')
  async getBandLogs(
    @Param('configId') configId: string,
    @Query('limit') limit?: string,
  ): Promise<{ logs: unknown[] }> {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const logs = await this.spreadManager.getBandLogs(configId, limitNum);
    return { logs };
  }

  /**
   * Get logs by band type.
   * GET /pricing/logs/band/:band?limit=100
   */
  @Get('logs/band/:band')
  async getLogsByBand(
    @Param('band') band: PricingBand,
    @Query('limit') limit?: string,
  ): Promise<{ logs: unknown[] }> {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const logs = await this.spreadManager.getLogsByBand(band, limitNum);
    return { logs };
  }
}