# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


All notable changes to this project will be documented in this file.

## [0.1.43] - 2026-07-07
### Added
- Added Puntos Deco secure forms loading through Admin BFF/Gateway Admin.
- Added secure forms metric and review visibility section to the Puntos Deco operations page.

### Security
- Protected Puntos Deco secure form POST actions behind Gateway Admin, elevated Admin Panel roles and recent email reauthentication.
- The UI displays structured fields and evidence references only; sensitive documents remain outside chat flows.

## [0.1.42] - 2026-07-07
### Added
- Added Puntos Deco audit export loading through Admin BFF/Gateway Admin.
- Added CSV audit export action and an auditable orders metric in the fiscal closing card.

### Security
- The audit export remains behind Admin Panel authentication and the Gateway Admin proxy path.

## [0.1.41] - 2026-07-07
### Added
- Added Puntos Deco receipt PDF download action in the operational receipts card.
- Added monthly Puntos Deco report download and metric in the fiscal closing card.

### Changed
- Updated the shared Admin BFF proxy to pass non-JSON responses as binary buffers so PDF downloads are not corrupted.

### Security
- Receipt PDF downloads stay behind Admin Panel authentication and Gateway Admin through `/api/points-deco/orders/:id/receipt.pdf`.

## [0.1.40] - 2026-07-07
### Added
- Added Admin Panel action to confirm Puntos Deco fiat provider settlement after dispatch.
- Added UI fields for settlement reference, settlement actor and settlement timestamp.
- Added protected BFF support for provider settlement confirmation through `/api/custody-fiat/points-deco-settlement-intents/:id/settle`.

### Security
- Provider settlement confirmation remains behind Gateway Admin, elevated roles and recent email OTP reauthentication.
- The Admin Panel sends reconciliation metadata and evidence references so custody-fiat can persist an auditable `provider_settled` transition.

## [0.1.39] - 2026-07-05
### Added
- Added Puntos Deco custody-fiat settlement intent visibility to the operational page.
- Added protected Admin Panel action to register provider dispatch through `/api/custody-fiat/points-deco-settlement-intents/:id/dispatch`.
- Added dispatch metric and reauthentication copy for high-risk fiat settlement intent actions.

### Security
- Dispatch actions keep the UI and BFF behind Gateway Admin, elevated role checks and recent email OTP reauthentication; provider dispatch is audit-only until real settlement reconciliation exists.

## [0.1.38] - 2026-07-05
### Changed
- Updated Puntos Deco connection metadata to reflect the custody-fiat settlement
  intent registered before `release_to_point` ledger payout.
- Clarified the remaining phase as real provider dispatch by country, KYB,
  protected GPS, TOTP/SMS and fiscal PDF.

## [0.1.37] - 2026-07-05
### Changed
- Updated Puntos Deco connection metadata to reflect automatic accounting for
  `release_to_point` through wallet-ledger point settlement accounts.
- Clarified the next step as real custody/provider settlement, KYB, protected
  GPS, TOTP/SMS and formal fiscal PDF.

## [0.1.36] - 2026-07-05
### Changed
- Updated Puntos Deco status metadata to reflect the automatic safe
  `refund_user` adapter through wallet-ledger.
- Clarified that `release_to_point` still requires a Punto Deco settlement or
  custody account before automatic execution.

## [0.1.35] - 2026-07-05
### Added
- Added high-risk Admin Panel actions for Puntos Deco no-hold economic actions: queue for custody, mark executed and reject.
- Added email reauthentication guard to Admin Panel BFF for `/api/points-deco/economic-actions/*` POST calls.
- Extended Puntos Deco economic action types with review, execution, rejection and audit metadata.

### Security
- Economic action transitions require elevated admin role and recent email OTP reauthentication before reaching Gateway Admin.

## [0.1.34] - 2026-07-05
### Added
- Added Puntos Deco economic actions to the admin overview through `/api/points-deco/economic-actions`.
- Added a dedicated "Acciones económicas sin hold" section for custody/ledger review visibility.

### Changed
- Updated Puntos Deco status metadata to reflect controlled no-hold economic action tracking.

### Security
- No balance mutation is triggered from the UI; the panel only displays pending custody/ledger actions returned by Gateway Admin.

## [0.1.33] - 2026-07-03
### Added
- Added a reusable Puntos Deco dispute execution timeline component.
- Extended Puntos Deco dispute types with `auditTrail` for visual traceability.

### Changed
- Puntos Deco approved disputes now show maker/checker/executor timeline, execution idempotency state and audit notes from Gateway Admin data.

