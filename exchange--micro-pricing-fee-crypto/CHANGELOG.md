# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


All notable changes to this project will be documented in this file.

## [2.1.0] - 2026-02-22

### Added — Dashboard v2 (Exchange-Grade)
- Rediseño completo del dashboard profesional con tipografía Inter / JetBrains Mono
- Tema oscuro exchange-grade con paleta de colores consistente
- Pantalla de autenticación inline con `x-internal-auth` token
- Chip de estado de conexión (connected / disconnected)
- Auto-refresh cada 60 segundos

### Added — Exchange Prices BUY / SELL Table
- Nueva sección "Exchange Prices — BUY / SELL" en dashboard
- Columnas: Asset, Internal Price, Buy Spread, 🟢 User BUY, Sell Spread, 🔴 User SELL
- Exchange Margin con porcentaje y monto USD
- Indicadores de Alert (SAFE/WARNING/DANGER/BLOCKED) y Mode (MANUAL/AUTO)
- Leyenda dual: perspectiva usuario (🟢 BUY / 🔴 SELL) y perspectiva Broker (🔴 SELL / 🟢 BUY)

### Added — Price Bands & Entropy Cards
- Tarjetas por asset con precios reales USD (🔵 Internal, 🟢 User BUY, 🔴 User SELL)
- Barra visual de entropía con score y nivel
- Detalle de spreads (buy/sell %) y límites legales
- Recomendaciones calculadas por el motor de entropía

### Added — PATCH Cron Override
- Endpoint `PATCH /internal/api-usage/smart-cron` para override runtime del intervalo
- Permite ajustar temporalmente el intervalo del smart cron sin reiniciar

### Changed — API Rate Limiting
- Intervalos de smart cron cambiados de 30s–5min a 1h–4h (~24 llamadas/día)
- Variables `CRON_MIN_INTERVAL_MS` (3600000) y `CRON_MAX_INTERVAL_MS` (14400000)

### Changed — Swagger desde Variables de Entorno
- Configuración de Swagger extraída a env vars: `APP_NAME`, `SWAGGER_DESCRIPTION`, `CONTACT_URL`, `CONTACT_EMAIL`, `LICENSE_NAME`, `LICENSE_URL`
- Versión dinámica leída desde `package.json`

### Changed — Configuración y Limpieza
- CORS habilitado en `main.ts`
- CleanLogger para silenciar logs internos de NestJS (RouterExplorer, RoutesResolver, etc.)
- `.env.example` actualizado con todas las nuevas variables
- Base de datos renombrada a `deco-exchange-micro`

---

## [2.0.0] - 2026-02-15

### Added — Swagger / OpenAPI
- Swagger UI en `/api/docs` con DocumentBuilder
- Decoradores `@ApiTags`, `@ApiOperation`, `@ApiParam`, `@ApiBody`, `@ApiQuery`, `@ApiHeader` en todos los controllers
- `@ApiProperty` / `@ApiPropertyOptional` en todos los DTOs
- Autenticación API Key (x-internal-auth) documentada en Swagger

### Added — Motor de Entropía
- `EntropyEngineService` — cálculo de entropía (0–1) desde volatilidad, cambio 24h y volumen
- Pesos configurables: 35% source volatility, 40% price change, 25% volume
- Spreads asimétricos: distribución 60/40 según dirección del mercado
- Sistema de alertas semáforo: 🟢 SAFE, 🟠 WARNING, 🔴 DANGER, ⛔ BLOCKED
- Modo MANUAL/AUTO en Price Bands — AUTO calcula spreads desde entropía
- Cron de entropía cada :15 y :45 de cada hora

### Added — API Rate-Limit Tracker
- Schema `ApiUsage` con tracking por fuente/día (UTC window)
- `ApiTrackerService` — track calls, budget check, rate limit detection
- `ApiTrackerController` — dashboard admin (`/internal/api-usage`)
- Endpoints: dashboard, budget, smart-cron interval, history
- Resumen diario a las 23:59 UTC

### Added — Smart Cron Dinámico
- Reemplazado `@Cron('*/30 * * * * *')` fijo por `setTimeout` dinámico
- Intervalo calculado: `(seconds_left / min_remaining) × 1.2`
- Rango: 30s (mínimo) a 5min (máximo)
- Auto-throttle en 429 (rate limit hit)

### Added — On-Demand Price Refresh
- Si un quote se solicita y el precio es >2min stale → fetch fresh antes de responder
- Garantiza datos frescos para operaciones reales

### Added — Startup Health Checks
- `StartupHealthService` (OnApplicationBootstrap)
- Verificación de monedas configuradas y estado enabled/disabled
- Check de frescura de últimos precios (alerta si >5min stale)
- Ping a las 3 APIs externas (CoinGecko, CMC, CryptoCompare) con timeout 8s
- Estimación de documentos en colecciones clave

### Added — Consola de Inicio
- ASCII banner "DECOX" al arrancar
- Logs de URLs: servidor, Swagger, health
- Detección de entorno (development/production)
- Estado de auth token

### Changed — Pricing Service
- Migrado de `@Cron` a smart cron con `setTimeout`
- Integración de `ApiTrackerService` en los 3 fetchers
- Budget check antes de cada llamada API
- Tracking de llamadas exitosas y errores

### Changed — Network Deltas
- Simplificado: removido gas-fees automático (GasFeesService)
- Solo manual delta + emergency override + network pause

### Changed — Documentación
- README reescrito con badges, diagramas ASCII, tablas de endpoints
- CHANGELOG actualizado con formato semántico
- Licencia cambiada a MIT

### Removed
- `GasFeesService` (gas automático removido — ahora todo es manual)
- Cron fijo de 30s (reemplazado por smart cron)

---

## [1.0.1] - 2026-01-30

### Changed
- Updated dependencies to latest stable versions
- Enhanced .gitignore coverage
- Improved documentation and code organization

---

## [1.0.0] - 2026-01-16

### Added
- Initial release of Crypto Pricing microservice
- Multi-source pricing aggregation (CoinGecko, CoinMarketCap, CryptoCompare)
- Real API integration with authenticated requests
- Price band calculation with admin spreads
- Network Deltas for per-chain cost adjustments
- Legal compliance bands (max deviation limits)
- Internal auth guard (`x-internal-auth` header)
- Health check endpoint
- MongoDB Atlas persistence
- Cron-based price refresh (every 30s)
