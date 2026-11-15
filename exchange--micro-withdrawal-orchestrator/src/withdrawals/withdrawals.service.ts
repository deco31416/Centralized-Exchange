import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Withdrawal,
    WithdrawalDocument,
    WithdrawalStatus,
} from './schemas/withdrawal.schema';
import { AuthPolicyService } from '../policy/auth-policy.service';

@Injectable()
export class WithdrawalsService {
    private readonly logger = new Logger(WithdrawalsService.name);

    constructor(
        @InjectModel(Withdrawal.name) private withdrawalModel: Model<WithdrawalDocument>,
        private readonly authPolicyService: AuthPolicyService,
    ) { }

    async requestWithdrawal(userId: string, _asset: string, _amount: string, _dest: string): Promise<never> {
        await this.authPolicyService.assertWithdrawalsAllowed(userId);
        throw new NotImplementedException(
            'Withdrawals are disabled in this prototype until risk checks, ledger reservation, and custody execution are implemented.',
        );
    }

    // Do not treat legacy pending requests as reserved: this prototype has no ledger integration.
    async processPending() {
        const pending = await this.withdrawalModel
            .find({ status: WithdrawalStatus.REQUESTED })
            .limit(10);

        for (const w of pending) {
            w.status = WithdrawalStatus.FAILED;
            w.errorReason =
                'Not processed: risk checks, ledger reservation, and custody execution are not implemented; no funds were moved.';
            await w.save();
            this.logger.warn(`Rejected unimplemented withdrawal ${w.withdrawalId}; no funds were moved.`);
        }
    }
}
