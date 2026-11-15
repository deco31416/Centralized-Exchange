# Plan Mercado - Deco Exchange

Documento de control tipo Jira para construir las interfaces de Mercados paso a paso.

Regla principal: no avanzar al siguiente modulo hasta que el modulo actual este revisado, corregido y marcado como HECHO.

Definicion oficial: Mercados no se construye como dashboard tradicional ni como landing estatica. Cada modulo debe ser un dashboard landing operativo: presenta el producto, guia al usuario y muestra una experiencia funcional tipo exchange.

## Flujo De Estados

| Estado | Significado |
|---|---|
| POR HACER | Tarea pendiente, aun no se toca codigo. |
| EN DISENO | Estamos pensando estructura, UX, copy y componentes. |
| EN DESARROLLO | Se esta implementando. |
| EN REVISION | Ya existe en codigo y se esta revisando visual/funcionalmente. |
| AJUSTES | El usuario pidio cambios antes de cerrar. |
| HECHO | Revisado, corregido y verificado. |
| BLOQUEADO | No se puede continuar sin decision o dependencia. |

## Reglas De Trabajo

- Trabajar un modulo a la vez.
- Cada modulo debe ser dashboard landing operativo, como P2P y Market Maker.
- No hacer dashboards administrativos tradicionales.
- No hacer landing pages informativas sin experiencia funcional.
- La primera pantalla debe explicar el producto y al mismo tiempo dejar entrar a la operacion.
- Referencias funcionales: Binance y Hyperliquid.
- Estilo visual: Deco Exchange, no copia literal.
- Todo debe quedar componetizado.
- Gestor de paquetes oficial: `pnpm`. No usar `npm` para instalar, correr scripts o documentar comandos.
- Nada de paginas informativas vacias para Mercados.
- Antes de implementar cada bloque, se piensa y se valida el objetivo.
- Despues de implementar, se revisa en `localhost` y se marca el estado.
- Estos modulos son mockups de UX conectables: luego se integran al backend/BFF/gateway de usuario sin rehacer la interfaz.

## Patron Aprobado

Las referencias internas aprobadas son:

1. `/markets/p2p`
   Dashboard landing operativo para intercambio entre personas.

2. `/markets/market-maker`
   Dashboard landing operativo para mesa OTC, cupos, acuerdos y negociaciones.

Estas dos rutas definen la estructura base para los nuevos mercados:

| Bloque | Regla |
|---|---|
| Header de producto | Debe explicar que es el modulo, para quien es y que accion permite. |
| Navegacion interna | Debe organizar vistas del producto sin mandar al usuario a rutas sueltas. |
| Resumen operativo | Debe mostrar metricas, estado, actividad u oportunidades. |
| Vistas funcionales | Deben parecer producto real conectable a backend, no secciones informativas. |
| Acciones claras | Cada vista debe tener una accion natural del usuario. |
| Copy | Comercial, claro, en espanol, sin lenguaje interno de desarrollo. |
| Componentizacion | Cada vista y pieza repetible debe vivir en componentes separados. |

## Plantilla Para Cada Modulo De Mercado

Cada modulo nuevo debe seguir esta plantilla antes de cerrarse:

| Paso | Bloque | Estado inicial |
|---|---|---|
| 1 | Header producto | POR HACER |
| 2 | Navegacion interna | POR HACER |
| 3 | Resumen operativo | POR HACER |
| 4 | Vista principal funcional | POR HACER |
| 5 | Vista secundaria / gestion | POR HACER |
| 6 | Historial / actividad | POR HACER |
| 7 | Acciones y modales | POR HACER |
| 8 | Revision de copy comercial | POR HACER |
| 9 | Revision responsive | POR HACER |
| 10 | Verificacion local | POR HACER |

## Roadmap General

| ID | Epica | Estado | Prioridad | Ruta |
|---|---|---|---|---|
| MKT-001 | Arquitectura de menu Mercados | HECHO | Alta | Navbar |
| MKT-002 | Market Maker OTC | EN REVISION | Alta | `/markets/market-maker` |
| MKT-003 | Spot Dashboard Landing Trading | EN REVISION | Alta | `/markets/spot` |
| MKT-004 | Trading Pro / Ordenes avanzadas | EN REVISION | Alta | `/markets/advanced-orders` |
| MKT-005 | Futuros / Perps | EN REVISION | Alta | `/markets/futures` |
| MKT-006 | Analisis de Mercado | EN REVISION | Media | `/markets/market-analysis` |
| MKT-007 | Historial global de ordenes | EN REVISION | Media | `/markets/order-history` |
| MKT-008 | Alertas de Precio | EN REVISION | Media | `/markets/price-alerts` |
| MKT-009 | API de datos | EN REVISION | Media | `/markets/data-api` |
| MKT-010 | Graficas, datos y tokens propios | EN REVISION | Alta | Compartido |

