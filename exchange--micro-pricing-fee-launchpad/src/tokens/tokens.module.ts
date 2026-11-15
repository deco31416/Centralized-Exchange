import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CustomToken, CustomTokenSchema } from './schemas/custom-token.schema';
import { CustomTokenTicker, CustomTokenTickerSchema } from './schemas/custom-token-ticker.schema';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { SimulationEngineService } from './simulation-engine.service';
import { PegSyncService } from './peg-sync.service';

@Module({
    imports: [
        HttpModule,
        ConfigModule,
        MongooseModule.forFeature([
            { name: CustomToken.name, schema: CustomTokenSchema },
            { name: CustomTokenTicker.name, schema: CustomTokenTickerSchema },
        ]),
    ],
    controllers: [TokensController],
    providers: [TokensService, SimulationEngineService, PegSyncService],
    exports: [TokensService],
})
export class TokensModule { }
