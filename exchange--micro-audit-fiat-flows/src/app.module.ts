import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { FiatAuditService } from './audit.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/deco_audit_fiat'),
        // Connect to Ledger Core DB as Read-Only ideally
        MongooseModule.forRoot(process.env.LEDGER_URI || 'mongodb://localhost:27017/deco_ledger_core', {
            connectionName: 'ledger_conn'
        })
    ],
    providers: [FiatAuditService],
})
export class AppModule { }