---

# MKT-001 - Arquitectura De Menu Mercados

## Objetivo

Ordenar el menu de Mercados para que Spot y Futuros sean mercados principales, P2P y Market Maker sean modalidades especiales, y las herramientas queden debajo.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| MKT-001-01 | Reordenar menu Mercados | HECHO | Spot y Futuros aparecen primero. |
| MKT-001-02 | Renombrar Ordenes Avanzadas a Trading Pro | HECHO | El menu muestra `Trading Pro`. |
| MKT-001-03 | Ajustar copys del menu | HECHO | Los textos son comerciales y claros. |
| MKT-001-04 | Crear rutas base para items visibles | HECHO | Las rutas responden en local. |

## Orden Actual Del Menu

1. Spot
2. Futuros
3. P2P Market
4. Market Maker
5. Trading Pro
6. Analisis de Mercado
7. Historial de Ordenes
8. Alertas de Precio
9. API de datos

---

# MKT-002 - Market Maker OTC

## Objetivo

Crear una experiencia para mesas OTC y proveedores de liquidez: cupos, acuerdos, negociaciones, propuestas a Deco y chat comercial.

## Estado Actual

EN REVISION

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| MKT-002-01 | Header producto Market Maker | HECHO | Header aprobado con `Mercados · Market Maker`. |
| MKT-002-02 | Navegacion dashboard | HECHO | Tabs: Dashboard, Mercado OTC, Mis Ofertas, Proveer a Deco, Acuerdos, Chat, Configuracion. |
| MKT-002-03 | Dashboard base | HECHO | Muestra liquidez, precio preferencial, margen e ingreso. |
| MKT-002-04 | Mercado OTC | EN REVISION | Cards comerciales de cupos mayoristas. |
| MKT-002-05 | Mis Ofertas | EN REVISION | Cards y modal de oferta sin lenguaje interno. |
| MKT-002-06 | Proveer a Deco | EN REVISION | Flujo comercial de cupo preferencial. |
| MKT-002-07 | Acuerdos comerciales | HECHO | Vista mejorada como pipeline de acuerdos. |
| MKT-002-08 | Chat de negociaciones | HECHO | Burbujas y resumen de negociacion activa. |
| MKT-002-09 | Configuracion / Perfil comercial | HECHO | Perfil tipo mesa OTC, no lista junior. |

## Pendientes De Revision

- Revisar `Mercado OTC` para que se vea mas como marketplace profesional.
- Revisar `Mis Ofertas` para que se sienta como gestion comercial de cupos.
- Revisar `Proveer a Deco` para que sea mas premium y claro.

---

# MKT-003 - Spot Dashboard Landing Trading

## Objetivo

Construir `/markets/spot` como dashboard landing operativo, no como dashboard tradicional: explica el producto, guia al usuario y permite operar visualmente con terminal, grafica, libro, formulario y ordenes.

## Estado Actual

EN REVISION

## Tareas Paso A Paso

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| MKT-003-01 | Header + navegacion Spot | HECHO | Header producto, par destacado, acciones y tabs internas aplicados. |
| MKT-003-02 | Resumen Spot | EN REVISION | Metricas, preview de grafica, actividad y acceso a terminal aplicados. |
| MKT-003-03 | Terminal Spot | EN REVISION | Grafica, order book, trades, formulario, pares y ordenes abiertas aplicados. |
| MKT-003-04 | Pares Spot | EN REVISION | Lista de pares con precio, volumen, cambio, proveedor de grafica y favoritos. |
| MKT-003-05 | Ordenes Spot | EN REVISION | Ordenes abiertas, estados, fills y formulario claro. |
| MKT-003-06 | Historial Spot | EN REVISION | Fills, ordenes ejecutadas/canceladas, fees y hora. |
| MKT-003-07 | Favoritos Spot | EN REVISION | Watchlist operativa con pares publicos y tokens Deco. |
| MKT-003-08 | Pulido visual Spot | EN REVISION | Primer pase completo aplicado; queda revision visual con usuario. |
| MKT-003-09 | Cierre Spot | EN REVISION | Usuario pidio anotar auditoria y seguir con el siguiente bloque. |
| MKT-003-10 | Integrar capa de grafica | EN REVISION | Spot usa `MarketChart` con proveedor TradingView o Deco Chart segun metadata. |
| MKT-003-11 | Soportar tokens propios sin TradingView | EN REVISION | DECO/DECOX aparecen con proveedor Deco Chart y grafica interna mock. |
| MKT-003-12 | Conectar Spot a Market BFF | HECHO | Spot consume `MarketDataService` para pares, ticker, order book y trades con fallback local. |

