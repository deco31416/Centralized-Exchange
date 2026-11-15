import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

type AssetResponse = {
  code: string;
  name: string;
  type: 'fiat' | 'crypto';
  decimals: number;
  enabled: boolean;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
};

@Injectable()
export class AssetRegistryClientService {
  private readonly logger = new Logger(AssetRegistryClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async validatePair(sourceAsset: string, targetAsset: string) {
    const baseUrl =
      this.configService
        .get<string>('services.assetRegistry')
        ?.replace(/\/$/, '') || '';

    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'Asset Registry service is not configured',
      );
    }

    try {
      const [sourceResponse, targetResponse] = await Promise.all([
        firstValueFrom(
          this.httpService.get<AssetResponse>(
            `${baseUrl}/assets/${encodeURIComponent(sourceAsset.toUpperCase())}`,
            {
              timeout: 10000,
            },
          ),
        ),
        firstValueFrom(
          this.httpService.get<AssetResponse>(
            `${baseUrl}/assets/${encodeURIComponent(targetAsset.toUpperCase())}`,
            {
              timeout: 10000,
            },
          ),
        ),
      ]);

      const source = sourceResponse.data;
      const target = targetResponse.data;
      const enabled = !!source?.enabled && !!target?.enabled;

      return {
        source: 'asset-registry',
        connected: true,
        sourceAsset: source?.code,
        targetAsset: target?.code,
        sourceAssetData: source,
        targetAssetData: target,
        enabled,
        message: enabled
          ? 'Redeem pair validated successfully'
          : 'One or both assets are disabled',
      };
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 404) {
        return {
          source: 'asset-registry',
          connected: true,
          sourceAsset,
          targetAsset,
          enabled: false,
          message: 'One or both assets do not exist in asset registry',
        };
      }

      this.logger.error(
        `Asset pair validation failed for ${sourceAsset}/${targetAsset}: ${error?.message || error}`,
      );

      throw new ServiceUnavailableException(
        'Unable to validate redeem pair against asset registry',
      );
    }
  }
}