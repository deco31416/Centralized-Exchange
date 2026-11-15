import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';
import { ConfirmRedeemDto } from './dto/confirm-redeem.dto';
import { GetQuoteDto } from './dto/get-quote.dto';
import { PreviewRedeemDto } from './dto/preview-redeem.dto';
import { RedeemQueryDto } from './dto/redeem-query.dto';
import { RedeemService } from './redeem.service';

@Controller('redeem')
export class RedeemController {
  constructor(private readonly redeemService: RedeemService) {}

  @Get('health-internal')
  @UseGuards(InternalAuthGuard)
  getInternalHealth() {
    return this.redeemService.getInternalHealth();
  }

  @Get()
  findAll(@Query() query: RedeemQueryDto) {
    return this.redeemService.findAll(query);
  }

  @Post('quote')
  getQuote(@Body() payload: GetQuoteDto) {
    return this.redeemService.getQuote(payload);
  }

  @Post('preview')
  preview(@Body() payload: PreviewRedeemDto) {
    return this.redeemService.preview(payload);
  }

  @Post('confirm')
  confirm(@Body() payload: ConfirmRedeemDto) {
    return this.redeemService.confirm(payload);
  }
}