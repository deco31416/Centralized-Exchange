# Frontend Audit Checklist - Deco Exchange

## Objetivo

Validar que el frontend publico, dashboard landing y BFF esten listos para
revision visual, seguridad y conexion posterior con gateway/backend real.

## Seguridad BFF

- [ ] El browser no llama directo a microservicios ni gateway.
- [ ] Tokens solo existen en cookies HttpOnly.
- [ ] Ningun token se guarda en `localStorage`, `sessionStorage` o JSON de respuesta.
- [ ] `x-user-id` nunca se acepta desde el browser como identidad confiable.
- [ ] `resolveUserId` valida sesion contra auth backend antes de inyectar identidad.
- [ ] `/api/auth/[[...path]]` opera por allowlist, no como proxy abierto.
- [ ] `/api/auth/set-tokens` responde `410 Gone`.
- [ ] Mutaciones BFF validan `Origin`.
- [ ] Endpoints sensibles tienen rate limit local.
- [ ] `INTERNAL_AUTH_TOKEN` no existe en `NEXT_PUBLIC_*` y falla cerrado en produccion.

## Headers

- [ ] `Content-Security-Policy` presente en build/ambiente de produccion.
- [ ] `X-Frame-Options: DENY` presente.
- [ ] `X-Content-Type-Options: nosniff` presente.
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` presente.
- [ ] `Permissions-Policy` limita camara, microfono y geolocalizacion.
- [ ] `Strict-Transport-Security` activo solo en produccion con dominio HTTPS completo.
- [ ] TradingView carga por `frame-src` sin abrir scripts externos innecesarios.

## Dependencias

- [ ] `pnpm audit --prod` sin vulnerabilidades conocidas.
- [ ] Next y axios en versiones parcheadas.
- [ ] No usar `npm`; todo cambio de dependencias se hace con `pnpm`.
- [ ] `pnpm-lock.yaml` actualizado junto con `package.json`.

## Build

- [ ] `pnpm exec tsc --noEmit --pretty false` pasa.
- [ ] `pnpm run build` pasa y valida tipos.
- [ ] `git diff --check` sin whitespace errors.
- [ ] `typescript.ignoreBuildErrors` no esta habilitado.
- [ ] `productionBrowserSourceMaps` esta desactivado.

## Auditoria Visual

- [ ] Home mantiene el estilo aprobado: dashboard landing, oscuro, sobrio, compacto.
- [ ] No usar bordes naranja fuertes como estado principal salvo CTA/acentos aprobados.
- [ ] Todas las vistas nuevas estan componetizadas por modulo.
- [ ] Cada URL renderiza su propia vista, sin esconder paginas enteras en tabs.
- [ ] Desktop 1440px: sin overflow horizontal ni textos cortados.
- [ ] Mobile 360px: sin solapamientos, botones legibles, cards compactas.
- [ ] Light mode: textos negros/grises con contraste suficiente.
- [ ] Dark mode: textos blancos/grises con contraste suficiente.
- [ ] Modales cierran, enfocan y no rompen scroll.
- [ ] Selectores custom reemplazan selects nativos donde el diseno lo requiere.
- [ ] Home / Acceso global muestra `coin-deco.gif` sin sombras, halos ni fondos radiales agregados.
- [ ] La moneda DECO mantiene el mismo tamano visual en light y dark mode.
- [ ] Componentes visuales del home no usan `data-theme` dinamico que pueda causar mismatch de hidratacion.

## Flujos De Producto

- [ ] Crypto facil: buy, sell, convert, send y spot-lite consistentes.
- [ ] Bolsillito: add-money, send-money, remittances y withdraw-credit consistentes.
- [ ] Mercados: p2p, market-maker, spot, futures y advanced-orders consistentes.
- [ ] Rendimiento: staking, boveda, reservas y calculadora como URLs independientes.
- [ ] Ganar: referidos, cashback, points, learn, missions, sponsor, launchpad y ranking independientes.
- [ ] Assets: crypto, fiat, tokens y payment-methods separados de legales.

## Estados De Autenticacion

- [ ] Sin login se muestra informacion publica, legal y educativa.
- [ ] Sin login no se muestra saldo privado, Merkle personal, ordenes ni contrapartes.
- [ ] Con login se habilitan paneles privados y acciones.
- [ ] CTA de login aparece cuando un flujo privado lo requiere.
- [ ] 401 del backend no rompe la pantalla.

## Pendientes De Produccion

- [ ] Rate limit distribuido en gateway/WAF.
- [ ] RBAC real para admin, catalogo privado, reservas operativas y conciliacion.
- [ ] Logs de auditoria para login, refresh, ordenes, remesas, P2P y aliados.
- [ ] CSP con nonce/hash para retirar `unsafe-inline`.
- [ ] Monitoreo de errores frontend y alertas de disponibilidad.
