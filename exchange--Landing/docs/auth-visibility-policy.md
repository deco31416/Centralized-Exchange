# Politica de visibilidad por autenticacion - Deco Exchange

Este documento define que puede mostrarse sin sesion y que debe quedar protegido por login en las experiencias de producto de Deco Exchange.

Regla principal: toda ruta puede explicar el producto de forma publica, pero ningun dato personal, saldo, direccion, comprobante, referencia unica, limite individual, orden privada o accion firmable debe mostrarse sin usuario autenticado.

## Capas De Visibilidad

| Capa | Quien la ve | Que permite |
|---|---|---|
| Publica | Visitante sin login | Entender producto, ver educacion, reglas, riesgos, metodos referenciales y CTAs. |
| Preview bloqueado | Visitante sin login | Ver que existe un modulo privado sin revelar datos sensibles. Debe ofrecer iniciar sesion. |
| Privada | Usuario autenticado | Ver datos propios, operar, confirmar, firmar, reclamar, retirar o consultar historial. |
| Admin/operacion | Roles internos futuros | Configurar limites, aprobar revisiones, ver riesgos internos o auditoria operacional. |

## Reglas Globales

- No mostrar saldos reales sin login.
- No mostrar direcciones wallet, cuentas destino, referencias unicas, proof path, codigos personales ni QR privados sin login.
- No permitir acciones que creen orden, movimiento, retiro, reclamo, publicacion, firma o aceptacion legal sin login.
- Las simulaciones publicas deben ser genericas y no personalizadas.
- Las tasas, metodos y disponibilidad publica deben decir "referencial", "sujeto a disponibilidad" o "segun region" cuando aplique.
- Los datos privados deben depender del backend/BFF/gateway de usuario, no de mocks hardcodeados en produccion.
- Si una ruta mezcla informacion publica y privada, la privada debe vivir en un bloque con gating claro.
- El CTA sin login debe ser "Iniciar sesion" o "Crear cuenta", no una accion operativa falsa.
- El copy debe evitar promesas de ganancia, aprobacion, cobertura individual o recompensa antes de validar usuario.

## Clasificacion De Datos

| Tipo de dato | Publico | Privado con login |
|---|---|---|
| Descripcion del producto | Si | Si |
| Reglas legales generales | Si | Si |
| Riesgos generales | Si | Si |
| Metodos disponibles por pais | Si, referencial | Si, filtrado por usuario |
| Montos minimos generales | Si | Si, ajustado a perfil |
| Saldos del usuario | No | Si |
| Limites del usuario | No | Si |
| KYC/estado regulatorio | No | Si |
| Direcciones wallet | No | Si |
| Cuentas destino/referencias | No | Si |
| Historial de ordenes | No | Si |
| Merkle leaf/proof path | No | Si |
| Codigo de referido | No | Si |
| Recompensas pendientes | No | Si |
| Ranking publico con alias | Si, si es opt-in | Si, con configuracion |

## Patron De Interfaz

Cada vista debe dividirse asi:

1. Hero publico: explica que es y para quien sirve.
2. Panel de reglas: riesgos, disponibilidad y documentos.
3. Bloques publicos: datos generales, simulaciones no personales, metodos referenciales.
4. Bloque privado: datos de usuario protegido por login.
5. CTA privado: si no hay login, abre modal de login; si hay login, ejecuta flujo.

## Crypto Facil

| Ruta | Publico sin login | Privado con login |
|---|---|---|
| `/easy-crypto/buy` | Explicacion, monedas disponibles, metodo referencial, simulacion de compra, minimo general. | Quote personalizada, limites, metodo real, orden de compra, cuenta/fondeo, confirmacion. |
| `/easy-crypto/sell` | Explicacion, activos soportados, tasa referencial, pasos para vender. | Balance crypto, destino fiat, orden de venta, liquidacion, historial. |
| `/easy-crypto/convert` | Conversor referencial, activos soportados, tasa estimada. | Balance disponible, quote firmable, conversion real, recibo. |
| `/easy-crypto/send` | Explicacion de envio y redes soportadas. | Direcciones, contactos, balance, fee real, firma y tracking. |
| `/easy-crypto/spot-lite` | TradingView/mercado publico, pares, tendencia, riesgo visible. | Balance, accion comprar/vender, orden spot lite, historial. |

