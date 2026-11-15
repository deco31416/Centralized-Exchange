# Plan Auth Visibility - Deco Exchange

Documento de control tipo Jira para definir y auditar que muestra cada modulo sin login y que queda protegido por autenticacion.

Regla principal: Deco Exchange puede explicar productos publicamente, pero datos personales, saldos, limites, referencias unicas, codigos, historiales, comprobantes, Merkle personal y acciones operativas deben requerir login.

Documento canonico: `docs/auth-visibility-policy.md`.

## Flujo De Estados

| Estado | Significado |
|---|---|
| POR HACER | Tarea pendiente. |
| EN DISENO | Se esta definiendo UX, copy y reglas de visibilidad. |
| EN DESARROLLO | Se esta implementando gating o estados. |
| EN REVISION | Existe definicion o codigo y falta QA. |
| HECHO | Revisado, verificado y documentado. |
| BLOQUEADO | Requiere decision legal, producto o backend. |

## Reglas De Trabajo

- Todo flujo debe separar contenido publico de contenido privado.
- No mostrar datos personales sin login.
- No ejecutar acciones sensibles sin login.
- Simulaciones publicas deben ser genericas.
- Datos privados deben venir del backend/BFF/gateway, no de mocks finales.
- La UI sin login debe explicar valor y pedir iniciar sesion sin revelar datos.
- Las rutas pueden ser publicas, pero sus bloques privados deben estar protegidos.
- Si ademas se requiere KYC, se debe mostrar un estado posterior al login.
- Mantener el estilo aprobado del home y componentes ya existentes.

## Clasificacion General

| Capa | Ejemplos |
|---|---|
| Publica | Hero, reglas, metodos referenciales, riesgos, docs, simulaciones genericas. |
| Privada login | Saldos, direcciones, ordenes, historial, recompensas, Merkle, codigos. |
| Privada KYC | Limites altos, retiro, remesas, P2P, futuros, launchpad, cobros. |
| Admin futuro | Aprobaciones, riesgo interno, auditorias operativas, soporte. |

## Roadmap General

| ID | Epica | Estado | Prioridad | Area |
|---|---|---|---|---|
| AUTH-001 | Politica canonica | HECHO | Alta | `docs/auth-visibility-policy.md` |
| AUTH-002 | Crypto facil | POR HACER | Alta | `/easy-crypto/*` |
| AUTH-003 | Bolsillito | POR HACER | Alta | `/bolsillito/*` |
| AUTH-004 | Mercados | POR HACER | Alta | `/markets/*` |
| AUTH-005 | Rendimiento | EN REVISION | Alta | `/rendimiento/*` |
| AUTH-006 | Ganar | POR HACER | Alta | `/earn/*` |
| AUTH-007 | Componentes compartidos | POR HACER | Alta | Login gates |
| AUTH-008 | Backend/BFF contratos | POR HACER | Alta | API privada/publica |
| AUTH-009 | QA visual y legal | POR HACER | Alta | Global |
| AUTH-010 | Legales y Help Center | EN REVISION | Alta | `/legals/*` |

---

# AUTH-001 - Politica Canonica

## Objetivo

Crear una regla oficial para decidir que informacion puede verse sin login y que informacion queda protegida.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| AUTH-001-01 | Crear documento canonico | HECHO | Existe `docs/auth-visibility-policy.md`. |
| AUTH-001-02 | Definir capas | HECHO | Publica, preview bloqueado, privada y admin. |
| AUTH-001-03 | Definir matriz por seccion | HECHO | Crypto facil, Bolsillito, Mercados, Rendimiento y Ganar incluidos. |
| AUTH-001-04 | Definir regla backend | HECHO | Se documentan contratos privados/publicos y validacion server-side. |

---

# AUTH-002 - Crypto Facil

## Objetivo

Separar informacion educativa/publica de operaciones privadas en compra, venta, conversion, envio y spot lite.

## Rutas

- `/easy-crypto/buy`
- `/easy-crypto/sell`
- `/easy-crypto/convert`
- `/easy-crypto/send`
- `/easy-crypto/spot-lite`

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| AUTH-002-01 | Auditar compra cripto | POR HACER | Orden, quote personalizada y metodo real requieren login. |
| AUTH-002-02 | Auditar venta cripto | POR HACER | Balance, destino fiat e historial requieren login. |
| AUTH-002-03 | Auditar convertidor | POR HACER | Conversion real requiere login; simulacion publica queda generica. |
| AUTH-002-04 | Auditar envio cripto | POR HACER | Direcciones, contactos y firma requieren login. |
| AUTH-002-05 | Auditar Spot Lite | POR HACER | Mercado publico visible; balance y orden requieren login. |

---

# AUTH-003 - Bolsillito

