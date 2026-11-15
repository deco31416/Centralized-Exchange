import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NotificationsService } from '../../notifications/notifications.service';
import { UserService } from './user.service';

@Injectable()
export class WithdrawalsHoldService {
  private readonly logger = new Logger(WithdrawalsHoldService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
  ) {}

  getDefaultHoldMinutes(): number {
    const fromEnv = this.configService.get<string>(
      'WITHDRAWALS_HOLD_MINUTES_DEFAULT',
    );
    const parsed = fromEnv ? Number.parseInt(fromEnv, 10) : Number.NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
  }

  async applyWithdrawalsHoldAndNotify(params: {
    userId: string;
    email?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    reason?: string;
    holdMinutes?: number;
  }): Promise<void> {
    const holdMinutes = params.holdMinutes ?? this.getDefaultHoldMinutes();
    const holdUntil = new Date(Date.now() + holdMinutes * 60_000);

    // Apply hold (do not throw to callers; keep it best-effort)
    try {
      await this.userService.setWithdrawalsHoldUntil(params.userId, holdUntil);
    } catch (error) {
      this.logger.warn(
        `Failed to set withdrawals_hold_until (best-effort) userId=${params.userId}: ${String(
          error,
        )}`,
      );
      return;
    }

    const email = params.email;
    if (typeof email !== 'string' || email.length === 0) return;

    try {
      await this.notificationsService.sendEmail({
        to: email,
        template: 'security.withdrawals_hold_activated',
        subject: 'DECO31416 — Withdrawals temporarily locked',
        variables: {
          displayName: email.split('@')[0],
          companyName: 'DECO31416',
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          deviceId: params.deviceId,
          timestamp: new Date().toISOString(),
          holdMinutes,
          holdUntil: holdUntil.toISOString(),
          reason: params.reason,
        },
        user_id: params.userId,
        idempotency_key: `security:withdrawals_hold_activated:${params.userId}:${holdUntil.toISOString()}`,
        priority: 'high',
      });
    } catch {
      // Intentionally ignore
    }
  }
}
