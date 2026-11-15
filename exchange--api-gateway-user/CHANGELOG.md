# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.



## [1.0.5] - 2026-04-15
### Fixed
- Fixed 9 incorrect port fallbacks in configuration.ts to match canonical port map
- Fixed `deleteOutDir: true` → `false` in nest-cli.json
- Aligned proxy.service.ts and funding.controller.ts with correct service URLs

## [1.0.4] - 2025-07-25

### Changed
- `.gitignore` estandarizado: agregado `.pnp.*`, `.yarn/*`, `*.tsbuildinfo`

## [1.0.3] - 2026-03-04

- fix: actualizar .env.example con puertos correctos
- feat: agregar INTERNAL_TRANSFERS_SERVICE_URL

## [1.0.3] - 2026-03-04

- fix: actualizar .env.example con puertos correctos (auth→7000, wallet→9001, payments→9000)
- feat: agregar INTERNAL_TRANSFERS_SERVICE_URL al .env.example

All notable changes to this project will be documented in this file.

## [1.0.2] - 2026-06-15
### Added
- Internal Transfers (P2P) proxy route → micro-internal-transfers (Port 3006)
- `INTERNAL_TRANSFERS_SERVICE_URL` configuration variable
- Path rewrite: `/api/v1/internal-transfers/*` → `/internal/p2p/*`

### Changed
- Updated proxy service to support `internal-transfers` as a routable service
- Internal auth (Bearer token) applied to internal-transfers routes

### Fixed
- Wallet Ledger Core port updated from 3003 → 9001 in documentation

## [1.0.1] - 2026-02-10
### Changed
- Updated documentation and badges
- Added MIT license file
- Patch version bump

## [1.0.0] - 2026-02-10
### Added
- Initial User API Gateway (proxy routes, Swagger, health checks)

