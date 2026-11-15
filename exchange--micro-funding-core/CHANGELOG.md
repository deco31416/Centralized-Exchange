# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


## [0.1.0] - 2026-04-15
### Added
- Initial production-ready infrastructure setup
- `envFilePath: ['.env.local', '.env']` in ConfigModule for proper environment loading
- NestJS Logger('Bootstrap') with structured startup banner (port, prefix, environment, MongoDB/Redis status)
- Correct port fallback (9016) matching canonical port map

### Fixed
- `deleteOutDir: true` → `false` in nest-cli.json (prevents tsbuildinfo corruption with incremental builds)
- Port configuration aligned with ecosystem port map

### Infrastructure
- MongoDB Atlas (shared cluster)
- Redis Railway (ballast instance) for Bull queues
- INTERNAL_AUTH_TOKEN for service-to-service auth
- Health check endpoint at `/api/v1/health`
