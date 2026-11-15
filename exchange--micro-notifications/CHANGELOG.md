# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


## [0.0.6] - 2026-07-11
### Changed
- Aligned service identity to DECO31416 Admin Notifications.
- Updated default local port to `7002`, CORS examples to admin/backend/auth origins, and S2S producer name to `deco31416-admin-auth`.
- Rebranded email templates, README, package metadata, dev client and startup scripts to DECO31416.
- Made Twilio configuration optional so email OTP flows can run with Resend only.

### Security
- Kept Swagger development-only, CORS allowlist in production, and removed unauthenticated debug endpoints.
- Sanitized config parsing logs to avoid printing service tokens or HMAC keys.
- `.env.example` documents `HTTPS_REDIRECT_ENABLED=false` for explicit local/production control.


## [0.0.5] - 2026-04-15
### Fixed
- Fixed `deleteOutDir: true` → `false` in nest-cli.json (prevents tsbuildinfo corruption)

All notable changes to this project will be documented in this file.

## [0.0.4] - 2025-07-25

### Changed
- `.gitignore` estandarizado: agregado `.pnp.*`, `.yarn/*`, `*.tsbuildinfo`

## [0.0.3] - 2026-02-10
### Changed
- Added MIT license file
- Updated README and project metadata
- Patch version bump

## [0.0.2] - 2026-01-30
### Changed
- Updated dependencies to latest stable versions
- Enhanced .gitignore coverage
- Improved documentation and code organization

## [0.0.1] - 2026-01-16
### Added
- Initial release of Notifications microservice
- Email notifications via Resend
- SMS notifications via Twilio
- Template-based messaging with Handlebars
- Bull queue integration for async processing

