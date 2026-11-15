export interface SendEmailDto {
  to: string;
  template: string;
  subject: string;
  variables: Record<string, any>;
  user_id: string;
  org_id?: string;
  idempotency_key?: string;
  priority?: 'normal' | 'high';
}

export interface SendSmsDto {
  to: string;
  template: string;
  variables: Record<string, any>;
  user_id: string;
  org_id?: string;
  idempotency_key?: string;
  priority?: 'normal' | 'high';
}

export interface NotificationResponse {
  job_id: string;
  status: 'queued' | 'enqueued';
  message: string;
}