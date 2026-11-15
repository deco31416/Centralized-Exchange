export default () => ({
  port: parseInt(process.env.PORT || '3021', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  mongoUri: process.env.MONGODB_URI || '',
  internalAuthToken: process.env.INTERNAL_AUTH_TOKEN || '',
  corsOrigins: process.env.CORS_ORIGINS || '*',
  nodeEnv: process.env.NODE_ENV || 'development',
  /** AES-256-GCM key para datos sensibles en reposo (FieldEncryptionService) */
  fieldEncryptionKey: process.env.P2P_FIELD_ENCRYPTION_KEY || '',
  /**
   * Feature flag: habilita el rail INTERNAL_FIAT_WALLET en órdenes P2P.
   * Desactivado por defecto. Requiere que wallet-ledger implemente lockAvailable/releaseLockedToAccount/refundLocked.
   * Ver deuda técnica: P2P-FIAT-HOLD-INTEGRATION-001.
   */
  p2pEnableInternalFiatWallet: process.env.P2P_ENABLE_INTERNAL_FIAT_WALLET === 'true',
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:7000/api/v1',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:7004/api/v1',
    walletLedger: process.env.WALLET_LEDGER_SERVICE_URL || 'http://localhost:9001/api/v1',
    pricingAggregator: process.env.PRICING_FEE_AGGREGATOR_URL || 'http://localhost:3013/api/v1',
    // custody-crypto no tiene global prefix — base URL sin /api/v1
    custodyCrypto: process.env.CUSTODY_CRYPTO_SERVICE_URL || 'http://localhost:9003',
    signatureKeys: process.env.SIGNATURE_KEYS_SERVICE_URL || 'http://localhost:3007/api/v1',
  },
});
