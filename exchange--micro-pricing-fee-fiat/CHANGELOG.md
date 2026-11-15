# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


All notable changes to this project will be documented in this file.

## [3.1.0] - 2026-02-26

### Added — Multi-Source Expansion (5 APIs)
- **FloatRates** — fuente gratuita sin API key, datos de bancos centrales, cobertura LATAM completa (incluye VES, SVC)
- **Fawaz Currency API** — fuente CDN global gratuita, cobertura de TODAS las monedas ISO (1000+ calls/día)
- 4 fuentes activas por defecto: `EXCHANGERATE_API`, `FRANKFURTER`, `FLOATRATES`, `FAWAZ_CURRENCY`
- `exchangerate.host` disponible como 5ta fuente (requiere API key, dormida por defecto)
- Variables de entorno: `FLOATRATES_URL`, `FAWAZ_CURRENCY_URL`, `FLOATRATES_DAILY_LIMIT`, `FAWAZ_CURRENCY_DAILY_LIMIT`

### Added — Cross-Rate Triangulation
- 4 estrategias de resolución automática: `DIRECT → INVERSE → CROSS_USD → CROSS_EUR`
- Cualquier par fiat se puede consultar sin configuración previa (ej: COP→MXN, PEN→BRL)
- Respuesta incluye `rateMethod` y `crossRateVia` para transparencia del cálculo
- Pivot currencies: USD (primario), EUR (fallback)

### Added — Expanded Currency Coverage
- 12 pares activos: USD_COP, USD_MXN, EUR_COP, USD_PEN, USD_VES, USD_SVC, MXN_COP, EUR_USD, GBP_USD, USD_BRL, USD_ARS, USD_CLP
- USD_SVC (Colón salvadoreño) ahora con datos reales de FloatRates + Fawaz Currency
- USD_VES (Bolívar venezolano) con 3 fuentes independientes

### Changed — Branding
- Renombrado de "DECO EXCHANGE" a **DECO Exchange** en todo el proyecto
- Dashboard: título, header brand, login screen, footer → DECO Exchange
- README, CHANGELOG, package.json → DECO Exchange

### Changed — Dashboard (5 Sources)
- 5 columnas de fuentes en Live Rates: ER, FK, EH, FR, FZ
- Pair Configurations muestra 5 source tags
- API Rate-Limit Budget muestra 5 fuentes con leyenda
- `sourceTag()` mapea los 5 campos de fuente a abreviaciones

### Changed — Schemas
- `FiatPairConfiguration.sources` default: 4 fuentes activas
- `FiatRateTicker`: 5 campos `SourceRate` (exchangeRateApi, frankfurter, exchangeRateHost, floatRates, fawazCurrency)
- API Tracker LIMITS incluye las 5 fuentes con límites configurables via env

### Fixed
- ExchangeRate-API URL: `/v6/latest` (antes faltaba `/latest`, causaba 404)
- DB cambiada a `deco-exchange-micro` (base de datos compartida del ecosistema)

---

## [3.0.0] - 2026-02-26

### Added — Transformación Completa a Fiat
- Migración total de microservicio crypto a **fiat pricing** puro
- 3 fuentes de tasas de cambio: ExchangeRate-API, Frankfurter, exchangerate.host
- Schema `FiatRateTicker` con `pairCode`, `baseCurrency`, `quoteCurrency`
- Schema `FiatPairConfiguration` para pares fiat configurables
- `PricingService` con fetchers para las 3 APIs fiat (open.er-api.com, api.frankfurter.app, api.exchangerate.host)
- Estrategia de agregación AVERAGE entre fuentes
- Rutas fiat: `/internal/pricing/fiat/rate/:base/:quote`, `/internal/pricing/fiat/quote/:pair/:corridor/:operation`, `/internal/pricing/fiat/all-rates`, `/internal/pricing/fiat/configurations`
- Pares soportados: USD_COP, USD_MXN, USD_PEN, USD_VES, USD_SVC, EUR_COP, MXN_COP
- Puerto cambiado a **3014**

### Changed — Price Bands → Fiat
- Campos renombrados: `assetCode` → `pairCode`, `networkCode` → `corridorCode`
- Límites legales ajustados: ±3%/±2% (regulación cambiaria fiat)
- Índice único: `{ pairCode: 1, corridorCode: 1 }`

### Changed — Motor de Entropía → Fiat
- Pesos recalibrados: 50% volatilidad de fuentes, 50% cambio 24h (sin volumen, no aplica a forex)
- Umbrales fiat: 2% desviación entre fuentes = EXTREME, 5% cambio 24h = EXTREME
- Spreads fiat: 0.1% mínimo – 2.0% máximo

### Changed — Network Deltas → Corridor Deltas
- Terminología cambiada: "network" → "corridor" (corredores de pago)
- Corredores soportados: SWIFT, LOCAL, ACH, SEPA (en vez de ERC20, BSC, TRC20, etc.)
- Colección: `network_deltas` (campo `corridorCode`)