## Componentes Creados

- `components/markets/spot/spot-market-container.tsx`
- `components/markets/spot/spot-market-data.ts`
- `components/markets/spot/spot-market-card.tsx`
- `components/markets/spot/spot-market-widgets.tsx`
- `components/markets/spot/views/summary-view.tsx`
- `components/markets/spot/views/terminal-view.tsx`
- `components/markets/spot/views/pairs-view.tsx`
- `components/markets/spot/views/orders-view.tsx`
- `components/markets/spot/views/history-view.tsx`
- `components/markets/spot/views/favorites-view.tsx`

## Auditoria De Codigo Actual

| Bloque | Estado | Nota |
|---|---|---|
| Ruta `/markets/spot` | EN REVISION | Compila y responde 200 OK en local. |
| Componentizacion | EN REVISION | Page, container, data, card, widgets y vistas separadas. |
| Graficas | EN REVISION | `MarketChart` usa TradingView para pares publicos y Deco Chart para tokens propios. |
| Pares publicos | EN REVISION | BTC/USDT, ETH/USDT, SOL/USDT y BNB/USDT tienen `tradingViewSymbol`. |
| Tokens propios | EN REVISION | DECO/USDT y DECOX/USDT usan Deco Chart. |
| Market BFF | HECHO | `useSpotMarketData` conecta `/api/markets/*` y conserva mocks como fallback. |
| Gestor paquetes | HECHO | Regla documentada: usar siempre `pnpm`, no `npm`. |

## Proxima Accion

Revisar visualmente `/markets/spot` y `/markets/futures` con el usuario. Spot quedo auditado y Futuros entro a primer pase completo por instruccion del usuario.

## Checklist MKT-003-01 - Header + Navegacion Spot

| Check | Estado | Nota |
|---|---|---|
| Header sigue patron P2P/Market Maker | HECHO | Header producto con bloque operativo de par destacado. |
| Copy explica Spot sin sonar tecnico de mas | HECHO | Menciona compra/venta, libro, grafica y ejecucion inmediata. |
| Tabs internas son claras | HECHO | Resumen, Terminal, Pares, Ordenes, Historial, Favoritos. |
| No hay rutas sueltas para moverse dentro de Spot | HECHO | Todo vive en tabs internas. |
| El usuario entiende cual es la accion principal | HECHO | Botones `Abrir terminal` y `Ver pares`. |
| No se parece a admin dashboard | HECHO | Tiene patron dashboard landing operativo. |
| Se verifica en `localhost:3000/markets/spot` | HECHO | Responde 200 OK. |

## Checklist MKT-003-02 - Resumen Spot

| Check | Estado | Nota |
|---|---|---|
| Metricas principales visibles | EN REVISION | Par activo, precio, volumen y spread. |
| Preview operativo sin duplicar terminal completa | EN REVISION | Incluye grafica compacta y actividad rapida. |
| Pares destacados accionables | EN REVISION | Click lleva a Terminal. |
| Actividad reciente clara | EN REVISION | Ordenes abiertas y trades recientes. |
| Accion principal clara | EN REVISION | Abrir terminal / operar BTC-USDT. |
| Se verifica en `localhost:3000/markets/spot` | HECHO | Responde 200 OK. |

## Forma Esperada

La experiencia debe sentirse como P2P y Market Maker:

1. Header comercial del producto.
2. Navegacion por vistas.
3. Resumen operativo.
4. Modulos funcionales con datos mock/proximamente reales.
5. Acciones claras.
6. Cero sensacion de admin panel generico.

---

# MKT-004 - Trading Pro / Ordenes Avanzadas

## Objetivo

Convertir `/markets/advanced-orders` en una experiencia avanzada para ordenes Spot y Futuros: limit, market, stop-limit, OCO, TP/SL.

## Estado Actual

EN REVISION

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| MKT-004-01 | Definir posicionamiento | EN REVISION | Queda como capa avanzada para Spot/Futuros, no mercado separado. |
| MKT-004-02 | Header + tabs | EN REVISION | Vista dashboard landing operativa con tabs internas. |
| MKT-004-03 | Formulario Limit / Market | EN REVISION | Inputs claros y estados mock. |
| MKT-004-04 | Stop-limit | EN REVISION | Trigger, limit price y cantidad. |
| MKT-004-05 | OCO | EN REVISION | Take profit + stop loss combinados. |
| MKT-004-06 | TP/SL | EN REVISION | Configuracion para salida de posicion. |
| MKT-004-07 | Conectar Trading Pro a Market BFF | HECHO | Trading Pro consume `MarketDataService` para par activo, ticker y grafica con fallback local. |

