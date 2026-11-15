import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SavingsService } from './savings.service';
import { CreateSavingDto } from './dto/create-saving.dto';
import { ContributeSavingDto } from './dto/contribute-saving.dto';
import { WithdrawSavingDto } from './dto/withdraw-saving.dto';
import { SavingsQueryDto } from './dto/savings-query.dto';
import { SavingsProjectionDto } from './dto/savings-projection.dto';
import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';

@Controller('savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Get('health-internal')
  @UseGuards(InternalAuthGuard)
  getInternalHealth() {
    return this.savingsService.getInternalHealth();
  }

  @Get()
  findAll(@Query() query: SavingsQueryDto) {
    return this.savingsService.findAll(query);
  }

  @Get('summary')
  getSummary(@Query('userId') userId?: string) {
    return this.savingsService.getSummary(userId);
  }

  @Get(':savingId')
  getById(@Param('savingId') savingId: string) {
    return this.savingsService.getById(savingId);
  }

  @Get(':savingId/history')
  getHistory(@Param('savingId') savingId: string) {
    return this.savingsService.getHistory(savingId);
  }

  @Post('projection')
  project(@Body() payload: SavingsProjectionDto) {
    return this.savingsService.project(payload);
  }

  @Post('create')
  create(@Body() payload: CreateSavingDto) {
    return this.savingsService.create(payload);
  }

  @Post('contribute')
  contribute(@Body() payload: ContributeSavingDto) {
    return this.savingsService.contribute(payload);
  }

  @Post('withdraw')
  withdraw(@Body() payload: WithdrawSavingDto) {
    return this.savingsService.withdraw(payload);
  }
}