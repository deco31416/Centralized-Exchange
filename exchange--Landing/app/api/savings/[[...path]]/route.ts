import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → savings-core :9014 vía gateway-user
export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('savings');
