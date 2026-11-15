import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CustomToken, CustomTokenSchema } from '../../tokens/schemas/custom-token.schema';
import { CustomTokenTicker, CustomTokenTickerSchema } from '../../tokens/schemas/custom-token-ticker.schema';
import { StartupHealthService } from './startup-health.service';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: CustomToken.name, schema: CustomTokenSchema },
            { name: CustomTokenTicker.name, schema: CustomTokenTickerSchema },
        ]),
    ],
    providers: [StartupHealthService],
})
export class StartupHealthModule { }
