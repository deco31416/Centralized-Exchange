# Plan de conexión de Mercados

Este documento registra el estado real entre Landing, Admin Panel, Gateway Admin y microservicios para el bloque **Mercados**.

Regla de arquitectura:

```text
Admin Panel -> BFF Next /api/* -> Gateway Admin -> microservicio
Landing/User -> Gateway User -> microservicio
```

Nada del Admin Panel debe consumir microservicios de forma directa.

## Estado por item del menu

| Item Landing | Ruta Landing | Estado UI | Backend actual | Micro requerido | Estado Admin |
| --- | --- | --- | --- | --- | --- |
| Spot | `/markets/spot` | Existe | Pricing/asset registry pueden alimentar referencias; no hay motor de ordenes | `exchange--micro-trading-engine` | Pendiente |
| Futuros | `/markets/futures` | Existe | No hay core de futuros | `exchange--micro-futures-core` | I+D+i pendiente |
| P2P Market | `/markets/p2p` | Existe | `exchange--micro-p2p-core` conectado parcialmente | Existente: `exchange--micro-p2p-core`, `exchange--micro-p2p-tunnel` pendiente | Parcial |
| Market Maker | `/markets/market-maker` | Existe | No hay workflow OTC/market maker | `exchange--micro-otc-core` | Pendiente |
| Trading Pro | `/markets/advanced-orders` | Existe | No hay ordenes limit/stop/OCO reales | `exchange--micro-trading-engine` | Pendiente |
| Analisis de Mercado | `/markets/market-analysis` | Existe | Pricing existe; market-data base creado | `exchange--micro-market-data` | Gateway conectado |
| Historial de Ordenes | `/markets/order-history` | Existe | P2P tiene historial parcial; spot/futuros no | `exchange--micro-trading-engine` | Pendiente |
| Alertas de Precio | `/markets/price-alerts` | Existe | Notificaciones existen, reglas de alerta no | `exchange--micro-price-alerts` | Pendiente |
| API de datos | `/markets/data-api` | Existe | Market-data base creado; falta API policy | `exchange--micro-market-data` + Gateway Admin/User | Gateway conectado |

## Orden recomendado

1. `exchange--micro-market-data` - creado y conectado por Gateway Admin/User
   - Precios normalizados, velas, tendencias, profundidad y snapshots.
   - Consume pricing aggregator y asset registry.
   - Alimenta Landing, Admin, alertas y API de datos.

2. `exchange--micro-trading-engine`
   - Spot, ordenes market/limit/stop/OCO, fills e historial.
   - No debe ejecutar dinero sin pasar por ledger/custodia.

3. `exchange--micro-price-alerts`
   - Reglas de usuario/admin.
   - Dispara eventos hacia `exchange--micro-notifications`.

4. `exchange--micro-otc-core`
   - Market Maker, cotizaciones OTC, contraparte, approval flow.

5. `exchange--micro-futures-core`
   - I+D+i por riesgo alto: margen, liquidaciones, funding y gestion de riesgo.

6. `exchange--micro-trading-automation`
   - Bots, copy trading y estrategias. Debe esperar al trading engine.

## Notas

- P2P no requiere micro nuevo para empezar: ya existe `exchange--micro-p2p-core`.
- El siguiente paso de P2P es conectar ofertas, reputacion dedicada y `exchange--micro-p2p-tunnel`.
- Market data debe ir primero para que Spot, Analisis, Alertas y API de datos no dupliquen fuentes.
