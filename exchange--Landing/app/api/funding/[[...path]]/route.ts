import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → funding-core :9016 vía gateway-user (FundingController dedicado, no proxy)
export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('funding');
