import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { SendFacadeService } from '../services/send-facade.service';
import { SendQueryService } from '../services/send-query.service';
import { BeneficiaryService } from '../services/beneficiary.service';
import { DecoQuoteDto } from '../../application/dto/deco-quote.dto';
import { DecoExecuteDto } from '../../application/dto/deco-execute.dto';
import { BankQuoteDto } from '../../application/dto/bank-quote.dto';
import { BankExecuteDto } from '../../application/dto/bank-execute.dto';
import { SpeiQuoteDto } from '../../application/dto/spei-quote.dto';
import { SpeiExecuteDto } from '../../application/dto/spei-execute.dto';
import { WalletQuoteDto } from '../../application/dto/wallet-quote.dto';
import { WalletExecuteDto } from '../../application/dto/wallet-execute.dto';
import { CreateSpeiBeneficiaryDto } from '../../application/dto/create-spei-beneficiary.dto';
import { CreateBankBeneficiaryDto } from '../../application/dto/create-bank-beneficiary.dto';

@Controller('send')
export class SendController {
  constructor(
    private readonly sendFacadeService: SendFacadeService,
    private readonly sendQueryService: SendQueryService,
    private readonly beneficiaryService: BeneficiaryService,
  ) {}

  // ── Query endpoints ──────────────────────────────────────────

  @Get('wallet/source')
  getWalletSource(@Headers('x-user-id') userId: string) {
    return this.sendQueryService.getWalletSource(userId);
  }

  @Get('wallet/destinations')
  getWalletDestinations(@Headers('x-user-id') userId: string) {
    return this.sendQueryService.getWalletDestinations(userId);
  }

  @Get('bank/accounts')
  getBankAccounts(@Headers('x-user-id') userId: string) {
    return this.sendQueryService.getBankAccounts(userId);
  }

  @Post('bank/accounts/search')
  searchBankAccounts(
    @Headers('x-user-id') userId: string,
    @Body() body: { query: string },
  ) {
    return this.sendQueryService.searchBankAccounts(userId, body.query);
  }

  @Get('spei/accounts')
  getSpeiAccounts(@Headers('x-user-id') userId: string) {
    return this.sendQueryService.getSpeiAccounts(userId);
  }

  @Post('spei/accounts')
  createSpeiAccount(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateSpeiBeneficiaryDto,
  ) {
    return this.beneficiaryService.createSpeiBeneficiary(userId, dto);
  }

  @Delete('spei/accounts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSpeiAccount(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.beneficiaryService.deleteBeneficiary(userId, id);
  }

  @Post('bank/accounts')
  createBankAccount(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateBankBeneficiaryDto,
  ) {
    return this.beneficiaryService.createBankBeneficiary(userId, dto);
  }

  @Delete('bank/accounts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBankAccount(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.beneficiaryService.deleteBeneficiary(userId, id);
  }

  @Get('DECOX/users')
  getdecoUsers(@Headers('x-user-id') userId: string) {
    return this.sendQueryService.getdecoUsers(userId);
  }

  @Post('DECOX/users/search')
  searchdecoUsers(
    @Headers('x-user-id') userId: string,
    @Body() body: { query: string },
  ) {
    return this.sendQueryService.searchdecoUsers(userId, body.query);
  }

  // ── Mutation endpoints ───────────────────────────────────────

  @Post('DECOX/quote')
  quotedeco(@Body() dto: DecoQuoteDto) {
    return this.sendFacadeService.quotedeco(dto);
  }

  @Post('DECOX/execute')
  executedeco(@Body() dto: DecoExecuteDto) {
    return this.sendFacadeService.executedeco(dto);
  }

  @Post('bank/quote')
  quoteBank(@Body() dto: BankQuoteDto) {
    return this.sendFacadeService.quoteBank(dto);
  }

  @Post('bank/execute')
  executeBank(@Body() dto: BankExecuteDto) {
    return this.sendFacadeService.executeBank(dto);
  }

  @Post('spei/quote')
  quoteSpei(@Body() dto: SpeiQuoteDto) {
    return this.sendFacadeService.quoteSpei(dto);
  }

  @Post('spei/execute')
  executeSpei(@Body() dto: SpeiExecuteDto) {
    return this.sendFacadeService.executeSpei(dto);
  }

  @Post('wallet/quote')
  quoteWallet(@Body() dto: WalletQuoteDto) {
    return this.sendFacadeService.quoteWallet(dto);
  }

  @Post('wallet/execute')
  executeWallet(@Body() dto: WalletExecuteDto) {
    return this.sendFacadeService.executeWallet(dto);
  }
}