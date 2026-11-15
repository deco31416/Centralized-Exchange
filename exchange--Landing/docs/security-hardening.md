# Security Hardening - Deco Exchange Frontend

## Objetivo

Preparar el frontend/BFF para conectar servicios reales sin exponer tokens,
identidad de usuario ni endpoints internos desde el navegador.

## Reglas obligatorias

- El browser nunca llama directo a microservicios ni al gateway.
- El browser nunca envia identidad confiable por `x-user-id`.
- Los tokens de sesion viven en cookies HttpOnly.
- El borrado de cookies debe repetir el path real de access/refresh para evitar sesiones residuales.
- El BFF valida la identidad contra auth backend antes de inyectar `x-user-id` hacia el gateway.
- `/api/auth/refresh` rota cookies, pero no devuelve tokens en JSON.
- `/api/auth/[[...path]]` no es proxy publico general; solo opera con allowlist de rutas aprobadas.
- `INTERNAL_AUTH_TOKEN` nunca debe estar en `NEXT_PUBLIC_*`.
- Produccion debe fallar cerrado si falta `INTERNAL_AUTH_TOKEN`.
- CSP global debe declarar explicitamente scripts, estilos, iframes, conexiones, workers e imagenes permitidas en produccion.
- Las mutaciones BFF deben validar `Origin` contra el sitio actual o `NEXT_PUBLIC_SITE_URL`.
- Endpoints sensibles del BFF deben tener rate limit local, aunque produccion tambien requiera rate limit distribuido en gateway/WAF.
- Los proxies publicos deben permitir escritura solo con sesion.
- Las rutas admin deben vivir en un BFF/admin panel con RBAC real.

## Headers de produccion

`Content-Security-Policy` y `Strict-Transport-Security` se aplican solo en
`NODE_ENV=production`. En desarrollo se omiten para no romper HMR, overlays de
Next DevTools ni pruebas locales con iframes/widgets.

## DevGuard

`components/security/DevGuard.tsx` muestra una advertencia anti fraude/self-XSS
cuando DevTools se abre en produccion.

Variable:

```env
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

- `true`: development, consola permitida.
- `false`: production, advertencia y redireccion.

DevGuard es una capa educativa. No reemplaza validacion backend, RBAC,
rate limiting, KYC/AML, firmas, ni controles del gateway.

## Pendientes para backend/gateway

- Validar JWT en backend antes de aceptar operaciones.
- Ignorar cualquier `x-user-id` que no venga de gateway/BFF confiable.
- Agregar RBAC para admin catalog, reservas, pricing y conciliacion.
- Agregar rate limit distribuido por IP, usuario y endpoint sensible.
- Firmar snapshots de reservas/Merkle.
- Registrar auditoria para login, refresh, ordenes, remesas, P2P y aliados.
- Migrar CSP a nonce/hash para retirar `unsafe-inline` cuando el pipeline final lo permita.
