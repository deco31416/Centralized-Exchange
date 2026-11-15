export default () => ({
  port: parseInt(process.env.PORT || '9011', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  mongoUri: process.env.MONGODB_URI || '',
  redisUrl: process.env.REDIS_URL || process.env.REDIS_URI || '',

  internalAuthToken: process.env.INTERNAL_AUTH_TOKEN || '',

  services: {
    auth: process.env.AUTH_SERVICE_URL || '',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL || '',
    walletLedger: process.env.WALLET_LEDGER_SERVICE_URL || '',
    pricingFeeAggregator: process.env.PRICING_FEE_AGGREGATOR_SERVICE_URL || '',
    assetRegistry: process.env.ASSET_REGISTRY_SERVICE_URL || '',
    internalTransfers: process.env.INTERNAL_TRANSFERS_SERVICE_URL || '',
    signatureKeys: process.env.SIGNATURE_KEYS_SERVICE_URL || '',
  },
});