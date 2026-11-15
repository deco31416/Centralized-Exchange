import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { LoansController } from './controllers/loans.controller';
import { LoansService } from './services/loans.service';
import { NotificationsClientService } from './services/notifications-client.service';
import { Loan, LoanSchema } from './schemas/loan.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Loan.name, schema: LoanSchema }]),
  ],
  controllers: [LoansController],
  providers: [LoansService, NotificationsClientService],
  exports: [LoansService],
})
export class LoansModule {}