# Changelog — deco-exchange Landing
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


Todos los cambios notables de este proyecto se documentan en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [0.16.0] - 2026-06-29

### Añadido
- Agregadas paginas institucionales y B2B componentizadas: `/roadmap`, `/unete-al-equipo`, `/brand`, `/business/crypto-processing` y `/business/ecommerce-plugins`.
- Agregadas paginas legales asociadas: `/legals/roadmap`, `/legals/unete-al-equipo`, `/legals/brand`, `/legals/crypto-processing` y `/legals/ecommerce-plugins`.
- Agregada pagina `/status` como Estado del Servicio con servicios operativos, incidentes recientes, avisos anteriores y soporte.
- Agregado `components/company/*` como modulo compartido para paginas institucionales, comerciales y de compania.
- Agregado `components/status/status-page.tsx` como status page Deco componentizada.
- Agregado `CONTRIBUTING.md` con reglas de pnpm, componentizacion, seguridad, documentacion y checklist antes de subir.
- Agregado diagrama Mermaid en README con el flujo dinamico del ecosistema: productos, legales, soporte, status, BFF y gateway futuro.

### Cambiado
- Footer reemplaza anchors o paginas prestadas por rutas propias: Roadmap, Unete al equipo, Guia de Marca, Procesamiento Cripto, E-Commerce plugins y Estado del Servicio.
- `/legals` agrega fichas para Roadmap, Equipo, Marca, Procesamiento Cripto y E-Commerce plugins.
- `/unete-al-equipo` agrega puestos buscados por area: Frontend, Backend/Gateway, Security, KYC/AML, Red Deco y Soporte.
- `/legals/calculadora` usa una experiencia propia con grafica dinamica por monto, origen, destino y tasa.
- Graficas legales genericas de `DecoReferencePage` reemplazan el mini chart heredado por una grafica SVG estilo Deco con eje, rango, resumen y serie referencial.
- README actualiza badges de tecnologia, version, estructura del proyecto, estado operativo y guia rapida de contribucion.
- Licencia MIT actualizada a copyright 2026 DECO Exchange.

### Verificado
- `git diff --check`
- `pnpm exec tsc --noEmit --pretty false`
- `pnpm run build`

---

## [0.15.4] - 2026-06-29

### Añadido
- Agregado **Soporte Deco** como widget global tipo help desk con inicio, chat mock, ticket mock y evento `deco:support`.
- Agregado `plan-soporte.md` como tablero tipo Jira para soporte, tickets, chat, P2P, Red Deco, Wallet, Developers, backend futuro y QA.
- Agregado **modal global de consentimiento de cookies** con resumen, personalizacion por categoria, `Aceptar todo`, `Solo necesarias` y `Guardar seleccion`.
- Agregado helper `lib/privacy/cookie-consent.ts` para leer, normalizar, persistir y emitir cambios de consentimiento.
- Agregado `GlobalClientWidgets` para centralizar widgets cliente globales: soporte, cookies y toaster.

### Cambiado
- Help Center conecta `Iniciar chat` y `Crear ticket de soporte` con el widget global en lugar de enlaces `#`.
- `/legals/cookies` agrega accion para administrar preferencias de cookies desde la politica legal.
- Boton de soporte queda debajo del boton de subir; el boton de subir queda arriba para evitar superposiciones.
- Navbar retrasa montaje de piezas Radix/Gooey sensibles a IDs hasta hidratacion para evitar mismatch SSR/CSR.
- Consentimiento de cookies carga preferencias guardadas al reabrir, abre personalizacion con todas activas cuando no existe decision previa y guarda exactamente la seleccion del usuario.

### Corregido
- Corregido warning de hidratacion por `aria-controls` generados por Radix y `gooey-filter-*` del buscador.
- Corregido comportamiento ambiguo de `Guardar preferencias`: ahora no equivale a aceptar todo.
- Corregido panel de soporte que podia abrir demasiado alto y perderse en pantallas bajas; ahora usa altura maxima con `100dvh` y scroll interno.

### Verificado
- `git diff --check`
- `pnpm exec tsc --noEmit --pretty false`
- `pnpm run build`

---

## [0.15.3] - 2026-06-29

### Añadido
- Agregada seccion **Developers** en `/developers` como portal tecnico para Data API, widgets, webhooks, sandbox y terminos.
- Agregada ruta `/developers/data-api` reutilizando la consola existente de Data API.
- Legales, Help Center y Footer conectan Developers como experiencia propia de integracion.
- Agregado menu **Red y Aliados** despues de Ganar para Red Deco, puntos cercanos, deposito/retiro efectivo, remesas presenciales y Aliado Deco.

### Cambiado
- `DataApiContainer` cambia copy de `Mercados · API` a `Developers · Data API`.
- `API de datos` sale del menu de Mercados para no mezclar operacion/trading con integraciones tecnicas.
- `/markets/data-api` queda como redirect temporal hacia `/developers/data-api`.
- Red Deco sale del menu Bolsillito y Aliado Deco sale del menu Ganar para separar saldo fiat, recompensas y red fisica.
- Rutas entre paises en Red Deco cambian a cards mas legibles, con metricas compactas y sin cajas internas que corten textos.
- Control de riesgo en Futuros cambia de grilla apretada a filas operativas resistentes a PnL largo.
- Posiciones de Futuros soportan listas largas con scroll interno, resumen compacto y filtros visuales de abiertas/cerradas/ordenes.
- Exportacion en Historial de Ordenes cambia a lista operativa con acciones CSV/PDF y reporte fiscal marcado como proximo.
- Aliado Deco mejora niveles y operaciones del punto con bandas de datos flexibles para montos, resultados, comisiones y tiempos.

### Verificado
- `pnpm exec tsc --noEmit --pretty false`
- `pnpm run build`
- `git diff --check`

---

## [0.15.2] - 2026-06-28

