import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class PepsiTestService {
    private readonly logger = new Logger(PepsiTestService.name);

    constructor(
        @InjectConnection('ledger_conn') private ledgerConnection: Connection
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async runPepsiTest() {
        this.logger.log('🧪 Running Pepsi Test (Total Assets vs Total Liabilities)...');

        // 1. Calculate Total User Liabilities (What we owe)
        // Aggregation on Ledger: Sum(Entries where account_type = USER)
        const liabilities = await this.calculateTotalLiabilities();

        // 2. Calculate Total System Assets (What we have)
        // Query Crypto Nodes + Bank APIs
        const assets = await this.calculateTotalAssets();

        const ratio = assets / liabilities;
        this.logger.log(`Solvency Ratio: ${ratio.toFixed(4)}`);

        if (ratio < 1.0) {
            this.logger.error('🚨 INSOLVENCY DETECTED! TRIGGERING KILL SWITCH!');
            // await this.triggerKillSwitch();
        }
    }

    private async calculateTotalLiabilities(): Promise<number> {
        // Mock
        return 1000000;
    }

    private async calculateTotalAssets(): Promise<number> {
        // Mock
        return 1000000;
    }
}
