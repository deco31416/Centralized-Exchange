import {
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

export type AuthUserPolicy = {
  userId: string;
  country?: string;
  withdrawals_hold_until?: string;
  is_withdrawals_held: boolean;
};

@Injectable()
export class AuthPolicyService {
  private readonly logger = new Logger(AuthPolicyService.name);

  constructor(private readonly httpService: HttpService) {}

  private getBaseUrl(): string {
    return (
      process.env.MICRO_AUTH_BASE_URL ||
      process.env.AUTH_BASE_URL ||
      'http://localhost:7001'
    ).replace(/\/$/, '');
  }

  private getToken(): string | undefined {
    return process.env.INTERNAL_AUTH_TOKEN;
  }

  private getFailMode(): 'closed' | 'open' {
    const v = (process.env.WITHDRAWALS_POLICY_FAIL_MODE || 'closed')
      .toLowerCase()
      .trim();
    return v === 'open' ? 'open' : 'closed';
  }

  async getUserPolicy(userId: string): Promise<AuthUserPolicy> {
    const baseUrl = this.getBaseUrl();
    const token = this.getToken();

    if (!token) {
      const msg = 'INTERNAL_AUTH_TOKEN not configured for withdrawals policy';
      if (this.getFailMode() === 'open') {
        this.logger.warn(`${msg} (fail-open)`);
        return { userId, is_withdrawals_held: false };
      }
      throw new ServiceUnavailableException(`${msg} (fail-closed)`);
    }

    try {
      const res = await lastValueFrom(
        this.httpService.get<AuthUserPolicy>(
          `${baseUrl}/internal/users/${encodeURIComponent(userId)}/policy`,
          {
            headers: {
              'x-internal-auth-token': token,
            },
            timeout: 5000,
          },
        ),
      );
      return res.data;
    } catch (error: any) {
      const msg = `Failed to fetch auth policy for userId=${userId}`;
      if (this.getFailMode() === 'open') {
        this.logger.warn(`${msg} (fail-open): ${String(error?.message || error)}`);
        return { userId, is_withdrawals_held: false };
      }
      throw new ServiceUnavailableException(
        `${msg} (fail-closed): ${String(error?.message || error)}`,
      );
    }
  }

  async assertWithdrawalsAllowed(userId: string): Promise<void> {
    const policy = await this.getUserPolicy(userId);
    if (!policy.is_withdrawals_held) return;

    throw new ForbiddenException({
      code: 'WITHDRAWALS_HELD',
      message: 'Withdrawals are temporarily locked',
      withdrawals_hold_until: policy.withdrawals_hold_until,
    });
  }
}
