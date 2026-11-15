# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.



## [0.0.6] - 2026-04-15
### Fixed
- Fixed port fallback in main.ts (3003 → 9001) to match canonical port map
- Added NestJS Logger('Bootstrap') with structured startup banner
- Migrated Redis from gondola (legacy) to ballast instance

## [0.0.5] - 2025-07-25

### Security
- **HIGH**: Agregado `@UseGuards(InternalAuthGuard)` a `AccountsController` — endpoints `ensure/:userId` y `by-user/:userId` estaban sin protección
- **HIGH**: `InternalAuthGuard` ahora lanza `UnauthorizedException` si `INTERNAL_AUTH_TOKEN` no está configurado (antes: permitía acceso libre en dev)
- Agregado `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`

### Changed
- `.gitignore` estandarizado: agregado `.pnp.*`, `.yarn/*`, `*.tsbuildinfo`, `coverage/`

## [0.0.4] - 2026-03-04

- fix: .env.example PORT 3003 a 9001
- chore: agregar vars faltantes

## [0.0.4] - 2026-03-04

- fix: .env.example PORT 3003→9001
- chore: agregar vars faltantes (NOTIFICATIONS, PRICING, OTP, IP, HTTPS)

All notable changes to this project will be documented in this file.

## [0.0.3] - 2026-03-03
### Added
- `GET /internal/wallets/user/:userId/transactions` — paginated transaction history endpoint with filters (type, currency, days)
- `LedgerService.findByAccountPaginated()` — paginated query method with type/currency/date filters
- Counterparty account number enrichment in transaction responses

## [0.0.2] - 2026-01-30
### Changed
- Updated dependencies to latest stable versions
- Enhanced .gitignore coverage
- Improved documentation and code organization

## [0.0.1] - 2026-01-16
### Added
- Initial release of Wallet Ledger Core microservice
- Double-entry accounting system
- Balance management and reconciliation
- Transaction history and audit trails

