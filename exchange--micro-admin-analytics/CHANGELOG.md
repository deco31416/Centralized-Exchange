# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


## [0.1.1] - 2026-06-24

### Added

- Connected admin analytics overview to internal auth, wallet ledger, P2P and KYC/risk services.
- Added per-source availability reporting for dashboard auditability.
- Added defensive upstream client with internal auth headers and request timeouts.

### Changed

- Updated default auth upstream to `http://localhost:7000`.
- Kept missing upstream data as zero instead of generating placeholder metrics.

## [0.1.0] - 2026-06-24

### Added

- Created base administrative analytics service.
- Added internal-auth protected overview, series and KPI endpoints.
- Added honest empty analytics responses for development environments without ingested events.
