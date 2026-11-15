import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DecoExecuteDto } from '../dto/deco-execute.dto';
import type { AuthPort } from '../ports/auth.port';
import type { InternalTransfersPort } from '../ports/internal-transfers.port';
import type { NotificationsPort } from '../ports/notifications.port';
import {
  AUTH_PORT,
  INTERNAL_TRANSFERS_PORT,
  NOTIFICATIONS_PORT,
} from '../ports/port-tokens';
import { SendExecutionEntity } from '../../domain/entities/send-execution.entity';
import { SendDestinationType } from '../../domain/enums/send-destination-type.enum';
import { SendStatus } from '../../domain/enums/send-status.enum';

@Injectable()
export class ExecuteDecoUseCase {
  constructor(
    @Inject(AUTH_PORT) private readonly authPort: AuthPort,
    @Inject(INTERNAL_TRANSFERS_PORT)
    private readonly internalTransfersPort: InternalTransfersPort,
    @Inject(NOTIFICATIONS_PORT)
    private readonly notificationsPort: NotificationsPort,
  ) {}

  async execute(dto: DecoExecuteDto): Promise<SendExecutionEntity> {
    const user = await this.authPort.validateUser(dto.userId);
    if (!user.valid) throw new UnauthorizedException('Invalid user');

    const quote = await this.internalTransfersPort.quotedeco({
      userId: dto.userId,
      destinationUserId: dto.destinationUserId,
      amount: dto.amount,
      currency: dto.currency,
      sourceWalletId: dto.sourceWalletId,
      reference: dto.reference,
      otpCode: dto.otpCode,
    });

    const execution = await this.internalTransfersPort.executedeco({
      userId: dto.userId,
      destinationUserId: dto.destinationUserId,
      amount: dto.amount,
      currency: dto.currency,
      sourceWalletId: dto.sourceWalletId,
      reference: dto.reference,
      otpCode: dto.otpCode,
    });

    await this.notificationsPort.notifyExecution({
      userId: dto.userId,
      operationId: execution.operationId,
      destinationType: SendDestinationType.DECOX,
      amount: dto.amount,
      currency: dto.currency,
      message: execution.message,
    });

    return new SendExecutionEntity(
      SendDestinationType.DECOX,
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
        destinationUserId: dto.destinationUserId,
      },
    );
  }
}