# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


## [0.0.9] - 2026-07-11
### Changed
- Aligned service identity to DECO31416 Admin Auth.
- Updated default local port to `7001`, Mongo database to `deco31416-admin-auth`, CORS to admin/backend origins, and JWT issuer to `deco31416-admin-auth`.
- Updated notification integration defaults to `exchange--micro-notifications` on port `7002`.
- Rebranded operational emails, TOTP issuer, docs, package metadata and startup scripts to DECO31416.

### Security
- Kept admin registration disabled by default with controlled provisioning.
- Kept Swagger development-only and removed sensitive logs from auth flows.
- Notification proxy logs now mask email/phone recipients and avoid stack traces in operational errors.

## [0.0.8] - 2026-07-09
### Security
- Removed hardcoded MongoDB Atlas URI from QA seed scripts.
- QA scripts now read `MONGO_URL` or `MONGODB_URI` from `.env.local` or the process environment before connecting.

## [0.0.7] - 2026-06-24
### Added
- Added internal admin user listing endpoint for Gateway Admin: `GET /api/v1/internal/users`.
- Added admin user profile endpoint support used by the Admin Panel BFF.

### Changed
- Exposed safe user summary fields for administrative dashboards without bypassing internal auth.


## [0.0.6] - 2026-04-15
### Fixed
- Fixed `deleteOutDir: true` → `false` in nest-cli.json (prevents tsbuildinfo corruption with incremental builds)
- Fixed port fallback in main.ts (3000 → 7000) to match canonical port map
- Added NestJS Logger('Bootstrap') with structured startup banner

## [0.0.5] - 2025-07-25

### Security
- fix: Non-null assertion en `SecurityPolicyService.findOneAndUpdate` (TS2322)

### Changed
- `.gitignore` estandarizado: agregado `*.tsbuildinfo`

## [0.0.4] - 2026-03-04

- fix: .env.example PORT 7001 a 7000
- fix: .env.example REDIS_URL a REDIS_URI

## [0.0.4] - 2026-03-04

- fix: .env.example PORT 7001→7000 (coincide con .env.local)
- fix: .env.example REDIS_URL→REDIS_URI (coincide con código)

All notable changes to this project will be documented in this file.

## [0.0.3] - 2026-02-10
### Changed
- Added MIT license file
- Updated README and project metadata
- Patch version bump

## [0.0.2] - 2026-01-30
### Changed
- Updated dependencies to latest stable versions
- Improved documentation and code organization
- Enhanced security and performance

## [0.0.1] - 2026-01-16
### Added
- Initial release of Authentication microservice
- JWT-based authentication system
- User management and role-based access control
- 2FA support with TOTP
- Session management with Redis

