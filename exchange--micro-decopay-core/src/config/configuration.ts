export default () => ({
  port: parseInt(process.env.PORT || '9017', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  redisUrl:
    process.env.REDIS_URL ||
    process.env.REDIS_URI ||
    'redis://localhost:6379',

  mongodbUri:
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/DECOPAY-core',

  apiTimeout: parseInt(process.env.API_TIMEOUT || '30000', 10),

  internalAuthToken: process.env.INTERNAL_AUTH_TOKEN || '',

  walletLedgerBaseUrl:
    process.env.WALLET_LEDGER_SERVICE_URL ||
    process.env.WALLET_LEDGER_URL ||
    process.env.WALLET_LEDGER_CORE_URL ||
    process.env.WALLET_LEDGER_BASE_URL ||
    'http://localhost:9001',

  signatureKeysBaseUrl:
    process.env.SIGNATURE_KEYS_SERVICE_URL ||
    process.env.SIGNATURE_KEYS_URL ||
    process.env.SIGNATURE_KEYS_BASE_URL ||
    'http://localhost:3007',

  notificationsBaseUrl:
    process.env.NOTIFICATIONS_SERVICE_URL ||
    process.env.NOTIFICATIONS_BASE_URL ||
    'http://localhost:7004',

  internalTransfersBaseUrl:
    process.env.INTERNAL_TRANSFERS_SERVICE_URL ||
    process.env.INTERNAL_TRANSFERS_BASE_URL ||
    'http://localhost:3006',

  notificationsBearerToken:
    process.env.NOTIFICATIONS_BEARER_TOKEN ||
    process.env.NOTIFICATIONS_SERVICE_TOKEN ||
    process.env.INTERNAL_AUTH_TOKEN ||
    '',

  DECOPAYNotificationTemplate:
    process.env.DECOPAY_NOTIFICATION_TEMPLATE || '',

  DECOPAYNotificationSubject:
    process.env.DECOPAY_NOTIFICATION_SUBJECT || 'DECOPAY payment confirmed',
});