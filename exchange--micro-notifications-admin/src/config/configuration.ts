import { EnvironmentVariables } from './environment.config';

// Helper to parse JSON environment variables with error handling
function parseJsonEnv(value: string, envName: string): Record<string, string> {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(`${envName} must be a JSON object`);
    }
    return parsed;
  } catch (error) {
    console.error(`❌ [CONFIG ERROR] Failed to parse ${envName}:`, error.message);
    console.error(`   Raw value: "${value}"`);
    console.error(`   Tip: Ensure the value is valid JSON without extra escaping`);
    throw new Error(`Invalid JSON in environment variable ${envName}: ${error.message}`);
  }
}

export interface AppConfiguration {
  port: number;
  nodeEnv: string;
  redis: {
    uri: string;
  };
  resend: {
    apiKey: string;
    fromEmail: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  auth: {
    serviceTokens: Record<string, string>;
    hmacKeys?: Record<string, string>;
  };
  rateLimit: {
    emailMaxPerMinute: number;
    smsMaxPerMinute: number;
  };
  queue: {
    emailConcurrency: number;
    smsConcurrency: number;
    maxAttempts: number;
  };
  templates: {
    baseUrl?: string;
  };
}

export const createConfiguration = (env: EnvironmentVariables): AppConfiguration => ({
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  redis: {
    uri: env.REDIS_URI,
  },
  resend: {
    apiKey: env.RESEND_API_KEY,
    fromEmail: env.RESEND_FROM_EMAIL,
  },
  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    fromNumber: env.TWILIO_FROM_NUMBER,
  },
  auth: {
    serviceTokens: parseJsonEnv(env.SERVICE_TOKENS, 'SERVICE_TOKENS'),
    hmacKeys: env.HMAC_KEYS ? parseJsonEnv(env.HMAC_KEYS, 'HMAC_KEYS') : undefined,
  },
  rateLimit: {
    emailMaxPerMinute: env.EMAIL_RATE_MAX,
    smsMaxPerMinute: env.SMS_RATE_MAX,
  },
  queue: {
    emailConcurrency: env.QUEUE_EMAIL_CONCURRENCY,
    smsConcurrency: env.QUEUE_SMS_CONCURRENCY,
    maxAttempts: env.QUEUE_MAX_ATTEMPTS,
  },
  templates: {
    baseUrl: env.BASE_TEMPLATE_URL,
  },
});