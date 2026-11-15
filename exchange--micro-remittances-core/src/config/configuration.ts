export default () => ({
  port: parseInt(process.env.PORT || '9015', 10),
  appName: process.env.APP_NAME || 'Exchange--micro-remittances-core',
  appVersion: process.env.APP_VERSION || '1.0.0',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '10000', 10),

  mongodbUri: process.env.MONGODB_URI || '',
  redisUri: process.env.REDIS_URI || '',

  internalAuthToken:
    process.env.INTERNAL_AUTH_TOKEN || process.env.INTERNAL_SERVICE_TOKEN || '',

  services: {
    auth: process.env.AUTH_SERVICE_URL || '',
    walletLedger:
      process.env.WALLET_LEDGER_SERVICE_URL || process.env.WALLET_LEDGER_URL || '',
    pricingAggregator: process.env.PRICING_AGGREGATOR_URL || '',
    notifications:
      process.env.NOTIFICATIONS_SERVICE_URL || process.env.NOTIFICATIONS_BASE_URL || '',
    internalTransfers: process.env.INTERNAL_TRANSFERS_SERVICE_URL || '',
  },

  paths: {
    authSearchUser:
      process.env.AUTH_SEARCH_USER_PATH || '/users/search',

    walletSummary:
      process.env.WALLET_SUMMARY_PATH || '/internal/wallets/user',
    walletReserve:
      process.env.WALLET_RESERVE_PATH || '/wallets/internal/reservations',
    walletCapture:
      process.env.WALLET_CAPTURE_PATH || '/wallets/internal/reservations/capture',
    walletRelease:
      process.env.WALLET_RELEASE_PATH || '/wallets/internal/reservations/release',
    walletCredit:
      process.env.WALLET_CREDIT_PATH || '/wallets/internal/credit',

    pricingConvert:
      process.env.PRICING_CONVERT_PATH || '/prices/convert',

    notificationsNotify:
      process.env.NOTIFICATIONS_NOTIFY_PATH || '/notifications/internal/send',
  },
});