import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { TokensModule } from '../tokens/tokens.module';
import { NetworkDeltasModule } from '../network-deltas/network-deltas.module';
import { PriceBandsModule } from '../price-bands/price-bands.module';

@Module({
    imports: [
        TokensModule,
        NetworkDeltasModule,
        PriceBandsModule,
    ],
    controllers: [PricingController],
    providers: [PricingService],
    exports: [PricingService],
})
export class PricingModule { }
