import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';

import { CreateDECOPAYRequestDto } from '../dto/create-decopay-request.dto';
import { PayDECOPAYDto } from '../dto/pay-decopay.dto';
import { CancelDECOPAYDto } from '../dto/cancel-decopay.dto';
import { QueryDECOPAYDto } from '../dto/query-decopay.dto';
import { RequestDECOPAYOtpDto } from '../dto/request-decopay-otp.dto';
import { WalletLedgerClient } from '../clients/wallet-ledger.client';
import { SignatureKeysClient } from '../clients/signature-keys.client';
import { NotificationsClient } from '../clients/notifications.client';
import {
  DECOPAYRequestDocument,
  DECOPAYRequestEntity,
} from '../schemas/decopay-request.schema';

@Injectable()
export class DECOPAYService {
  constructor(
    @InjectModel(DECOPAYRequestEntity.name)
    private readonly DECOPAYRequestModel: Model<DECOPAYRequestDocument>,
    private readonly walletLedgerClient: WalletLedgerClient,
    private readonly signatureKeysClient: SignatureKeysClient,
    private readonly notificationsClient: NotificationsClient,
  ) {}

  private getCurrencyDecimals(currency: string): number {
    const map: Record<string, number> = {
      MXN: 2,
      USD: 2,
      COP: 2,
      PEN: 2,
      SVC: 2,
      BTC: 8,
      ETH: 8,
      USDT: 6,
      USDC: 6,
    };

    return map[String(currency || '').toUpperCase()] ?? 2;
  }

  private majorToMinorUnits(amount: number, currency: string): string {
    const decimals = this.getCurrencyDecimals(currency);
    const scaled = Math.round(Number(amount) * Math.pow(10, decimals));
    return String(scaled);
  }

  async createRequest(dto: CreateDECOPAYRequestDto) {
    const requestId = randomUUID();
    const amountMinorUnits = this.majorToMinorUnits(dto.amount, dto.currency);

    // Nota: en campos opcionales, NO mandamos null (a menos que el schema sea string | null).
    // Los omitimos o pasamos undefined.
    const payload: Partial<DECOPAYRequestEntity> & {
      requestId: string;
      payerUserId: string;
      collectorUserId: string;
      amount: number;
      amountMinorUnits: string;
      currency: string;
      status: 'PENDING';
      paidAt: null;
      cancelledAt: null;
      cancelReason: null;
      transferTxId: null;
      receiptId: null;
      notificationStatus: 'SKIPPED';
    } = {
      requestId,
      payerUserId: dto.payerUserId,
      collectorUserId: dto.collectorUserId,
      amount: dto.amount,
      amountMinorUnits,
      currency: dto.currency.toUpperCase(),
      status: 'PENDING',
      paidAt: null,
      cancelledAt: null,
      cancelReason: null,
      transferTxId: null,
      receiptId: null,
      notificationStatus: 'SKIPPED',

      ...(dto.concept != null ? { concept: dto.concept } : {}),
      ...(dto.title != null ? { title: dto.title } : {}),
      ...(dto.description != null ? { description: dto.description } : {}),
      ...(dto.imageUrl != null ? { imageUrl: dto.imageUrl } : {}),
      ...(dto.payerEmail != null ? { payerEmail: dto.payerEmail } : {}),
      ...(dto.collectorEmail != null
        ? { collectorEmail: dto.collectorEmail }
        : {}),
      ...(dto.metadata != null ? { metadata: dto.metadata } : {}),
    };

    // Evita overloads ambiguos de Mongoose create()
    const created = (await this.DECOPAYRequestModel.create(
      payload,
    )) as DECOPAYRequestDocument;

    return {
      ok: true,
      message: 'DECOPAY request created successfully',
      data: created.toObject(),
    };
  }

  async getRequests(query: QueryDECOPAYDto) {
    const filter: Record<string, unknown> = {};

    if (query.status) {
      filter.status = query.status.toUpperCase();
    }

    if (query.payerUserId) {
      filter.payerUserId = query.payerUserId;
    }

    if (query.collectorUserId) {
      filter.collectorUserId = query.collectorUserId;
    }

    const data = await this.DECOPAYRequestModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return {
      ok: true,
      message: 'DECOPAY requests fetched successfully',
      data,
    };
  }