## Componentes Creados

- `components/markets/trading-pro/trading-pro-container.tsx`
- `components/markets/trading-pro/trading-pro-data.ts`
- `components/markets/trading-pro/trading-pro-card.tsx`
- `components/markets/trading-pro/trading-pro-widgets.tsx`
- `components/markets/trading-pro/views/trading-pro-summary-view.tsx`
- `components/markets/trading-pro/views/trading-pro-order-view.tsx`
- `components/markets/trading-pro/views/trading-pro-activity-view.tsx`

## Auditoria De Codigo Actual

| Bloque | Estado | Nota |
|---|---|---|
| Ruta `/markets/advanced-orders` | EN REVISION | Compila y responde 200 OK en local. |
| Componentizacion | EN REVISION | Page, container, data, card, widgets y vistas separadas. |
| Posicionamiento | EN REVISION | Trading Pro funciona como capa avanzada para Spot/Futuros. |
| Ordenes | EN REVISION | Incluye Limit/Market, Stop-limit, OCO y TP/SL. |
| Graficas | EN REVISION | Usa `MarketChart` con TradingView en BTC/USDT. |
| Market BFF | HECHO | `useTradingProMarketData` conecta `/api/markets/*` y conserva fallback local. |
| Actividad | EN REVISION | Incluye ordenes avanzadas activas e historial. |

---

# MKT-005 - Futuros / Perps

## Objetivo

Construir `/markets/futures` como dashboard trading para contratos: long/short, margen, apalancamiento, funding, posiciones, PnL y riesgo.

## Estado Actual

EN REVISION

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| MKT-005-01 | Header + navegacion Futuros | EN REVISION | Header producto, contrato destacado y tabs internas aplicados. |
| MKT-005-02 | Resumen Futuros | EN REVISION | Funding, open interest, volumen, riesgo y acceso a terminal. |
| MKT-005-03 | Terminal Futuros | EN REVISION | Grafica TradingView/Deco, order book, trades y formulario long/short. |
| MKT-005-04 | Posiciones abiertas | EN REVISION | PnL, margen, entry, mark price y liquidacion. |
| MKT-005-05 | Panel de riesgo | EN REVISION | Exposicion, margen usado, alertas y reglas operativas. |
| MKT-005-06 | Historial Futuros | EN REVISION | Ordenes, fills, cancelaciones, fees y funding. |
| MKT-005-07 | Conectar Futuros a Market BFF | HECHO | Futuros consume `MarketDataService` para contratos, ticker, order book y trades con fallback local. |

## Auditoria Inicial

| Bloque | Estado | Nota |
|---|---|---|
| Ruta `/markets/futures` | EN REVISION | Ya fue reemplazada la pagina generica `MarketFeaturePage`. |
| Necesidad | HECHO | Convertida en dashboard landing operativo como Spot, P2P y Market Maker. |

## Componentes Creados

- `components/markets/futures/futures-market-container.tsx`
- `components/markets/futures/futures-market-data.ts`
- `components/markets/futures/futures-market-card.tsx`
- `components/markets/futures/futures-market-widgets.tsx`
- `components/markets/futures/views/futures-summary-view.tsx`
- `components/markets/futures/views/futures-terminal-view.tsx`
- `components/markets/futures/views/futures-positions-view.tsx`
- `components/markets/futures/views/futures-risk-view.tsx`
- `components/markets/futures/views/futures-history-view.tsx`

## Auditoria De Codigo Actual

| Bloque | Estado | Nota |
|---|---|---|
| Ruta `/markets/futures` | EN REVISION | Compila y responde 200 OK en local. |
| Componentizacion | EN REVISION | Page, container, data, card, widgets y vistas separadas. |
| Graficas | EN REVISION | Usa `MarketChart`: TradingView para perps publicos y Deco Chart para contrato propio. |
| Terminal | EN REVISION | Incluye pares, grafica, posiciones, formulario, profundidad y trades. |
| Market BFF | HECHO | `useFuturesMarketData` conecta `/api/markets/*` y conserva mocks como fallback. |
| Riesgo | EN REVISION | Incluye margen usado, PnL, distancia de liquidacion y reglas. |
| Historial | EN REVISION | Incluye ordenes, tipos, fees, hora y estados. |

---

# MKT-006 - Analisis De Mercado

## Objetivo

