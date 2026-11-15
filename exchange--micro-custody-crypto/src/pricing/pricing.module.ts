import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceProvider, PriceProviderSchema } from './models/price-provider.schema';
import { ExchangeRate, ExchangeRateSchema } from './models/exchange-rate.schema';
import { PricingConfiguration, PricingConfigurationSchema } from './models/pricing-configuration.schema';
import { PricingBandLog, PricingBandLogSchema } from './models/pricing-band-log.schema';
import { PriceOracleService } from './services/price-oracle.service';
import { SpreadManagerService } from './services/spread-manager.service';
import { PricingConfigurationService } from './services/pricing-configuration.service';
import { ComplianceService } from './services/compliance.service';
import { PricingController } from './controllers/pricing.controller';

/**
 * Pricing module providing dynamic pricing with legal compliance bands.
 * Manages exchange rates, spreads, and regulatory compliance.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PriceProvider.name, schema: PriceProviderSchema },
      { name: ExchangeRate.name, schema: ExchangeRateSchema },
      { name: PricingConfiguration.name, schema: PricingConfigurationSchema },
      { name: PricingBandLog.name, schema: PricingBandLogSchema },
    ]),
  ],
  controllers: [PricingController],
  providers: [
    PriceOracleService,
    SpreadManagerService,
    PricingConfigurationService,
    ComplianceService,
  ],
  exports: [
    PriceOracleService,
    SpreadManagerService,
    PricingConfigurationService,
    ComplianceService,
  ],
})
export class PricingModule {}