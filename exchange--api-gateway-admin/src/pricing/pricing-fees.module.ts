import { Module } from '@nestjs/common';
import { ProxyModule } from '../proxy/proxy.module';
import { PricingFeesController } from './pricing-fees.controller';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';

@Module({
  imports: [ProxyModule],
  controllers: [PricingFeesController],
  providers: [AdminJwtGuard],
})
export class PricingFeesModule {}
