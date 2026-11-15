# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


## [0.1.2] - 2025-07-25

### Security
- **CRITICAL**: Eliminado fallback `'dev'` en `InternalAuthGuard` — ahora lanza `UnauthorizedException` si `INTERNAL_AUTH_TOKEN` no está configurado
- Agregado `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`
- Agregado `helmet` middleware para headers de seguridad HTTP
- CORS controlado por variable de entorno `CORS_ORIGIN` (antes: sin configurar)

### Changed
- `.gitignore` estandarizado: agregado `.pnp.*`, `.yarn/*`, `*.tsbuildinfo`, `coverage/`

## [0.1.1] - 2026-03-04

- chore: agregar .env.example

## [0.1.1] - 2026-03-04

- chore: agregar .env.example

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-03-01
### Added
- Initial release of micro-internal-transfers
- P2P QR code generation (`POST /internal/p2p/generate-code`)
- P2P payment with code (`POST /internal/p2p/receive-with-code`)
- OTP request forwarding to wallet-ledger-core (`POST /internal/p2p/request-otp`)
- Code cancellation (`POST /internal/p2p/cancel`)
- Active codes listing (`GET /internal/p2p/active/:userId`)
- MongoDB schema for P2P codes with TTL auto-expiry
- Wallet Ledger Client for HTTP communication with wallet-ledger-core
- Internal auth guard for service-to-service authentication
- Health check endpoint
