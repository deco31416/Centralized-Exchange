import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceBand, PriceBandSchema } from './schemas/price-band.schema';
import { FiatRateTicker, FiatRateTickerSchema } from '../pricing/schemas/fiat-rate-ticker.schema';
import { PriceBandsService } from './price-bands.service';
import { PriceBandsController } from './price-bands.controller';
import { EntropyEngineService } from './entropy-engine.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PriceBand.name, schema: PriceBandSchema },
            { name: FiatRateTicker.name, schema: FiatRateTickerSchema },
        ]),
    ],
    controllers: [PriceBandsController],
    providers: [PriceBandsService, EntropyEngineService],
    exports: [PriceBandsService],
})
export class PriceBandsModule { }