  async getRequestDetail(id: string) {
    const request = await this.DECOPAYRequestModel
      .findOne({ requestId: id })
      .lean();

    if (!request) {
      throw new NotFoundException('DECOPAY request not found');
    }

    return {
      ok: true,
      message: 'DECOPAY request detail fetched successfully',
      data: request,
    };
  }

  async requestOtp(dto: RequestDECOPAYOtpDto) {
    const request = await this.DECOPAYRequestModel.findOne({
      requestId: dto.requestId,
    });

    if (!request) {
      throw new NotFoundException('DECOPAY request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        `La solicitud ya no está pendiente. Estado actual: ${request.status}`,
      );
    }

    const result = await this.walletLedgerClient.requestP2POtp({
      userId: request.payerUserId,
      email: dto.email ?? request.payerEmail ?? undefined,
      correlationId: randomUUID(),
    });

    return {
      ok: true,
      message: 'OTP requested successfully',
      data: result,
    };
  }

  async pay(dto: PayDECOPAYDto) {
    const request = await this.DECOPAYRequestModel.findOne({
      requestId: dto.requestId,
    });

    if (!request) {
      throw new NotFoundException('DECOPAY request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        `La solicitud ya no está pendiente. Estado actual: ${request.status}`,
      );
    }

    const pinValidation = await this.signatureKeysClient.validatePin(
      request.payerUserId,
      dto.pin,
    );

    const balance = await this.walletLedgerClient.getAvailableBalance(
      request.payerUserId,
      request.currency,
    );

    if (
      BigInt(balance.availableMinorUnits) < BigInt(request.amountMinorUnits)
    ) {
      throw new BadRequestException(
        `Saldo insuficiente. Disponible: ${balance.availableBalance} ${balance.currency}. Requerido: ${request.amount} ${request.currency}`,
      );
    }

    const transfer = await this.walletLedgerClient.executeP2PTransfer({
      fromUserId: request.payerUserId,
      toUserId: request.collectorUserId,
      currency: request.currency,
      amountMinorUnits: request.amountMinorUnits,
      otp: dto.otp,
      concept: request.concept || request.title || 'DECOPAY payment',
      correlationId: randomUUID(),
    });

    const paidAt = new Date().toISOString();

    request.status = 'PAID';
    request.paidAt = paidAt;
    request.transferTxId = transfer?.txId ?? null;
    request.receiptId = transfer?.txId ?? null;

    const notification = await this.notificationsClient.sendDECOPAYPaymentEmail({
      to: request.payerEmail ?? request.collectorEmail ?? undefined,
      userId: request.payerUserId,
      amount: request.amount,
      currency: request.currency,
      concept: request.concept ?? request.title ?? undefined,
      requestId: request.requestId,
      paidAt,
      transactionId: transfer?.txId ?? null,
    });

    request.notificationStatus = notification.ok
      ? 'ENQUEUED'
      : notification.skipped
        ? 'SKIPPED'
        : 'FAILED';

    await request.save();

    return {
      ok: true,
      message: 'DECOPAY payment processed successfully',
      data: {
        requestId: request.requestId,
        status: request.status,
        paidAt: request.paidAt,
        receiptId: request.receiptId,
        transactionId: request.transferTxId,
      },
      integrations: {
        pinValidation,
        balance,
        transfer,
        notification,
      },
    };
  }

  async cancel(dto: CancelDECOPAYDto) {
    const request = await this.DECOPAYRequestModel.findOne({
      requestId: dto.requestId,
    });

    if (!request) {
      throw new NotFoundException('DECOPAY request not found');
    }

    if (request.status === 'PAID') {
      throw new BadRequestException(
        'No se puede cancelar una solicitud ya pagada',
      );
    }

    request.status = 'CANCELLED';
    request.cancelledAt = new Date().toISOString();
    request.cancelReason = dto.reason ?? null;

    await request.save();

    return {
      ok: true,
      message: 'DECOPAY request cancelled successfully',
      data: {
        requestId: request.requestId,
        status: request.status,
        cancelledAt: request.cancelledAt,
        reason: request.cancelReason,
      },
    };
  }
}
