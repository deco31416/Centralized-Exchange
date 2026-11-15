import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { PepsiTestService } from './pepsi-test.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MongooseModule.forRoot(process.env.LEDGER_URI || 'mongodb://localhost:27017/deco_ledger_core', {
            connectionName: 'ledger_conn'
        })
    ],
    providers: [PepsiTestService],
})
export class AppModule { }
