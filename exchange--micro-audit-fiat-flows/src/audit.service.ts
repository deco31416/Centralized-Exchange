import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class FiatAuditService {
    private readonly logger = new Logger(FiatAuditService.name);

    constructor(
        @InjectConnection('ledger_conn') private ledgerConnection: Connection
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async auditPendingDeposits() {
        this.logger.log('🕵️ checking pending fiat deposits vs provider...');
        // Logic: 
        // 1. Get all PENDING fiat deposits from ledger_txs
        // 2. Query Stripe/Bank API
        // 3. If Settled in Bank but Pending in Ledger > 1h -> ALARM
    }
}