Crear una vista de research operativo: tendencias, volumen, top movers, watchlist y oportunidades.

## Estado Actual

EN REVISION

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| MKT-006-01 | Header + resumen | EN REVISION | Vista ejecutiva de mercado con lectura destacada. |
| MKT-006-02 | Top movers | EN REVISION | Ganadores y correcciones 24h. |
| MKT-006-03 | Volumen y tendencia | EN REVISION | Cards de volumen por Spot, Futuros y ecosistema. |
| MKT-006-04 | Oportunidades | EN REVISION | Senales visuales con aviso de no asesoria. |
| MKT-006-05 | Conectar Analisis a Market BFF | HECHO | Analisis consume `MarketDataService` para movers, volumen, oportunidades, watchlist y grafica con fallback local. |

## Componentes Creados

- `components/markets/market-analysis/market-analysis-container.tsx`
- `components/markets/market-analysis/market-analysis-data.ts`
- `components/markets/market-analysis/market-analysis-card.tsx`
- `components/markets/market-analysis/market-analysis-widgets.tsx`
- `components/markets/market-analysis/views/analysis-summary-view.tsx`
- `components/markets/market-analysis/views/analysis-movers-view.tsx`
- `components/markets/market-analysis/views/analysis-volume-view.tsx`
- `components/markets/market-analysis/views/analysis-opportunities-view.tsx`
- `components/markets/market-analysis/views/analysis-watchlist-view.tsx`

## Auditoria De Codigo Actual

| Bloque | Estado | Nota |
|---|---|---|
| Ruta `/markets/market-analysis` | EN REVISION | Compila y responde 200 OK en local. |
| Componentizacion | EN REVISION | Page, container, data, card, widgets y vistas separadas. |
| Resumen | EN REVISION | Incluye pulso de mercado, grafica, movers y oportunidades. |
| Movers | EN REVISION | Lista activos con precio, cambio, volumen y senal. |
| Volumen | EN REVISION | Segmenta Spot, Futuros y ecosistema. |
| Oportunidades | EN REVISION | Incluye riesgo/confianza y evita prometer rendimiento. |
| Watchlist | EN REVISION | Incluye condiciones y ruta natural de accion. |
| Market BFF | HECHO | `useMarketAnalysisData` conecta `/api/markets/*` y conserva fallback local. |

---

# MKT-007 - Historial Global De Ordenes

## Objetivo

Unificar actividad del usuario: ordenes, fills, cancelaciones, comisiones y exportacion.

## Estado Actual

EN REVISION

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| MKT-007-01 | Vista principal | EN REVISION | Tabla, resumen y filtros claros. |
| MKT-007-02 | Filtros por mercado | EN REVISION | Spot, Futuros, P2P y Market Maker. |
| MKT-007-03 | Detalle de orden | EN REVISION | Estado, fills, fee y timestamps. |
| MKT-007-04 | Exportacion | EN REVISION | Accion visual CSV/PDF mock. |

## Componentes Creados

- `components/markets/order-history/order-history-container.tsx`
- `components/markets/order-history/order-history-data.ts`
- `components/markets/order-history/order-history-card.tsx`
- `components/markets/order-history/order-history-widgets.tsx`
- `components/markets/order-history/views/order-history-overview-view.tsx`
- `components/markets/order-history/views/order-history-market-view.tsx`
- `components/markets/order-history/views/order-history-detail-view.tsx`
- `components/markets/order-history/views/order-history-export-view.tsx`

## Auditoria De Codigo Actual

| Bloque | Estado | Nota |
|---|---|---|
| Ruta `/markets/order-history` | EN REVISION | Compila y responde 200 OK en local. |
| Componentizacion | EN REVISION | Page, container, data, card, widgets y vistas separadas. |
| Vista principal | EN REVISION | Incluye metricas, filtros, tabla, detalle y exportacion. |
| Filtros | EN REVISION | Mercado, estado, rango y busqueda mock. |
| Mercados | EN REVISION | Spot, Futuros, P2P y Market Maker. |
| Detalle | EN REVISION | Timeline y fills por orden. |
| Exportacion | EN REVISION | CSV, PDF y reporte fiscal en mock. |

---

# MKT-008 - Alertas De Precio

## Objetivo

Crear alertas por precio, porcentaje, volumen y condiciones relevantes.

## Estado Actual

