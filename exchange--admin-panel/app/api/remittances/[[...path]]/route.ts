import { createAdminProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

export const { GET, POST, PUT, PATCH, DELETE } = createAdminProxyHandler('remittances');
