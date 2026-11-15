# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.



## [0.0.4] - 2026-04-15
### Fixed
- Fixed port fallback in main.ts (3001 → 9002) to match canonical port map
- Added NestJS Logger('Bootstrap') with structured startup banner
- Migrated to MongoDB Atlas and Redis Railway (ballast)



## [0.0.3] - 2026-03-04

- fix: agregar envFilePath [.env.local, .env]

## [0.0.3] - 2026-03-04

- fix: agregar envFilePath ['.env.local', '.env'] a ConfigModule

All notable changes to this project will be documented in this file.

## [0.0.2] - 2026-01-30
### Changed
- Updated dependencies to latest stable versions
- Enhanced .gitignore coverage
- Improved documentation and code organization

## [0.0.1] - 2026-01-16
### Added
- Initial release of Fiat Custody microservice
- SPEI integration with STP
- Bank transfer management
- Webhook handling for payment notifications

