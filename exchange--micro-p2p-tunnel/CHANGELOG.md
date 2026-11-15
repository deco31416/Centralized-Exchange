# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-03-17

### Added
- Initial release of micro-p2p-tunnel
- WebSocket (Socket.IO) bilateral authorization in real-time
- Namespace `/tunnel` with authenticated connections
- Session lifecycle: `WAITING → ACTIVE → EXECUTING → COMPLETED`
- **Create session** — Cobrador creates with amount, currency, concept
- **Join session** — Pagador joins with invite code (6 digits)
- **Auth methods** — PIN, clave dinámica, email OTP — verified via micro-signature-keys
- **Real-time sync** — Each participant sees the other's auth progress with masked values (asterisks)
- **Auto-execute** — Transfer triggers automatically when both participants are fully authorized
- Transfer execution delegated to wallet-ledger-core via micro-internal-transfers
- MongoDB schema for `tunnel_sessions` with TTL auto-cleanup
- Health endpoint: `GET /api/v1/health`
- Railway deployment config (`railway.json`)

### Security
- `InternalAuthGuard` replicated from existing microservices pattern
- WebSocket auth via `x-user-id` + `x-user-email` headers (gateway-injected)
- CORS controlled by `CORS_ORIGIN` environment variable
- Helmet middleware for HTTP security headers
- Session expiration via configurable `SESSION_TTL_MINUTES` (default: 15)
- Max 5 auth attempts per session (`SESSION_MAX_AUTH_ATTEMPTS`)
