import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [PricesController],
    providers: [PricesService],
    exports: [PricesService], // Exportar para que QuotesModule lo pueda usar también
})
export class PricesModule {}
