export const QUEUE_NAMES = {
  FIAT_WEBHOOKS_INGEST: 'fiat.webhooks.ingest',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