## [0.1.32] - 2026-07-03
### Added
- Added reusable email reauthentication dialog for high-risk Admin Panel actions.
- Added Admin BFF proxy for `/api/auth/reauth/*` through Gateway Admin.

### Security
- Puntos Deco approved dispute execution now requires both elevated role and recent email OTP reauthentication before proxying to Gateway Admin.

## [0.1.31] - 2026-07-03
### Added
- Added reusable Admin Panel RBAC helper for high-risk Puntos Deco actions.
- Added role-aware visibility for the Puntos Deco resolution execution button.

### Security
- Added BFF-side role verification for `POST /api/points-deco/*/execute-resolution` before proxying to Gateway Admin.
- Only `super_admin` and `admin` roles can trigger approved Puntos Deco resolution execution from the Admin Panel BFF.

## [0.1.30] - 2026-07-03
### Added
- Added Admin Panel action to execute approved Puntos Deco dispute resolutions through BFF and Gateway Admin.
- Added reload/error handling for Puntos Deco execution requests.

### Security
- The action only appears for disputes resolved and approved by maker-checker.
- The UI calls `/api/points-deco/...` only; it never calls Puntos Deco core, ledger or custody directly.

## [0.1.29] - 2026-07-03
### Added
- Added Puntos Deco execution labels for `refund_user` and `release_to_point` approved dispute outcomes.

### Changed
- Updated Puntos Deco connection metadata to reflect hold-based refund and point-release executors.

### Security
- Keeps the Admin Panel as visibility/control surface only; economic mutation still runs through Gateway Admin and Puntos Deco/ledger executors, never direct UI-to-ledger calls.

## [0.1.28] - 2026-07-03
### Added
- Added Puntos Deco execution labels for approved dispute cancellation and review-required execution failures.

### Changed
- Updated Puntos Deco status metadata to reflect the first real controlled executor path for `cancel_order`.

### Security
- Keeps the Admin Panel visibility-only for execution outcomes; cancellation is performed through Gateway Admin and the Puntos Deco order executor, not directly from UI to ledger/custody.

## [0.1.27] - 2026-07-03
### Added
- Added Puntos Deco dispute resolution execution status and executor visibility.
- Extended Puntos Deco dispute types with controlled execution metadata.

### Security
- Keeps execution as controlled downstream intent only; the Admin Panel does not move funds or call custody/ledger directly.

## [0.1.26] - 2026-07-03
### Added
- Added Puntos Deco maker-checker status visibility for operational disputes.
- Extended Puntos Deco dispute types with maker, checker and controlled resolution metadata.

### Changed
- Updated Puntos Deco connection status to reflect dispute maker-checker contracts through Gateway Admin.

### Security
- Kept the Admin Panel as visibility-first for Puntos Deco dispute approvals; final balance/custody execution remains outside the UI until controlled executors are connected.
- No direct frontend-to-microservice calls were added.

## [0.1.25] - 2026-07-03
### Added
- Added a Puntos Deco operational disputes section fed by `/api/points-deco/disputes`.
- Extended Puntos Deco dispute types with point, user, amount, SLA and resolution metadata.

### Changed
- Updated Puntos Deco connection status to include dispute workflow reads through Gateway Admin.

### Security
- Kept dispute resolution as read-only visibility in the Admin Panel until maker-checker actions are connected.
- No direct frontend-to-microservice calls were added.

## [0.1.24] - 2026-07-03
### Added
- Connected the Puntos Deco fiscal report summary from `/api/points-deco/reports/fiscal`.
- Added a CSV export action for Puntos Deco fiscal settlements through Admin Panel BFF and Gateway Admin.
- Added fiscal report metrics to the Puntos Deco operational dashboard.

### Changed
- Preserved non-JSON response headers in the shared Admin BFF proxy so CSV exports keep content type and download metadata.
- Updated Puntos Deco connection status to include fiscal JSON/CSV reporting.

### Security
- Kept fiscal exports behind the authenticated Admin Panel BFF and Gateway Admin.
- No direct frontend-to-microservice calls were added.

## [0.1.23] - 2026-07-02
### Added
- Added Puntos Deco settlement loading from `/api/points-deco/settlements`.
- Added the "Liquidación y cierre fiscal" section with balanced/review states,
  ledger status, cash differences and fiscal export readiness.

### Security
- Kept settlement data behind Admin Panel BFF and Gateway Admin.
- Shows review-required settlements without allowing direct completion from UI.

## [0.1.22] - 2026-07-02
### Added
- Added Puntos Deco cash reconciliation widgets from `/api/points-deco/cash/summary`.
- Added recent Puntos Deco operational receipts from `/api/points-deco/receipts`.
- Extended the reusable Puntos Deco hook with cash summary, cash movements and receipts.

