import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { BankExecuteDto } from '../dto/bank-execute.dto';
import type { AuthPort } from '../ports/auth.port';
import type { CustodyFiatPort } from '../ports/custody-fiat.port';
import type { NotificationsPort } from '../ports/notifications.port';
import {
  AUTH_PORT,
  CUSTODY_FIAT_PORT,
  NOTIFICATIONS_PORT,
} from '../ports/port-tokens';
import { SendExecutionEntity } from '../../domain/entities/send-execution.entity';
import { SendDestinationType } from '../../domain/enums/send-destination-type.enum';
import { SendStatus } from '../../domain/enums/send-status.enum';

@Injectable()
export class ExecuteBankUseCase {
  constructor(
    @Inject(AUTH_PORT) private readonly authPort: AuthPort,
    @Inject(CUSTODY_FIAT_PORT) private readonly custodyFiatPort: CustodyFiatPort,
    @Inject(NOTIFICATIONS_PORT)
    private readonly notificationsPort: NotificationsPort,
  ) {}

  async execute(dto: BankExecuteDto): Promise<SendExecutionEntity> {
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
      otpCode: dto.otpCode,
    });

    const execution = await this.custodyFiatPort.executeBank({
      userId: dto.userId,
      bankCode: dto.bankCode,
      accountNumber: dto.accountNumber,
      beneficiaryName: dto.beneficiaryName,
      accountType: dto.accountType,
      amount: dto.amount,
      currency: dto.currency,
      sourceWalletId: dto.sourceWalletId,
      reference: dto.reference,
      otpCode: dto.otpCode,
    });

    await this.notificationsPort.notifyExecution({
      userId: dto.userId,
      operationId: execution.operationId,
      destinationType: SendDestinationType.BANK,
      amount: dto.amount,
      currency: dto.currency,
      message: execution.message,
    });

    return new SendExecutionEntity(
      SendDestinationType.BANK,
      execution.operationId,
      SendStatus.EXECUTED,
      dto.amount,
      dto.currency,
      quote.fee,
      quote.totalDebit,
      execution.executedAt,
      execution.providerReference,
      execution.message,
      {
        bankCode: dto.bankCode,
        accountNumber: dto.accountNumber,
      },
    );
  }
}