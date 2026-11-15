import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { KycRiskController } from './kyc-risk/kyc-risk.controller';
import { KycRiskService } from './kyc-risk/kyc-risk.service';
import { KycRiskCaseEntity, KycRiskCaseSchema } from './kyc-risk/schemas/kyc-risk-case.schema';
import { KycRiskRuleEntity, KycRiskRuleSchema } from './kyc-risk/schemas/kyc-risk-rule.schema';
import { UserRiskProfileEntity, UserRiskProfileSchema } from './kyc-risk/schemas/user-risk-profile.schema';

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
      { name: KycRiskCaseEntity.name, schema: KycRiskCaseSchema },
      { name: KycRiskRuleEntity.name, schema: KycRiskRuleSchema },
      { name: UserRiskProfileEntity.name, schema: UserRiskProfileSchema },
    ]),
  ],
  controllers: [HealthController, KycRiskController],
  providers: [KycRiskService],
})
export class AppModule {}
