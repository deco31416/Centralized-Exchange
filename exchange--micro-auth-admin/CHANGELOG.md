# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.



## [0.0.4] - 2026-04-15
### Fixed
- Fixed `deleteOutDir: true` → `false` in nest-cli.json (prevents tsbuildinfo corruption)
- Fixed port fallback in main.ts (3000 → 7002) to match canonical port map
- Fixed banner service name from 'AUTH MICROSERVICE' to 'AUTH ADMIN MICROSERVICE'

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

