import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { FeesModule } from './fees/fees.module';
import { QuotesModule } from './quotes/quotes.module';
import { PricesModule } from './prices/prices.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
        MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/deco_fee_aggregator'),
        FeesModule,
        QuotesModule,
        PricesModule,
        DashboardModule,
        HealthModule,
    ],
})
export class AppModule { }
