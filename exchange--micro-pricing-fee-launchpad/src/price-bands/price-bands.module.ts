import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceBand, PriceBandSchema } from './schemas/price-band.schema';
import { CustomTokenTicker, CustomTokenTickerSchema } from '../tokens/schemas/custom-token-ticker.schema';
import { CustomToken, CustomTokenSchema } from '../tokens/schemas/custom-token.schema';
import { PriceBandsService } from './price-bands.service';
import { PriceBandsController } from './price-bands.controller';
import { EntropyEngineService } from './entropy-engine.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PriceBand.name, schema: PriceBandSchema },
            { name: CustomTokenTicker.name, schema: CustomTokenTickerSchema },
            { name: CustomToken.name, schema: CustomTokenSchema },
        ]),
    ],
    controllers: [PriceBandsController],
    providers: [PriceBandsService, EntropyEngineService],
    exports: [PriceBandsService],
})
export class PriceBandsModule { }