## Bolsillito

| Ruta | Publico sin login | Privado con login |
|---|---|---|
| `/bolsillito/add-money` | Pais, moneda, metodos referenciales, minimo general, pasos. | Limites personales, referencia unica, cuenta destino, orden de recarga, estado. |
| `/bolsillito/send-money` | Explicacion de envio entre usuarios y reglas. | Destinatarios, saldo fiat, firma, comision, comprobante. |
| `/bolsillito/remittances` | Paises disponibles, rutas, cotizacion referencial, riesgo. | Beneficiarios, limites, tasa reservada, orden, tracking. |
| `/bolsillito/withdraw-credit` | Medios disponibles, tiempos, reglas generales. | Saldo, cuenta destino, limites, retiro, comprobante. |

## Mercados

| Ruta | Publico sin login | Privado con login |
|---|---|---|
| `/markets/spot` | Grafica, pares, ticker, libro publico/fallback, riesgo. | Balances, ordenes, historial, ejecutar compra/venta. |
| `/markets/futures` | Informacion de contratos, riesgo, grafica, funding referencial. | Margen, posiciones, ordenes, liquidacion, cierre. |
| `/markets/p2p` | Ofertas publicas, reglas, reputacion agregada. | Crear orden, chat, pagos, liberacion, disputas. |
| `/markets/market-maker` | Explicacion OTC, mercado mayorista, requisitos generales. | Ofertas propias, acuerdos, propuesta a Deco, chat, configuracion. |
| `/markets/advanced-orders` | Explicacion de ordenes avanzadas y ejemplos. | Ordenes limit/stop/OCO/TP-SL reales, balance, historial. |
| `/markets/market-analysis` | Analisis publico, tendencias, watchlist mock. | Watchlist privada, alertas propias, preferencias. |
| `/markets/order-history` | Explicacion del historial. | Historial real, fills, exportacion, detalle de orden. |
| `/markets/price-alerts` | Templates y ejemplos. | Alertas guardadas, canales, disparos, notificaciones. |

## Developers

| Ruta | Publico sin login | Privado con login |
|---|---|---|
| `/developers` | Portal tecnico, casos de uso, widgets, webhooks y terminos. | Estado de integracion, credenciales, contratos y configuracion por cuenta. |
| `/developers/data-api` | Docs publicas de endpoints, contratos BFF y casos de uso. | API keys, permisos, logs privados, rotacion y scopes de trading. |
| `/markets/data-api` | Redirect de compatibilidad hacia `/developers/data-api`. | N/A. |

## Rendimiento

| Ruta | Publico sin login | Privado con login |
|---|---|---|
| `/rendimiento` | Explicacion, productos, riesgos, reglas. | Posiciones propias, saldo elegible, actividad. |
| `/rendimiento/staking-tokens` | Tokens elegibles, condiciones, simulador generico. | Saldo, posicion, activar staking, retirar, historial. |
| `/rendimiento/boveda-programada` | Plazos, reglas, simulador generico, riesgos. | Bovedas propias, monto, vencimiento, accion al cierre. |
| `/rendimiento/reservas` | Reservas crypto/fiat, consolidado usuarios, cobertura, auditorias. | "Asi esta tu dinero", porcentaje propio, Merkle leaf/proof, comprobante. |
| `/rendimiento/calculator` | Simulacion no personalizada. | Simulacion con saldo elegible, guardar escenario, activar producto. |
| `/rendimiento/activity` | Explicacion de actividad. | Eventos, posiciones y movimientos del usuario. |

## Ganar

