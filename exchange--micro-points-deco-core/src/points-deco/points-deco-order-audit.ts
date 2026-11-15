import { PointOrderActionInput, PointOrderStatus } from './points-deco.interfaces';

export function pointOrderActorId(input: PointOrderActionInput = {}) {
  return input.actorId?.trim() || 'points-deco-gateway';
}

export function buildPointOrderAuditEvent(
  action: string,
  input: PointOrderActionInput = {},
  from?: PointOrderStatus | string,
) {
  return {
    action,
    from: from ?? null,
    actorId: pointOrderActorId(input),
    actorRole: input.actorRole || 'system',
    reason: (input.reason || input.note)?.trim() || null,
    at: new Date().toISOString(),
  };
}
