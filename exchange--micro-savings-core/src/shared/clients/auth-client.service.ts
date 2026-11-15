import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface AuthUserProfile {
  userId: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  country?: string;
  status?: string;
  smsOtpEnabled?: boolean;
  createdAt?: string;
}

@Injectable()
export class AuthClientService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getUserProfile(userId: string): Promise<AuthUserProfile | null> {
    const baseUrl = this.configService.get<string>('services.auth');
    const internalAuthToken =
      this.configService.get<string>('internalAuthToken');

    if (!baseUrl) return null;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<AuthUserProfile>(
          `${baseUrl.replace(/\/$/, '')}/internal/users/${encodeURIComponent(
            userId,
          )}/profile`,
          {
            headers: {
              'x-internal-auth': internalAuthToken || '',
            },
            timeout: 10000,
          },
        ),
      );

      return data;
    } catch (error: any) {
      throw new ServiceUnavailableException({
        message: 'Auth service is unavailable',
        source: 'auth',
        detail:
          error?.response?.data || error?.message || 'Unknown auth error',
      });
    }
  }
}