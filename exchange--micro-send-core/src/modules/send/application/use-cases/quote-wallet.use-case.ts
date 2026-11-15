import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { WalletQuoteDto } from '../dto/wallet-quote.dto';
import type { AuthPort } from '../ports/auth.port';
import type { InternalTransfersPort } from '../ports/internal-transfers.port';
import { AUTH_PORT, INTERNAL_TRANSFERS_PORT } from '../ports/port-tokens';
import { SendQuoteEntity } from '../../domain/entities/send-quote.entity';
import { SendDestinationType } from '../../domain/enums/send-destination-type.enum';

@Injectable()
export class QuoteWalletUseCase {
  constructor(
    @Inject(AUTH_PORT) private readonly authPort: AuthPort,
    @Inject(INTERNAL_TRANSFERS_PORT)
    private readonly internalTransfersPort: InternalTransfersPort,
  ) {}

  async execute(dto: WalletQuoteDto): Promise<SendQuoteEntity> {
    const user = await this.authPort.validateUser(dto.userId);
    if (!user.valid) throw new UnauthorizedException('Invalid user');

    const quote = await this.internalTransfersPort.quoteWallet({
      userId: dto.userId,
      destinationWalletId: dto.destinationWalletId,
      amount: dto.amount,
      currency: dto.currency,
      sourceWalletId: dto.sourceWalletId,
      reference: dto.reference,
    });

    return new SendQuoteEntity(
      SendDestinationType.WALLET,
      dto.amount,
      dto.currency,
      quote.fee,
      quote.totalDebit,
      null,
      quote.estimatedDelivery,
      undefined,
      {
        destinationWalletId: dto.destinationWalletId,
      },
    );
  }
}