import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → micro-notifications :7004 vía gateway-user
export const { GET, POST, PUT, PATCH, DELETE } =
  createProxyHandler('notifications');
