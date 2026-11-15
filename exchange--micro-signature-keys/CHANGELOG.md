# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


All notable changes to this project will be documented in this file.

## [0.1.1] - 2025-07-25

### Changed
- `.gitignore` estandarizado: agregado `.pnp.*`, `.yarn/*`, `*.tsbuildinfo`

## [0.1.0] - 2026-03-09

### Added
- Initial release of micro-signature-keys
- **Signature (PIN) domain**
  - Create signature (`POST /signature`)
  - Verify PIN (`POST /signature/verify`)
  - Change PIN (`PUT /signature`)
  - Signature status (`GET /signature/status`)
  - HMAC-SHA256 hashing (never plaintext)
  - Auto-lock after 5 failed attempts (15 min cooldown)
  - Configurable PIN length (2, 3, 4, 6, 8 digits)
- **Dynamic Key (TOTP-like) domain**
  - Enable dynamic key (`POST /dynamic-key/enable`)
  - Disable dynamic key (`POST /dynamic-key/disable`)
  - Get current code (`GET /dynamic-key/current`)
  - Verify code (`POST /dynamic-key/verify`)
  - Dynamic key status (`GET /dynamic-key/status`)
  - HMAC-SHA256 + dynamic truncation (RFC 4226)
  - Configurable rotation period and code length
  - Verification window ±1 period
- Health check endpoint (`GET /health`)
- MongoDB schemas with Mongoose
- Notifications client for OTP delivery via micro-notifications
- Internal auth guard for service-to-service authentication
- ValidationPipe global (whitelist + forbidNonWhitelisted)
- Environment template (`.env.template`)
- Connected through api-gateway-user (`signature/*` and `dynamic-key/*` routes)
- Dashboard BFF routes (`/api/signature/status`, `/api/signature/verify`, `/api/signature/dynamic-key`)
- React hook `useSignature` in dashboard-user
- UI cards: SignatureStatusCard, SignatureChangeCard, SignatureApproveCard
