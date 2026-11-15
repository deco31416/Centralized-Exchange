# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.




## [0.0.3] - 2026-03-04

- feat: agregar ConfigModule con envFilePath
- refactor: MongooseModule forRootAsync
- chore: agregar .env.example

## [0.0.3] - 2026-03-04

- feat: agregar @nestjs/config ConfigModule con envFilePath ['.env.local', '.env']
- refactor: migrar MongooseModule de forRoot sync a forRootAsync con ConfigService
- chore: agregar .env.example

All notable changes to this project will be documented in this file.

## [0.0.2] - 2026-01-30
### Changed
- Updated dependencies to latest stable versions
- Enhanced .gitignore coverage
- Improved documentation and code organization

## [0.0.1] - 2026-01-16
### Added
- Initial release of Withdrawal Orchestrator microservice
- Withdrawal flow orchestration
- Risk and compliance checks
- Multi-currency support
