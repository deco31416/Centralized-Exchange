import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → signature-keys :3007 vía gateway-user
export const { GET, POST, PUT, PATCH, DELETE } =
  createProxyHandler('signature');