### Security
- Kept Puntos Deco evidence behind Admin Panel BFF and Gateway Admin; no direct microservice calls were added.
- Marked receipts as operational evidence only, not final fiscal exports.

## [0.1.21] - 2026-06-28
### Added
- Added maker-checker pending request panel to Límites globales.
- Added approve/reject actions for limit policy change requests through BFF and Gateway Admin.

### Changed
- Changed limit rule controls to create pending requests instead of applying changes directly.
- Updated Limits Policy connection state to include requests and approval workflow.

### Security
- Enforced the operational rule that limit changes must be approved before they can affect downstream ledger or custody contracts.

## [0.1.20] - 2026-06-28
### Added
- Added audited limit rule controls to Límites globales through BFF and Gateway Admin.
- Added recent limit changes view with actor, version and reason.

### Changed
- Updated Limits Policy connection state to include read, evaluation and audited edits.

### Security
- Kept ledger/custody execution closed until maker-checker approvals and downstream contracts are connected.

## [0.1.19] - 2026-06-28
### Added
- Added Admin Panel BFF route for Puntos Deco through Gateway Admin.
- Added Puntos Deco operational page with overview, points, orders and disputes read from `exchange--micro-points-deco-core`.
- Added Puntos Deco to the operations registry, sidebar navigation and connection status map.

### Security
- Kept Puntos Deco as an independent physical network line that complements P2P, Remesas, Bolsillito, Custodia, Ledger and Pricing without bypassing Gateway Admin.
- Kept location, ledger hold, KYC/KYB, limits and settlement actions as pending controlled phases until audited contracts are connected.

## [0.1.18] - 2026-06-27
### Added
- Added maker-checker controls to Flujos crypto actions: approve, reject and simulated execution.
- Added transition reason and notes fields for auditable action decisions.

### Security
- Kept real custody, limits and risk execution closed; Admin Panel only records controlled approval state until provider contracts are connected.

## [0.1.17] - 2026-06-27
### Added
- Added audited actions panel to Flujos crypto for block withdrawal, release balance and open investigation records.
- Added action history loading through `/api/audit-crypto-flows/actions`.
- Added `userId` propagation from crypto reconciliation into audited action payloads when available.

### Security
- Kept actions as audit records only; real custody/limits execution remains closed until approval workflows are connected.

## [0.1.16] - 2026-06-27
### Added
- Added a visible integration log to the Flujos crypto audit page documenting the next production steps.

### Changed
- Documented the remaining audit-crypto-flows path: real chain indexers, ledger/custody reconciliation, blockchain risk, exportable evidence and audited actions.

### Security
- Reaffirmed that the Admin Panel must go through BFF and Gateway Admin before reaching any microservice.

## [0.1.15] - 2026-06-27
### Added
- Added Admin Panel BFF route for Crypto Flows Audit through Gateway Admin.
- Added connected Flujos crypto page with on-chain reconciliation, confirmations, alerts and controls.

### Changed
- Updated admin connection maps to mark audit-crypto-flows as gateway-connected.

### Security
- Kept wallet actions, evidence export and reconciliation overrides closed until audited approval workflows are connected.

## [0.1.14] - 2026-06-26
### Added
- Added Admin Panel BFF route for Fiat Flows Audit through Gateway Admin.
- Added connected Flujos fiat page with reconciliation, alerts, controls and operational difference summaries.

### Changed
- Updated admin connection maps to mark audit-fiat-flows as gateway-connected.

### Security
- Kept provider actions and reconciliation overrides closed until audited approval workflows are connected.

## [0.1.13] - 2026-06-26
### Added
- Added Admin Panel BFF route for Balance Integrity Audit through Gateway Admin.
- Added connected Integridad de balances page with Pepsi Test, assets, liabilities, solvency ratio and audit controls.

### Changed
- Updated admin connection maps and documentation to mark balance integrity reads as gateway-connected.

### Security
- Kept kill switch, evidence export and remediation actions closed until audited approval flows are connected.

## [0.1.12] - 2026-06-26
### Added
- Added Admin Panel BFF route for Fiat Custody through Gateway Admin.
- Added connected Custodia fiat page with providers, external fee profiles and reconciliation summaries.

### Changed
- Updated admin connection maps and documentation to mark custody fiat reads as gateway-connected.

### Security
- Kept provider actions, fee edits and reconciliation overrides closed until audited approval flows are connected.