EN REVISION

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| MKT-008-01 | Crear alerta | EN REVISION | Formulario claro y compacto. |
| MKT-008-02 | Lista de alertas | EN REVISION | Activas, observando y disparadas. |
| MKT-008-03 | Canales | EN REVISION | App, email, push y webhook mock. |
| MKT-008-04 | Integracion visual con Spot | EN REVISION | Rutas naturales hacia Spot, Futuros, Trading Pro y ecosistema. |
| MKT-008-05 | Conectar Alertas a Market BFF | HECHO | Alertas consume `MarketDataService` para pares, templates, builder y reglas mock con fallback local. |

## Componentes Creados

- `components/markets/price-alerts/price-alerts-container.tsx`
- `components/markets/price-alerts/price-alerts-data.ts`
- `components/markets/price-alerts/price-alerts-card.tsx`
- `components/markets/price-alerts/price-alerts-widgets.tsx`
- `components/markets/price-alerts/views/price-alerts-summary-view.tsx`
- `components/markets/price-alerts/views/price-alerts-create-view.tsx`
- `components/markets/price-alerts/views/price-alerts-list-view.tsx`
- `components/markets/price-alerts/views/price-alerts-channels-view.tsx`

## Auditoria De Codigo Actual

| Bloque | Estado | Nota |
|---|---|---|
| Ruta `/markets/price-alerts` | EN REVISION | Compila y responde 200 OK en local. |
| Componentizacion | EN REVISION | Page, container, data, card, widgets y vistas separadas. |
| Crear alerta | EN REVISION | Incluye activo, condicion, valor, canal, frecuencia y ruta. |
| Lista | EN REVISION | Alertas activas, observando y disparadas. |
| Canales | EN REVISION | App, email, push y webhook futuro. |
| Integracion | EN REVISION | Cada alerta apunta a Spot, Futuros, Trading Pro o ecosistema. |
| Market BFF | HECHO | `usePriceAlertsData` conecta `/api/markets/*` y conserva fallback local. |

---

# MKT-009 - API De Datos

## Objetivo

Crear herramienta para datos de mercado: API keys, permisos, endpoints, limites, logs y documentacion rapida.

## Estado Actual

EN REVISION

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| MKT-009-01 | Dashboard API | EN REVISION | Keys, estado, uso, latencia y rate limit. |
| MKT-009-02 | Permisos | EN REVISION | Read market, read account, trading y alerts. |
| MKT-009-03 | Endpoints | EN REVISION | Precios, candles, order book, trades, ordenes y alertas. |
| MKT-009-04 | Logs | EN REVISION | Requests recientes, latencia, status y errores. |
| MKT-009-05 | Conectar consola a Market BFF | HECHO | API de datos mide `/api/markets/*`, muestra endpoints reales y conserva fallback local. |

## Componentes Creados

- `components/markets/data-api/data-api-container.tsx`
- `components/markets/data-api/data-api-data.ts`
- `components/markets/data-api/data-api-card.tsx`
- `components/markets/data-api/data-api-widgets.tsx`
- `components/markets/data-api/views/data-api-summary-view.tsx`
- `components/markets/data-api/views/data-api-keys-view.tsx`
- `components/markets/data-api/views/data-api-permissions-view.tsx`
- `components/markets/data-api/views/data-api-endpoints-view.tsx`
- `components/markets/data-api/views/data-api-logs-view.tsx`

## Auditoria De Codigo Actual

| Bloque | Estado | Nota |
|---|---|---|
| Ruta `/markets/data-api` | EN REVISION | Compila y responde 200 OK en local. |
| Componentizacion | EN REVISION | Page, container, data, card, widgets y vistas separadas. |
| Dashboard API | EN REVISION | Estado, uso 24h, latencia y rate limit. |
| Keys | EN REVISION | API keys mock con scopes y ultimo uso. |
| Permisos | EN REVISION | read:market, read:account, trade y alerts. |
| Endpoints | HECHO | Contratos `/api/markets/*` reflejados como BFF activo; órdenes/alertas quedan como gateway futuro. |
| Logs | HECHO | Requests recientes se alimentan desde medición del Market BFF con fallback local. |
| Backend futuro | EN REVISION | Documenta Auth user gateway, Market BFF y Risk guard. |
| Market BFF | HECHO | `useDataApiStatus` mide pairs, ticker, candles, order book y trades. |

---

# MKT-010 - Graficas, Datos Y Tokens Propios

## Objetivo

Crear una capa comun para graficas de trading y datos de mercado que funcione tanto con pares soportados por TradingView como con tokens propios del ecosistema Deco que no existan en TradingView.

## Decision De Producto

No todos los activos van a tener simbolo publico en TradingView.

Decision actual: TradingView sera la experiencia principal para pares publicos porque el usuario prefiere esa grafica. Deco Chart queda como respaldo obligatorio para tokens propios, mercados internos o activos sin cobertura externa.

