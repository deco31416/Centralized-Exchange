import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  port: parseInt(process.env.PORT, 10) || 8080,
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200,
  },
  internalAuthToken: process.env.INTERNAL_AUTH_TOKEN,
  serviceTokens: {
    notifications: process.env.NOTIFICATIONS_SERVICE_TOKEN,
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:7002',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:7003',
    'wallet-ledger': process.env.WALLET_LEDGER_SERVICE_URL || 'http://localhost:9001',
    payments: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:9000',
    'internal-transfers': process.env.INTERNAL_TRANSFERS_SERVICE_URL || 'http://localhost:3006',
    send: process.env.SEND_SERVICE_URL || 'http://localhost:9010',
    movements: process.env.MOVEMENTS_SERVICE_URL || 'http://localhost:9012',
    savings: process.env.SAVINGS_SERVICE_URL || 'http://localhost:9014',
    loans: process.env.LOANS_SERVICE_URL || 'http://localhost:9013',
    redeem: process.env.REDEEM_SERVICE_URL || 'http://localhost:9011',
    DECOPAY: process.env.DECOPAY_SERVICE_URL || 'http://localhost:9017',
    remittances: process.env.REMITTANCES_SERVICE_URL || 'http://localhost:9015',
    funding: process.env.FUNDING_SERVICE_URL || 'http://localhost:9016',
    signature: process.env.SIGNATURE_SERVICE_URL || 'http://localhost:3007',
    pricing: process.env.PRICING_AGGREGATOR_SERVICE_URL || 'http://localhost:3013',
    'p2p-core': process.env.P2P_CORE_SERVICE_URL || 'http://localhost:3021',
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
