# deco-exchange — BFF (Backend For Frontend)

Esta carpeta contiene todas las **API routes server-side** que actúan como puente entre el frontend autenticado (`app/dashboard/*`) y el ecosistema de microservicios DECOX.

## Patrón obligatorio

```
Browser  ──fetch('/api/X/...')──▶  Next.js BFF (esta carpeta)
                                        │
                                        ▼
                          api-gateway-user (:8081)
                                        │
                                        ▼
                                  Microservicio
```

**Reglas:**

1. El browser **NUNCA** llama directo al gateway ni a un microservicio.
2. Las cookies HttpOnly (`access_token`, `refresh_token`) viajan automáticamente al BFF.
3. El BFF lee cookies server-side, inyecta `Authorization: Bearer <token>` y `x-internal-auth: <INTERNAL_AUTH_TOKEN>` hacia el gateway.
4. Tokens **JAMÁS** se guardan en `localStorage`, `sessionStorage`, ni se exponen al cliente.
5. El BFF **NO** confia en `x-user-id` enviado por el browser; la identidad se valida contra el auth backend usando la cookie HttpOnly.
6. `INTERNAL_AUTH_TOKEN` es obligatorio en produccion; si falta, las rutas fallan cerrado.

## Mapa de rutas BFF → Gateway → Micro

| BFF route                       | Gateway prefix      | Micro destino                  | Puerto |
| ------------------------------- | ------------------- | ------------------------------ | ------ |
| `/api/auth/[[...path]]`         | allowlist `/auth/*` | micro-auth                     | 7000   |
| `/api/auth/set-tokens`          | deshabilitado       | —                              | —      |
| `/api/auth/clear-tokens`        | (cookie handler)    | —                              | —      |
| `/api/auth/refresh`             | `/auth/refresh`     | micro-auth                     | 7000   |
| `/api/internal/[[...path]]`     | `/internal/*`       | micro-auth (users/search)      | 7000   |
| `/api/notifications/[[...path]]`| `/notifications/*`  | micro-notifications            | 7004   |
| `/api/wallet/[[...path]]`       | `/wallet/*`         | wallet-ledger                  | 9001   |
| `/api/send/[[...path]]`         | `/send/*`           | send-core                      | 9010   |
| `/api/movements/[[...path]]`    | `/movements/*`      | movements-core                 | 9012   |
| `/api/remittances/[[...path]]`  | `/remittances/*`    | remittances-core               | 9015   |
| `/api/savings/[[...path]]`      | `/savings/*`        | savings-core                   | 9014   |
| `/api/loans/[[...path]]`        | `/loans/*`          | loans-core                     | 9013   |
| `/api/DECOPAY/[[...path]]`      | `/DECOPAY/*`        | DECOPAY-core                   | 9017   |
| `/api/redeem/[[...path]]`       | `/redeem/*`         | redeem-core                    | 9011   |
| `/api/funding/[[...path]]`      | `/funding/*`        | funding-core                   | 9016   |
| `/api/p2p/[[...path]]`          | `/p2p/*`            | internal-transfers             | 3006   |
| `/api/signature/[[...path]]`    | `/signature/*`      | signature-keys                 | 3007   |
| `/api/dynamic-key/[[...path]]`  | `/dynamic-key/*`    | signature-keys                 | 3007   |
| `/api/prices/[[...path]]`       | (directo, sin gw)   | pricing-aggregator             | 3013   |
| `/api/markets/[[...path]]`      | (directo, sin gw)   | pricing/market data            | 3013   |

## Helpers compartidos (`_shared/`)

- **`gateway.ts`** — Resuelve URL base del gateway (`getUserGatewayBaseUrl`) y de pricing-aggregator (`getPricingAggregatorBaseUrl`).
- **`auth.ts`** — `resolveUserId(req)` valida la cookie HttpOnly contra `/auth/me/profile` y extrae el userId desde la respuesta backend; no acepta identidad enviada por el cliente ni decodifica JWT localmente como fuente de verdad.
- **`internal-auth.ts`** — centraliza `INTERNAL_AUTH_TOKEN` y falla cerrado en produccion si falta.
- **`origin-guard.ts`** — valida `Origin` en mutaciones BFF para reducir CSRF/cross-origin abuse.
- **`rate-limit.ts`** — rate limit local para endpoints sensibles; produccion debe complementarlo con gateway/WAF.
- **`proxy.ts`** — `createProxyHandler('prefix')` devuelve los 5 verbos HTTP listos.

## Cómo agregar una ruta nueva

```ts
// app/api/<servicio>/[[...path]]/route.ts
import { createProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('<servicio>');
```

Si el endpoint NO requiere sesión (ej. login público), pasar `{ public: true }` como segundo argumento.

Para endpoints mixtos, usar `publicMethods` y dejar publicos solo los metodos de lectura:

```ts
export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler('p2p-market', {
  public: true,
  publicMethods: ['GET', 'HEAD'],
});
```

## Variables de entorno requeridas

Ver `.env.local` en la raíz del proyecto:

- `NEXT_PUBLIC_GATEWAY_URL` o `NEXT_PUBLIC_API_BASE_URL` — base del gateway
- `PRICING_AGGREGATOR_URL` — base de pricing-aggregator (acceso directo)
- `INTERNAL_AUTH_TOKEN` — token compartido service-to-service

## Rutas cerradas por seguridad

- `/api/auth/set-tokens` responde `410 Gone`. Las cookies de sesion solo se emiten desde login/refresh tras validacion backend.
- `/api/auth/[[...path]]` ya no es un proxy publico general. Solo permite `forgot-password`, `reset-password`, `verify-email` y `sessions` con sesion validada.
- `/api/catalog/admin/*` responde `403` desde el BFF publico hasta tener RBAC/admin real.
- `/api/catalog/*` bloquea metodos de escritura publicos con `405`.

## Contratos de mercado

Las interfaces de trading usan `/api/markets/*` como BFF para ticker, candles,
order book, trades y pares disponibles. Mientras el backend definitivo no exista,
la ruta responde con fallback estable para mantener vivos los mockups UX.
