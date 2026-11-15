import { Global, Module } from '@nestjs/common';
import { PricingClientService } from './pricing-client.service';

@Global()
@Module({
  providers: [PricingClientService],
  exports: [PricingClientService],
})
export class PricingClientModule {}
