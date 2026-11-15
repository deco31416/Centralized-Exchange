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
- Added `envFilePath: ['.env.local', '.env']` to ConfigModule
- Added NestJS Logger('Bootstrap') with structured startup banner
- Fixed PORT from 6379 (Redis collision) to 9003
- Migrated to MongoDB Atlas and Redis Railway (ballast)



## [0.0.3] - 2026-03-04

- fix: envFilePath corregido a [.env.local, .env]

## [0.0.3] - 2026-03-04

- fix: envFilePath corregido de '.env' a ['.env.local', '.env']

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-01-30
### Changed
- Updated dependencies to latest stable versions
- Enhanced .gitignore coverage
- Improved documentation and code organization

## [1.0.0] - 2026-01-16
### Added
- Initial release of Crypto Custody microservice
- Multi-chain wallet support (Bitcoin, Ethereum, Stellar, Tron)
- Hot and cold wallet management
- Secure key storage and signing
- Transaction broadcasting

