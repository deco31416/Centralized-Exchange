import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { BankQuoteDto } from '../dto/bank-quote.dto';
import type { AuthPort } from '../ports/auth.port';
import type { CustodyFiatPort } from '../ports/custody-fiat.port';
import { AUTH_PORT, CUSTODY_FIAT_PORT } from '../ports/port-tokens';
import { SendQuoteEntity } from '../../domain/entities/send-quote.entity';
import { SendDestinationType } from '../../domain/enums/send-destination-type.enum';

@Injectable()
export class QuoteBankUseCase {
  constructor(
    @Inject(AUTH_PORT) private readonly authPort: AuthPort,
    @Inject(CUSTODY_FIAT_PORT) private readonly custodyFiatPort: CustodyFiatPort,
  ) {}

  async execute(dto: BankQuoteDto): Promise<SendQuoteEntity> {
    const user = await this.authPort.validateUser(dto.userId);
    if (!user.valid) throw new UnauthorizedException('Invalid user');

    const quote = await this.custodyFiatPort.quoteBank({
      userId: dto.userId,
      bankCode: dto.bankCode,
      accountNumber: dto.accountNumber,
      beneficiaryName: dto.beneficiaryName,
      accountType: dto.accountType,
      amount: dto.amount,
      currency: dto.currency,
      sourceWalletId: dto.sourceWalletId,
      reference: dto.reference,
    });

    return new SendQuoteEntity(
      SendDestinationType.BANK,
      dto.amount,
      dto.currency,
      quote.fee,
      quote.totalDebit,
      null,
      quote.estimatedDelivery,
      undefined,
      {
        bankCode: dto.bankCode,
        accountNumber: dto.accountNumber,
        beneficiaryName: dto.beneficiaryName,
        accountType: dto.accountType,
      },
    );
  }
}