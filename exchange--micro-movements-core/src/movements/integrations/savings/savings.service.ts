import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MovementTypeEnum } from '../../enums/movement-type.enum';
import { Movement } from '../../interfaces/movement.interface';

@Injectable()
export class SavingsService {
  private readonly logger = new Logger(SavingsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getMovements(userId: string): Promise<Movement[]> {
    const baseUrl =
      this.configService.get<string>('SAVINGS_SERVICE_URL') ||
      'http://localhost:9014/api/v1';

    const internalAuthToken =
      this.configService.get<string>('INTERNAL_AUTH_TOKEN') || '';

    const url = `${baseUrl.replace(/\/+$/, '')}/savings?userId=${userId}`;

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

      const items = Array.isArray(response.data?.data) ? response.data.data : [];
      return items.map((item: any) => this.mapSaving(item, userId));
    } catch (error: any) {
      this.logger.error(
        `Error consulting savings-core for user ${userId}: ${error?.message || error}`,
      );
      return [];
    }
  }

  private mapSaving(item: any, userId: string): Movement {
    const amount = Number(item?.totalBalance ?? item?.principalAmount ?? 0);

    return {
      id: String(item?.id ?? item?._id),
      sourceId: String(item?.id ?? item?._id),
      userId,
      type: MovementTypeEnum.SAVING,
      title: item?.goalName || item?.description || 'Ahorro',
      description: [
        item?.status === 'ACTIVE' ? 'Activo' : item?.status,
        item?.monthlyRate ? `${item.monthlyRate}% mensual` : null,
      ]
        .filter(Boolean)
        .join(' | ') || 'Saving account',
      amount: Math.abs(amount),
      currency: String(item?.currency ?? 'MXN'),
      status: String(item?.status ?? 'ACTIVE').toLowerCase(),
      direction: 'debit',
      createdAt: String(item?.createdAt ?? new Date().toISOString()),
      metadata: {
        provider: 'savings-core',
        originalType: 'saving',
        walletId: null,
        counterparty: null,
        raw: item,
      },
    };
  }
}