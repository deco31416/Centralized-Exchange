export interface EmailProvider {
  sendEmail(params: SendEmailParams): Promise<SendEmailResult>;
}

export interface SmsProvider {
  sendSms(params: SendSmsParams): Promise<SendSmsResult>;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendSmsParams {
  to: string;
  body: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}