### Cambiado
- Home / Acceso global reemplaza el cubo experimental por `coin-deco.gif` como asset visual oficial de moneda DECO.
- `GlobalAccessSwarm` queda sin dependencia de tema del cliente, sin `data-theme` dinamico y sin branch SSR/CSR sensible a hidratacion.
- La moneda mantiene tamano consistente en light/dark y elimina sombras, halos y fondos radiales externos.
- `Content-Security-Policy` y `Strict-Transport-Security` quedan aplicados solo en produccion para no romper HMR, overlays de Next DevTools ni pruebas locales.

### Documentado
- README actualizado con release 0.15.2.
- Checklist de auditoria frontend ampliado con validaciones visuales del hero Acceso global y la moneda DECO.
- Documentacion de seguridad aclara que CSP/HSTS son controles de produccion y no se fuerzan en desarrollo.

### Verificado
- `pnpm exec tsc --noEmit --pretty false`
- `pnpm run build`
- `pnpm audit --prod`
- `git diff --check`

---

## [0.15.1] - 2026-06-28

### Seguridad
- Agregado CSP de produccion en `next.config.mjs` con allowlist para recursos propios, conexiones BFF/gateway configuradas y TradingView en iframe.
- Agregado `app/api/_shared/origin-guard.ts` para bloquear mutaciones BFF con `Origin` no permitido.
- Agregado `app/api/_shared/rate-limit.ts` con rate limit en memoria para endpoints sensibles del BFF.
- Login, registro, refresh, sesiones y rutas publicas de recuperacion/verificacion auth quedan protegidas con rate limit.
- Rutas custom de `easy-crypto` quedan protegidas con origin guard en mutaciones.

### Documentado
- `.env.example` agrega `NEXT_PUBLIC_SITE_URL` para validacion de origen en ambientes reales.
- README actualizado con release 0.15.1.
- Agregado `docs/frontend-audit-checklist.md` para auditoria visual y seguridad frontend.

### Pendiente
- Rate limit distribuido en gateway/WAF para produccion multi-instancia.
- CSP sin `unsafe-inline` cuando el pipeline tenga nonce/hash para scripts y estilos.
- RBAC definitivo en backend/admin panel.

---

## [0.15.0] - 2026-06-28

