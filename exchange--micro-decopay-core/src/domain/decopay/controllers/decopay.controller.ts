import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DECOPAYService } from '../services/decopay.service';
import { CreateDECOPAYRequestDto } from '../dto/create-decopay-request.dto';
import { PayDECOPAYDto } from '../dto/pay-decopay.dto';
import { CancelDECOPAYDto } from '../dto/cancel-decopay.dto';
import { QueryDECOPAYDto } from '../dto/query-decopay.dto';
import { RequestDECOPAYOtpDto } from '../dto/request-decopay-otp.dto';

@Controller('DECOPAY')
export class DECOPAYController {
  constructor(private readonly DECOPAYService: DECOPAYService) {}

  @Post('requests')
  createRequest(@Body() dto: CreateDECOPAYRequestDto) {
    return this.DECOPAYService.createRequest(dto);
  }

  @Get('requests')
  getRequests(@Query() query: QueryDECOPAYDto) {
    return this.DECOPAYService.getRequests(query);
  }

  @Get('requests/:id')
  getRequestDetail(@Param('id') id: string) {
    return this.DECOPAYService.getRequestDetail(id);
  }

  @Post('pay/request-otp')
  requestOtp(@Body() dto: RequestDECOPAYOtpDto) {
    return this.DECOPAYService.requestOtp(dto);
  }

  @Post('pay')
  pay(@Body() dto: PayDECOPAYDto) {
    return this.DECOPAYService.pay(dto);
  }

  @Patch('cancel')
  cancel(@Body() dto: CancelDECOPAYDto) {
    return this.DECOPAYService.cancel(dto);
  }
}
