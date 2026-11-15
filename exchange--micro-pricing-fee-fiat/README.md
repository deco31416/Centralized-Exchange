# Exchange — Micro Pricing Fiat

<!-- DECO-RELEASE-BADGES -->
[![Prototipo inicial](https://img.shields.io/badge/etapa-prototipo%20inicial-orange.svg)](../README.md#alcance-y-estado) [![No apto para producción](https://img.shields.io/badge/producci%C3%B3n-no%20apta-red.svg)](../README.md#limitaciones-conocidas) [![Mapa del sistema](https://img.shields.io/badge/arquitectura-mapa%20global-blue.svg)](../README.md#arquitectura)
<!-- /DECO-RELEASE-BADGES -->

<!-- DECO-NON-PRODUCTION-NOTICE -->
> **Advertencia:** prototipo en fase inicial, no apto para producción. No conectes este servicio a fondos, cuentas bancarias, wallets, datos de clientes ni credenciales reales. Las capacidades descritas son referencias al código y no pruebas de aceptación; las rutas, controles y dependencias requieren validación independiente.
<!-- /DECO-NON-PRODUCTION-NOTICE -->


![NestJS](https://img.shields.io/badge/NestJS-11-ea2845?style=flat-square&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=flat-square&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Version](https://img.shields.io/badge/Version-3.1.0-blue?style=flat-square)
![Port](https://img.shields.io/badge/Port-3014-orange?style=flat-square)

> **DECO Exchange** — Microservicio de precios fiat con agregación multi-source (5 APIs), triangulación cross-rate, motor de entropía, bandas de precio inteligentes, sistema de alertas semáforo y dashboard exchange-grade.

---

## Arquitectura General

```
╔════════════════════════════════════════════════════════════════════╗
║                    DECO EXCHANGE ECOSYSTEM                         ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║   ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐     ║
║   │   Frontend   │    │  Fee Aggreg.  │    │  Remittance     │     ║
║   │   (Admin)    │    │  (consumer)   │    │   (consumer)    │     ║
║   └──────┬───────┘    └──────┬────────┘    └───────┬─────────┘    ║
║          │                   │                     │               ║
║          │  x-internal-auth  │  x-internal-auth    │               ║
║          ▼                   ▼                     ▼               ║
║   ╔══════════════════════════════════════════════════════════╗     ║
║   ║           MICRO PRICING FIAT (:3014)                     ║     ║
║   ║                                                          ║     ║
║   ║  ┌─────────────────────────────────────────────────┐    ║     ║
║   ║  │              API Layer (NestJS)                  │    ║     ║
║   ║  │  /health  /pricing  /price-bands  /network-deltas│    ║     ║
║   ║  │  /api-usage                /api/docs (Swagger)   │    ║     ║
║   ║  └───────────────────┬─────────────────────────────┘    ║     ║
║   ║                      │                                   ║     ║
║   ║  ┌───────────────────▼────────────────────────────┐     ║     ║
║   ║  │            PRICING ENGINE                       │     ║     ║
║   ║  │                                                 │     ║     ║
║   ║  │  ┌──────────┐┌──────────┐┌──────────┐┌────────┐┌──────┐│   ║     ║
║   ║  │  │Exchange  ││Frankfur- ││Float-    ││Fawaz   ││exch- ││   ║     ║
║   ║  │  │Rate-API  ││ter (ECB) ││Rates     ││Currency││rate  ││   ║     ║
║   ║  │  └────┬─────┘└────┬─────┘└────┬─────┘└───┬────┘└──┬───┘│   ║     ║
║   ║  │       └───────────┼──────────┼───────────┼────────┘    │     ║     ║
║   ║  │                        ▼                       │     ║     ║
║   ║  │         ┌───────────────────┐                  │     ║     ║
║   ║  │         │  Aggregation      │                  │     ║     ║
║   ║  │         │  AVG / MAX / MIN  │                  │     ║     ║
║   ║  │         └─────────┬─────────┘                  │     ║     ║
║   ║  │                   ▼                            │     ║     ║
║   ║  │         ┌───────────────────┐                  │     ║     ║
║   ║  │         │   BASE RATE       │                  │     ║     ║
║   ║  │         └─────────┬─────────┘                  │     ║     ║
║   ║  └───────────────────┼────────────────────────────┘     ║     ║
║   ║                      │                                   ║     ║
║   ║  ┌───────────────────▼────────────────────────────┐     ║     ║
║   ║  │          CORRIDOR DELTAS                        │     ║     ║
║   ║  │  Manual cost per corridor (SWIFT=$5, LOCAL=$0.50)│     ║     ║
║   ║  │  + Emergency override + Corridor pause          │     ║     ║
║   ║  └───────────────────┬────────────────────────────┘     ║     ║
║   ║                      │                                   ║     ║
║   ║  ┌───────────────────▼────────────────────────────┐     ║     ║
║   ║  │          PRICE BANDS + ENTROPY ENGINE           │     ║     ║
║   ║  │                                                 │     ║     ║
║   ║  │  Mode: MANUAL (admin) or AUTO (entropy)         │     ║     ║
║   ║  │  ┌─────────────────────────────────────┐       │     ║     ║
║   ║  │  │  Entropy Score (0-1)                 │       │     ║     ║
║   ║  │  │  = 50% Source Volatility             │       │     ║     ║
║   ║  │  │  + 50% 24h Rate Change               │       │     ║     ║
║   ║  │  │  → Asymmetric Spread Recommendation  │       │     ║     ║
║   ║  │  └─────────────────────────────────────┘       │     ║     ║
║   ║  │                                                 │     ║     ║
║   ║  │  Legal Limits: CLAMP to compliance bounds       │     ║     ║
║   ║  │  Traffic Light: 🟢 SAFE 🟠 WARNING 🔴 DANGER  │     ║     ║
║   ║  └───────────────────┬────────────────────────────┘     ║     ║
║   ║                      │                                   ║     ║
║   ║                      ▼                                   ║     ║
║   ║            ┌───────────────────┐                         ║     ║
║   ║            │  FINAL BUY/SELL   │                         ║     ║
║   ║            │      RATE         │                         ║     ║
║   ║            └───────────────────┘                         ║     ║
║   ║                                                          ║     ║
║   ╚══════════════════════════════════════════════════════════╝     ║
║                      │                                             ║
║              ┌───────▼────────┐                                    ║
║              │  MongoDB Atlas  │                                   ║
║              │  (persistence)  │                                   ║
║              └────────────────┘                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Flujo de Tasa de Cambio

```
┌──────────────────────────────────────────────────────────────────┐
│                      RATE PIPELINE                                │
│                                                                   │
│  ① ExchangeRate-API ──┐                                          │
│  ② Frankfurter ───────┤                                          │
│  ③ FloatRates ────────┼──→ Aggregation (AVG/MAX/MIN) → Base Rate│
│  ④ Fawaz Currency ────┤                                          │
│  ⑤ exchangerate.host ─┘  (dormant without API key)               │
│                          │                                        │
│                          ▼                                        │
│              Base + Corridor Delta                                │
│              (manual cost per corridor)                           │
│                          │                                        │
│                          ▼                                        │
│              Apply Spread (buy/sell)                              │
│              ┌────────────────────┐                               │
│              │  MANUAL: admin set  │                              │
│              │  AUTO: entropy calc │                              │
│              └────────────────────┘                               │
│                          │                                        │
│                          ▼                                        │
│              Clamp to Legal Limits                                │
│              (compliance bounds)                                  │
│                          │                                        │
│                          ▼                                        │
│              ┌────────────────────┐                               │
│              │ Final BUY Rate     │  ← user buys (exchange sells) │
│              │ Final SELL Rate    │  ← user sells (exchange buys) │
│              └────────────────────┘                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Entropía y Spreads Dinámicos

```
┌────────────────────────────────────────────────────────┐
│              ENTROPY ENGINE (Fiat)                       │
│                                                          │
│  Input Data (from latest ticker):                        │
│  ├── Source Volatility (CoV between 3 APIs)   weight=50% │
│  └── 24h Rate Change (absolute %)             weight=50% │
│                                                          │
│  Thresholds (lower for fiat vs crypto):                  │
│  ├── Max Source Volatility: 2% (extreme for fiat)        │
│  └── Max Rate Change 24h:  5% (extreme for fiat)         │
│                                                          │
│  Entropy Score: 0.0 ─────────────────── 1.0              │
│                 LOW    MEDIUM   HIGH   EXTREME           │
│                 0.25    0.50    0.75                      │
│                                                          │
│  Spread Mapping (fiat-scale):                            │
│  score=0 → 0.1% spread (minimum)                        │
│  score=1 → 2.0% spread (maximum)                        │
│                                                          │
│  Asymmetric:                                             │
│  Rate RISING  → sell spread × 60%, buy spread × 40%     │
│  Rate FALLING → sell spread × 40%, buy spread × 60%     │
│                                                          │
│  Traffic Light (vs legal limits):                        │
│  🟢 SAFE     effective < 33% of legal max               │
│  🟠 WARNING  effective = 33-66% of legal max            │
│  🔴 DANGER   effective > 66% of legal max               │
│  ⛔ BLOCKED  exceeded → auto-clamped                    │
└────────────────────────────────────────────────────────┘
```

---

## Smart Cron & Rate Limiting

```
┌────────────────────────────────────────────────────────┐
│              SMART CRON SYSTEM                           │
│                                                          │
│  Daily API Limits (free tiers):                          │
│  ├── ExchangeRate-API:  ~50/day                         │
│  ├── Frankfurter:       ~500/day                        │
│  ├── FloatRates:        ~500/day                        │
│  ├── Fawaz Currency:    ~1000/day                       │
│  └── exchangerate.host: ~100/day (dormant)              │
│                                                          │
│  Algorithm:                                              │
│  1. Track every API call per source per UTC day          │
│  2. After each refresh cycle:                            │
│     interval = (seconds_left_in_day / min_remaining)     │
│                 × 1.2 safety factor                      │
│  3. Clamp between 1hr (min) and 2hr (max)               │
│  4. If any source hits 429 → max interval               │
│  5. PATCH override for runtime interval adjustment       │
│                                                          │
│  On-Demand: if a quote is requested and the cached      │
│  rate is >2min old → fetch fresh before responding      │
└────────────────────────────────────────────────────────┘
```

---

## Monedas Soportadas

| Par        | Descripción                     |
|------------|---------------------------------|
| `USD_MXN`  | Dólar → Peso mexicano           |
| `USD_COP`  | Dólar → Peso colombiano         |
| `USD_PEN`  | Dólar → Sol peruano             |
| `USD_VES`  | Dólar → Bolívar venezolano      |
| `USD_SVC`  | Dólar → Colón salvadoreño       |
| `MXN_COP`  | Peso mexicano → Peso colombiano |
| `EUR_USD`  | Euro → Dólar estadounidense     |
| `GBP_USD`  | Libra esterlina → Dólar USD     |
| `USD_BRL`  | Dólar → Real brasileño          |
| `USD_ARS`  | Dólar → Peso argentino          |
| `USD_CLP`  | Dólar → Peso chileno            |

> 12 pares activos. Configurables dinámicamente vía API. Base = cualquier moneda ISO.
>
> **Cross-Rate Triangulation**: Cualquier par no configurado se resuelve automáticamente:
> `DIRECT → INVERSE → CROSS_USD → CROSS_EUR`

---

## Endpoints

### Health (No Auth)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check del servicio |

### Pricing

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/pricing/fiat/rate/:base/:quote` | Tasa base (sin spreads, sin deltas) |
| `GET` | `/internal/pricing/fiat/all-rates` | Todas las tasas más recientes |
| `GET` | `/internal/pricing/fiat/quote/:base/:quote/:corridor/:op` | Quote completo (BUY/SELL con spreads, deltas, entropía) |
| `POST` | `/internal/pricing/fiat/calculate-final` | Cálculo de tasa final (body) |
| `POST` | `/internal/pricing/fiat/refresh` | Force-refresh tasas de APIs |
| `GET` | `/internal/pricing/fiat/configurations` | Listar configuraciones de pares |
| `POST` | `/internal/pricing/fiat/configurations` | Crear/actualizar configuración |
| `DELETE` | `/internal/pricing/fiat/configurations/:base/:quote` | Eliminar configuración |

### Price Bands

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/price-bands` | Listar todas las bandas |
| `GET` | `/internal/price-bands/alerts` | Dashboard semáforo (traffic-light) |
| `GET` | `/internal/price-bands/alerts/:pairCode` | Alertas por par |
| `GET` | `/internal/price-bands/lookup` | Buscar banda por par+corredor |
| `GET` | `/internal/price-bands/:id` | Banda por ID |
| `POST` | `/internal/price-bands` | Crear banda |
| `PUT` | `/internal/price-bands/:id` | Actualizar banda |
| `PUT` | `/internal/price-bands/:id/mode` | Cambiar modo MANUAL↔AUTO |
| `DELETE` | `/internal/price-bands/:id` | Eliminar banda |
| `POST` | `/internal/price-bands/refresh-entropy` | Recalcular entropía |

### Corridor Deltas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/network-deltas` | Listar todos los deltas |
| `GET` | `/internal/network-deltas/lookup` | Delta por par+corredor |
| `GET` | `/internal/network-deltas/emergencies` | Emergencias activas |
| `GET` | `/internal/network-deltas/:id` | Delta por ID |
| `POST` | `/internal/network-deltas` | Crear delta |
| `PUT` | `/internal/network-deltas/:id` | Actualizar delta |
| `DELETE` | `/internal/network-deltas/:id` | Eliminar delta |
| `POST` | `/internal/network-deltas/:id/pause` | Pausar corredor |
| `POST` | `/internal/network-deltas/:id/resume` | Reanudar corredor |
| `POST` | `/internal/network-deltas/:id/activate-emergency` | Activar emergencia |
| `POST` | `/internal/network-deltas/:id/deactivate-emergency` | Desactivar emergencia |

### API Usage

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/api-usage` | Dashboard de uso de APIs |
| `GET` | `/internal/api-usage/budget` | Presupuesto restante hoy |
| `GET` | `/internal/api-usage/smart-cron` | Intervalo óptimo actual |
| `GET` | `/internal/api-usage/history` | Historial de uso (últimos N días) |
| `PATCH` | `/internal/api-usage/smart-cron` | Override runtime del intervalo cron |

> **Nota**: Todos los endpoints `/internal/*` requieren header `x-internal-auth`.

### Dashboard (Dev Only)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/dashboard` | Dashboard exchange-grade (dev only) |

---

## Swagger

Documentación interactiva disponible en:

```
http://localhost:3014/api/docs
```

---

## Setup

### Requisitos

- **Node.js** >= 20
- **Yarn** >= 4.x
- **MongoDB** (Atlas o local)

### Instalación

```bash
# Clonar
git clone <repo-url>
cd Exchange--micro-pricing-fee-fiat

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### Variables de Entorno

```env
PORT=3014
NODE_ENV=development
MONGODB_URI=mongodb+srv://xxxxx--xxxxx:xxxxx--xxxxx@cluster.mongodb.net/deco-exchange-micro
REDIS_URI=redis://default:pass@host:port
INTERNAL_AUTH_TOKEN=xxxxx--xxxxx

# APIs (free, no key required for basic usage)
EXCHANGERATE_API_URL=https://open.er-api.com/v6/latest
FRANKFURTER_API_URL=https://api.frankfurter.app
EXCHANGERATE_HOST_URL=https://api.exchangerate.host
FLOATRATES_URL=https://www.floatrates.com/daily
FAWAZ_CURRENCY_URL=https://latest.currency-api.pages.dev/v1/currencies

# Daily Limits
EXCHANGERATE_API_DAILY_LIMIT=50
FRANKFURTER_DAILY_LIMIT=500
EXCHANGERATE_HOST_DAILY_LIMIT=100
FLOATRATES_DAILY_LIMIT=500
FAWAZ_CURRENCY_DAILY_LIMIT=1000

# Smart Cron (ms)
CRON_MIN_INTERVAL_MS=3600000
CRON_MAX_INTERVAL_MS=7200000
```

### Ejecución

```bash
# Desarrollo (watch mode)
yarn start:dev

# Producción
yarn build
yarn start:prod
```

### Health Check al Arranque

Al iniciar, automáticamente se verifica:
1. Configuraciones de pares de monedas en DB
2. Frescura de últimas tasas guardadas
3. Conectividad a las 5 APIs externas (ExchangeRate-API, Frankfurter, FloatRates, Fawaz Currency, exchangerate.host)
4. Estado de MongoDB

---

## Colecciones MongoDB

| Colección | Descripción |
|-----------|-------------|
| `fiat_rate_tickers` | Tasas de cambio históricas por par |
| `fiat_pair_configurations` | Config de fuentes y estrategia por par |
| `price_bands` | Bandas de spread + entropía + alertas |
| `network_deltas` | Deltas de costo por corredor + emergencias |
| `api_usage_logs` | Tracking de llamadas API por fuente/día |

---

## Ecosistema DECO EXCHANGE

```
┌────────────────────────────────────────────────────────┐
│  Asset Registry     :3010  ← Catálogo de activos       │
│  Pricing Fiat       :3014  ← ESTE SERVICIO (DECO)      │
│  Fee Aggregator     :30XX  ← Cálculo de comisiones     │
│  Remittance Engine  :30XX  ← Motor de remesas          │
└────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | NestJS 11 |
| Lenguaje | TypeScript 5.7 |
| Base de Datos | MongoDB (Mongoose 8) |
| Cache | Redis (ioredis) — preparado |
| APIs Externas | ExchangeRate-API, Frankfurter, FloatRates, Fawaz Currency, exchangerate.host |
| Documentación | Swagger / OpenAPI |
| Scheduler | Smart cron dinámico |
| Package Manager | Yarn 4.12 |

---

## Licencia

[MIT](LICENSE) — DECO Exchange © 2026

## Relación con otros proyectos

Este esquema resume relaciones de alto nivel descritas en el repositorio. Las líneas punteadas indican integraciones incompletas o pendientes de validación; ninguna flecha certifica que el flujo esté desplegado o probado.

```mermaid
flowchart LR
  UP0["micro-pricing-fee-aggregator"] --> SERVICE["micro-pricing-fee-fiat"]
  SERVICE["micro-pricing-fee-fiat"] --> TARGET["Proveedor de tasa fiat configurado"]
```

**Documentación relacionada:** [micro-pricing-fee-aggregator](../exchange--micro-pricing-fee-aggregator/README.md).

**Capacidad:** no hay resultados de carga publicados para este componente. Consulta la sección de [capacidad y rendimiento](../README.md#capacity) del README raíz.

**Archivos del componente:** [`.env.example`](.env.example) · [`CHANGELOG.md`](CHANGELOG.md) · [mapa general](../README.md#service-docs).

<!-- DECO-RELATION-DIAGRAM -->
