# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.



## [0.0.4] - 2026-04-15
### Fixed
- Fixed port fallback in main.ts (3002 → 9000) to match canonical port map
- Added NestJS Logger('Bootstrap') with structured startup banner
- Fixed Redis banner check to verify both REDIS_URI and REDIS_URL



## [0.0.3] - 2026-03-04

- fix: agregar envFilePath [.env.local, .env]
- chore: eliminar .env obsoleto

## [0.0.3] - 2026-03-04

- fix: agregar envFilePath ['.env.local', '.env'] a ConfigModule
- chore: eliminar .env obsoleto

All notable changes to this project will be documented in this file.

## [0.0.2] - 2026-01-30
### Changed
- Updated dependencies to latest stable versions
- Enhanced .gitignore coverage
- Improved documentation and code organization

## [0.0.1] - 2026-01-16
### Added
- Initial release of Payments Core microservice
- Payment confirmation logic
-reconciliation engine
- MongoDB integration for payment records
- Bull queue for async processing

