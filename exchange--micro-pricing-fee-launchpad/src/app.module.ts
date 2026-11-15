import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';
import { TokensModule } from './tokens/tokens.module';
import { PricingModule } from './pricing/pricing.module';
import { NetworkDeltasModule } from './network-deltas/network-deltas.module';
import { PriceBandsModule } from './price-bands/price-bands.module';
import { ApiTrackerModule } from './shared/api-tracker/api-tracker.module';
import { StartupHealthModule } from './shared/startup/startup-health.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
            }),
        }),
        ScheduleModule.forRoot(),
        HealthModule,
        TokensModule,
        PricingModule,
        NetworkDeltasModule,
        PriceBandsModule,
        ApiTrackerModule,
        StartupHealthModule,
        DashboardModule,
    ],
})
export class AppModule { }
