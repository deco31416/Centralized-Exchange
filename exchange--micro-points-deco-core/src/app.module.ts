import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { PointsDecoController } from './points-deco/points-deco.controller';
import { PointsDecoCashService } from './points-deco/points-deco-cash.service';
import { PointsDecoCustodySettlementService } from './points-deco/points-deco-custody-settlement.service';
import { PointsDecoDisputeService } from './points-deco/points-deco-dispute.service';
import { PointsDecoEconomicActionService } from './points-deco/points-deco-economic-action.service';
import { PointsDecoFiatAuditService } from './points-deco/points-deco-fiat-audit.service';
import { PointsDecoLedgerService } from './points-deco/points-deco-ledger.service';
import { PointsDecoLimitsPolicyService } from './points-deco/points-deco-limits-policy.service';
import { PointsDecoOrderOperationsService } from './points-deco/points-deco-order-operations.service';
import { PointsDecoOrderStateService } from './points-deco/points-deco-order-state.service';
import { PointsDecoPricingService } from './points-deco/points-deco-pricing.service';
import { PointsDecoReportService } from './points-deco/points-deco-report.service';
import { PointsDecoReceiptPdfService } from './points-deco/points-deco-receipt-pdf.service';
import { PointsDecoReceiptService } from './points-deco/points-deco-receipt.service';
import { PointsDecoSecureFormService } from './points-deco/points-deco-secure-form.service';
import { PointsDecoSettlementService } from './points-deco/points-deco-settlement.service';
import { PointsDecoService } from './points-deco/points-deco.service';
import {
  DecoPointEntity,
  DecoPointSchema,
} from './points-deco/schemas/deco-point.schema';
import {
  PointDisputeEntity,
  PointDisputeSchema,
} from './points-deco/schemas/point-dispute.schema';
import {
  PointEconomicActionEntity,
  PointEconomicActionSchema,
} from './points-deco/schemas/point-economic-action.schema';
import {
  PointCashMovementEntity,
  PointCashMovementSchema,
} from './points-deco/schemas/point-cash-movement.schema';
import {
  PointCashPositionEntity,
  PointCashPositionSchema,
} from './points-deco/schemas/point-cash-position.schema';
import {
  PointOrderEntity,
  PointOrderSchema,
} from './points-deco/schemas/point-order.schema';
import {
  PointSettlementEntity,
  PointSettlementSchema,
} from './points-deco/schemas/point-settlement.schema';
import {
  PointSecureFormEntity,
  PointSecureFormSchema,
} from './points-deco/schemas/point-secure-form.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ??
          'mongodb://localhost:27017/deco-exchange-dev',
        retryAttempts: 3,
        retryDelay: 1000,
      }),
    }),
    MongooseModule.forFeature([
      { name: DecoPointEntity.name, schema: DecoPointSchema },
      { name: PointOrderEntity.name, schema: PointOrderSchema },
      { name: PointDisputeEntity.name, schema: PointDisputeSchema },
      { name: PointEconomicActionEntity.name, schema: PointEconomicActionSchema },
      { name: PointCashPositionEntity.name, schema: PointCashPositionSchema },
      { name: PointCashMovementEntity.name, schema: PointCashMovementSchema },
      { name: PointSettlementEntity.name, schema: PointSettlementSchema },
      { name: PointSecureFormEntity.name, schema: PointSecureFormSchema },
    ]),
  ],
  controllers: [HealthController, PointsDecoController],
  providers: [
    PointsDecoService,
    PointsDecoCashService,
    PointsDecoCustodySettlementService,
    PointsDecoDisputeService,
    PointsDecoEconomicActionService,
    PointsDecoFiatAuditService,
    PointsDecoLedgerService,
    PointsDecoLimitsPolicyService,
    PointsDecoOrderOperationsService,
    PointsDecoOrderStateService,
    PointsDecoPricingService,
    PointsDecoReportService,
    PointsDecoReceiptPdfService,
    PointsDecoReceiptService,
    PointsDecoSecureFormService,
    PointsDecoSettlementService,
  ],
})
export class AppModule {}