## Objetivo

Permitir que el usuario entienda metodos y paises sin login, pero proteger referencias, saldos, limites y movimientos.

## Rutas

- `/bolsillito/add-money`
- `/bolsillito/send-money`
- `/bolsillito/remittances`
- `/bolsillito/withdraw-credit`

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| AUTH-003-01 | Auditar recarga | POR HACER | Referencia unica, cuenta destino y limites personales requieren login. |
| AUTH-003-02 | Auditar envio saldo | POR HACER | Destinatario, saldo y firma requieren login. |
| AUTH-003-03 | Auditar remesas | POR HACER | Beneficiario, limite, orden y tracking requieren login/KYC. |
| AUTH-003-04 | Auditar retiro | POR HACER | Cuenta destino, retiro y comprobante requieren login/KYC. |

---

# AUTH-004 - Mercados

## Objetivo

Mantener datos de mercado publicos, pero proteger balances, ordenes, API keys, historial y acciones privadas.

## Rutas

- `/markets/spot`
- `/markets/futures`
- `/markets/p2p`
- `/markets/market-maker`
- `/markets/advanced-orders`
- `/markets/market-analysis`
- `/markets/order-history`
- `/markets/price-alerts`
- `/markets/data-api`

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| AUTH-004-01 | Auditar Spot/Futuros | POR HACER | Graficas publicas; balances, margen y ordenes requieren login. |
| AUTH-004-02 | Auditar P2P | POR HACER | Ofertas publicas; orden, chat y liberacion requieren login/KYC. |
| AUTH-004-03 | Auditar Market Maker | POR HACER | Perfil, ofertas propias y acuerdos requieren login/KYC. |
| AUTH-004-04 | Auditar Trading Pro | POR HACER | Crear orden avanzada requiere login. |
| AUTH-004-05 | Auditar herramientas | POR HACER | Watchlist, alertas, historial y API keys requieren login. |

---

# AUTH-005 - Rendimiento

## Objetivo

Separar informacion publica de productos y riesgos de datos personales como saldos, posiciones, actividad y Merkle.

## Rutas

- `/rendimiento`
- `/rendimiento/staking-tokens`
- `/rendimiento/boveda-programada`
- `/rendimiento/reservas`
- `/rendimiento/calculator`
- `/rendimiento/activity`

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| AUTH-005-01 | Auditar reservas | EN REVISION | "Asi esta tu dinero" y Merkle se ocultan sin login. |
| AUTH-005-02 | Auditar staking | POR HACER | Saldo elegible y activar posicion requieren login. |
| AUTH-005-03 | Auditar boveda | POR HACER | Posicion, bloqueo y vencimiento propios requieren login. |
| AUTH-005-04 | Auditar calculadora | POR HACER | Simulacion publica generica; guardar/activar requiere login. |
| AUTH-005-05 | Auditar actividad | POR HACER | Movimientos y posiciones requieren login. |

---

# AUTH-006 - Ganar

## Objetivo

Permitir que Ganar venda los programas publicamente, pero proteger recompensas, codigos, puntos, progreso, campanas y reclamos del usuario.

## Rutas

- `/earn`
- `/earn/referrals`
- `/earn/deco-points`
- `/earn/cashback`
- `/earn/learn-and-earn`
- `/earn/missions`
- `/earn/sponsor-ads`
- `/earn/launchpad`
- `/earn/top-earners`

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| AUTH-006-01 | Auditar overview Ganar | POR HACER | Estado de usuario y recompensas requieren login. |
| AUTH-006-02 | Auditar referidos | POR HACER | Codigo, invitados y comisiones requieren login. |
| AUTH-006-03 | Auditar Puntos Deco | POR HACER | Balance, historial y canje requieren login. |
| AUTH-006-04 | Auditar Cashback | POR HACER | Movimientos, cobro y categorias activadas requieren login. |
| AUTH-006-05 | Auditar Aprende y Gana | POR HACER | Progreso, quiz y recompensa requieren login. |
| AUTH-006-06 | Auditar Misiones | POR HACER | Progreso, racha y reclamar requieren login. |
| AUTH-006-07 | Auditar Sponsor Ads | POR HACER | Tomar campana y enviar evidencia requieren login. |
| AUTH-006-08 | Auditar Launchpad | POR HACER | Whitelist, cupo y participacion requieren login/KYC. |
| AUTH-006-09 | Auditar Ranking | POR HACER | Alias propio y reclamo requieren login; ranking publico debe ser opt-in. |

---

# AUTH-007 - Componentes Compartidos

## Objetivo

Crear patrones reutilizables para no repetir gating a mano en cada pantalla.

## Componentes Propuestos

