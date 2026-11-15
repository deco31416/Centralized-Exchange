import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DecoQuoteDto } from '../dto/deco-quote.dto';
import type { AuthPort } from '../ports/auth.port';
import { AUTH_PORT, INTERNAL_TRANSFERS_PORT } from '../ports/port-tokens';
import type { InternalTransfersPort } from '../ports/internal-transfers.port';
import { SendQuoteEntity } from '../../domain/entities/send-quote.entity';
import { SendDestinationType } from '../../domain/enums/send-destination-type.enum';

@Injectable()
export class QuoteDecoUseCase {
  constructor(
    @Inject(AUTH_PORT) private readonly authPort: AuthPort,
    @Inject(INTERNAL_TRANSFERS_PORT)
    private readonly internalTransfersPort: InternalTransfersPort,
  ) {}

  async execute(dto: DecoQuoteDto): Promise<SendQuoteEntity> {
    const user = await this.authPort.validateUser(dto.userId);
    if (!user.valid) throw new UnauthorizedException('Invalid user');

    const quote = await this.internalTransfersPort.quotedeco({
      userId: dto.userId,
      destinationUserId: dto.destinationUserId,
      amount: dto.amount,
      currency: dto.currency,
      sourceWalletId: dto.sourceWalletId,
      reference: dto.reference,
    });

    return new SendQuoteEntity(
      SendDestinationType.DECOX,
      dto.amount,
      dto.currency,
      quote.fee,
      quote.totalDebit,
      null,
      quote.estimatedDelivery,
      undefined,
      {
        destinationUserId: dto.destinationUserId,
        destinationTag: dto.destinationTag,
      },
    );
  }
}