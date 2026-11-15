import * as Sentry from '@sentry/nestjs';
import {
  redactSensitiveText,
  sanitizeObservabilityValue,
} from './shared/sentry-observability';

const dsn = process.env.SENTRY_DSN?.trim();

export function readSentryStatus() {
  return dsn ? 'enabled' : 'disabled';
}

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'local',
    release: process.env.SENTRY_RELEASE || undefined,
    sendDefaultPii: false,
    tracesSampleRate: readSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.05),
    enableLogs: process.env.SENTRY_ENABLE_LOGS === 'true',
    beforeSend(event) {
      event.message = event.message
        ? redactSensitiveText(event.message, 500)
        : event.message;
      event.extra = sanitizeObservabilityValue(event.extra) as typeof event.extra;
      event.contexts = sanitizeObservabilityValue(
        event.contexts,
      ) as typeof event.contexts;
      event.request = sanitizeObservabilityValue(
        event.request,
      ) as typeof event.request;
      return event;
    },
  });
}

function readSampleRate(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1
    ? parsed
    : fallback;
}
