# Exchange — Micro Pricing Launchpad

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
![Port](https://img.shields.io/badge/Port-3016-orange?style=flat-square)

> **DECO EXCHANGE** — Microservicio de pricing para tokens de launchpad: gestión de tokens custom, sistema de peg (fiat/crypto), motor de simulación algorítmica, entropía interna, bandas de precio inteligentes y alertas semáforo.

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
║   ║        MICRO PRICING LAUNCHPAD (:3016)                   ║     ║
║   ║                                                          ║     ║
║   ║  ┌─────────────────────────────────────────────────┐    ║     ║
║   ║  │              API Layer (NestJS)                  │    ║     ║
║   ║  │  /health  /custom-tokens  /pricing/launchpad     │    ║     ║
║   ║  │  /price-bands  /network-deltas  /api/docs        │    ║     ║
║   ║  └───────────────────┬─────────────────────────────┘    ║     ║
║   ║                      │                                   ║     ║
║   ║  ┌───────────────────▼────────────────────────────┐     ║     ║
║   ║  │            PRICING ENGINE                       │     ║     ║
║   ║  │                                                 │     ║     ║
║   ║  │  ┌───────────┐ ┌───────────┐ ┌─────────────┐  │     ║     ║
║   ║  │  │  MANUAL   │ │  PEGGED   │ │  SIMULATED  │  │     ║     ║
║   ║  │  │ Admin set │ │ Auto-sync │ │ Random walk │  │     ║     ║
║   ║  │  └─────┬─────┘ └─────┬─────┘ └──────┬──────┘  │     ║     ║
║   ║  │        └──────────────┼──────────────┘         │     ║     ║
║   ║  │                       ▼                        │     ║     ║
║   ║  │           ┌───────────────────┐                │     ║     ║
║   ║  │           │  Floor / Ceiling  │                │     ║     ║
║   ║  │           │    Validation     │                │     ║     ║
║   ║  │           └─────────┬─────────┘                │     ║     ║
║   ║  │                     ▼                          │     ║     ║
║   ║  │           ┌───────────────────┐                │     ║     ║
║   ║  │           │   BASE PRICE      │                │     ║     ║
║   ║  │           └─────────┬─────────┘                │     ║     ║
║   ║  └─────────────────────┼──────────────────────────┘     ║     ║
║   ║                        │                                 ║     ║
║   ║  ┌─────────────────────▼──────────────────────────┐     ║     ║
║   ║  │          NETWORK DELTAS                         │     ║     ║
║   ║  │  Manual cost per network (BSC=$0.05, ERC20=$0.50)│    ║     ║
║   ║  │  + Emergency override + Network pause           │     ║     ║
║   ║  └─────────────────────┬──────────────────────────┘     ║     ║
║   ║                        │                                 ║     ║
║   ║  ┌─────────────────────▼──────────────────────────┐     ║     ║
║   ║  │       PRICE BANDS + ENTROPY ENGINE              │     ║     ║
║   ║  │                                                 │     ║     ║
║   ║  │  Mode: MANUAL (admin) or AUTO (entropy)         │     ║     ║
║   ║  │  ┌─────────────────────────────────────┐       │     ║     ║
║   ║  │  │  Entropy Score (0-1)                 │       │     ║     ║
║   ║  │  │  = 30% Internal Volatility           │       │     ║     ║
║   ║  │  │  + 35% 24h Price Change              │       │     ║     ║
║   ║  │  │  + 20% Profile Risk (admin)          │       │     ║     ║
║   ║  │  │  + 15% Peg Deviation                 │       │     ║     ║
║   ║  │  │  → Asymmetric Spread Recommendation  │       │     ║     ║
║   ║  │  └─────────────────────────────────────┘       │     ║     ║
║   ║  │                                                 │     ║     ║
║   ║  │  Legal Limits: CLAMP to compliance bounds       │     ║     ║
║   ║  │  Traffic Light: 🟢 SAFE 🟠 WARNING 🔴 DANGER  │     ║     ║
║   ║  └─────────────────────┬──────────────────────────┘     ║     ║
║   ║                        │                                 ║     ║
║   ║                        ▼                                 ║     ║
║   ║              ┌───────────────────┐                       ║     ║
║   ║              │  FINAL BUY/SELL   │                       ║     ║
║   ║              │     PRICE         │                       ║     ║
║   ║              └───────────────────┘                       ║     ║
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

## Modelos de Pricing

El servicio soporta **4 modelos de pricing** para tokens personalizados:

| Modelo | Fuente del Precio | Descripción |
|--------|-------------------|-------------|
| **MANUAL** | Admin vía API | El admin define y actualiza el precio manualmente |
| **PEGGED** | Auto-sync con referencia | Precio anclado a USD, BTC, ETH, BNB, USDT, USDC u otro token custom |
| **SIMULATED** | Motor algorítmico | Random walk con drift, volatilidad, tendencia y mean reversion |
| **INTERNAL** | Order engine (futuro) | Precio calculado por matching de órdenes internas |

### Categorías de Token

| Categoría | Descripción | Ejemplo |
|-----------|-------------|---------|
| `STABLE` | Stablecoins pegged a fiat/crypto | DECO (peg USD 1:1) |
| `ALTCOIN` | Tokens de precio variable | DECOX ($0.15) |
| `UTILITY` | Tokens de utilidad del ecosistema | DECOX-REWARDS |
| `PARTNER` | Tokens de alianzas comerciales | PARTNER-A |
| `MEME` | Tokens meme/community | DOGE-DECOX |

---

## Flujo del Precio Final

```
┌──────────────────────────────────────────────────────────────────┐
│                     PRECIO FINAL PIPELINE                         │
│                                                                   │
│  ① Precio Base (según modelo)                                    │
│     MANUAL → admin lo define                                     │
│     PEGGED → auto-sync con referencia × ratio                   │
│     SIMULATED → motor algorítmico genera el precio              │
│     INTERNAL → order matching engine (futuro)                    │
│                          │                                        │
│                          ▼                                        │
│              ② Floor / Ceiling Validation                         │
│              (clamp a límites del token)                          │
│                          │                                        │
│                          ▼                                        │
│              ③ + Network Delta                                    │
│              (cost per chain: INTERNAL=$0, BSC=$0.05)            │
│                          │                                        │
│                          ▼                                        │
│              ④ Apply Spread (buy/sell)                            │
│              ┌────────────────────┐                               │
│              │  MANUAL: admin set  │                              │
│              │  AUTO: entropy calc │                              │
│              └────────────────────┘                               │
│                          │                                        │
│                          ▼                                        │
│              ⑤ Clamp to Legal Limits                              │
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
│           ENTROPY ENGINE (Internal Signals)              │
│                                                          │
│  Señales (todas internas, NO de mercado externo):        │
│                                                          │
│  ├── Internal Volatility (CoV del historial)  w = 30%   │
│  ├── 24h Price Change (cambio absoluto %)     w = 35%   │
│  ├── Profile Risk (riskLevel del admin)       w = 20%   │
│  └── Peg Deviation (si es token PEGGED)       w = 15%   │
│                                                          │
│  Entropy Score: 0.0 ─────────────────── 1.0              │
│                 LOW    MEDIUM   HIGH   EXTREME           │
│                 0.25    0.50    0.75                      │
│                                                          │
│  Spread Mapping:                                         │
│  score=0 → volatilityProfile.minSpread (ej: 0.1%)      │
│  score=1 → volatilityProfile.maxSpread (ej: 5.0%)      │
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

## Motor de Simulación

```
┌────────────────────────────────────────────────────────┐
│           SIMULATION ENGINE (SIMULATED Model)            │
│                                                          │
│  Algorithm: Random Walk with Mean Reversion              │
│                                                          │
│  newPrice = currentPrice                                 │
│    × (1 + dailyDrift / ticksPerDay)         ← trend     │
│    × (1 + gaussianNoise × volatility)       ← noise     │
│    × (1 + meanReversion × (init/curr - 1))  ← revert    │
│  newPrice = CLAMP(newPrice, floor, ceiling)              │
│                                                          │
│  Config por token:                                       │
│  ├── trend: BULLISH | BEARISH | SIDEWAYS | VOLATILE     │
│  ├── dailyDriftPct: drift diario % (+0.5 = alcista)     │
│  ├── volatilityPct: ruido por tick %                     │
│  ├── tickIntervalMs: intervalo entre ticks (ms)          │
│  ├── meanReversion: 0-1 fuerza hacia initialPrice       │
│  └── enabled: on/off                                     │
│                                                          │
│  Gaussian noise via Box-Muller transform                 │
│  Auto-start en boot para tokens SIMULATED habilitados   │
│  Admin puede start/stop/restart en runtime               │
└────────────────────────────────────────────────────────┘
```

---

## Endpoints

> **Prefijo global**: `/api/v1`  
> **Auth**: Todos los `/internal/*` requieren header `x-internal-auth`

### Health (No Auth)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check del servicio |

### Custom Tokens (Admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/custom-tokens` | Listar tokens (filtros: category, pricingModel, enabled) |
| `GET` | `/internal/custom-tokens/:tokenCode` | Detalle de un token |
| `POST` | `/internal/custom-tokens` | Crear nuevo token |
| `PUT` | `/internal/custom-tokens/:tokenCode` | Actualizar configuración |
| `DELETE` | `/internal/custom-tokens/:tokenCode` | Delist (soft-delete) |
| `PATCH` | `/internal/custom-tokens/:tokenCode/price` | Actualizar precio (manual override) |
| `GET` | `/internal/custom-tokens/:tokenCode/ticker/latest` | Último ticker del token |
| `GET` | `/internal/custom-tokens/tickers/all-latest` | Últimos tickers de todos |
| `GET` | `/internal/custom-tokens/:tokenCode/ticker/history` | Historial de precios |
| `POST` | `/internal/custom-tokens/:tokenCode/peg-sync` | Trigger peg sync manual |
| `POST` | `/internal/custom-tokens/peg-sync/all` | Sync todos los pegged |
| `POST` | `/internal/custom-tokens/:tokenCode/simulation/start` | Iniciar simulación |
| `POST` | `/internal/custom-tokens/:tokenCode/simulation/stop` | Detener simulación |
| `POST` | `/internal/custom-tokens/simulation/restart-all` | Reiniciar todas |

### Pricing (Quotes — Inter-service)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/pricing/launchpad/latest/:tokenCode` | Precio base (sin spreads) |
| `GET` | `/internal/pricing/launchpad/all-latest` | Todos los precios |
| `GET` | `/internal/pricing/launchpad/quote/:token/:network/:op` | Quote BUY/SELL completo |
| `POST` | `/internal/pricing/launchpad/calculate-final` | Quote vía POST body |
| `GET` | `/internal/pricing/launchpad/bulk-quote/:network/:op` | Bulk quotes por red |

### Price Bands

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/price-bands` | Listar bandas (filtros: assetCode, alertLevel, enabled) |
| `GET` | `/internal/price-bands/alerts` | Dashboard semáforo (traffic-light) |
| `GET` | `/internal/price-bands/alerts/:assetCode` | Alertas por asset |
| `GET` | `/internal/price-bands/lookup` | Buscar banda (query: assetCode, networkCode) |
| `GET` | `/internal/price-bands/:id` | Banda por ID |
| `POST` | `/internal/price-bands` | Crear banda |
| `PUT` | `/internal/price-bands/:id` | Actualizar banda |
| `PUT` | `/internal/price-bands/:id/mode` | Cambiar modo MANUAL ↔ AUTO |
| `DELETE` | `/internal/price-bands/:id` | Eliminar banda |
| `POST` | `/internal/price-bands/refresh-entropy` | Recalcular entropía |

### Network Deltas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/internal/network-deltas` | Listar deltas (filtros: assetCode, networkCode, enabled) |
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

### Dashboard (Dev Only)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/dashboard` | Dashboard launchpad (NODE_ENV ≠ production) |

---

## Swagger

Documentación interactiva:

```
http://localhost:3016/api/docs
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
cd Exchange--micro-pricing-fee-launchpad

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### Variables de Entorno

```env
# ─── Servidor ─────────────────────────────
PORT=3016
NODE_ENV=development

# ─── Base de datos ────────────────────────
MONGODB_URI=mongodb+srv://xxxxx--xxxxx:xxxxx--xxxxx@cluster.mongodb.net/deco-exchange-micro

# ─── Seguridad ────────────────────────────
INTERNAL_AUTH_TOKEN=xxxxx--xxxxx
# CORS_ORIGIN=http://localhost:3000  # Comma-separated. Vacío = allow all

# ─── Peg Sync (tokens PEGGED a crypto) ───
PRICING_CRYPTO_URL=http://localhost:3012/api/v1
PRICING_CRYPTO_AUTH_TOKEN=xxxxx--xxxxx
PEG_SYNC_INTERVAL_MS=300000
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
1. Tokens custom registrados en DB (agrupados por modelo)
2. Frescura de últimos precios guardados
3. Conectividad a micro-pricing-crypto (para peg sync)
4. Estado de MongoDB
5. Auto-start de simulaciones para tokens SIMULATED

---

## Colecciones MongoDB

| Colección | Descripción |
|-----------|-------------|
| `custom_tokens` | Definición de tokens (precio, modelo, peg, simulación, volatilidad) |
| `custom_token_tickers` | Historial de precios append-only (TTL: 90 días) |
| `price_bands` | Bandas de spread + entropía + alertas semáforo |
| `network_deltas` | Deltas de costo por red + emergencias |

---

## Ecosistema DECO EXCHANGE

```
┌────────────────────────────────────────────────────────┐
│  Asset Registry     :3010  ← Catálogo de activos       │
│  Pricing Crypto     :3012  ← Precios de mercado (APIs) │
│  Pricing Fiat       :3014  ← Tasas de cambio fiat      │
│  Pricing Launchpad  :3016  ← ESTE SERVICIO             │
│  Fee Aggregator     :30XX  ← Cálculo de comisiones     │
│  Custody Crypto     :30XX  ← Custodia y wallets        │
└────────────────────────────────────────────────────────┘
```

---

## Estructura del Proyecto

```
src/
├── main.ts                             ← Bootstrap, Swagger, banner
├── app.module.ts                       ← Root module
├── health/                             ← GET /health
├── tokens/                             ← Token management
│   ├── tokens.controller.ts            ← CRUD + price + peg + simulation
│   ├── tokens.service.ts               ← Business logic + tickers
│   ├── peg-sync.service.ts             ← Auto-sync para PEGGED
│   ├── simulation-engine.service.ts    ← Random walk para SIMULATED
│   ├── dto/                            ← CreateTokenDto, UpdateTokenDto, etc.
│   └── schemas/
│       ├── custom-token.schema.ts      ← Token definition (pricingModel, pegConfig, etc.)
│       └── custom-token-ticker.schema.ts ← Price history (append-only)
├── pricing/                            ← Quote pipeline
│   ├── pricing.controller.ts           ← GET/POST quotes
│   ├── pricing.service.ts              ← base → floor/ceiling → delta → spread → final
│   └── schemas/
├── price-bands/                        ← Spreads + entropy
│   ├── price-bands.controller.ts       ← CRUD + alerts + entropy refresh
│   ├── price-bands.service.ts          ← Band management + cron
│   ├── entropy-engine.service.ts       ← 4 internal signals → score
│   └── schemas/
├── network-deltas/                     ← Per-chain cost adjustments
├── dashboard/                          ← Dev dashboard (serves HTML)
└── shared/
    ├── guards/internal-auth.guard.ts   ← x-internal-auth validation
    └── startup/                        ← Boot health checks
```

---

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | NestJS 11 |
| Lenguaje | TypeScript 5.7 |
| Base de Datos | MongoDB Atlas (Mongoose 8) |
| Pricing Models | MANUAL, PEGGED, SIMULATED, INTERNAL |
| Simulation | Box-Muller Gaussian random walk |
| Entropy | 4 señales internas (vol, change, risk, peg) |
| Documentación | Swagger / OpenAPI |
| Package Manager | Yarn 4.12 |

---

## Documentación relacionada

Consulta el [pricing fee aggregator](../exchange--micro-pricing-fee-aggregator/README.md) para situar este componente en el flujo. Los modelos disponibles se documentan en los schemas de este proyecto; no hay una carpeta `docs/` adicional en esta copia.

## Licencia

[MIT](LICENSE) — DECO EXCHANGE © 2026

## Relación con otros proyectos

Este esquema resume relaciones de alto nivel descritas en el repositorio. Las líneas punteadas indican integraciones incompletas o pendientes de validación; ninguna flecha certifica que el flujo esté desplegado o probado.

```mermaid
flowchart LR
  UP0["micro-pricing-fee-aggregator"] --> SERVICE["micro-pricing-fee-launchpad"]
  SERVICE["micro-pricing-fee-launchpad"] --> TARGET["Fuentes de mercado / activos configurados"]
```

**Documentación relacionada:** [micro-pricing-fee-aggregator](../exchange--micro-pricing-fee-aggregator/README.md).

**Capacidad:** no hay resultados de carga publicados para este componente. Consulta la sección de [capacidad y rendimiento](../README.md#capacity) del README raíz.

**Archivos del componente:** [`.env.example`](.env.example) · [`CHANGELOG.md`](CHANGELOG.md) · [mapa general](../README.md#service-docs).

<!-- DECO-RELATION-DIAGRAM -->