| Componente | Uso |
|---|---|
| `AuthRequiredPanel` | Bloque privado con CTA de login. |
| `PrivateDataGate` | Renderiza children solo con usuario autenticado. |
| `KycRequiredPanel` | Estado posterior al login cuando falta verificacion. |
| `PublicPrivateSplit` | Layout con contenido publico y panel privado. |
| `SensitiveActionButton` | Boton que abre login si no hay usuario. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| AUTH-007-01 | Revisar patrones actuales | POR HACER | Identificar login modals y gates existentes. |
| AUTH-007-02 | Definir API de componentes | POR HACER | Props simples y reutilizables. |
| AUTH-007-03 | Implementar componentes | POR HACER | Funciona con `useAuth` y modales actuales. |
| AUTH-007-04 | Migrar una ruta piloto | POR HACER | Reservas o Referidos usa el patron. |

---

# AUTH-008 - Backend/BFF Contratos

## Objetivo

Separar endpoints publicos y privados para que el frontend no tenga que adivinar que datos son sensibles.

## Contratos Esperados

| Tipo | Regla |
|---|---|
| Publico | No requiere usuario, no devuelve datos personales. |
| Privado | Requiere sesion, filtra por userId server-side. |
| KYC | Requiere sesion y verificacion. |
| Admin | Requiere rol interno. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| AUTH-008-01 | Inventario de endpoints publicos | POR HACER | Lista inicial por modulo. |
| AUTH-008-02 | Inventario de endpoints privados | POR HACER | Lista inicial por modulo. |
| AUTH-008-03 | Definir errores estandar | POR HACER | 401, 403, KYC_REQUIRED, REGION_BLOCKED. |
| AUTH-008-04 | Definir auditoria | POR HACER | Acciones sensibles generan evento. |

---

# AUTH-009 - QA Visual Y Legal

## Objetivo

Verificar que el gating sea claro, bonito, legalmente prudente y no rompa la experiencia dashboard landing.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| AUTH-009-01 | QA sin login | POR HACER | Cada ruta muestra solo datos publicos o preview bloqueado. |
| AUTH-009-02 | QA con login | POR HACER | Cada ruta muestra datos privados esperados. |
| AUTH-009-03 | QA mobile | POR HACER | Bloques privados no rompen layout. |
| AUTH-009-04 | QA legal/copy | POR HACER | No hay promesas ni filtracion de datos. |
| AUTH-009-05 | QA estados de error | POR HACER | 401/403/KYC_REQUIRED tienen UI clara. |

---

# AUTH-010 - Legales Y Help Center

## Objetivo

Mapear las paginas legales y el Help Center sin tocar codigo, definiendo que informacion debe permanecer publica y que interacciones requieren login.

## Regla Principal

Legales y Help Center deben ser publicos como material educativo, regulatorio y de soporte general. Cualquier dato de usuario, ticket, evidencia, conversacion, estado de caso, KYC, orden, wallet o comprobante debe quedar detras de login.

## Grupos Legales

| Grupo | Rutas | Estado | Regla |
|---|---|---|---|
| Centro legal | `/legals`, `/legals/terms`, `/legals/privacy`, `/legals/cookies` | EN REVISION | Publico; aceptaciones firmadas son privadas. |
| Identidad y cumplimiento | `/legals/kyc-aml`, `/legals/prevention`, `/legals/licencias` | EN REVISION | Publico; estado KYC y limites personales son privados. |
| Riesgo y criptoactivos | `/legals/risks`, `/legals/criptoactivos`, `/legals/deco-token`, `/legals/deco-custody` | EN REVISION | Publico; exposicion personal y aceptaciones de riesgo son privadas. |
| Reservas y transparencia | `/legals/reservas`, `/legals/transparencia`, `/legals/auditorias`, `/legals/seguros`, `/legals/reports` | EN REVISION | Publico; Merkle personal y comprobantes son privados. |
| Monedas y tasas | `/legals/monedas`, `/legals/tasas`, `/legals/comisiones`, `/legals/calculadora` | EN REVISION | Publico; tarifas/limites personales son privados. |
| Bolsillito/metodos | `/legals/efectivo`, `/legals/electronicos`, `/legals/tarjetas`, `/legals/cajeros`, `/legals/giros-puntos` | EN REVISION | Publico; referencias, cuentas destino y puntos propios son privados. |
| Comunidad y recompensas | `/legals/referidos`, `/legals/lee-y-gana`, `/legals/play-to-earn`, `/legals/sponsor-ads`, `/legals/score-traders`, `/legals/community`, `/legals/comunidad` | EN REVISION | Publico; codigo, progreso, recompensas y reclamos son privados. |
| Developer/B2B | `/legals/api-developer`, `/legals/widgets`, `/legals/white-label`, `/legals/cuenta-adt`, `/legals/cuenta-trader` | EN REVISION | Publico; API keys, contratos y configuraciones son privados. |
| Contacto y soporte | `/legals/contacto`, `/legals/help-center`, `/legals/knowledge-base`, `/legals/bug-bounty` | EN REVISION | Publico; tickets, evidencias, casos y reportes privados requieren login. |

