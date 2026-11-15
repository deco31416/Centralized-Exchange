import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FundingController } from './funding.controller';

@Module({
  imports: [HttpModule],
  controllers: [FundingController],
})
export class FundingModule {}