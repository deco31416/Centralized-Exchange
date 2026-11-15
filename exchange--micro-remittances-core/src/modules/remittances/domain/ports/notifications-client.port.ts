export const NOTIFICATIONS_CLIENT = 'NOTIFICATIONS_CLIENT';

export interface NotificationsClientPort {
  notify(event: string, payload: Record<string, unknown>): Promise<void>;
}