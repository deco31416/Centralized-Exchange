import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { FiatRateTicker, FiatRateTickerSchema } from '../../pricing/schemas/fiat-rate-ticker.schema';
import { FiatPairConfiguration, FiatPairConfigurationSchema } from '../../pricing/schemas/fiat-pair-configuration.schema';
import { PriceBand, PriceBandSchema } from '../../price-bands/schemas/price-band.schema';
import { StartupHealthService } from './startup-health.service';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: FiatRateTicker.name, schema: FiatRateTickerSchema },
            { name: FiatPairConfiguration.name, schema: FiatPairConfigurationSchema },
            { name: PriceBand.name, schema: PriceBandSchema },
        ]),
    ],
    providers: [StartupHealthService],
})
export class StartupHealthModule { }
