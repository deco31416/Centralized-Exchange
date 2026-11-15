import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CryptoPriceTicker, CryptoPriceTickerSchema } from './schemas/crypto-price-ticker.schema';
import { PriceConfiguration, PriceConfigurationSchema } from './schemas/price-configuration.schema';
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
            { name: CryptoPriceTicker.name, schema: CryptoPriceTickerSchema },
            { name: PriceConfiguration.name, schema: PriceConfigurationSchema },
        ]),
    ],
    controllers: [PricingController],
    providers: [PricingService, RegistrySyncService],
    exports: [PricingService],
})
export class PricingModule { }
