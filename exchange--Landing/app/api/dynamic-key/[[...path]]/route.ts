import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → signature-keys :3007 vía gateway-user (endpoints de dynamic-key)
export const { GET, POST, PUT, PATCH, DELETE } =
  createProxyHandler('dynamic-key');