| Ruta | Publico sin login | Privado con login |
|---|---|---|
| `/earn` | Programas disponibles, reglas y beneficios generales. | Estado del usuario, recompensas, nivel, actividad. |
| `/earn/referrals` | Como funciona referidos, reglas, elegibilidad general. | Codigo personal, enlace, invitados, comisiones, cobro. |
| `/earn/deco-points` | Explicacion de puntos, fuentes y canjes generales. | Balance de puntos, historial, canje, vencimientos. |
| `/earn/cashback` | Categorias generales, reglas y cortes. | Cashback propio, movimientos, cobro, categorias activas. |
| `/earn/learn-and-earn` | Rutas educativas y recompensas generales. | Progreso, quizzes, recompensas, certificados. |
| `/earn/missions` | Misiones generales y reglas. | Misiones activas, progreso, racha, reclamar recompensa. |
| `/earn/sponsor-ads` | Campanas disponibles y reglas antiabuso. | Tomar campana, enviar evidencia, metricas, recompensa. |
| `/earn/launchpad` | Proyectos, riesgos, cupos generales, vesting. | Whitelist, cupo personal, intencion, participacion. |
| `/earn/top-earners` | Ranking publico con alias opt-in, reglas. | Alias propio, posicion privada, reclamo si aplica. |

## Legales

Las paginas legales son principalmente publicas. Su funcion es explicar reglas, riesgos, terminos, licencias, transparencia y soporte documental. No deben revelar datos del usuario ni reemplazar flujos privados.

| Grupo | Rutas | Publico sin login | Privado con login |
|---|---|---|---|
| Centro legal | `/legals`, `/legals/terms`, `/legals/privacy`, `/legals/cookies` | Terminos, privacidad, cookies, categorias y recursos. | Aceptaciones firmadas, version aceptada, historial de consentimientos. |
| Identidad y cumplimiento | `/legals/kyc-aml`, `/legals/prevention`, `/legals/licencias` | Reglas KYC/AML, prevencion, disponibilidad regulatoria. | Estado KYC, documentos, restricciones personales, limites por usuario. |
| Riesgo y criptoactivos | `/legals/risks`, `/legals/criptoactivos`, `/legals/deco-token`, `/legals/deco-custody` | Riesgos generales, custodia, token, activos digitales. | Exposicion personal, cartera, aceptaciones de riesgo por producto. |
| Reservas y transparencia | `/legals/reservas`, `/legals/transparencia`, `/legals/auditorias`, `/legals/seguros`, `/legals/reports` | Politica PoR, auditorias, reportes, coberturas y limitaciones. | Merkle personal, leaf/proof path, snapshot de usuario, comprobantes privados. |
| Monedas y tasas | `/legals/monedas`, `/legals/tasas`, `/legals/comisiones`, `/legals/calculadora` | Monedas soportadas, tasas referenciales, comisiones generales y simuladores educativos. | Tarifas personalizadas, limites, descuentos, historial de comisiones. |
| Bolsillito/metodos | `/legals/efectivo`, `/legals/electronicos`, `/legals/tarjetas`, `/legals/cajeros`, `/legals/giros-puntos` | Reglas generales de metodos, puntos y disponibilidad. | Referencias unicas, cuentas destino, puntos del usuario, movimientos. |
| Comunidad y recompensas | `/legals/referidos`, `/legals/lee-y-gana`, `/legals/play-to-earn`, `/legals/sponsor-ads`, `/legals/score-traders`, `/legals/community`, `/legals/comunidad` | Reglas generales de programas, elegibilidad y antiabuso. | Codigo personal, recompensas, progreso, alias, reclamos, evidencia enviada. |
| Developer/B2B | `/legals/api-developer`, `/legals/widgets`, `/legals/white-label`, `/legals/cuenta-adt`, `/legals/cuenta-trader` | Documentacion publica, requisitos, niveles y condiciones. | API keys, credenciales, contratos, configuraciones, estado de cuenta. |
| Contacto y soporte | `/legals/contacto`, `/legals/help-center`, `/legals/knowledge-base`, `/legals/bug-bounty` | Canales publicos, FAQ, guias, reporte general de bugs. | Tickets, casos, evidencias, estado de soporte, reportes privados. |

## Legales - Inventario Observado

