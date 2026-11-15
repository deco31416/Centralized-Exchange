import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CryptoPriceTicker, CryptoPriceTickerSchema } from '../../pricing/schemas/crypto-price-ticker.schema';
import { PriceConfiguration, PriceConfigurationSchema } from '../../pricing/schemas/price-configuration.schema';
import { StartupHealthService } from './startup-health.service';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: CryptoPriceTicker.name, schema: CryptoPriceTickerSchema },
            { name: PriceConfiguration.name, schema: PriceConfigurationSchema },
        ]),
    ],
    providers: [StartupHealthService],
})
export class StartupHealthModule { }
