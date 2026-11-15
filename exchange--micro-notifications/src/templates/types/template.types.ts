export interface TemplateVariables {
  [key: string]: any;
}

export interface RenderedTemplate {
  subject?: string;
  content: string;
}

export interface EmailTemplateResult extends RenderedTemplate {
  html: string;
  text?: string;
}

export interface SmsTemplateResult extends RenderedTemplate {
  content: string;
}

export enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
}

export interface TemplateMetadata {
  name: string;
  namespace: string;
  type: TemplateType;
  requiredVariables: string[];
  optionalVariables: string[];
  description?: string;
}