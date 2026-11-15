import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MovementTypeEnum } from '../../enums/movement-type.enum';
import { Movement } from '../../interfaces/movement.interface';

@Injectable()
export class RemittancesService {
  private readonly logger = new Logger(RemittancesService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getMovements(userId: string): Promise<Movement[]> {
    const baseUrl =
      this.configService.get<string>('REMITTANCES_SERVICE_URL') ||
      'http://localhost:9015/api/v1';

    const internalAuthToken =
      this.configService.get<string>('INTERNAL_AUTH_TOKEN') || '';

    const url = `${baseUrl.replace(/\/+$/, '')}/remittances/user/${userId}`;

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

      const items = Array.isArray(response.data) ? response.data : [];
      return items.map((item: any) => this.mapRemittance(item, userId));
    } catch (error: any) {
      this.logger.error(
        `Error consulting remittances-core for user ${userId}: ${error?.message || error}`,
      );
      return [];
    }
  }

  private mapRemittance(item: any, userId: string): Movement {
    const amount = Number(item?.amountdeco ?? 0);

    return {
      id: String(item?.id ?? item?._id),
      sourceId: String(item?.id ?? item?._id),
      userId,
      type: MovementTypeEnum.REMITTANCE,
      title: item?.concept || `Remesa a ${item?.receiverName || item?.receiverIdentifier || 'destinatario'}`,
      description: [
        item?.sourceCurrency && item?.targetCurrency
          ? `${item.sourceCurrency} → ${item.targetCurrency}`
          : null,
        item?.fxRate ? `TC: ${item.fxRate}` : null,
      ]
        .filter(Boolean)
        .join(' | ') || 'Remittance',
      amount: Math.abs(amount),
      currency: String(item?.sourceCurrency ?? 'MXN'),
      status: String(item?.status ?? 'PENDING').toLowerCase(),
      direction: 'debit',
      createdAt: String(item?.createdAt ?? new Date().toISOString()),
      metadata: {
        provider: 'remittances-core',
        originalType: 'remittance',
        walletId: item?.senderWalletId ?? null,
        counterparty: item?.receiverName || item?.receiverIdentifier || null,
        raw: item,
      },
    };
  }
}