| Bloque actual | Rutas principales | Lectura de producto |
|---|---|---|
| Legales | `kyc-aml`, `privacy`, `terms`, `risks`, `prevention`, `reports`, `cookies`, `community` | Centro regulatorio publico. Solo consentimientos, aceptaciones o reportes propios pasan a privado. |
| Operacion | `comisiones`, `calculadora`, `tasas`, `monedas`, `tarjetas`, `cajeros`, `reservas`, `transparencia`, `auditorias`, `licencias`, `seguros`, `efectivo`, `electronicos`, `criptoactivos` | Documentacion publica de costos, metodos, monedas y solvencia. Limites, tarifas personalizadas, referencias y Merkle personal requieren login. |
| Integraciones | `deco-custody`, `cuenta-adt`, `cuenta-trader`, `giros-puntos`, `white-label`, `widgets` | Oferta publica B2B/operativa. Contratos, configuracion y credenciales quedan privados. |
| Programas | `bug-bounty`, `score-traders`, `referidos`, `play-to-earn`, `lee-y-gana`, `sponsor-ads` | Reglas publicas de participacion. Progreso, reclamos, evidencias y pagos requieren login. |
| Control legal | `deco-token`, `api-developer`, `help-center`, `contacto` | Acceso publico a informacion y soporte. Acciones trazables o sensibles requieren login. |

## Help Center

El Help Center debe ser publico para educar y orientar, pero las interacciones de soporte con datos del usuario deben requerir login.

| Seccion | Publico sin login | Privado con login |
|---|---|---|
| Hero y selector de equipo | Equipos de soporte, tiempos generales, canales disponibles. | Equipo recomendado segun cuenta, pais, KYC o producto usado. |
| Acceso rapido | FAQ, tutoriales, problemas frecuentes, base de conocimiento. | Atajos a casos propios, ordenes, wallet, P2P o movimientos afectados. |
| Canales de soporte | Email publico, telefono general, chat informativo, guias. | Chat autenticado, ticket con usuario, adjuntos, trazabilidad. |
| Sistema de tickets | Explicacion de como crear ticket. | Crear ticket, ver estado, responder, subir evidencia, cerrar caso. |
| FAQ | Preguntas generales. | FAQ contextual segun productos activos o errores del usuario. |
| Tutoriales | Guias publicas. | Tutoriales personalizados por nivel, pais, producto y estado KYC. |
| Solucion de problemas | Pasos generales de diagnostico. | Diagnostico con datos de orden, wallet, pago, remesa o ticket. |
| Bug bounty | Reglas publicas para reportar. | Reportes privados, severidad, estado y recompensa. |

## Help Center - Mapa De Experiencia

| Elemento observado | Regla futura |
|---|---|
| `SupportTeamSelector` | Puede ser publico como selector educativo. Si recomienda equipo por pais, producto o usuario, debe usar login. |
| `Contactar soporte` | Puede llevar a canales generales. Si abre chat operativo, debe pedir login. |
| `Iniciar chat` | Debe pedir login antes de crear conversacion o asociar usuario. |
| `Crear ticket de soporte` | Debe pedir login antes de crear ticket, adjuntar evidencia o asignar numero de caso. |
| Email y telefono | Pueden ser publicos como canales generales. No deben mostrar agentes asignados ni casos propios. |
| FAQ y tutoriales | Publicos si son genericos. Cualquier ayuda basada en cuenta, KYC, pago, orden o wallet pasa a privado. |
| Solucion de problemas | Publica para pasos generales. Seguimiento de transaccion, motivo KYC, bloqueo de cuenta o disputa requiere login. |
| Base de conocimiento | Publica como biblioteca. Historial de articulos vistos, progreso o recomendaciones personalizadas requieren login. |

## Help Center - Links A Revisar

| Hallazgo | Riesgo | Accion futura |
|---|---|---|
| Enlaces mezclados entre `/legals/knowledge-base/...` y `/knowledge-base/...` | Puede romper navegacion o duplicar rutas. | Definir ruta canonica antes de implementar gating. |
| Enlace `/legals/fees` observado en FAQ | La ruta canonica actual parece ser `/legals/comisiones`. | Alinear copy/enlace sin cambiar contenido legal todavia. |
| CTAs con `href="#"` en chat, redes o tickets | Maqueta no funcional. | Convertir en acciones publicas o privadas segun el tipo de dato. |

## Footer - Mapa De Conexion

El footer principal esta conectado a rutas reales, anchors del home y canales externos. La auditoria debe distinguir entre conexion tecnica y destino ideal de producto.