Por eso se usara una estrategia por proveedor:

1. `Deco Chart`
   Grafica local de respaldo, renderizada dentro de la app, rapida y compatible con pares propios.

2. `TradingView`
   Proveedor principal para pares publicos y reconocidos: `BTCUSDT`, `ETHUSDT`, `SOLUSDT`, etc.

3. `Fallback visual`
   Mientras no exista backend historico, usar grafica mock controlada, sin datos aleatorios agresivos y marcada internamente como placeholder.

## Reglas

- `pnpm` es obligatorio como gestor de paquetes del proyecto.
- TradingView se usa en pares publicos con `tradingViewSymbol`.
- La grafica local Deco debe seguir existiendo para tokens propios.
- La interfaz no debe depender exclusivamente de TradingView.
- Crear un componente adaptador: `MarketChart`.
- `MarketChart` decide proveedor segun metadata del par.
- Si `tradingViewSymbol` existe, usa TradingView.
- Si no existe, usa grafica interna Deco.
- Los tokens propios deben poder operar visualmente aunque no esten listados afuera.
- Los datos reales deben venir despues desde BFF/backend: candles, trades, order book y ticker.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| MKT-010-01 | Definir metadata de par | EN REVISION | Cada par Spot ya tiene symbol, base, quote, proveedor y tradingViewSymbol opcional. |
| MKT-010-02 | Crear `MarketChart` | HECHO | Componente comun creado para decidir TradingView o Deco Chart. |
| MKT-010-03 | Integrar TradingView | HECHO | Pares publicos renderizan TradingView como grafica principal. |
| MKT-010-04 | Crear grafica interna Deco | HECHO | `MarketChart` renderiza velas locales sin widget externo ni dependencia nueva. |
| MKT-010-05 | Definir fallback sin historico | HECHO | `MarketChart` muestra Deco Chart si TradingView no carga o no existe simbolo externo. |
| MKT-010-06 | Preparar contrato BFF candles | HECHO | `/api/markets/candles?symbol=&interval=&limit=` devuelve OHLCV y respeta limit. |
| MKT-010-07 | Preparar contrato BFF ticker | HECHO | `/api/markets/ticker?symbol=` devuelve precio, cambio 24h, volumen, high/low y updatedAt. |
| MKT-010-08 | Preparar contrato BFF order book | HECHO | `/api/markets/order-book?symbol=&depth=` devuelve bids/asks y respeta depth. |
| MKT-010-09 | Agregar tokens Deco al selector | EN REVISION | DECO/USDT y DECOX/USDT aparecen en Spot como ecosistema. |
| MKT-010-10 | Documentar comportamiento | HECHO | Plan explica TradingView vs Deco Chart y tokens propios. |
| MKT-010-11 | Extraer card comun de mercados | HECHO | `MarketCard` centraliza el estilo base y cada modulo conserva su wrapper propio. |
| MKT-010-12 | Auditoria TypeScript | HECHO | `pnpm exec tsc --noEmit --pretty false` pasa sin errores. |

## Tokens Propios Iniciales

| Token | Par sugerido | Grafica | Nota |
|---|---|---|---|
| DECO | `DECO/USDT` | Deco Chart | Token propio, puede no existir en TradingView. |
| DECOX | `DECOX/USDT` | Deco Chart | Token de ecosistema, usar data interna. |
| Launchpad tokens | `TOKEN/USDT` | Deco Chart | Pares nuevos o privados. |
| OTC/internal pairs | Variable | Deco Chart | No necesariamente publicos. |

## Pregunta Pendiente

Confirmar nombres finales de tokens propios, simbolos oficiales y pares iniciales antes de conectar backend.

---

# Auditoria Tecnica General

## Estado Actual

EN REVISION

## Resultado Del Pase Actual

| Bloque | Estado | Nota |
|---|---|---|
| TypeScript global | HECHO | `pnpm exec tsc --noEmit --pretty false` pasa sin errores. |
| Market BFF | HECHO | `/api/markets/*` queda listo como BFF para pares, ticker, candles, order book y trades. |
| Toasts | HECHO | Se agregan variantes `success` y `neutral` porque ya eran usadas por onboarding, navbar y P2P. |
| Badges | HECHO | Se agrega variante `success` para estados completados. |
| Onboarding | HECHO | Los pasos de registro comparten tipos en `components/common/onboarding/steps/types.ts`. |
| Chat P2P | HECHO | El hook consume mensajes normalizados con `getMessagesAsChat`. |
| Fiat funding | HECHO | Callback de copiado queda tipado sin cambiar comportamiento. |
| Stats landing | HECHO | CountUp recibe solo numeros validados. |
| Globe UI | HECHO | Callbacks tipados sin cambiar renderizado. |
| Cards de mercados | HECHO | `components/markets/market-card.tsx` centraliza el estilo base. |
| Graficas de mercados | HECHO | `MarketChart` usa TradingView para pares publicos y Deco Chart como fallback. |
| QA visual | POR HACER | Sigue pendiente revisar rutas en navegador despues del saneamiento tecnico. |

