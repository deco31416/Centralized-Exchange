import {
  Inject,
  Injectable,
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PAYMENT_GATEWAY_PORT, WALLET_LEDGER_PORT } from '../tokens';
import type {
  ConfirmFundingPayload,
  PaymentGatewayPort,
} from '../ports/payment-gateway.port';
import type { WalletLedgerPort } from '../ports/wallet-ledger.port';
import type { FundingConfirmationEntity } from '../../domain/entities/funding-confirmation.entity';

@Injectable()
export class ConfirmFundingUseCase {
  constructor(
    @Inject(PAYMENT_GATEWAY_PORT)
    private readonly paymentGatewayPort: PaymentGatewayPort,
    @Inject(WALLET_LEDGER_PORT)
    private readonly walletLedgerPort: WalletLedgerPort,
  ) {}

  async execute(
    payload: ConfirmFundingPayload,
  ): Promise<FundingConfirmationEntity> {
    let paymentResult: Awaited<
      ReturnType<PaymentGatewayPort['confirmFunding']>
    >;

    try {
      paymentResult = await this.paymentGatewayPort.confirmFunding(payload);
    } catch (error) {
      throw new BadGatewayException(
        'No fue posible confirmar el pago en el servicio de payments',
      );
    }

    if (paymentResult.status !== 'AUTHORIZED') {
      return {
        fundingId: `funding_${Date.now()}`,
        intentId: payload.intentId,
        paymentId: paymentResult.paymentId,
        ledgerEntryId: '',
        status: paymentResult.status === 'PENDING' ? 'PENDING' : 'FAILED',
        creditedAmount: 0,
        currency: payload.currency,
        processedAt: new Date().toISOString(),
        message: paymentResult.message,
      };
    }

    let ledgerResult: Awaited<ReturnType<WalletLedgerPort['creditWallet']>>;

    try {
      ledgerResult = await this.walletLedgerPort.creditWallet({
        userId: payload.userId,
        walletId: payload.walletId,
        amount: payload.amount,
        currency: payload.currency,
        reference: payload.intentId,
        concept: `Funding via ${payload.method}`,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'El pago fue autorizado, pero falló la acreditación en wallet-ledger',
      );
    }

    return {
      fundingId: `funding_${Date.now()}`,
      intentId: payload.intentId,
      paymentId: paymentResult.paymentId,
      ledgerEntryId: ledgerResult.ledgerEntryId,
      status: ledgerResult.status === 'POSTED' ? 'SUCCESS' : 'PENDING',
      creditedAmount: ledgerResult.status === 'POSTED' ? payload.amount : 0,
      currency: payload.currency,
      processedAt: ledgerResult.postedAt ?? new Date().toISOString(),
      message:
        ledgerResult.status === 'POSTED'
          ? 'Funding processed and wallet credited successfully'
          : 'Funding authorized, wallet credit pending',
    };
  }
}