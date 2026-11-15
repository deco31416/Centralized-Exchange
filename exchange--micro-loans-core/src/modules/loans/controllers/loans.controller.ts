import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { AcceptContractDto } from '../dtos/accept-contract.dto';
import { CreateLoanApplicationDto } from '../dtos/create-loan-application.dto';
import { RegisterLoanPaymentDto } from '../dtos/register-loan-payment.dto';
import { SimulateLoanDto } from '../dtos/simulate-loan.dto';
import { LoansService } from '../services/loans.service';

@Controller('internal/loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get('health')
  health() {
    return this.loansService.health();
  }

  @Get('profile')
  getProfile(@Headers('x-user-id') userId?: string) {
    return this.loansService.getProfile(userId);
  }

  @Post('simulate')
  simulateLoan(@Body() body: SimulateLoanDto) {
    return this.loansService.simulateLoan(body);
  }

  @Post('applications')
  createApplication(
    @Headers('x-user-id') userId: string | undefined,
    @Body() body: CreateLoanApplicationDto,
  ) {
    return this.loansService.createApplication(userId, body);
  }

  @Post('contracts/:id/accept')
  acceptContract(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') id: string,
    @Body() body: AcceptContractDto,
  ) {
    return this.loansService.acceptContract(userId, id, body);
  }

  @Get()
  getLoans(@Headers('x-user-id') userId?: string) {
    return this.loansService.getLoans(userId);
  }

  @Get(':id')
  getLoanById(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.loansService.getLoanById(userId, id);
  }

  @Get(':id/schedule')
  getLoanSchedule(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.loansService.getLoanSchedule(userId, id);
  }

  @Post(':id/payments')
  registerPayment(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') id: string,
    @Body() body: RegisterLoanPaymentDto,
  ) {
    return this.loansService.registerPayment(userId, id, body);
  }
}