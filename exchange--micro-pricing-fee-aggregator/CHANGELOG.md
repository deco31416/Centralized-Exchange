# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.



## [1.0.4] - 2026-04-15
### Fixed
- Fixed `deleteOutDir: true` → `false` in nest-cli.json
- Added NestJS Logger('Bootstrap') with structured startup banner
- Removed quoted values in .env.local (literal quotes break URI parsing)
- Migrated Redis from gondola to ballast instance

## [1.0.3] - 2025-07-25

### Security
- **CRITICAL**: Agregado `InternalAuthGuard` a `PricesController` y `QuotesController` — todos los endpoints de precios estaban expuestos sin autenticación
- Creado `shared/internal-auth.guard.ts` con validación de `INTERNAL_AUTH_TOKEN`
- CORS controlado por variable de entorno `CORS_ORIGIN` (antes: `enableCors()` abierto a todos los orígenes)
- `ValidationPipe` actualizado con `forbidNonWhitelisted: true`

### Changed
- `.gitignore` ya estaba completo (no requirió cambios)

## [1.0.2] - 2026-03-04

- fix: .env.example REDIS_URL a REDIS_URI

## [1.0.2] - 2026-03-04

- fix: .env.example REDIS_URL→REDIS_URI, asset-registry URL corregido

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-01-30
### Changed
- Updated dependencies to latest stable versions
- Enhanced .gitignore coverage
- Improved documentation and code organization

## [1.0.0] - 2026-01-16
### Added
- Initial release of Fee Aggregator microservice
- Multi-source quote aggregation
- Fee calculation engine