## Componentes Compartidos Nuevos

- `components/markets/market-card.tsx`
- `components/common/onboarding/steps/types.ts`
- `services/MarketDataService.ts`
- `types/markets.ts`
- `app/api/markets/[[...path]]/route.ts`

---

# Registro De Cambios Del Plan

| Fecha | Cambio |
|---|---|
| 2026-06-25 | Se crea plan tipo Jira para Mercados. |
| 2026-06-25 | Se registra Market Maker en revision y Spot en revision inicial. |
| 2026-06-25 | Se define regla de avanzar modulo por modulo. |
| 2026-06-25 | Se agrega epica MKT-010 para TradingView, Deco Chart y tokens propios sin grafica externa. |
| 2026-06-25 | Se define TradingView como grafica principal y Deco Chart como alternativa para tokens propios o sin cobertura externa. |
| 2026-06-25 | Se aplica MKT-003-01 en Spot: header producto, par destacado, acciones y navegacion interna. |
| 2026-06-25 | Se aplica MKT-003-02 en Spot: resumen operativo con metricas, grafica compacta, actividad, pares destacados y operacion rapida. |
| 2026-06-25 | Cambio de dinamica: se completa Spot entero y luego se revisa visualmente todo el modulo. |
| 2026-06-25 | Se completa primer pase de Spot: terminal, pares, ordenes, historial, favoritos y capa `MarketChart`. |
| 2026-06-25 | Se agregan DECO/USDT y DECOX/USDT como tokens propios con proveedor Deco Chart. |
| 2026-06-25 | Se define `pnpm` como gestor obligatorio y se prioriza grafica local Deco para reducir tiempo de carga. |
| 2026-06-25 | Se cambia decision de producto: TradingView sera principal en pares publicos y Deco Chart queda como respaldo para tokens propios. |
| 2026-06-25 | Se audita Spot en codigo y se inicia MKT-005 Futuros como siguiente modulo componentizado. |
| 2026-06-25 | Se completa primer pase de Futuros: resumen, terminal, posiciones, riesgo, historial y graficas por proveedor. |
| 2026-06-25 | Se completa primer pase de Analisis de Mercado: resumen, movers, volumen, oportunidades y watchlist. |
| 2026-06-25 | Se completa primer pase de Historial de Ordenes: resumen global, filtros, detalle, mercados y exportacion. |
| 2026-06-25 | Se completa primer pase de Alertas de Precio: crear alerta, activas, canales, disparadas e integracion con rutas de mercado. |
| 2026-06-25 | Se completa primer pase de API de datos: keys, permisos, endpoints, logs y contratos para backend/BFF/gateway de usuario. |
| 2026-06-25 | Se sanea TypeScript global, se normaliza chat P2P y se extrae `MarketCard` compartido para los modulos de mercados. |
| 2026-06-25 | Se endurece `MarketChart`: TradingView sigue principal y Deco Chart queda como fallback automatico si el widget externo falla. |
| 2026-06-26 | Se crea BFF `/api/markets/*`, `MarketDataService` y tipos canonicos para conectar luego pricing/market backend o gateway sin rehacer la UI. |
| 2026-06-26 | Se conecta Spot a `MarketDataService` para pares, ticker, order book y trades, manteniendo fallback local para UX mock. |
| 2026-06-26 | Se conecta Futuros a `MarketDataService` y se agregan contratos `kind=futures` al BFF de mercados. |
| 2026-06-26 | Se conecta Trading Pro a `MarketDataService` para par activo, ticker y grafica, manteniendo fallback local. |
| 2026-06-26 | Se conecta Analisis de Mercado a `MarketDataService` para movers, volumen, oportunidades, watchlist y grafica. |
| 2026-06-26 | Se conecta Alertas de Precio a `MarketDataService` para pares, templates, builder y reglas visuales con fallback. |
| 2026-06-26 | Se conecta API de datos a `MarketDataService`; la consola mide `/api/markets/*` y deja user orders/alerts como gateway futuro. |
| 2026-06-26 | Auditoria severa Market BFF: se corrige parser compartido de volumenes compactos y se reduce ruido de fallback en logs productivos. |