### Changed — Dashboard
- Branding actualizado: DECO EXCHANGE / micro-pricing-fiat v3.0.0
- Fuentes del dashboard: ER (ExchangeRate-API), FK (Frankfurter), EH (exchangerate.host)
- Pares fiat en seed: USD_COP, USD_MXN, EUR_COP, USD_PEN, etc.
- Endpoints del dashboard apuntan a `/internal/pricing/fiat/*`

### Changed — Infraestructura
- `package.json`: nombre `micro-pricing-fiat` v3.0.0
- Puerto: 3014 (antes 3012)
- Colecciones MongoDB: `fiat_rate_tickers`, `fiat_pair_configurations`
- Variables de entorno: `EXCHANGERATE_API_KEY`, `EXCHANGERATE_HOST_KEY`
- Smart cron adaptado a APIs fiat (budgets: 50/500/100 calls diarias)

### Removed
- Toda referencia a crypto, blockchain, CoinGecko, CoinMarketCap, CryptoCompare
- Schemas `CryptoPriceTicker`, `PriceConfiguration` (reemplazados por schemas fiat)
- Campos: `volume24h`, `marketCap`, `basePriceUsd`, `finalBasePriceUsd`
- Puerto 3012

---

## [2.1.0] - 2026-02-22

### Added — Dashboard v2 (Exchange-Grade)
- Rediseño completo del dashboard profesional con tipografía Inter / JetBrains Mono
- Tema oscuro exchange-grade con paleta de colores consistente
- Pantalla de autenticación inline con `x-internal-auth` token
- Auto-refresh cada 60 segundos

### Added — Exchange Rates BUY / SELL Table
- Sección "Exchange Rates — BUY / SELL" en dashboard
- Columnas: Pair, Internal Rate, Buy Spread, 🟢 User BUY, Sell Spread, 🔴 User SELL
- Exchange Margin con porcentaje y monto
- Indicadores de Alert (SAFE/WARNING/DANGER/BLOCKED) y Mode (MANUAL/AUTO)

### Added — Rate Bands & Entropy Cards
- Tarjetas por par con tasas reales (🔵 Internal, 🟢 User BUY, 🔴 User SELL)
- Barra visual de entropía con score y nivel
- Spreads (buy/sell %) y límites legales

### Added — PATCH Cron Override
- Endpoint `PATCH /internal/api-usage/smart-cron` para override del intervalo
- Permite ajustar temporalmente el intervalo del smart cron sin reiniciar

### Changed — API Rate Limiting
- Intervalos de smart cron: 1h–4h (~24 llamadas/día)
- Variables `CRON_MIN_INTERVAL_MS` / `CRON_MAX_INTERVAL_MS`

### Changed — Swagger desde Variables de Entorno
- Configuración de Swagger extraída a env vars
- Versión dinámica leída desde `package.json`

---

## [2.0.0] - 2026-02-15

### Added — Swagger / OpenAPI
- Swagger UI en `/api/docs` con DocumentBuilder
- Decoradores completos en todos los controllers y DTOs
- Autenticación API Key documentada en Swagger

### Added — Motor de Entropía
- `EntropyEngineService` — cálculo de entropía (0–1) desde volatilidad y cambio de tasa
- Spreads asimétricos: distribución 60/40 según dirección del mercado
- Sistema de alertas semáforo: 🟢 SAFE, 🟠 WARNING, 🔴 DANGER, ⛔ BLOCKED
- Modo MANUAL/AUTO en Price Bands

### Added — API Rate-Limit Tracker
- `ApiTrackerService` — track calls, budget check, rate limit detection
- `ApiTrackerController` — dashboard admin (`/internal/api-usage`)
- Resumen diario a las 23:59 UTC

### Added — Smart Cron Dinámico
- `setTimeout` dinámico en lugar de `@Cron` fijo
- Auto-throttle en 429 (rate limit hit)

### Added — Startup Health Checks
- `StartupHealthService` con verificación de pares y frescura de datos
- Ping a las 3 APIs externas con timeout 8s
- Estimación de documentos en colecciones clave

---

## [1.0.1] - 2026-01-30

### Changed
- Updated dependencies to latest stable versions
- Enhanced .gitignore coverage
- Improved documentation and code organization

---

## [1.0.0] - 2026-01-16

### Added
- Initial release of Fiat Pricing microservice
- Multi-source rate aggregation (ExchangeRate-API, Frankfurter, exchangerate.host)
- Real API integration with authenticated requests
- Rate band calculation with admin spreads
- Corridor Deltas for per-corridor cost adjustments
- Legal compliance bands (max deviation limits for fiat regulations)
- Internal auth guard (`x-internal-auth` header)
- Health check endpoint
- MongoDB Atlas persistence
- Smart cron-based rate refresh
