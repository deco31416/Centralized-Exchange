import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SwapRequest, SwapRequestSchema } from './models/swap-request.schema';
import { SwapLimit, SwapLimitSchema } from './models/swap-limit.schema';
import {
  PlatformReserve,
  PlatformReserveSchema,
} from './models/platform-reserve.schema';
import { SwapExecutionService } from './services/swap-execution.service';
import { SwapValidationService } from './services/swap-validation.service';
import { SwapCalculationService } from './services/swap-calculation.service';
import { PlatformReservesService } from './services/platform-reserves.service';
import { SwapController } from './controllers/swap.controller';
import { LedgerModule } from '../ledger/ledger.module';
import { PricingModule } from '../pricing/pricing.module';

/**
 * Swap module providing platform-to-user instant swaps.
 * Manages swap execution, validation, reserves, and limits.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SwapRequest.name, schema: SwapRequestSchema },
      { name: SwapLimit.name, schema: SwapLimitSchema },
      { name: PlatformReserve.name, schema: PlatformReserveSchema },
    ]),
    LedgerModule,
    PricingModule,
  ],
  controllers: [SwapController],
  providers: [
    SwapExecutionService,
    SwapValidationService,
    SwapCalculationService,
    PlatformReservesService,
  ],
  exports: [
    SwapExecutionService,
    SwapValidationService,
    SwapCalculationService,
    PlatformReservesService,
  ],
})
export class SwapModule {}
