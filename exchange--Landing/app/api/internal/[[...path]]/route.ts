import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// Endpoints internos del micro-auth: users/search, users/:id/profile, etc.
// El gateway-user expone estos bajo /internal/**
export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('internal');
