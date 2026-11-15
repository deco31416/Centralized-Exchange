# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


## 0.1.5 - 2026-07-02

- Added KYC/Risk profile lookup during `POST /limits-policy/precheck` when `userId` is provided.
- Added downstream decisioning for KYC/Risk profiles: red/restricted blocks, orange/monitoring reviews and green/active passes.
- Added `KYC_RISK_SERVICE_URL`, `KYC_RISK_TIMEOUT_MS` and `KYC_RISK_FAIL_MODE` configuration.

## 0.1.4 - 2026-07-01

- Added default `GLOBAL-P2P-L2` policy for governed P2P execution.
- Changed default seed behavior to upsert missing bootstrap rules without overwriting admin-managed policy changes.

## 0.1.3 - 2026-07-01

- Added `POST /limits-policy/precheck` for operational execution checks.
- Added daily/monthly projected usage checks.
- Added ledger balance, custody liquidity/provider status and risk score checks.
- Kept money movement outside this service; ledger and custody remain domain owners.

## 0.1.2 - 2026-06-28

- Added maker-checker change requests for limit policy rules.
- Added pending request listing, approval and rejection endpoints.
- Changed rule edit flow so admin edits create a pending request before a rule is applied.
- Kept real ledger/custody execution closed until downstream contracts consume approved policy versions.

## 0.1.1 - 2026-06-28

- Added audited limit rule updates with required reason, actor and versioning.
- Added change history collection and `GET /limits-policy/changes`.
- Added `PATCH /limits-policy/rules/:id` for controlled admin edits.
- Kept execution against ledger/custody closed until maker-checker approval is connected.

## 0.1.0 - 2026-06-25

- Created base limits policy microservice.
- Added Mongo-backed read-only rules, overview and policy evaluation endpoints.
- Documented gateway-only architecture and future audit requirements.
