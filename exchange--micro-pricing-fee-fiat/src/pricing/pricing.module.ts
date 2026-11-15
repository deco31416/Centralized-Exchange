import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FiatRateTicker, FiatRateTickerSchema } from './schemas/fiat-rate-ticker.schema';
import { FiatPairConfiguration, FiatPairConfigurationSchema } from './schemas/fiat-pair-configuration.schema';
import { HttpModule } from '@nestjs/axios';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { RegistrySyncService } from './registry-sync.service';
import { NetworkDeltasModule } from '../network-deltas/network-deltas.module';
import { PriceBandsModule } from '../price-bands/price-bands.module';
import { ApiTrackerModule } from '../shared/api-tracker/api-tracker.module';

@Module({
    imports: [
        HttpModule,
        NetworkDeltasModule,
        PriceBandsModule,
        ApiTrackerModule,
        MongooseModule.forFeature([
            { name: FiatRateTicker.name, schema: FiatRateTickerSchema },
            { name: FiatPairConfiguration.name, schema: FiatPairConfigurationSchema },
        ]),
    ],
    controllers: [PricingController],
    providers: [PricingService, RegistrySyncService],
    exports: [PricingService],
})
export class PricingModule { }
