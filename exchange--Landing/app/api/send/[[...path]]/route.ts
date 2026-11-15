import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → send-core :9010 vía gateway-user
export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('send');