| Grupo | Items conectados a ruta real | Items conectados a anchor del home | Items a revisar |
|---|---|---|---|
| Compania | Home, Tarifas, Prueba de Reservas, Help Center, Legales, Contacto | Roadmap, Unete al equipo | Roadmap y equipo dependen del contenido actual del home, no de paginas dedicadas. |
| Para ti | Comprar Cripto, Mercado P2P, Wallet, Referidos, Launchpad, Estado del Servicio | Intercambio Fiat, Staking | Wallet apunta a `/dashboard`; Referidos y Launchpad apuntan a legales aunque ya existen experiencias `/earn/referrals` y `/earn/launchpad`. Staking apunta a home aunque existe `/rendimiento/staking-tokens`. |
| Para empresas | E-Commerce plugins, Market Maker, Guia de Marca, Procesamiento Cripto | Ninguno | Guia de Marca y Procesamiento Cripto apuntan a legales; falta decidir si seran paginas comerciales propias. |
| Soporte | Telegram, Email | Ninguno | Son canales externos/directos. Cualquier chat/ticket operativo debe pedir login. |
| Mercados DECO | Informacion de monedas, DECOToken | Resumen del mercado | Bitcoin/Ethereum/Solana apuntan a `/legals/monedas`, no a paginas por moneda. |
| Herramientas | Calculadora DECO, Comprar cripto, Convertir activos, Enviar activos, Mercado P2P, Wallet | Ninguno | Wallet apunta a `/dashboard`; revisar si debe apuntar a `/wallet` o app autenticada futura. |
| Tasas fiat | Calculadora, Tasas, Monedas, Efectivo, Medios electronicos, Comisiones | Ninguno | Bien conectado a legales como documentacion publica. |
| Educacion cripto | Knowledge Base, Prevencion, Riesgos, KYC/AML | Ninguno | Las preguntas especificas apuntan todas a Knowledge Base general; falta ruta/articulo canonico por tema. |

## Footer - Destinos Ideales Futuros

| Item actual | Destino actual | Destino ideal probable |
|---|---|---|
| Staking | `/#recompensas` | `/rendimiento/staking-tokens` |
| Referidos | `/legals/referidos` | `/earn/referrals` para producto, `/legals/referidos` para reglas. |
| Launchpad | `/legals/criptoactivos` | `/earn/launchpad` para producto, legal especifico para reglas. |
| Wallet | `/dashboard` | App autenticada o `/wallet` si se crea vista publica/privada. |
| Intercambio Fiat | `/#tasas` | `/bolsillito/add-money` o vista fiat dedicada, segun producto final. |
| Estado del Servicio | `/legals/reports` | Pagina publica de status si se crea servicio dedicado. |
| Bitcoin/Ethereum/Solana | `/legals/monedas` | Articulo o ficha individual de moneda. |

## Help Center - Datos Sensibles

| Dato | Debe requerir login |
|---|---|
| Numero de ticket | Si |
| Estado de ticket | Si |
| Adjuntos o evidencias | Si |
| Orden relacionada | Si |
| Movimiento o pago relacionado | Si |
| Wallet o direccion del usuario | Si |
| Conversacion con soporte | Si |
| Datos KYC o documentos | Si |
| Recompensa bug bounty | Si |
| Diagnostico personalizado | Si |

## Estados De Bloque Privado

| Estado | UI esperada |
|---|---|
| Cargando sesion | Skeleton o card "Verificando sesion". |
| Sin login | Card con beneficio de iniciar sesion y boton de login. |
| Login requerido para accion | Modal de login antes de ejecutar. |
| Usuario sin KYC | Explicar requisito y CTA a verificacion. |
| Usuario sin datos | Empty state con accion natural. |
| Error backend | Mensaje claro y reintento, sin filtrar datos sensibles. |

## Backend Futuro

Cada endpoint privado debe:

- Requerir cookie/token de sesion.
- Validar usuario y permisos.
- Filtrar por `userId` server-side.
- No confiar en parametros de usuario enviados desde el browser.
- Registrar auditoria para acciones sensibles.
- Separar datos publicos de datos privados en contratos distintos.

## Regla De Revision

Antes de cerrar cualquier nueva pantalla, revisar:

1. Que se ve sin login.
2. Que se oculta sin login.
3. Que accion dispara login.
4. Que datos requieren KYC o region.
5. Que copy legal evita promesas indebidas.
6. Que el estado privado no se puede inferir desde HTML publico.
