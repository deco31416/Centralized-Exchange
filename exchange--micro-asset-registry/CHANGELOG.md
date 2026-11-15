# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.



## [1.0.3] - 2026-04-15
### Fixed
- Removed duplicate `Schema.index()` from asset.schema.ts and network.schema.ts (`@Prop({ unique: true })` already creates the index)
- Fixed `deleteOutDir: true` → `false` in nest-cli.json
- Added NestJS Logger('Bootstrap') with structured startup banner
- Migrated Redis from gondola to ballast instance

All notable changes to this project will be documented in this file.

## [1.0.2] - 2025-07-25

### Security
- CORS controlado por variable de entorno `CORS_ORIGIN` (antes: `enableCors()` abierto a todos los orígenes)
- `ValidationPipe` actualizado con `forbidNonWhitelisted: true`

### Changed
- `.gitignore` estandarizado: agregado `.pnp.*`, `.yarn/*`, `*.tsbuildinfo`

## [1.0.1] - 2026-01-30
### Changed
- Updated dependencies to latest stable versions
- Enhanced .gitignore coverage
- Improved documentation and code organization

## [1.0.0] - 2026-01-16
### Added
- Initial release of Asset Registry microservice
- Asset and Network schemas
- CRUD endpoints with InternalAuthGuard

