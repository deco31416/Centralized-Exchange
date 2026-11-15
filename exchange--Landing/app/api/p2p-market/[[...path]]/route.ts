import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

// → p2p-core :3021 vía gateway-user (ruta p2p-market/** → p2p/api/v1/p2p/**)
// public: true → endpoints públicos (GET /ads, GET /payment-method-catalog) no bloquean
// Los endpoints privados (POST /ads, GET /mine, POST /payment-methods) son protegidos por
// UserContextGuard en p2p-core — requieren x-user-id que el BFF inyecta cuando hay sesión.
export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('p2p-market', {
  public: true,
  publicMethods: ['GET', 'HEAD'],
});
