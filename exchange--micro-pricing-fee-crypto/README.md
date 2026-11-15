# Exchange — Micro Pricing Crypto

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
![Version](https://img.shields.io/badge/Version-2.1.0-blue?style=flat-square)
![Port](https://img.shields.io/badge/Port-3012-orange?style=flat-square)

> **DECO EXCHANGE** — Microservicio de precios crypto con agregación multi-source, motor de entropía, bandas de precio inteligentes, sistema de alertas semáforo y dashboard exchange-grade.

---

## Arquitectura General

```
╔════════════════════════════════════════════════════════════════════╗
║                    DECO EXCHANGE ECOSYSTEM                         ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║   ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐     ║
║   │   Frontend   │    │  Fee Aggreg.  │    │ Custody Crypto  │     ║
║   │   (Admin)    │    │  (consumer)   │    │   (consumer)    │     ║
║   └──────┬───────┘    └──────┬────────┘    └───────┬─────────┘    ║
║          │                   │                     │               ║
║          │  x-internal-auth  │  x-internal-auth    │               ║
║          ▼                   ▼                     ▼               ║
║   ╔══════════════════════════════════════════════════════════╗     ║
║   ║           MICRO PRICING CRYPTO (:3012)                   ║     ║
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
║   ║  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐   │     ║     ║
║   ║  │  │CoinGecko │ │  CMC     │ │CryptoCompare │   │     ║     ║
║   ║  │  │ Fetcher  │ │ Fetcher  │ │   Fetcher    │   │     ║     ║
║   ║  │  └────┬─────┘ └────┬─────┘ └──────┬───────┘   │     ║     ║
║   ║  │       └─────────────┼──────────────┘           │     ║     ║
║   ║  │                     ▼                          │     ║     ║
║   ║  │         ┌───────────────────┐                  │     ║     ║
║   ║  │         │  Aggregation      │                  │     ║     ║
║   ║  │         │  AVG / MAX / MIN  │                  │     ║     ║
║   ║  │         └─────────┬─────────┘                  │     ║     ║
║   ║  │                   ▼                            │     ║     ║
║   ║  │         ┌───────────────────┐                  │     ║     ║
║   ║  │         │   BASE PRICE      │                  │     ║     ║
║   ║  │         └─────────┬─────────┘                  │     ║     ║
║   ║  └───────────────────┼────────────────────────────┘     ║     ║
║   ║                      │                                   ║     ║
║   ║  ┌───────────────────▼────────────────────────────┐     ║     ║
║   ║  │          NETWORK DELTAS                         │     ║     ║
║   ║  │  Manual cost per network (BSC=$0.10, ETH=$2.00) │     ║     ║
║   ║  │  + Emergency override + Network pause           │     ║     ║
║   ║  └───────────────────┬────────────────────────────┘     ║     ║
║   ║                      │                                   ║     ║
║   ║  ┌───────────────────▼────────────────────────────┐     ║     ║
║   ║  │          PRICE BANDS + ENTROPY ENGINE           │     ║     ║
║   ║  │                                                 │     ║     ║
║   ║  │  Mode: MANUAL (admin) or AUTO (entropy)         │     ║     ║
║   ║  │  ┌─────────────────────────────────────┐       │     ║     ║
║   ║  │  │  Entropy Score (0-1)                 │       │     ║     ║
║   ║  │  │  = 35% Source Volatility             │       │     ║     ║
║   ║  │  │  + 40% 24h Price Change              │       │     ║     ║
║   ║  │  │  + 25% 24h Volume                    │       │     ║     ║
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
║   ║            │     PRICE         │                         ║     ║
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

## Flujo de Precio

```
┌──────────────────────────────────────────────────────────────────┐
│                     PRECIO FINAL PIPELINE                         │
│                                                                   │
│  ① CoinGecko ──┐                                                 │
│  ② CMC ────────┼──→ Aggregation (AVG/MAX/MIN) ──→ Base Price    │
│  ③ CryptoComp ─┘                                                 │
│                          │                                        │
│                          ▼                                        │
│              Base + Network Delta                                 │
│              (manual cost per chain)                              │
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
│              │ Final BUY Price    │  ← user buys (exchange sells) │
│              │ Final SELL Price   │  ← user sells (exchange buys) │
│              └────────────────────┘                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Entropía y Spreads Dinámicos

```
┌────────────────────────────────────────────────────────┐
│              ENTROPY ENGINE                              │
│                                                          │
│  Input Data (from latest ticker):                        │
│  ├── Source Volatility (CoV between 3 APIs)   weight=35% │
│  ├── 24h Price Change (absolute %)            weight=40% │
│  └── 24h Volume (vs $1B threshold)            weight=25% │
│                                                          │
│  Entropy Score: 0.0 ─────────────────── 1.0              │
│                 LOW    MEDIUM   HIGH   EXTREME           │
│                 0.25    0.50    0.75                      │
│                                                          │
│  Spread Mapping:                                         │
│  score=0 → 0.5% spread (minimum)                        │
│  score=1 → 8.0% spread (maximum)                        │
│                                                          │
│  Asymmetric:                                             │
│  Price RISING  → sell spread × 60%, buy spread × 40%    │
│  Price FALLING → sell spread × 40%, buy spread × 60%    │
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
│  ├── CoinGecko:      ~300/day                           │
│  ├── CoinMarketCap:  ~300/day                           │
│  └── CryptoCompare: ~3000/day                           │
│                                                          │
│  Algorithm:                                              │
│  1. Track every API call per source per UTC day          │
│  2. After each refresh cycle:                            │
│     interval = (seconds_left_in_day / min_remaining)     │
│                 × 1.2 safety factor                      │
│  3. Clamp between 1hr (min) and 4hr (max)               │
│  4. If any source hits 429 → max interval               │
│  5. PATCH override for runtime interval adjustment       │
│                                                          │
│  On-Demand: if a quote is requested and the cached      │
│  price is >2min old → fetch fresh before responding     │
└────────────────────────────────────────────────────────┘
```

---

## Endpoints

### Health (No Auth)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check del servicio |

### Pricing

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/pricing/crypto/latest/:assetCode` | Precio base (sin spreads, sin deltas) |
| `GET` | `/internal/pricing/crypto/all-latest` | Todos los precios más recientes |
| `GET` | `/internal/pricing/crypto/quote/:asset/:network/:op` | Quote completo (BUY/SELL con spreads, deltas, entropía) |
| `POST` | `/internal/pricing/crypto/calculate-final` | Cálculo de precio final (body) |
| `POST` | `/internal/pricing/crypto/refresh` | Force-refresh precios de APIs |
| `GET` | `/internal/pricing/crypto/configurations` | Listar configuraciones de assets |
| `POST` | `/internal/pricing/crypto/configurations` | Crear/actualizar configuración |
| `DELETE` | `/internal/pricing/crypto/configurations/:assetCode` | Eliminar configuración |

### Price Bands

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/price-bands` | Listar todas las bandas |
| `GET` | `/internal/price-bands/alerts` | Dashboard semáforo (traffic-light) |
| `GET` | `/internal/price-bands/alerts/:assetCode` | Alertas por asset |
| `GET` | `/internal/price-bands/lookup` | Buscar banda por asset+network |
| `GET` | `/internal/price-bands/:id` | Banda por ID |
| `POST` | `/internal/price-bands` | Crear banda |
| `PUT` | `/internal/price-bands/:id` | Actualizar banda |
| `PUT` | `/internal/price-bands/:id/mode` | Cambiar modo MANUAL↔AUTO |
| `DELETE` | `/internal/price-bands/:id` | Eliminar banda |
| `POST` | `/internal/price-bands/refresh-entropy` | Recalcular entropía |

### Network Deltas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/network-deltas` | Listar todos los deltas |
| `GET` | `/internal/network-deltas/lookup` | Delta por asset+network |
| `GET` | `/internal/network-deltas/emergencies` | Emergencias activas |
| `GET` | `/internal/network-deltas/:id` | Delta por ID |
| `POST` | `/internal/network-deltas` | Crear delta |
| `PUT` | `/internal/network-deltas/:id` | Actualizar delta |
| `DELETE` | `/internal/network-deltas/:id` | Eliminar delta |
| `POST` | `/internal/network-deltas/:id/pause` | Pausar red |
| `POST` | `/internal/network-deltas/:id/resume` | Reanudar red |
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

El dashboard incluye:
- **KPI Strip** — Assets activos, última actualización, auto-refresh
- **Live Prices** — Precios base desde las 3 APIs
- **Exchange Prices BUY/SELL** — Tabla con precios internos, spreads, precios usuario, margen
- **Price Bands & Entropy** — Tarjetas con entropía, spreads, precios USD reales
- **Asset Configurations** — Configuraciones de agregación por moneda
- **API Rate-Limit Budget** — Presupuesto diario y estado del smart cron

---

## Swagger

Documentación interactiva disponible en:

```
http://localhost:3012/api/docs
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
cd Exchange--micro-pricing-fee-crypto

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### Variables de Entorno

```env
PORT=3012
NODE_ENV=development
MONGODB_URI=mongodb+srv://xxxxx--xxxxx:xxxxx--xxxxx@cluster.mongodb.net/db
REDIS_URI=redis://default:pass@host:port
INTERNAL_AUTH_TOKEN=xxxxx--xxxxx

# APIs
COINGECKO_API_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=xxxxx--xxxxx
COINGECKO_DAILY_LIMIT=300
COINMARKETCAP_API_URL=https://pro-api.coinmarketcap.com
COINMARKETCAP_API_KEY=xxxxx--xxxxx
COINMARKETCAP_DAILY_LIMIT=300
CRYPTO_API_URL=https://min-api.cryptocompare.com
CRYPTO_API_SECRET=xxxxx--xxxxx
CRYPTOCOMPARE_DAILY_LIMIT=3000
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
1. Configuraciones de monedas en DB
2. Frescura de últimos precios guardados
3. Conectividad a las 3 APIs externas
4. Estado de MongoDB

---

## Colecciones MongoDB

| Colección | Descripción |
|-----------|-------------|
| `crypto_price_tickers` | Precios históricos por asset |
| `price_configurations` | Config de fuentes y estrategia |
| `price_bands` | Bandas de spread + entropía + alertas |
| `network_deltas` | Deltas de costo por red + emergencias |
| `api_usage_logs` | Tracking de llamadas API por fuente/día |

---

## Ecosistema DECO EXCHANGE

```
┌────────────────────────────────────────────────────────┐
│  Asset Registry     :3010  ← Catálogo de activos       │
│  Pricing Crypto     :3012  ← ESTE SERVICIO             │
│  Fee Aggregator     :30XX  ← Cálculo de comisiones     │
│  Custody Crypto     :30XX  ← Custodia y wallets        │
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
| APIs Externas | CoinGecko, CoinMarketCap, CryptoCompare |
| Documentación | Swagger / OpenAPI |
| Scheduler | Smart cron dinámico |
| Package Manager | Yarn 4.12 |

---

## Licencia

[MIT](LICENSE) — DECO EXCHANGE © 2026

## Relación con otros proyectos

Este esquema resume relaciones de alto nivel descritas en el repositorio. Las líneas punteadas indican integraciones incompletas o pendientes de validación; ninguna flecha certifica que el flujo esté desplegado o probado.

```mermaid
flowchart LR
  UP0["micro-pricing-fee-aggregator"] --> SERVICE["micro-pricing-fee-crypto"]
  SERVICE["micro-pricing-fee-crypto"] --> TARGET["Proveedores de precio configurados"]
```

**Documentación relacionada:** [micro-pricing-fee-aggregator](../exchange--micro-pricing-fee-aggregator/README.md).

**Capacidad:** no hay resultados de carga publicados para este componente. Consulta la sección de [capacidad y rendimiento](../README.md#capacity) del README raíz.

**Archivos del componente:** [`.env.example`](.env.example) · [`CHANGELOG.md`](CHANGELOG.md) · [mapa general](../README.md#service-docs).

<!-- DECO-RELATION-DIAGRAM -->
