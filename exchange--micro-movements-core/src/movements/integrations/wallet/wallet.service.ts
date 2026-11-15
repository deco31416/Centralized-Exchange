import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MovementTypeEnum } from '../../enums/movement-type.enum';
import { Movement } from '../../interfaces/movement.interface';

function joinUrl(baseUrl: string, path: string): string {
  const base = String(baseUrl || '').replace(/\/+$/, '');
  let nextPath = String(path || '');

  if (!nextPath.startsWith('/')) {
    nextPath = '/' + nextPath;
  }

  const prefixMatch = base.match(/\/(api\/v\d+)$/i);
  if (prefixMatch) {
    const prefix = '/' + prefixMatch[1];

    if (nextPath.toLowerCase().startsWith(prefix.toLowerCase() + '/')) {
      nextPath = nextPath.slice(prefix.length);
    } else if (nextPath.toLowerCase() === prefix.toLowerCase()) {
      nextPath = '';
    }
  }

  return base + nextPath;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getMovements(
    userId: string,
    page = 1,
    limit = 100,
  ): Promise<Movement[]> {
    const baseUrl =
      this.configService.get<string>('WALLET_LEDGER_SERVICE_URL') ||
      this.configService.get<string>('WALLET_LEDGER_URL') ||
      'http://localhost:9001/api/v1';

    const internalAuthToken =
      this.configService.get<string>('INTERNAL_AUTH_TOKEN') || '';

    const url = joinUrl(
      baseUrl,
      `/api/v1/internal/wallets/user/${userId}/transactions?page=${page}&limit=${limit}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${internalAuthToken}`,
            'X-Internal-Auth': internalAuthToken,
          },
          timeout: 15000,
        }),
      );

      const items = this.extractItems(response.data);
      return items.map((item) => this.mapWalletMovement(item, userId));
    } catch (error: any) {
      this.logger.error(
        `Error consulting wallet-ledger for user ${userId}: ${error?.message || error}`,
      );
      return [];
    }
  }

  private extractItems(payload: any): any[] {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.data?.items)) {
      return payload.data.items;
    }

    if (Array.isArray(payload?.items)) {
      return payload.items;
    }

    if (Array.isArray(payload?.results)) {
      return payload.results;
    }

    return [];
  }

  private mapWalletMovement(item: any, userId: string): Movement {
    const amount = Number(
      item?.amount ?? item?.value ?? item?.total ?? item?.grossAmount ?? 0,
    );

    const rawType = String(
      item?.type ?? item?.transactionType ?? item?.category ?? item?.kind ?? '',
    ).toLowerCase();

    const rawDirection = String(
      item?.direction ?? item?.entryType ?? item?.flow ?? '',
    ).toLowerCase();

    const direction: 'credit' | 'debit' =
      rawDirection === 'credit' ||
      rawDirection === 'in' ||
      rawDirection === 'incoming' ||
      rawDirection === 'deposit' ||
      amount >= 0
        ? 'credit'
        : 'debit';

    const absoluteAmount = Math.abs(amount);

    return {
      id: String(item?.id ?? item?._id ?? item?.transactionId ?? item?.referenceId),
      sourceId: String(
        item?.transactionId ?? item?.referenceId ?? item?.id ?? item?._id,
      ),
      userId: String(item?.userId ?? item?.ownerId ?? userId),
      type: this.resolveMovementType(rawType),
      title: this.resolveTitle(item, direction),
      description: String(
        item?.description ?? item?.concept ?? item?.memo ?? item?.note ?? 'Wallet movement',
      ),
      amount: absoluteAmount,
      currency: String(
        item?.currency ?? item?.asset ?? item?.assetCode ?? item?.symbol ?? 'USD',
      ),
      status: String(item?.status ?? item?.state ?? 'completed'),
      direction,
      createdAt: String(
        item?.createdAt ??
          item?.created_at ??
          item?.timestamp ??
          item?.date ??
          new Date().toISOString(),
      ),
      metadata: {
        provider: 'wallet-ledger',
        originalType: rawType || null,
        walletId: item?.walletId ?? item?.wallet ?? null,
        counterparty: item?.counterparty ?? item?.recipient ?? item?.sender ?? null,
        raw: item,
      },
    };
  }

  private resolveMovementType(rawType: string): MovementTypeEnum {
    if (
      rawType.includes('p2p') ||
      rawType.includes('transfer') ||
      rawType.includes('internal_transfer')
    ) {
      return MovementTypeEnum.P2P;
    }

    if (rawType.includes('payment') || rawType.includes('qr')) {
      return MovementTypeEnum.PAYMENT;
    }

    if (rawType.includes('remittance')) {
      return MovementTypeEnum.REMITTANCE;
    }

    if (rawType.includes('saving')) {
      return MovementTypeEnum.SAVING;
    }

    return MovementTypeEnum.WALLET;
  }

  private resolveTitle(item: any, direction: 'credit' | 'debit'): string {
    if (item?.title) {
      return String(item.title);
    }

    if (item?.concept) {
      return String(item.concept);
    }

    return direction === 'credit' ? 'Wallet credit' : 'Wallet debit';
  }
}