## [0.1.11] - 2026-06-26
### Added
- Added Admin Panel BFF route for Crypto Custody through Gateway Admin.
- Added connected Custodia crypto page with wallet, deposit and watchtower summaries.

### Changed
- Updated admin connection maps and documentation to mark custody crypto reads as gateway-connected.

### Security
- Kept lock/unlock, limit changes and watchtower actions closed until audited approval flows are connected.

## [0.1.10] - 2026-06-25
### Added
- Added Admin Panel BFF route for Limits Policy through Gateway Admin.
- Added connected Límites globales page with rule summaries and an operational evaluation sample.

### Security
- Kept limit editing closed until audit trail, approval workflow, versioning and reason capture are connected.

## [0.1.9] - 2026-06-25
### Added
- Added Admin Panel BFF route for fiat/crypto price bands through Gateway Admin.
- Added connected Config de spreads page with price band summaries and alert state.

### Changed
- Updated admin connection maps to mark spread band reads as partially connected.

### Security
- Kept spread editing closed in the UI until approval, audit trail and simulation flows are connected.

## [0.1.8] - 2026-06-25
### Added
- Added Admin Panel BFF route for fee schedules through Gateway Admin.
- Added connected Fees y comisiones page with schedule summaries and activate/pause controls.

### Changed
- Updated connection maps and documentation to mark pricing fee schedules as partially connected.

### Security
- Kept fee schedule access behind Admin Panel BFF and Gateway Admin; no direct microservice calls were added.

## [0.1.7] - 2026-06-25
### Added
- Added Markets connection plan documenting Landing routes, backend status and required microservices.

### Changed
- Updated Trading module status to reflect `exchange--micro-market-data` as gateway-connected and pending visual consumption.

## [0.1.6] - 2026-06-24
### Added
- Added source-level status badges for Admin Analytics on the dashboard activity card.

### Changed
- Updated dashboard module status to reflect aggregated auth, ledger, P2P and KYC/risk sources.
- Updated documentation for the Admin Analytics source contract.

## [0.1.5] - 2026-06-24
### Added
- Added BFF route for Admin Analytics through Gateway Admin.
- Added reusable Admin Analytics hook for dashboard activity status.

### Changed
- Connected the dashboard activity card to `exchange--micro-admin-analytics` without simulated series.
- Updated the admin module map to mark Dashboard Analytics as gateway-connected but awaiting real event ingestion.

## [0.1.4] - 2026-06-24
### Added
- Added reusable connected pages for asset catalog, wallet lists and wallet-ledger transactions.
- Added reusable hooks for Admin assets, wallets and ledger transaction summaries.

### Changed
- Connected final users, dashboard counts, assets, wallets, ledger and internal transfer summaries through BFF routes that pass through Gateway Admin.
- Updated module connection badges to show connected, partial and pending states more accurately.
- Replaced duplicated placeholder screens with reusable connected components for crypto/fiat assets, fiat/crypto wallets and ledger views.

### Security
- Kept Admin Panel data access behind BFF routes and Gateway Admin; no direct frontend calls to microservices were added.

## [0.1.3] - 2026-06-24
### Added
- Added admin domain registry for operations, custody, users/data, configuration, monitoring, support, liquidity, notifications, API/webhooks, analytics and compliance.
- Added reusable connection badges and Gateway Admin integration overview.
- Added BFF routes for P2P admin, KYC/Risk, wallet, withdrawals and internal P2P flows.
- Added branded admin logo assets, favicon and theme toggle support.

### Changed
- Reworked admin navigation into the full DECO EXCHANGE operational map.
- Connected funding, withdrawals, QR P2P, DECOPAY, pricing, catalog, users, admins, roles, KYC/Risk and P2P views through BFF routes that pass through Gateway Admin.
- Replaced static JSON-backed pages with reusable connected or honest pending-state components.
- Updated dashboard cards to avoid displaying provisional active/pending user counts as real data.
- Hardened auth verification by validating admin sessions through Gateway Admin instead of trusting local JWT decode.

### Removed
- Removed legacy Deco31416 references and static demo data files from admin panel views.
- Removed obsolete favicon/logo placeholders in favor of DECO EXCHANGE assets.

## [0.1.2] - 2026-06-23
### Changed
- Connected KYC/Risk overview and section pages through Gateway Admin.
- Replaced static KYC/Risk subpages with reusable connected components.
- Updated admin connection map to reflect persistent KYC/Risk Mongo integration.

## [0.1.1] - 2026-02-10
### Changed
- Updated documentation and badges
- Added MIT license file
- Patch version bump

## [0.1.0] - 2026-01-30
### Added
- Initial Admin Panel release