## Help Center

| Seccion | Estado | Publico | Privado |
|---|---|---|---|
| Hero y selector de equipo | EN REVISION | Equipos, canales y orientacion general. | Equipo recomendado por usuario/pais/producto. |
| Acceso rapido | EN REVISION | FAQ, tutoriales, problemas, base de conocimiento. | Atajos a casos, ordenes o movimientos propios. |
| Canales de soporte | EN REVISION | Email, telefono, chat informativo y guias. | Chat autenticado y trazabilidad. |
| Sistema de tickets | EN REVISION | Explicar como funciona. | Crear ticket, ver estado, responder, adjuntar evidencia. |
| FAQ | EN REVISION | Preguntas generales. | Preguntas contextuales por cuenta/producto. |
| Tutoriales | EN REVISION | Guias publicas. | Tutoriales personalizados por perfil/KYC. |
| Solucion de problemas | EN REVISION | Diagnostico general. | Diagnostico con datos de orden, wallet, pago o remesa. |
| Bug bounty | EN REVISION | Reglas publicas. | Reportes, severidad, estado y recompensa. |

## Inventario Observado

| Area | Hallazgo | Decision |
|---|---|---|
| Landing legal | Las secciones actuales se agrupan en Legales, Operacion, Integraciones, Programas y Control legal. | Mantenerlas publicas como documentacion; solo acciones trazables requieren login. |
| Help Center | Existen CTAs de chat, ticket, FAQ, tutoriales y troubleshooting. | FAQ/tutoriales publicos; chat, ticket y seguimiento requieren login. |
| Knowledge Base | Hay enlaces a `/legals/knowledge-base/...` y tambien a `/knowledge-base/...`. | Definir ruta canonica antes de implementar gating. |
| FAQ comisiones | Hay referencia a `/legals/fees`. | Revisar si debe apuntar a `/legals/comisiones`. |
| CTAs mock | Chat, ticket y algunas redes usan `href="#"`. | Clasificar cada CTA como publico informativo o privado autenticado. |
| Footer principal | La lista de Compania, Para ti, Empresas, Soporte, Mercados, Herramientas, Tasas y Educacion esta conectada, pero mezcla rutas reales, anchors y destinos legales. | Auditar destino ideal por producto antes de cambiar navegacion. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| AUTH-010-01 | Mapear rutas legales | HECHO | `docs/auth-visibility-policy.md` incluye matriz legal. |
| AUTH-010-02 | Mapear Help Center | HECHO | Politica incluye secciones publicas/privadas de soporte. |
| AUTH-010-03 | Definir datos sensibles de soporte | HECHO | Tickets, evidencias, conversaciones y KYC quedan privados. |
| AUTH-010-04 | Revisar links inconsistentes | EN REVISION | Links como `/knowledge-base/*`, `/legals/knowledge-base/*` y `/legals/fees` se alinean a rutas canonicas. |
| AUTH-010-05 | Disenar gating de tickets | POR HACER | Crear ticket y ver estado deben pedir login. |
| AUTH-010-06 | Disenar soporte contextual | POR HACER | Help Center muestra ayuda personalizada solo autenticado. |
| AUTH-010-07 | Clasificar CTAs mock | POR HACER | `href="#"` queda reemplazado por accion publica o privada segun sensibilidad. |
| AUTH-010-08 | Definir Knowledge Base canonica | POR HACER | Una sola familia de rutas queda definida antes de tocar codigo. |
| AUTH-010-09 | Mapear footer principal | HECHO | `docs/auth-visibility-policy.md` incluye conexion actual y destino ideal futuro. |
| AUTH-010-10 | Decidir destinos comerciales vs legales | POR HACER | Items como Staking, Referidos, Launchpad, Wallet e Intercambio Fiat apuntan a producto cuando aplique y dejan legal como reglas. |

---

## Orden Recomendado

1. AUTH-007 Componentes compartidos de gating.
2. AUTH-005 Rendimiento, porque Reservas ya tiene primer gating.
3. AUTH-006 Ganar, por recompensas y datos personales.
4. AUTH-003 Bolsillito, por saldos/referencias.
5. AUTH-002 Crypto facil, por ordenes y balances.
6. AUTH-004 Mercados, por ordenes/API/historial.
7. AUTH-010 Legales y Help Center.
8. AUTH-008 Contratos backend/BFF.
9. AUTH-009 QA visual y legal.
