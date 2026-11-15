import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceBand, PriceBandSchema } from './schemas/price-band.schema';
import { CryptoPriceTicker, CryptoPriceTickerSchema } from '../pricing/schemas/crypto-price-ticker.schema';
import { PriceBandsService } from './price-bands.service';
import { PriceBandsController } from './price-bands.controller';
import { EntropyEngineService } from './entropy-engine.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PriceBand.name, schema: PriceBandSchema },
            { name: CryptoPriceTicker.name, schema: CryptoPriceTickerSchema },
        ]),
    ],
    controllers: [PriceBandsController],
    providers: [PriceBandsService, EntropyEngineService],
    exports: [PriceBandsService],
})
export class PriceBandsModule { }
