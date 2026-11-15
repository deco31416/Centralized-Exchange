export interface NotificationJob {
  channel: 'email' | 'sms';
  to: string;
  template: string;
  subject?: string;
  variables: Record<string, any>;
  user: {
    id: string;
    orgId?: string;
  };
  meta: {
    idempotencyKey?: string;
    correlationId?: string;
    requestedBy: string;
  };
}

export interface EmailJob extends NotificationJob {
  channel: 'email';
  subject: string;
}

export interface SmsJob extends NotificationJob {
  channel: 'sms';
}

export enum QueueNames {
  EMAIL = 'email',
  SMS = 'sms',
  DEAD_LETTER = 'dead-letter',
}

export enum JobPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 15,
}