import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → movements-core :9012 vía gateway-user
export const { GET, POST, PUT, PATCH, DELETE } =
  createProxyHandler('movements');
