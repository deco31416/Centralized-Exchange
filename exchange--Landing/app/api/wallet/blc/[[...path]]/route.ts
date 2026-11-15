import { createProxyHandler } from '../../../_shared/proxy';

export const dynamic = 'force-dynamic';

// /api/wallet/blc/* -> gateway-user /api/v1/funding/blc/* -> funding-core
export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('funding/blc');
