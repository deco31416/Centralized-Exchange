import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → remittances-core :9015 vía gateway-user
export const { GET, POST, PUT, PATCH, DELETE } =
  createProxyHandler('remittances');
