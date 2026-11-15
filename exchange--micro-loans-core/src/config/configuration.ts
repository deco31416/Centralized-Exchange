export default () => ({
  app: {
    name: process.env.APP_NAME || 'Exchange--micro-loans-core',
    port: parseInt(process.env.PORT || '9013', 10),
    env: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || 'api/v1',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || '',
  },
  security: {
    internalAuthToken: process.env.INTERNAL_AUTH_TOKEN || '',
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:7000/api/v1',
    walletLedger:
      process.env.WALLET_LEDGER_SERVICE_URL ||
      process.env.WALLET_LEDGER_URL ||
      'http://localhost:9001/api/v1',
    payments: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:9000/api/v1',
    signatureKeys:
      process.env.SIGNATURE_KEYS_SERVICE_URL ||
      process.env.SIGNATURE_KEYS_URL ||
      'http://localhost:3007/api/v1',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:7004/api/v1',
    pricingAggregator:
      process.env.PRICING_AGGREGATOR_URL ||
      'http://localhost:3013/api/v1',
  },
  loans: {
    currency: process.env.LOANS_DEFAULT_CURRENCY || 'MXN',
    providerName: process.env.LOANS_PROVIDER_NAME || 'internal-scoring',
    providerBaseUrl: process.env.LOANS_PROVIDER_BASE_URL || '',
    openingFeeRate: parseFloat(process.env.LOANS_OPENING_FEE_RATE || '0.02'),
    signaturePinLength: parseInt(process.env.SIGNATURE_PIN_LENGTH || '6', 10),
    supportedCurrencies: (process.env.LOANS_SUPPORTED_CURRENCIES || 'MXN,USD,DECOX,BTC').split(','),
    // Límites aprobados base expresados en MXN (se convierten a la moneda del préstamo
    // consultando pricing-aggregator en tiempo real).
    approvedLimits: {
      excellent: parseFloat(process.env.LOANS_LIMIT_EXCELLENT || '20000'),
      good: parseFloat(process.env.LOANS_LIMIT_GOOD || '12000'),
      medium: parseFloat(process.env.LOANS_LIMIT_MEDIUM || '7000'),
      high: parseFloat(process.env.LOANS_LIMIT_HIGH || '3000'),
    },
  },
});