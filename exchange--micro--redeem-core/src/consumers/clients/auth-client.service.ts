import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

type AuthProfileResponse = {
  userId: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  country?: string;
  status: string;
  smsOtpEnabled: boolean;
  createdAt: string;
};

@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(userId: string) {
    const baseUrl =
      this.configService.get<string>('services.auth')?.replace(/\/$/, '') || '';
    const token =
      this.configService.get<string>('internalAuthToken') || '';

    if (!baseUrl || !token) {
      throw new ServiceUnavailableException(
        'Auth service is not configured correctly',
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<AuthProfileResponse>(
          `${baseUrl}/internal/users/${encodeURIComponent(userId)}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'x-internal-auth': token,
            },
            timeout: 10000,
          },
        ),
      );

      const data = response.data;

      return {
        source: 'auth',
        connected: true,
        userId,
        valid: !!data?.userId,
        email: data?.email,
        profile: data,
      };
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 404) {
        return {
          source: 'auth',
          connected: true,
          userId,
          valid: false,
          message: 'User not found in auth service',
        };
      }

      this.logger.error(
        `Auth validation failed for userId=${userId}: ${error?.message || error}`,
      );

      throw new ServiceUnavailableException(
        'Unable to validate user against auth service',
      );
    }
  }
}