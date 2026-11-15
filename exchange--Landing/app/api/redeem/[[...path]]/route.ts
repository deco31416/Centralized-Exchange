import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → redeem-core :9011 vía gateway-user
export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('redeem');
