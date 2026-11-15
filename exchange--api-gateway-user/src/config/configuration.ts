import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  port: parseInt(process.env.PORT, 10) || 8081,
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 50,
  },
  internalAuthToken: process.env.INTERNAL_AUTH_TOKEN,
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:7000',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:7004',
    'wallet-ledger': process.env.WALLET_LEDGER_SERVICE_URL || 'http://localhost:9001',
    payments: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:9000',
    'internal-transfers': process.env.INTERNAL_TRANSFERS_SERVICE_URL || 'http://localhost:3006',
    'signature-keys': process.env.SIGNATURE_KEYS_SERVICE_URL || 'http://localhost:3007',
    send: process.env.SEND_SERVICE_URL || 'http://localhost:9010',
    movements: process.env.MOVEMENTS_SERVICE_URL || 'http://localhost:9012',
    remittances: process.env.REMITTANCES_SERVICE_URL || 'http://localhost:9015',
    funding: process.env.FUNDING_SERVICE_URL || 'http://localhost:9016',
    savings: process.env.SAVINGS_SERVICE_URL || 'http://localhost:9014',
    loans: process.env.LOANS_SERVICE_URL || 'http://localhost:9013',
    DECOPAY: process.env.DECOPAY_SERVICE_URL || 'http://localhost:9017',
    redeem: process.env.REDEEM_SERVICE_URL || 'http://localhost:9011',
    pricing: process.env.PRICING_AGGREGATOR_SERVICE_URL || 'http://localhost:3013',
    'p2p-core': process.env.P2P_CORE_URL || 'http://localhost:3021/api/v1',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  },
  api: {
    prefix: process.env.API_PREFIX || 'api/v1',
    timeout: parseInt(process.env.API_TIMEOUT, 10) || 30000,
  },
  nodeEnv: process.env.NODE_ENV || 'development',
}));