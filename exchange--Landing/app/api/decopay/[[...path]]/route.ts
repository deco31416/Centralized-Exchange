import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → DECOPAY-core :9017 vía gateway-user
export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('DECOPAY');
