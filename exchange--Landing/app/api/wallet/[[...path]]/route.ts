import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → wallet-ledger :9001 vía gateway-user (rewrite a /api/v1/internal)
export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('wallet');
