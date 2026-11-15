import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SignatureKeysClientService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async verifySignature(userId: string, pin?: string) {
    const baseUrl = this.configService.get<string>('services.signatureKeys');
    const internalAuthToken =
      this.configService.get<string>('internalAuthToken');

    if (!baseUrl) {
      return {
        connected: false,
        verified: false,
        skipped: true,
        message: 'Signature Keys service URL is not configured',
      };
    }

    if (!pin) {
      throw new BadRequestException(
        'signatureToken is required for this operation',
      );
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${baseUrl.replace(/\/$/, '')}/signature/verify`,
          { pin },
          {
            headers: {
              'x-internal-auth': internalAuthToken || '',
              'x-user-id': userId,
            },
            timeout: 10000,
          },
        ),
      );

      return {
        connected: true,
        verified: Boolean(data?.valid),
        skipped: false,
        response: data,
      };
    } catch (error: any) {
      if (error?.response?.status === 401) {
        throw new UnauthorizedException(
          error?.response?.data || 'Invalid signature PIN',
        );
      }

      if (error?.response?.status === 400) {
        throw new BadRequestException(
          error?.response?.data || 'Signature verification failed',
        );
      }

      throw new ServiceUnavailableException({
        message: 'Signature Keys service is unavailable',
        source: 'signature-keys',
        detail:
          error?.response?.data || error?.message || 'Unknown signature error',
      });
    }
  }
}