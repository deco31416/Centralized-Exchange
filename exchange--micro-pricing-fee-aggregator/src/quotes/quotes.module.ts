import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quote, QuoteSchema } from './schemas/quote.schema';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { FeesModule } from '../fees/fees.module';
import { PricesModule } from '../prices/prices.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Quote.name, schema: QuoteSchema }]),
        FeesModule,
        PricesModule,
    ],
    controllers: [QuotesController],
    providers: [QuotesService],
})
export class QuotesModule { }
