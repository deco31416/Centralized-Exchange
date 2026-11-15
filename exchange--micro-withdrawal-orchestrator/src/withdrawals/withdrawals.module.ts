import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { WithdrawalsService } from './withdrawals.service';
import { Withdrawal, WithdrawalSchema } from './schemas/withdrawal.schema';
import { AuthPolicyService } from '../policy/auth-policy.service';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([{ name: Withdrawal.name, schema: WithdrawalSchema }])
    ],
    providers: [WithdrawalsService, AuthPolicyService],
    exports: [WithdrawalsService]
})
export class WithdrawalsModule { }
