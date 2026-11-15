import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { KycRiskClientService } from './limits-policy/kyc-risk-client.service';
import { LimitsPolicyController } from './limits-policy/limits-policy.controller';
import { LimitsPolicyService } from './limits-policy/limits-policy.service';
import {
  LimitPolicyRuleEntity,
  LimitPolicyRuleSchema,
} from './limits-policy/schemas/limit-policy-rule.schema';
import {
  LimitPolicyChangeEntity,
  LimitPolicyChangeSchema,
} from './limits-policy/schemas/limit-policy-change.schema';
import {
  LimitPolicyChangeRequestEntity,
  LimitPolicyChangeRequestSchema,
} from './limits-policy/schemas/limit-policy-change-request.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        retryAttempts: 3,
        retryDelay: 1000,
      }),
    }),
    MongooseModule.forFeature([
      { name: LimitPolicyRuleEntity.name, schema: LimitPolicyRuleSchema },
      { name: LimitPolicyChangeEntity.name, schema: LimitPolicyChangeSchema },
      {
        name: LimitPolicyChangeRequestEntity.name,
        schema: LimitPolicyChangeRequestSchema,
      },
    ]),
  ],
  controllers: [HealthController, LimitsPolicyController],
  providers: [LimitsPolicyService, KycRiskClientService],
})
export class AppModule {}