### Seguridad
- Agregado `components/security/DevGuard.tsx` con advertencia anti fraude/self-XSS para produccion, controlada por `NEXT_PUBLIC_ENABLE_DEVTOOLS`.
- Agregados headers globales en `next.config.mjs`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` y `productionBrowserSourceMaps: false`.
- Agregado `app/api/_shared/internal-auth.ts` como resolvedor unico de `INTERNAL_AUTH_TOKEN`; en produccion falla cerrado si falta el token.
- `resolveUserId` deja de confiar en `x-user-id` enviado por el browser y usa la cookie HttpOnly como fuente de sesion.
- `resolveUserId` ahora valida la sesion contra `/auth/me/profile` antes de extraer `userId`; se elimina la decodificacion local de JWT como fuente de verdad.
- `/api/auth/[[...path]]` deja de ser proxy publico general y pasa a allowlist: recuperacion/verificacion publica y sesiones solo con identidad validada.
- `/api/auth/refresh` ya no devuelve `accessToken` ni `refreshToken` en JSON; solo rota cookies HttpOnly.
- `clearTokenCookies()` borra access y refresh con sus paths reales para evitar sesiones residuales tras logout o refresh expirado.
- `/api/auth/set-tokens` queda deshabilitado para evitar token injection/session fixation desde el cliente.
- `/api/catalog/*` queda publico solo lectura; rutas `admin` y metodos `POST/PATCH/PUT/DELETE` se bloquean en el BFF.
- `/api/p2p-market/*` mantiene lectura publica, pero bloquea escrituras sin sesion antes de reenviar al gateway.

### Dependencias
- Actualizado Next a `15.5.18` usando `pnpm`.
- Actualizado axios a `1.16.0` usando `pnpm`.

### Documentado
- `.env.example` ampliado con variables de gateway, pricing, asset registry, token interno y DevGuard.
- README actualizado con release 0.15.0 y resumen de hardening.
- README del BFF actualizado con reglas de identidad, token interno, catalogo read-only y endpoint `set-tokens` deprecado.

---

## [0.14.0] - 2026-06-27

### Añadido
- **Seccion Ganar** como Nivel 5 - Embajador con experiencias dashboard landing independientes, componetizadas y conectables a backend/gateway.
- **Rutas Ganar**: `/earn`, `/earn/referrals`, `/earn/deco-points`, `/earn/cashback`, `/earn/learn-and-earn`, `/earn/missions`, `/earn/sponsor-ads`, `/earn/launchpad` y `/earn/top-earners`.
- **Componentes compartidos `components/earn/*`** para heroes, metricas, panels, summaries, cards, timelines y modales de accion.
- **Puntos Deco** con balance, fuentes, catalogo de canjes, historial, reglas, beneficios y mock data reemplazable por API.
- **Aprende y Gana** con rutas educativas, progreso, racha, quiz mock y flujo de recompensa sujeto a validacion.
- **Misiones** con retos diarios/semanales, juego online destacado, progreso, estados y modal para reclamar recompensas.
- **Sponsor Ads** como programa de usuarios/embajadores para promocionar Deco con campanas, evidencia, canales, revision y recompensas en tokens/puntos.
- **Reservas crypto y fiat** en `/rendimiento/reservas`, separando activos on-chain, saldos fiat, cobertura por categoria y consolidado de fondos de usuarios.
- **Panel privado "Asi esta tu dinero"** con desglose crypto/fiat/bloqueado, porcentaje del usuario sobre fondos/reservas y resumen equivalente.
- **Prueba Merkle de usuario** con root, leaf hash, snapshot y estado de inclusion mock.
- **Gating por login** en Reservas: el desglose personal y Merkle quedan ocultos sin sesion activa y disparan el modal real de login.

### Cambiado
- **Navbar Ganar** actualizado con Referidos, Puntos Deco, Cashback, Aprende y Gana, Misiones, Sponsor Ads, Launchpad y Ranking de Ganadores.
- **Market Maker** se mantiene exclusivamente en Mercados para evitar duplicidad de producto dentro de Ganar.
- **Resumen de Ganar** ahora presenta 8 programas y ordena el ecosistema por rutas independientes, sin tabs mezcladas.
- **Reservas** deja de ser solo tabla de activos y pasa a explicar fondos de usuarios, reservas declaradas, cobertura consolidada y prueba de inclusion.
- **Copy financiero** de Rendimiento/Reservas ajustado para hablar de cobertura, snapshot, prueba, validacion y privacidad sin promesas indebidas.

### Documentado
- README actualizado con release 0.14.0, rutas Ganar, componentes nuevos y Reservas con Merkle/login.
- `plan-ganar.md` actualizado con Puntos Deco, Aprende y Gana, Misiones, Sponsor Ads, modales, backend futuro y estado de QA/docs/version.
- `plan-rendimientos.md` actualizado con reservas crypto/fiat, consolidado de usuarios, Merkle de usuario, "Asi esta tu dinero" y gating por login.

### Verificado
- `pnpm exec tsc --noEmit --pretty false` pasa sin errores.
- `pnpm run build` pasa correctamente.
- Build de Next reconoce las nuevas rutas `/earn/*` y mantiene `/rendimiento/reservas` operativo.

### Pendiente
- QA visual completo desktop/mobile/light/dark para Ganar y Reservas.
- Integracion futura con backend/gateway para puntos reales, recompensas, campanas, misiones, Merkle proof path, saldos privados y snapshots firmados.

---

## [0.13.0] - 2026-06-27

### Añadido
- **Crypto facil renovado** como suite de experiencias dashboard landing operativas, alineadas al patron aprobado de Bolsillito, Market Maker y Rendimiento.
- **Componentes compartidos `components/easy-crypto/*`** para hero, panels, metricas, buscadores, metodos, resumen lateral y modales de confirmacion.
- **Spot Lite** en `/easy-crypto/spot-lite` con referencia TradingView para activos publicos, selector custom de activo, resumen operativo y estado de ejecucion pendiente.
- **Fallback de metodos de pago** en el BFF/mock de compra cripto para MXN, COP, USD y EUR cuando el gateway no entregue metodos.
- **Plan Jira `plan-crypto-facil.md`** para controlar tareas, QA visual, copy, rutas y componentes de Crypto facil.
- **Plan Jira `plan-ganar.md`** para planificar Ganar como Nivel 5 - Embajador, con Referidos, Launchpad, Cashback, Market Maker como puente y Ranking de Ganadores.

### Cambiado
- **Compra cripto, vende cripto, convertidor y envia cripto** ahora siguen el formato de ruta-producto: hero, flujo operativo, resumen lateral, estado mock y modal accionable.
- **Selectores de activos** refinados para reemplazar controles nativos sin estilo por una experiencia compacta y consistente.
- **Rendimiento** mantiene rutas independientes por producto; `/rendimiento/security` queda como compatibilidad hacia Reservas.
- **Regla de producto Ganar** documentada: cada item del dropdown debe abrir su propia URL completa, sin tabs corridas.
- **Copy comercial de Ganar** orientado a fomentar participacion, comunidad, recompensas y crecimiento sin prometer ganancias garantizadas.

### Documentado
- README actualizado con release 0.13.0, rutas de Crypto facil, componentes nuevos, Spot Lite y plan Ganar.
- `plan-crypto-facil.md` registra la renovacion de Crypto facil y pendientes de QA/copy.
- `plan-ganar.md` define arquitectura, rutas, componentes, modales, backend futuro y decisiones pendientes.

### Verificado
- `pnpm exec tsc --noEmit --pretty false` pasa sin errores.
- `pnpm run build` pasa correctamente.
- Rutas principales de Crypto facil y Rendimiento revisadas en local.

### Pendiente
- QA visual completo desktop/mobile/light/dark para Crypto facil.
- Implementar Ganar ruta por ruta siguiendo `plan-ganar.md`.
- Integracion futura con backend/gateway de usuario para metodos reales, ordenes, recompensas, referidos y launchpad.

---

## [0.12.0] - 2026-06-26

### Añadido
- **Seccion Rendimiento** como dashboard landing operativo, siguiendo el patron aprobado de P2P, Market Maker y Mercados.
- **Rutas nuevas de producto** en `/rendimiento`, `/rendimiento/staking-tokens`, `/rendimiento/boveda-programada`, `/rendimiento/reservas`, `/rendimiento/activity` y `/rendimiento/calculator`.
- **Modulo componetizado `components/rendimiento/*`** con container, data, cards, vistas, modales de accion y modal de retiro flexible.
- **Staking de Tokens** con cards por activo, condiciones visibles, comisiones, riesgo, liquidez y modal reutilizable de simulacion.
- **Boveda Programada** con plazos mockup, proyeccion variable, retiro condicionado y aceptacion de riesgo antes de simular.
- **Actividad y posiciones** con filtros, timeline, progreso de vencimiento, posiciones activas y flujo de retiro flexible.
- **Reservas** con reservas totales, reservas de usuarios, fondos bloqueados, cobertura referencial y respaldo estimado del usuario.
- **Calculadora de Retorno** con escenarios estimados, desglose de comision, liquidez, disponibilidad por pais/KYC y CTAs hacia staking/boveda.
- **Plan Jira `plan-rendimientos.md`** para controlar arquitectura, tareas, criterio legal, backend futuro y QA.

### Cambiado
- **Navbar Rendimiento** ahora apunta a rutas canonicas `/rendimiento/*`.
- **Copy de rendimiento** queda alineado a criterio legal prudente: rendimiento estimado, variable, sujeto a condiciones y sin promesas fijas.
- **Regla de producto** documentada: Rendimiento queda separado de Ganar; referidos, cashback, launchpad y ranking pertenecen al plan posterior.

### Documentado
- README actualizado con release 0.12.0, rutas nuevas, flujos de Rendimiento y estado pendiente de QA visual.
- `plan-rendimientos.md` registra `RND-001` a `RND-009` en revision y verificacion tecnica `RND-010-05` en `HECHO`.

### Verificado
- `pnpm exec tsc --noEmit --pretty false` pasa sin errores.
- `pnpm run build` pasa correctamente.
- Rutas `/rendimiento`, `/rendimiento/staking-tokens`, `/rendimiento/boveda-programada`, `/rendimiento/reservas`, `/rendimiento/activity` y `/rendimiento/calculator` responden `200 OK` en local.

### Pendiente
- QA visual completo desktop/mobile/light/dark antes de marcar `RND-010` como `HECHO`.
- Integracion futura con backend/gateway de usuario para productos, tasas estimadas, posiciones reales, movimientos y condiciones legales por pais.

---

## [0.11.0] - 2026-06-26

### Añadido
- **Market BFF `/api/markets/*`** para normalizar datos de mercado desde frontend hacia pricing/market backend sin exponer servicios internos al browser.
- **Contratos canonicos de mercado** en `types/markets.ts` para pares, ticker, candles, order book, trades y proveedor de grafica.
- **`MarketDataService`** como cliente frontend unico para pares, ticker, candles, order book y trades.
- **Fallback server-side de mercado** para mantener los mockups UX operativos cuando `pricing-aggregator` o el backend de mercados no este levantado.
- **Pares publicos y tokens propios** en metadata de mercado: BTC, ETH, SOL, BNB con TradingView; DECO y DECOX con Deco Chart.
- **Parser compartido `parseCompactMarketNumber`** para volumenes compactos (`B`, `M`, `K`) usado por Spot, Futuros y Analisis.

### Cambiado
- **Spot** ahora consume `MarketDataService` para pares, ticker, libro y trades, conservando mocks como respaldo visual.
- **Futuros** ahora consume `MarketDataService` para contratos, ticker, libro y trades, incluyendo contratos `kind=futures`.
- **Trading Pro** ahora toma par activo y ticker desde Market BFF para operar como capa avanzada sobre Spot/Futuros.
- **Analisis de Mercado** ahora arma movers, volumen, oportunidades y watchlist desde Market BFF con fallback local.
- **Alertas de Precio** ahora genera templates, builder y alertas visuales desde pares/tickers del Market BFF.
- **API de datos** ahora mide endpoints reales de `/api/markets/*` y muestra logs/latencias del contrato BFF.
- **Timeout del Market BFF** queda configurable con `MARKET_BACKEND_TIMEOUT_MS`; por defecto el fallback en desarrollo responde rapido para no romper la experiencia mock.
- **Logs de fallback** reducidos: en produccion no se genera ruido por un fallback esperado.

### Documentado
- `planmercado.md` registra la conexion a Market BFF, los modulos en revision, contratos, auditoria TypeScript y pendientes de QA visual.
- README actualizado con arquitectura actual de Mercados, endpoints `/api/markets/*`, variables de entorno y estado operativo 2026-06-26.

### Verificado
- `pnpm exec tsc --noEmit --pretty false` pasa sin errores.
- Rutas `/markets/spot`, `/markets/futures`, `/markets/advanced-orders`, `/markets/market-analysis`, `/markets/price-alerts` y `/markets/data-api` responden `200 OK` en local.
- Endpoints `/api/markets/pairs`, `/api/markets/ticker`, `/api/markets/candles`, `/api/markets/order-book` y `/api/markets/trades` responden `200 OK` en local.

### Pendiente
- QA visual completo en navegador antes de marcar todos los modulos de Mercados como `HECHO`.
- Integracion final con backend/gateway de usuario para datos reales de ordenes privadas, alertas persistidas, riesgo y cuentas.

---

## [0.10.0] - 2026-06-25

### Añadido
- **Suite Mercados dashboard landing operativo** para convertir las rutas del menu Mercados en experiencias funcionales, componentizadas y conectables a backend/BFF/gateway de usuario.
- **Spot** en `/markets/spot` con resumen, terminal, pares, ordenes, historial, favoritos y `MarketChart`.
- **Futuros** en `/markets/futures` con resumen, terminal, posiciones, riesgo, historial, long/short, funding, margen y liquidacion.
- **Trading Pro** en `/markets/advanced-orders` como capa avanzada para Spot/Futuros con Limit/Market, Stop-limit, OCO, TP/SL, ordenes activas e historial.
- **Analisis de Mercado** en `/markets/market-analysis` con pulso de mercado, top movers, volumen por segmento, oportunidades sin prometer rendimiento y watchlist.
- **Historial de Ordenes** en `/markets/order-history` con actividad global, filtros, mercados, detalle de orden, timeline, fills y exportacion mock.
- **Alertas de Precio** en `/markets/price-alerts` con crear alerta, activas, disparadas, canales y rutas naturales hacia Spot, Futuros, Trading Pro y ecosistema.
- **API de datos** en `/markets/data-api` con API keys, permisos, endpoints, logs y contratos visuales para Auth user gateway, Market BFF y Risk guard.
- **`MarketChart` compartido** con TradingView para pares publicos y Deco Chart como respaldo para tokens propios o mercados internos.
- **Plan Jira `planmercado.md`** para controlar estado, componentes creados, auditoria de codigo y tareas por modulo de Mercados.

### Cambiado
- **Mercados** queda alineado al patron aprobado de P2P y Market Maker: dashboard landing operativo, no dashboard administrativo ni landing informativa.
- **Regla de integracion futura** documentada: los modulos actuales son mockups UX conectables y luego se integran a backend/BFF/gateway de usuario sin rehacer interfaz.
- **Regla de package manager** reforzada: usar siempre `pnpm`, nunca `npm`.

### Verificado
- Rutas principales de Mercados responden `200 OK`: Spot, Futuros, Trading Pro, Analisis, Historial, Alertas y API de datos.

---

## [0.9.0] - 2026-06-24

### Añadido
- **Modulo Bolsillito** con rutas privadas de producto en `/bolsillito/add-money`, `/bolsillito/send-money`, `/bolsillito/remittances` y `/bolsillito/withdraw-credit`.
- **Mockups UX de recarga COP** para Colombia con deposito minimo de `10,000 COP`, montos rapidos regionales, selector de metodos por categoria y modal de instrucciones segun tipo de medio.
- **Mockup UX de envio de saldo** con selector compacto de destinatarios, monto por moneda preferida, resumen lateral y modal de confirmacion con pasos de firma.
- **Mockup UX de remesas** con selector de destino, cotizacion referencial, resumen de ruta y modal de validaciones para tasa/compliance.
- **Modulo Market Maker OTC** en `/markets/market-maker` como guia de producto Nivel 3 para proveedores de liquidez mayorista.
- **Mockups UX de Market Maker** con dashboard, mercado OTC, ofertas propias, abastecimiento directo a Deco, acuerdos, chat comercial y configuracion de perfil maker.
- **Flujos por pasos de Market Maker** para crear oferta OTC, revisar/contactar una oferta mayorista y enviar propuesta directa de inventario a Deco.
- **Spot Terminal inicial** en `/markets/spot` con dashboard landing operativo, tabs internas, grafica mock, libro de ordenes, trades recientes, formulario comprar/vender, pares, ordenes abiertas, historial y favoritos.
- **Hook compartido `useBolsillitoPreferences`** para leer idioma, pais/region y moneda desde el modal global de preferencias.
- **Guia de diseno `docs/design-guidelines.md`** con reglas oficiales: el home es la referencia aprobada, el naranja es acento y no deben usarse bordes naranjas dominantes.

### Cambiado
- **Navbar Bolsillito** ahora apunta a las rutas canonicas `/bolsillito/*` en lugar de rutas heredadas `/little-pocket/*`.
- **Banner de remesas** actualizado para enlazar a `/bolsillito/remittances`.
- **Flujos Bolsillito** alineados al estilo aprobado del home: controles compactos, buscadores con contraste inverso, mini-cards rectangulares y acento naranja discreto.
- **Metodos de recarga** preparados para renderizar por pais, moneda y categoria, facilitando la conexion futura con backend.
- **Entradas visibles de Market Maker** en home, partnership, navbar y footer conectadas a `/markets/market-maker`.
- **Menu Mercados** reorganizado con Spot y Futuros como mercados principales, P2P y Market Maker como liquidez especial, y herramientas de trading debajo.

### Corregido
- **Nomenclatura COP** normalizada en recargas y montos rapidos.
- **Categorias de metodos de fondeo** completadas para evitar configuraciones incompletas en paises soportados.
- **Referencias activas `little-pocket`** eliminadas de enlaces visibles.

---

## [0.8.0] - 2026-06-22

### Añadido
- **Landing legal `/legals`** rediseñada con hero regulatorio, secciones por categorias, centro de control y CTA legal del ecosistema DECO EXCHANGE.
- **Paginas legales internas** con layout compartido, navbar/footer canonicos, hero legal consistente, breadcrumb y boton de volver arriba.
- **Rutas nuevas de cumplimiento y ecosistema** para `DECOToken`, `DECO custody`, Help Center, Knowledge Base y recursos legales clave.
- **Help Center interactivo** con selector de equipo de soporte, cards de canales, tutoriales, FAQ y recursos educativos conectados.
- **Anclas estables del home** para productos, wallet, tasas, mercados, recompensas, destacados y comunidad.

### Cambiado
- **Footer principal y footer P2P** conectados a rutas reales, enlaces legales, soporte por Telegram/email y anclas internas del home.
- **CTA del hero** ahora baja a la seccion de productos en lugar de quedar como enlace vacio.
- **Legal footer** refinado con resumen global de idioma/region/moneda, presencia legal Colombia/Miami y estado operativo.
- **Cards legales y de Help Center** alineadas con la linea visual del home: radios amplios, sombras suaves en light y fondos limpios en dark.
- **Copys legales** ajustados para DECO EXCHANGE, contacto `contacto@deco31416.com` y aviso de "Sin licencia operativa".

### Corregido
- **Duplicados de layout P2P** eliminados: P2P usa ahora el navbar y footer canonicos de `components/Main/layout`.
- **Referencias heredadas** reemplazadas por rutas nuevas de `deco-token` y `deco-custody`.
- **Links muertos `#`** del footer principal y footer P2P reemplazados por rutas reales o anclas existentes.
- **Componentes legales** sin ancho consistente refinados para alinearse con el container del home y `/legals`.

---

## [0.7.0] - 2026-06-21

### Añadido
- **Modal central de preferencias** para idioma, pais/region y moneda, disparado desde el icono global del navbar principal y P2P.
- **25 idiomas** con banderas rectangulares mediante `country-flag-icons` y persistencia de preferencias en `localStorage`.
- **`FiatCurrencyIcon`** como componente centralizado para monedas fiat redondas usando assets locales de `public/images/FiatAccepted`.
- **Selector de moneda fiat** con iconos, busqueda y fallback por codigo cuando no exista asset local.

### Cambiado
- **Globo 3D** migrado a Three.js puro con `three-globe`, removiendo `@react-three/fiber` y `@react-three/drei` para evitar fallos runtime en Next 15.
- **Onboarding login/registro** ahora usa los logos `logo-name-black.png` y `logo-name-white.png` por tema.
- **QR de login** reemplaza el placeholder roto por el QR real `deco31416-qr.png`.
- **Modal de bienvenida** simplificado con titulo corto "Bienvenido" y logo completo visible.
- **Partners del ecosistema** actualizados con CTA naranja "Visitar", nombres revisados (`alter|alma`, `BlackCEX`, `DECOToken`, `DECO Exchange`) y copy alineado al ecosistema DECO.
- **Tabs y radios visuales** ajustados para mantener consistencia entre light/dark, bordes externos y tabs activas.
- **Scrollbars** centralizados para mantener una apariencia consistente en modales, wallet mockup y contenedores con overflow.

### Corregido
- **Logo del onboarding** deja de usar variantes completas que se recortaban en modales compactos.
- **Selector de idioma anterior** deja de ser el punto principal para informacion extensa; el flujo pasa al modal central.
- **QR vacio/roto** en tab de login por QR.

---

## [0.6.0] - 2026-06-21

### Añadido
- **Seccion Global Access** con globo 3D interactivo basado en `three`, `@react-three/fiber`, `@react-three/drei` y `three-globe`.
- **`components/ui/globe.tsx`** como componente reutilizable para visualizaciones globales con arcos, puntos, atmosfera y rotacion.
- **`components/ui/gooey-input.tsx`** integrado en navbars principales como busqueda visual compacta.
- **Banderas fiat** en tarjetas de tasas para USD, COP, EUR, MXN, CLP, PEN, ARS, VES, AWG, DOP y BRL.
- **Fallback fiat regional** en el BFF de precios para monedas de Mexico, Chile, Peru, Argentina, Venezuela, Aruba, Republica Dominicana y Brasil.

### Cambiado
- **Stats y tasas** traducidas y ajustadas visualmente: Transacciones, Criptomonedas, Monedas fiat y Usuarios.
- **Fiat Currency Rates** ahora muestra compra, venta y diferencial en espanol, con formato uniforme a dos decimales.
- **Hero y navbar** refinados con radio amplio, sombras controladas, modo claro/oscuro y CTA en color DECO `#ff6c02`.
- **Secciones visuales** alineadas a la nueva direccion de diseno: bordes mas suaves, profundidad en modo claro y negro real en modo dark.
- **Copy principal** ajustado a "Opere y gestione sus activos con nuestra plataforma segura, rapida e intuitiva."

### Corregido
- **Globo 3D** estabilizado contra deformaciones, tamanos transitorios y cambios de tema; la camara y el renderer recalculan medidas reales del canvas.
- **QR y assets por tema** mantienen contraste entre modo dark y white.
- **Tabs visuales** refinadas para mantener borde y seleccion consistentes con la nueva linea de diseno.
- **Iconografia social y footer** consolidada con Lucide React donde aplica.

---

## [0.5.0] - 2026-06-20

### Añadido
- **Mockup mobile DECO Wallet** importado y componentizado en `components/wallet/`, con assets propios de monedas, fiat, stablecoin, altcoins y QR.
- **`ExchangeAccessBadge`** para reemplazar el acceso de inversionista anterior por un badge DECO Exchange enlazado a `https://exchange.example.invalid/`.
- **`share-preview-card.tsx`** para la tarjeta de compartir en onboarding social con imagen Cloudinary de DECO Exchange.
- **QR principal light/dark** para que el acceso movil mantenga contraste correcto en ambos temas.

### Cambiado
- **Branding DECO Exchange** actualizado: logos por tema, favicon, color primario `#ff6c02`, textos principales en blanco sobre acciones naranjas y footer con logo oficial.
- **Modal de bienvenida** simplificado, con menos texto, logo por tema y aviso legal corto: "No ofrecemos servicios financieros."
- **Mobile Access** reemplaza el mockup anterior por el mockup mobile DECO Wallet y mantiene QR cuadrado.
- **Footer y comunidad** conectados a redes DECO31416 y WhatsApp `+573013099880`.
- **Productos, partners y onboarding** ajustados para usar iconos Lucide React y tarjetas sin imagen cuando el asset anterior no correspondia.
- **Partners** actualizados con nombres y enlaces reales del ecosistema DECO31416.

### Corregido
- **Logos por tema**: se evita que el logo blanco quede invisible en modo claro despues de recargar.
- **QR por tema**: se corrige el contraste del QR en modo white y dark.
- **Favicon**: metadata apunta a `/favicon.ico`.
- **BFF `/api/prices`**: fallback controlado para mantener la landing operativa si el pricing aggregator local no esta disponible.
- **Trazas visuales antiguas**: eliminados assets y copys heredados que no pertenecen a DECO Exchange.

---

## [0.4.0] - 2026-05-01

### Dashboard: modales de fondeo fiat multi-método y recepción crypto multi-red

#### Añadido
- **`FundMethodId`** — tipo union en `currency-metadata.ts` con los 9 métodos de fondeo fiat soportados: `spei | card | store | deposit | ach | wire | pse | nequi | sepa`.
- **`NetworkOption`** — interfaz en `currency-metadata.ts`: `{ id, name, standard, warning? }` para redes blockchain de tokens multi-red.
- **`fundMethods[]`** en metadatos de monedas fiat — MXN: `[spei, card, store, deposit]`; USD: `[wire, ach, card]`; COP: `[pse, nequi, card, deposit]`; EUR: `[sepa, card, wire]`.
- **`networks[]`** en metadatos de tokens crypto — USDT: `[erc20, trc20, bep20]`; USDC: `[erc20, spl, bep20]`; BTC/ETH/DECOX: sin array (mono-red).
- **`modal-fund-fiat.tsx`** — reescritura completa. `FUND_METHODS_REGISTRY` cubre los 9 métodos con pantallas de detalle individuales: SPEI (CLABE copiable + STP), Tarjeta (fee adaptativo por moneda), Tiendas (Oxxo/7-Eleven + referencia), Depósito bancario, ACH (Routing + Account), Wire SWIFT (adaptativo USD/EUR), PSE Colombia, Nequi, SEPA (IBAN + BIC). Footer cambia a "← Volver a métodos" en vista de detalle.
- **`modal-fund-crypto.tsx`** — reescritura completa. Flujo bifurcado: tokens multi-red muestran selector de red con advertencia crítica antes del QR; tokens mono-red van directamente al QR + dirección copiable. Badge de red activa en la vista QR.
- **`.modal-scroll`** — clase CSS en `globals.css` para scrollbar fino semi-transparente en modales con contenido desplazable.
- **`balance-card.tsx`** — botones QR (recibir), Info (detalle) y Cargar (fondeo) conectados: fiat abre `ModalFundFiat`, crypto abre `ModalFundCrypto`.

#### Corregido
- **`Duplicate export 'default'` en `modal-fund-fiat.tsx`** — el código viejo del componente quedó concatenado tras la reescritura. Eliminado. Build restaurado.
- **`Duplicate export 'default'` en `modal-fund-crypto.tsx`** — mismo problema. Eliminado. Build restaurado.
- **`package.json`** — versión corregida de `0.2.0` a `0.4.0`.
- **`README.md`** — sección obsoleta 0.2.0 duplicada eliminada. Diagrama de flujo BFF actualizado con flujo de modales.

#### Deuda técnica registrada (abierta)
- `MODAL-DEBT-001` — Los botones "Ir al formulario de pago" (tarjeta) e "Iniciar pago con PSE" son placeholders visuales — pendiente integración con pasarela de pagos real.
- `MODAL-DEBT-002` — Direcciones de fondeo fiat (CLABE, IBAN, cuenta) están tomadas de `accountNumber` prop — pendiente conexión a API que devuelva la dirección real por usuario y método.

---

## [0.3.0] - 2026-05-01

### Landing audit and real-data stabilization

#### Añadido
- **BFF `/api/prices/all`** — proxy server-side a `pricing-aggregator` (:3013). Precios reales de crypto y fiat sin exponer `x-internal-auth` al browser.
- **BFF `/api/prices/convert/:from/:to`** — conversión en tiempo real vía aggregator.
- **BFF `/api/landing-stats`** — métricas públicas reales: `transactions` (total `ledger_txs`), `cryptocurrencies` y `fiatMoney` (desde pricing), `users` (desde micro-auth). Endpoint destino: `GET /api/v1/public/landing-stats` en api-gateway-user (:8081).
- **`CryptoService`** (`services/CryptoService.ts`) — cliente centralizado: `getCryptoCurrencies()`, `getStablecoins()`, `getCryptoBySymbols()`, `getMarketStats()`, `getFiatCurrencies()`.
- **`LOCAL_CURRENCY_ICONS`** — mapa de iconos para BTC, BNB, USDC, ETH, SOL, ADA, DOT, DOGE, DECOX, DECO, DECO, etc. DECO añadido en esta sesión.
- **`.mock-wallet-scroll`** — clase CSS en `globals.css` para scrollbar fino semi-transparente en vistas internas del mockup móvil. Reemplaza clases Tailwind `scrollbar-thin scrollbar-dark` (no operativas sin plugin).
- **`DEMO_TOTAL_BALANCE`** — constante `99828.30` en `crypto-wallet.tsx`. Balance demo señalizado como tal en UI. No conecta datos privados de usuario en landing pública.
- **`formatUsdPrice()`** — formateador con escala por magnitud (≥1000: locale, ≥1: 2dp, ≥0.01: 4dp, else 6dp).
- **Precios en tiempo real en mockup móvil** — `getCryptoBySymbols` conectado en `crypto-wallet.tsx`. `livePrices` state con `useEffect`. Asset list, coin detail y header muestran precios reales.
- **`getMarketStats()`** en CryptoService — calcula Market Cap, Volume 24h y BTC/ETH Dominance derivados del aggregator. Market Sentiment card eliminada (sin fuente real).
- **Filtros de activos internos** — `INTERNAL_MARKET_EXCLUDED_SYMBOLS`, `INTERNAL_PORTFOLIO_EXCLUDED_SYMBOLS`, `INTERNAL_TICKER_EXCLUDED_SYMBOLS` — filtran DECOX/DECO de secciones públicas donde no corresponde mostrarlos.

#### Cambiado
- **Fiat Currency Rates** — `liveCurrencyRates`, `centralBankRates`, `buyRates`, `p2pRates` dead code eliminado. Tasas reales desde `getFiatCurrencies()`. `CENTRAL_BANK_RATES_STATIC_CONFIG` reclasificado como `RATES-CONFIG-003`: tasas oficiales de referencia de mercado deco-exchange (no API bancaria externa). Buy/Sell ±5% y P2P ±2% son configuración de producto aprobada.
- **Market Overview** — `marketData` const eliminado. Market Cap / Volume / Dominance derivados del aggregator. Market Sentiment oculto. `lg:grid-cols-4` → `lg:grid-cols-3`.
- **Portfolio Builder + Token Price Ticker** — `formatPercent()` reemplaza floats crudos. `formatVolume()` en ticker carousel. Arrays `cryptoData.popular/stablecoins/novedades` confirmados como dead code (tabs consumen APIs reales).
- **Mobile Wallet Mockup** — badge externo "Vista previa" eliminado. Gráficos determinísticos: `Math.random` → `Math.sin(i * 2.7 + (basePrice % 97))`. Scrollbars internos estandarizados (15 contenedores en 9 archivos).
- **`getCurrencyIcon` / icono de Next/Image** — assets sin icono filtrados u ocultos para evitar `src=""` inválido.

#### Corregido
- **Scrollbar global** — bug de scrollbar de página desapareciendo al abrir modal/dropdown. Corregido en CSS global sin afectar scrollbars de secciones.
- **TS7053 `coin-detail-view.tsx`** — `useState<string>("day")` → `useState<"day"|"week"|"month"|"year">("day")`. Preexistente.
- **TS2352 × 3 `p2p-market-view.tsx`** — variantes `"success"` e `"info"` no existen en `toastVariants` (solo `"default"` y `"destructive"`). Eliminados `variant` inválido y casts `as Parameters<typeof toast>[0]`. Sin cambio visual. Preexistente.

#### Deuda técnica registrada (abierta)
- `MOBILEAPP-MOCK-001` — balance demo aceptado en landing pública (señalizado)
- `MOBILEAPP-DEBT-001` — gráficos principales sin histórico real (sin() determinístico)
- `MOBILEAPP-DEBT-002` — `Math.random()` en `coin-detail-view` y `analytics-view`
- `MOBILEAPP-DEBT-003` — vistas hijas del mockup pendientes de auditoría individual
- `PORTFOLIO-TEMP-001` — Recompensas hardcodeadas como config de producto
- `PORTFOLIO-DEAD-001` — arrays dead code en portfolio-builder
- `PORTFOLIO-NOVEDADES-001` — curación editorial de tab Novedades
- `TOKENPRICE-DEBT-001` — helpers `formatPercent/formatVolume` duplicados
- `MARKET-DEBT-001` — endpoint dedicado `/api/market-overview` no bloqueante
- `MARKET-DEBT-002` — componentización Market Overview
- `RATES-DEBT-002` — sin polling en Fiat Currency Rates

#### Bugs cerrados en esta versión
- ~~`BUG-NEXT-001`~~ — ✅ **CERRADO 2026-05-01** — Exchange widgets aceptaban montos negativos. Corregido en `use-fiat-exchange.ts`, `fiat-exchange-tab.tsx`, `buy-sell-crypto-tab.tsx`, `p2p-trading-tab.tsx`. Ahora: no se calcula con `amount <= 0`, no se llama API con negativos, botones deshabilitados con `amount <= 0`, valores positivos siguen funcionando. Veredicto: **operativo**.
- ~~`STATS-404`~~ — ✅ **CERRADO 2026-05-01** — Fixed landing-stats BFF/gateway runtime validation. Public landing stats now resolve end-to-end from gateway-user, micro-auth, pricing-aggregator and wallet-ledger. BFF añade guard `!response.ok → 503` para evitar passthrough de errores upstream. Cadena completa: `browser → :3002/api/landing-stats → gateway-user :8081 → micro-auth :7000 (users: real) + pricing-aggregator :3013 (cryptocurrencies/fiatMoney: real) + wallet-ledger :9001 (transactions: real)`. `sources: all real`. StatsSection ya no cae en fallback degradado. Veredicto: **operativo**.

#### Próxima auditoría pendiente
- Continuar auditoría visual/componente por secciones en `http://localhost:3000/`.

---

## [0.2.0] - 2026-04-26

### Añadido
- **Módulo P2P completo** (`components/p2p/`): layout, navegación, vistas y modales
- **P2P Container** (`components/p2p/container/index.tsx`): layout principal con navbar horizontal de tabs (Dashboard, Mercado, Intercambio, Mis Anuncios, Órdenes, Chat, Usuarios, Configuración)
- **Navigation Provider** (`components/p2p/navigation-provider.tsx`): contexto global `activeView`/`setActiveView` para switching de vistas
- **P2P Market View** (`components/p2p/views/p2p-market-view.tsx`): vista de mercado P2P refactorizada (~500 líneas, limpia y mantenible)
- **Market Constants** (`components/p2p/market/market-constants.ts`): datos base de `cryptos`, `currencies` y `paymentMethods`
- **Trade Modal** (`components/p2p/modals/trade-modal.tsx`): modal de operación de compra/venta P2P
- **Chat Modal** (`components/p2p/modals/chat-modal.tsx`): modal de chat entre contrapartes en operación P2P
- **Favicon configurado** en `app/layout.tsx` con `icons` en metadata (browser tab, shortcut, Apple touch icon) apuntando a `/images/logos/favicon.png`

### Cambiado
- **P2P layout**: eliminado `SidebarProvider`/`Sidebar`/`SidebarTrigger` de shadcn — reemplazado por barra de tabs horizontal nativa
- **P2P tabs**: la barra de navegación está contenida dentro del `container` (mismo ancho que el contenido) — sin línea de borde a pantalla completa
- **P2P spacing**: padding-top correcto (`pt-[88px] sm:pt-24`) para compensar navbar `fixed top-0 z-50`. Spacer `h-14` entre navbar y tabs. Padding de contenido `pt-20 pb-10`
- **P2P tabs sticky**: posición `sticky top-[88px] sm:top-24 z-30` — se adhieren justo debajo del navbar al hacer scroll sin quedar debajo de él
- **README**: versión actualizada a `0.2.0`, comandos actualizados a `pnpm` (gestor oficial del proyecto)
- **package.json**: versión bumpeada de `0.1.1` a `0.2.0`

### Corregido
- Inconsistencia de versión entre `package.json` (`0.1.1`) y `README.md` (`1.0.36`) — unificado en `0.2.0`
- Comandos de instalación en README usaban `npm` en lugar de `pnpm`

---

## [0.1.1] - 2026-04-01

### Inicial
- Landing page deco-exchange con Next.js 15, React 18, TailwindCSS 3, Radix UI
- Secciones: Hero, Stats, Fiat Currency, Market Overview, Portfolio, Token Price, Spot Trading, Products, Partnership, Mobile Access, Community, Partners
- Navbar, Footer, ScrollToTop
- Componentes UI base con shadcn/ui
- Modo oscuro por defecto (`dark`)
