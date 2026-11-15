import { BadRequestException, Injectable } from '@nestjs/common';
import { PointOrderStatus } from './points-deco.interfaces';

@Injectable()
export class PointsDecoOrderStateService {
  private readonly transitions: Record<PointOrderStatus, PointOrderStatus[]> = {
    quoted: ['created', 'expired', 'cancelled'],
    created: ['accepted', 'cancelled', 'expired', 'disputed'],
    accepted: ['location_revealed', 'cancelled', 'expired', 'disputed'],
    rate_locked: ['location_revealed', 'cancelled', 'expired', 'disputed'],
    location_revealed: ['user_checked_in', 'cancelled', 'expired', 'disputed'],
    user_checked_in: ['code_verified', 'cancelled', 'expired', 'disputed'],
    code_verified: ['cash_received', 'cash_delivered', 'settlement_pending', 'disputed'],
    cash_received: ['settlement_pending', 'completed', 'disputed'],
    cash_delivered: ['settlement_pending', 'completed', 'disputed'],
    settlement_pending: ['completed', 'disputed'],
    completed: ['disputed'],
    cancelled: [],
    expired: [],
    disputed: [],
  };

  assertTransition(current: PointOrderStatus, next: PointOrderStatus) {
    const allowed = this.transitions[current] ?? [];
    if (!allowed.includes(next)) {
      throw new BadRequestException({
        message: 'Invalid Puntos Deco order status transition',
        current,
        next,
        allowed,
      });
    }
  }

  assertCanOperate(status: PointOrderStatus) {
    if (['cancelled', 'expired', 'disputed'].includes(status)) {
      throw new BadRequestException({
        message: 'Puntos Deco order is not operational',
        status,
      });
    }
  }
}
