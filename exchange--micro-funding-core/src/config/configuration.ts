export default () => ({
  app: {
    name: process.env.SERVICE_NAME || 'exchange-micro-funding-core',
    port: Number(process.env.PORT || 9016),
    nodeEnv: process.env.NODE_ENV || 'development',
    swaggerEnabled: String(process.env.SWAGGER_ENABLED || 'true') === 'true',
  },

  security: {
    internalAuthToken:
      process.env.INTERNAL_AUTH_TOKEN ||
      process.env.INTERNAL_API_KEY ||
      '',
  },

  services: {
    paymentsServiceUrl:
      process.env.PAYMENTS_SERVICE_URL || 'http://localhost:9000/api/v1',

    walletLedgerServiceUrl:
      process.env.WALLET_LEDGER_SERVICE_URL || 'http://localhost:9001/api/v1',

    notificationsServiceUrl:
      process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:7004',

    cardVaultServiceUrl:
      process.env.CARD_VAULT_SERVICE_URL || '', // no lo tenemos aún real
  },
});