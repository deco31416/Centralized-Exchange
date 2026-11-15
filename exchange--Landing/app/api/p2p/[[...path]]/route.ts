import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → internal-transfers :3006 vía gateway-user (rewrite a /api/v1/internal/p2p)
export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('p2p');
