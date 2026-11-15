import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → loans-core :9013 vía gateway-user (rewrite a /api/v1/internal/loans)
export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('loans');
