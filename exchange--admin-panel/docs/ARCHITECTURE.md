# Arquitectura de Conexiones

## Regla principal

El panel administrativo no se conecta directamente a ningun microservicio.

Todo flujo del admin panel debe pasar por:

- `exchange--admin-panel`
- `exchange--api-gateway-admin`
- microservicio interno correspondiente

Todo flujo de usuarios debe pasar por:

- cliente o panel de usuario
- `exchange--api-gateway-user`
- microservicio interno correspondiente

## No permitido

No se deben usar conexiones directas desde el frontend o BFF del panel hacia puertos internos de microservicios como `3010`, `9001`, `3012`, `7000`, `7002` u otros.

Tampoco se deben crear variables como `ASSET_REGISTRY_URL`, `WALLET_LEDGER_URL` o similares dentro del panel si saltan el gateway.

## Motivo

Los gateways centralizan autenticacion, autorizacion, auditoria, trazabilidad, politicas internas y versionado de rutas.

Si una ruta falta, se agrega o corrige en el gateway correspondiente, no se conecta el panel directo al microservicio.

## Mapa admin actual

Rutas del panel y destino esperado:

- `/api/auth/*` -> `exchange--api-gateway-admin` -> `exchange--micro-auth-admin`
- `/api/users/*` -> `exchange--api-gateway-admin` -> `exchange--micro-auth`
- `/api/admins/*` -> `exchange--api-gateway-admin` -> `exchange--micro-auth-admin`
- `/api/roles/*` -> `exchange--api-gateway-admin` -> `exchange--micro-auth-admin`
- `/api/sessions/*` -> `exchange--api-gateway-admin` -> `exchange--micro-auth-admin`
- `/api/catalog/*` -> `exchange--api-gateway-admin` -> `exchange--micro-asset-registry`
- `/api/custody-crypto/*` -> `exchange--api-gateway-admin` -> `exchange--micro-custody-crypto`
- `/api/custody-fiat/*` -> `exchange--api-gateway-admin` -> `exchange--micro-custody-fiat`
- `/api/audit-balance-integrity/*` -> `exchange--api-gateway-admin` -> `exchange--micro-audit-balance-integrity`
- `/api/wallet/*` y `/api/wallets/*` -> `exchange--api-gateway-admin` -> `exchange--micro-wallet-ledger-core`
- `/api/pricing/*` -> `exchange--api-gateway-admin` -> `exchange--micro-pricing-fee-aggregator`
- `/api/admin-pricing/fee-schedules/*` -> `exchange--api-gateway-admin` -> `exchange--micro-pricing-fee-aggregator`
- `/api/admin-pricing/price-bands/*` -> `exchange--api-gateway-admin` -> `exchange--micro-pricing-fee-fiat` / `exchange--micro-pricing-fee-crypto`
- `/api/admin-analytics/*` -> `exchange--api-gateway-admin` -> `exchange--micro-admin-analytics`
- `/api/market-data/*` -> `exchange--api-gateway-admin` -> `exchange--micro-market-data`
- `/api/points-deco/*` -> `exchange--api-gateway-admin` -> `exchange--micro-points-deco-core`
- `/api/send/*`, `/api/movements/*`, `/api/savings/*`, `/api/loans/*`, `/api/redeem/*`, `/api/decopay/*`, `/api/remittances/*`, `/api/funding/*` y `/api/signature/*` -> `exchange--api-gateway-admin` -> microservicio correspondiente

## Componentes conectados actuales

- `components/biblioteca/assets/*`: hooks y páginas reutilizables para activos fiat/crypto desde `/api/catalog/admin/assets`.
- `components/biblioteca/wallets/*`: hooks y páginas reutilizables para wallets fiat/crypto desde `/api/wallet/admin/wallets`.
- `components/biblioteca/transactions/*`: hooks y páginas reutilizables para ledger desde `/api/wallet/admin/transactions`.
- `components/custodia/crypto/*`: hook y página reutilizable para wallets reales, depósitos y watchtower desde `/api/custody-crypto`.
- `components/custodia/fiat/*`: hook y página reutilizable para pasarelas, fees externos y conciliación desde `/api/custody-fiat`.
- `components/auditoria/balance-integrity/*`: hook y página reutilizable para solvencia, activos, pasivos y controles desde `/api/audit-balance-integrity`.
- `components/admin-analytics/*`: hook reutilizable para estado de analítica administrativa desde `/api/admin-analytics`, incluyendo fuentes agregadas de auth, ledger, P2P y KYC/riesgo.
- `components/configuracion/fees/*`: página y hook reutilizable para reglas de fees desde `/api/admin-pricing/fee-schedules`.
- `components/liquidez/spreads/*`: página y hook reutilizable para bandas de spread desde `/api/admin-pricing/price-bands`.
- `components/operaciones/points-deco/*`: hook reutilizable para overview, puntos, órdenes, disputas con estado maker-checker y ejecución controlada, caja, comprobantes, liquidaciones y reporte fiscal desde `/api/points-deco`.
- `docs/MARKETS_CONNECTION_PLAN.md`: mapa de Mercados para Landing/Admin/Gateways y microservicios pendientes.

## Nota operativa sobre custodia, ledger y fees

La custodia crypto/fiat representa los fondos reales que entran y salen por blockchain, bancos y pasarelas. El ledger y los saldos de usuario son representación operativa en base de datos. Las reglas de fees, spread y comisiones administradas desde el panel impactan cotizaciones y saldos visibles para usuarios, por lo que cualquier edición futura debe guardar actor, razón, versión anterior, versión nueva y trazabilidad para auditoría y reportes regulatorios.

Los componentes de biblioteca no deben conocer URLs internas de microservicios. Si un dato falta, se marca como pendiente/parcial en `lib/admin-module-status.ts`.
