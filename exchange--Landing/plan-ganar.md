# Plan Ganar - Deco Exchange

Documento de control tipo Jira para construir la seccion Ganar paso a paso.

Regla principal: Ganar es el Nivel 5 de la plataforma. No es Rendimiento, no es mercado spot y no es un dashboard administrativo. Ganar agrupa programas donde el usuario recibe valor por aportar crecimiento, comunidad, educacion, promocion, compras, retos o participacion temprana.

Definicion oficial: cada modulo de Ganar debe ser un dashboard landing operativo, igual que P2P, Market Maker, Bolsillito y Rendimiento. La pantalla debe explicar el producto, vender bien el beneficio, mostrar el estado del usuario, permitir una accion real y dejar claro que luego se conectara al backend/BFF/gateway de usuario.

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
- Todo debe quedar componetizado.
- Gestor de paquetes oficial: `pnpm`. No usar `npm`.
- No subir cambios sin aprobacion.
- Una URL debe renderizar una sola experiencia completa. No usar tabs corridas para mezclar productos.
- Cada item del dropdown Ganar debe abrir su propia ruta y sentirse como un producto independiente.
- Ganar debe ser mas comercial, aspiracional y motivador que Rendimiento, sin perder reglas ni transparencia.
- Mantener estilo aprobado del home, Bolsillito, Mercados, Market Maker y Rendimiento.
- Usar cards rectangulares compactas, buscadores correctos y acento naranja discreto.
- No usar bordes naranja pesados como decoracion principal.
- No prometer ganancias garantizadas, fijas o libres de riesgo.
- Las recompensas deben explicar reglas, elegibilidad, estado, fecha, moneda y fuente.
- Estos modulos son mockups UX conectables: luego se integran al backend/BFF/gateway sin rehacer interfaz.

## Que Es Ganar

Ganar debe sentirse como el area de crecimiento e impacto del usuario dentro de Deco Exchange. La intencion no es solo informar: es fomentar accion, invitar al usuario a participar y mostrarle de forma clara que puede crear valor dentro del ecosistema.

| Producto | Intencion |
|---|---|
| Referidos | Invitar usuarios, medir activacion y cobrar comisiones elegibles. |
| Puntos Deco | Sistema base de fidelizacion para acumular y canjear puntos del ecosistema. |
| Cashback | Devoluciones por compras, pagos o actividad elegible. |
| Aprende y Gana | Recompensar aprendizaje, lecturas, cursos, quizzes y rutas educativas. |
| Misiones | Retos diarios/semanales, juego online, tareas de producto y actividades gamificadas. |
| Sponsor Ads | Usuarios/embajadores promocionan Deco en redes o comunidades y ganan tokens por campanas aprobadas. |
| Launchpad | Participar en proyectos nuevos con reglas, cupos, riesgo y vesting visible. |
| Ranking de Ganadores | Mostrar usuarios destacados, premios en token y posicion del usuario con privacidad. |

## Separacion Con Otras Secciones

| Seccion | No mezclar |
|---|---|
| Crypto facil | Compra, venta, conversion, envio y spot lite para usuarios nuevos. |
| Bolsillito | Saldo fiat, recarga, envio, remesas y retiro. |
| Mercados | P2P, Market Maker, Spot, Futuros, API, analisis y ordenes. |
| Rendimiento | Staking, boveda, reservas, calculadora y actividad de rendimiento estimado. |
| Ganar | Referidos, puntos, cashback, aprendizaje, misiones, sponsor ads, launchpad y ranking. |

## Referencias Legales Internas

| Fuente | Uso En Ganar |
|---|---|
| `/legals/referidos` | Reglas del programa de referidos, comisiones y condiciones. |
| `/legals/giros-puntos` | Puntos Deco, acumulacion, canje, beneficios y descuentos. |
| `/legals/community` | Comunidad, participacion y reglas de conducta. |
| `/legals/comunidad` | Contexto local de comunidad. |
| `/legals/play-to-earn` | Referencia historica de programas de recompensa. |
| `/legals/lee-y-gana` | Aprendizaje recompensado, contenidos, quizzes y recompensas. |
| `/legals/sponsor-ads` | Promocion, contenido patrocinado, segmentacion y reglas publicitarias. |
| `/legals/comisiones` | Comisiones pagadas, acumuladas o pendientes. |
| `/legals/tasas` | Conversion de recompensas cuando aplique. |
| `/legals/monedas` | Monedas disponibles para cobrar o mostrar recompensa. |
| `/legals/kyc-aml` | Elegibilidad, verificacion y prevencion de abuso. |
| `/legals/risks` | Riesgos de launchpad, mercado y participacion temprana. |
| `/legals/deco-token` | Tokens internos o proyectos propios si aplican. |
| `/legals/licencias` | Disponibilidad por jurisdiccion. |
| `/legals/transparencia` | Reportes, reglas y trazabilidad. |

## Patron Aprobado

Las referencias internas aprobadas para la forma del producto son:

1. `/bolsillito/add-money`
   Flujo operativo con hero, pasos, selector, resumen lateral y modal.

2. `/markets/p2p`
   Dashboard landing operativo para intercambio entre personas.

3. `/markets/market-maker`
   Dashboard landing operativo para liquidez OTC, acuerdos, chat y oferta.

4. `/rendimiento/staking-tokens`
   Producto financiero explicado con riesgo, reservas, resumen y accion.

Ganar debe seguir esa misma logica:

| Bloque | Regla |
|---|---|
| Header de producto | Explica que gana el usuario y por que. |
| Oferta comercial | Debe vender el beneficio de forma clara, breve y deseable. |
| Estado del usuario | Nivel, elegibilidad, saldo pendiente y actividad reciente. |
| Accion principal | Invitar, activar cashback, aprender, completar misiones, promocionar, participar o ver ranking. |
| Resumen lateral | Recompensa, estado, reglas, proxima fecha y moneda. |
| Modales | Confirmar accion, ver condiciones, compartir enlace o solicitar cobro. |
| Copy | Comercial, claro, breve y sin promesa garantizada. |
| Componentizacion | Componentes compartidos para heroes, metricas, programas, ranking y modales. |

## Roadmap General

| ID | Epica | Estado | Prioridad | Ruta |
|---|---|---|---|---|
| GAN-001 | Arquitectura de menu Ganar | EN REVISION | Alta | Navbar |
| GAN-002 | Componentes compartidos Ganar | EN REVISION | Alta | `components/earn` |
| GAN-003 | Dashboard Ganar | EN REVISION | Media | `/earn` |
| GAN-004 | Referidos | EN REVISION | Alta | `/earn/referrals` |
| GAN-005 | Launchpad | EN REVISION | Alta | `/earn/launchpad` |
| GAN-006 | Cashback | EN REVISION | Alta | `/earn/cashback` |
| GAN-007 | Retirar Market Maker de Ganar | EN REVISION | Media | Navbar / `/earn` |
| GAN-008 | Ranking de Ganadores | EN REVISION | Media | `/earn/top-earners` |
| GAN-009 | Puntos Deco | EN REVISION | Alta | `/earn/deco-points` |
| GAN-010 | Aprende y Gana | EN REVISION | Alta | `/earn/learn-and-earn` |
| GAN-011 | Misiones | EN REVISION | Alta | `/earn/missions` |
| GAN-012 | Sponsor Ads | EN REVISION | Alta | `/earn/sponsor-ads` |
| GAN-013 | Modales y acciones | EN REVISION | Alta | Compartido |
| GAN-014 | Contratos backend futuros | POR HACER | Alta | Mock/API |
| GAN-015 | Copy legal y riesgo | POR HACER | Alta | Compartido |
| GAN-016 | QA visual, responsive y docs | EN REVISION | Alta | Global |

---

# GAN-001 - Arquitectura De Menu Ganar

## Objetivo

Revisar el dropdown Ganar para que los productos sean claros, accionables y coherentes con Nivel 5 - Embajador.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-001-01 | Revisar nombres visibles | EN REVISION | Los nombres son comerciales y no confunden con Rendimiento. |
| GAN-001-02 | Revisar descripciones cortas | EN REVISION | Cada descripcion comunica beneficio en pocas palabras. |
| GAN-001-03 | Validar rutas canonicas | EN REVISION | Cada item abre una URL real o enlace canonico existente. |
| GAN-001-04 | Mantener Market Maker solo en Mercados | EN REVISION | No se duplica el producto OTC en Ganar. |

## Menu Actual A Evaluar

1. Referidos
2. Puntos Deco
3. Cashback
4. Aprende y Gana
5. Misiones
6. Sponsor Ads
7. Launchpad
8. Ranking de Ganadores

---

# GAN-002 - Componentes Compartidos Ganar

## Objetivo

Crear base componetizada para que todas las rutas de Ganar mantengan el mismo lenguaje visual.

## Componentes Propuestos

| Componente | Uso |
|---|---|
| `EarnHero` | Hero de cada producto. |
| `EarnHeroStat` | Cifra o estado dentro del hero. |
| `EarnProgramCard` | Card compacta de programa o recompensa. |
| `EarnMetricCard` | Metrica de comisiones, cupos, cashback o posicion. |
| `EarnSummary` | Resumen lateral de estado y accion. |
| `EarnTimeline` | Historial de eventos, cobros o hitos. |
| `EarnTermsPanel` | Condiciones visibles antes de activar. |
| `EarnConfirmModal` | Confirmacion de acciones. |
| `EarnShareBox` | Copiar enlace, codigo o invitacion. |
| `EarnRankingRow` | Fila de ranking mensual. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-002-01 | Crear carpeta `components/earn` | HECHO | Carpeta lista para componentes compartidos. |
| GAN-002-02 | Crear componentes base | EN REVISION | Heroes, metricas, summary y cards reutilizables. |
| GAN-002-03 | Evitar duplicacion visual | EN REVISION | Las rutas usan componentes compartidos. |
| GAN-002-04 | Preparar props para backend | EN REVISION | Datos mockeados reemplazables por API. |

---

# GAN-003 - Dashboard Ganar

## Objetivo

Crear una vista general de Ganar que funcione como mapa operativo del impacto del usuario, sin reemplazar las rutas individuales de cada programa.

## Ruta

`/earn`

## Experiencia

- Hero: "Ganar con Deco".
- Mensaje: el usuario puede crecer invitando, comprando, aprendiendo, completando misiones, promocionando Deco y participando en proyectos.
- Resumen: puntos, recompensas pendientes, nivel, programas activos y proxima liquidacion.
- Cards: Referidos, Puntos Deco, Cashback, Aprende y Gana, Misiones, Sponsor Ads, Launchpad y Ranking.
- Accion: entrar al programa mas relevante segun elegibilidad.
- No usar tabs para mostrar programas dentro de `/earn`.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-003-01 | Crear ruta `/earn` | EN REVISION | La ruta responde con dashboard landing. |
| GAN-003-02 | Mostrar programas disponibles | EN REVISION | Las cards enlazan a cada experiencia. |
| GAN-003-03 | Mostrar estado del usuario | EN REVISION | Nivel, recompensas y elegibilidad visibles. |
| GAN-003-04 | Agregar estados mock | EN REVISION | Vista funciona sin backend. |
| GAN-003-05 | Evitar tabs internas de producto | HECHO | `/earn` solo resume y dirige a rutas independientes. |

---

# GAN-004 - Referidos

## Objetivo

Convertir el programa de referidos en una experiencia publica-operativa, no solo una pestaña vieja de dashboard.

## Ruta

`/earn/referrals`

## Experiencia

- Hero: "Invita y gana".
- Oferta comercial: convierte tu comunidad en comisiones elegibles.
- Estado: codigo, enlace, usuarios invitados, activos, pendiente y pagado.
- Flujo: copiar enlace, compartir invitacion, ver reglas, solicitar cobro.
- Resumen lateral: comision estimada, proxima liquidacion, condiciones y nivel.
- Tabla compacta: invitados, estado KYC, primera operacion y recompensa.
- Esta ruta no debe compartir tabs con Launchpad, Cashback o Ranking.

## Modales

| Modal | Uso |
|---|---|
| Compartir invitacion | Copiar enlace, codigo y mensaje corto. |
| Reglas de comision | Mostrar condiciones de pago. |
| Solicitar cobro | Confirmar moneda y saldo elegible. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-004-01 | Migrar concepto de `tab-referidos` | EN REVISION | Se rescata logica util sin traer estilo viejo. |
| GAN-004-02 | Crear vista componetizada | EN REVISION | Hero, resumen, share box, tabla y modales separados. |
| GAN-004-03 | Definir datos mock | EN REVISION | Invitados y comisiones se muestran sin backend. |
| GAN-004-04 | Validar copy legal | EN REVISION | No promete pago sin condiciones. |

---

# GAN-005 - Launchpad

## Objetivo

Crear una experiencia para participar en nuevos proyectos con cupo, riesgo, reglas y vesting visibles.

## Ruta

`/earn/launchpad`

## Experiencia

- Hero: "Launchpad Deco".
- Oferta comercial: entra temprano a proyectos seleccionados con reglas claras.
- Estado: proyectos abiertos, cupo disponible, participacion pendiente y tokens bloqueados.
- Cards de proyecto: nombre, red, etapa, cupo, fecha, riesgo, vesting y moneda aceptada.
- Flujo: seleccionar proyecto, revisar condiciones, simular participacion y confirmar interes.
- Resumen lateral: cupo usuario, monto, token esperado, vesting y estado KYC.
- Esta ruta no debe compartir tabs con Referidos, Cashback o Ranking.

## Cuidado Legal

Launchpad debe evitar sonar como inversion garantizada. Usar lenguaje de participacion temprana, riesgo, disponibilidad y elegibilidad.

## Modales

| Modal | Uso |
|---|---|
| Detalle de proyecto | Riesgo, red, token, cupo, fechas y condiciones. |
| Simular participacion | Monto, moneda, asignacion estimada y vesting. |
| Confirmar interes | Aceptar condiciones antes de enviar. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-005-01 | Crear ruta Launchpad | EN REVISION | La ruta responde con dashboard landing. |
| GAN-005-02 | Disenar cards de proyectos | EN REVISION | Proyectos se leen facil y sin ruido visual. |
| GAN-005-03 | Crear flujo de participacion | EN REVISION | Usuario puede simular y confirmar interes. |
| GAN-005-04 | Mostrar riesgo y vesting | EN REVISION | Condiciones visibles antes de accion. |

---

# GAN-006 - Cashback

## Objetivo

Crear una experiencia para ver devoluciones por compras, pagos o actividad elegible.

## Ruta

`/earn/cashback`

## Experiencia

- Hero: "Cashback Deco".
- Oferta comercial: recupera parte de tus compras y actividad elegible.
- Estado: cashback acumulado, pendiente, pagado y categorias activas.
- Cards de categorias: compras, tarjeta, pagos, comercios aliados, promociones.
- Flujo: activar promocion, ver reglas, revisar historial y solicitar cobro.
- Resumen lateral: porcentaje estimado, moneda, fecha de corte y reglas.
- Esta ruta no debe compartir tabs con Referidos, Launchpad o Ranking.

## Modales

| Modal | Uso |
|---|---|
| Activar cashback | Confirmar categoria o promocion. |
| Ver detalle | Reglas, fecha, moneda y limite. |
| Solicitar cobro | Confirmar saldo elegible. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-006-01 | Crear ruta Cashback | EN REVISION | La ruta responde con dashboard landing. |
| GAN-006-02 | Crear cards de categorias | EN REVISION | Categorias compactas y accionables. |
| GAN-006-03 | Crear historial de devoluciones | EN REVISION | Movimientos mock visibles. |
| GAN-006-04 | Definir estados de cobro | EN REVISION | Pendiente, aprobado, pagado y rechazado. |

---

# GAN-007 - Retirar Market Maker De Ganar

## Objetivo

Mantener Market Maker como producto canonico en Mercados y retirarlo del dropdown Ganar para evitar duplicidad de producto.

## Ruta Canonica

`/markets/market-maker`

## Regla De Navegacion

- En el dropdown Ganar no debe aparecer Market Maker.
- En `/earn`, Market Maker no debe aparecer como programa principal de Ganar.
- Market Maker se mantiene en el dropdown Mercados y en su ruta canonica `/markets/market-maker`.
- Si Ranking muestra actividad de liquidez, debe ser contexto de puntos, no una segunda entrada navegable a Market Maker.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-007-01 | Quitar Market Maker del dropdown Ganar | EN REVISION | Market Maker solo queda visible en Mercados. |
| GAN-007-02 | Quitar card Market Maker de `/earn` | EN REVISION | `/earn` solo muestra programas propios de Ganar. |
| GAN-007-03 | Revisar copy cruzado | EN REVISION | Ganar no duplica producto OTC. |

---

# GAN-008 - Ranking De Ganadores

## Objetivo

Crear ranking mensual con privacidad, premios, posicion del usuario y reglas antiabuso.

## Ruta

`/earn/top-earners`

## Experiencia

- Hero: "Ranking de Ganadores".
- Oferta comercial: compite por visibilidad, premios y reconocimiento mensual.
- Estado: posicion del usuario, puntos del mes, recompensa estimada y corte.
- Tabla: top usuarios, programa principal, recompensa y badge.
- Filtros: mensual, historico, referidos, cashback, liquidez.
- Privacidad: alias publico, ocultar identidad y opt-in.
- Esta ruta no debe compartir tabs con Referidos, Launchpad o Cashback.

## Modales

| Modal | Uso |
|---|---|
| Configurar alias | Definir nombre publico del ranking. |
| Ver reglas | Condiciones de participacion y antiabuso. |
| Reclamar premio | Confirmar premio elegible. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-008-01 | Crear ruta Ranking | EN REVISION | La ruta responde con dashboard landing. |
| GAN-008-02 | Crear leaderboard compacto | EN REVISION | Ranking legible en desktop y mobile. |
| GAN-008-03 | Crear privacidad de alias | EN REVISION | Usuario puede ver como apareceria. |
| GAN-008-04 | Crear reglas antiabuso | EN REVISION | Reglas visibles y no invasivas. |

---

# GAN-009 - Puntos Deco

## Objetivo

Crear el programa base de fidelizacion de Ganar. Puntos Deco debe explicar como el usuario acumula puntos por actividad elegible y como puede canjearlos por beneficios, descuentos, tokens o acceso.

## Ruta

`/earn/deco-points`

## Experiencia

- Hero: "Tus puntos mueven el ecosistema".
- Estado: puntos disponibles, puntos pendientes, nivel, vencimiento y canjes.
- Fuentes: referidos, cashback, misiones, aprende y gana, actividad elegible.
- Canjes: descuentos, tokens DECO, token Launchpad, beneficios, boosts o acceso.
- Resumen lateral: saldo de puntos, equivalencia, proximo vencimiento y reglas.
- Esta ruta no debe reemplazar Cashback ni Ranking; es el sistema base de puntos.

## Modales

| Modal | Uso |
|---|---|
| Canjear puntos | Confirmar beneficio, costo y destino. |
| Ver regla | Explicar acumulacion, vencimiento y limites. |
| Historial | Mostrar fuentes y movimientos de puntos. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-009-01 | Crear ruta Puntos Deco | EN REVISION | La ruta responde con dashboard landing. |
| GAN-009-02 | Crear balance de puntos | EN REVISION | Disponible, pendiente, vencimiento y nivel visibles. |
| GAN-009-03 | Crear catalogo de canjes | EN REVISION | Beneficios compactos y accionables. |
| GAN-009-04 | Crear historial de puntos | EN REVISION | Movimientos mock visibles. |

---

# GAN-010 - Aprende Y Gana

## Objetivo

Crear una experiencia educativa recompensada donde el usuario aprende sobre crypto, seguridad, trading, riesgos y uso de Deco, y gana puntos o tokens por completar contenido validado.

## Ruta

`/earn/learn-and-earn`

## Experiencia

- Hero: "Aprende y gana".
- Rutas educativas: Cripto basico, Seguridad, Trading responsable, Deco Wallet, Riesgos.
- Estado: progreso, puntos ganados, certificados, racha y contenido pendiente.
- Flujo: abrir leccion, completar quiz, reclamar recompensa.
- Resumen lateral: progreso semanal, recompensa disponible y proxima leccion.
- Esta ruta se apoya en `/legals/lee-y-gana`.

## Modales

| Modal | Uso |
|---|---|
| Iniciar leccion | Mostrar objetivos y recompensa. |
| Quiz completado | Resultado, puntos y siguiente paso. |
| Reglas educativas | Explicar antiabuso y evaluacion honesta. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-010-01 | Crear ruta Aprende y Gana | EN REVISION | La ruta responde con dashboard landing. |
| GAN-010-02 | Crear cards de rutas educativas | EN REVISION | Contenido claro y motivador. |
| GAN-010-03 | Crear flujo de quiz mock | EN REVISION | Usuario puede completar y reclamar. |
| GAN-010-04 | Mostrar progreso y racha | EN REVISION | Progreso visible sin backend. |

---

# GAN-011 - Misiones

## Objetivo

Crear un centro de retos diarios/semanales que conecte actividades del producto, juego online, aprendizaje, referidos y promociones. Misiones debe ser el motor gamificado de Ganar.

## Ruta

`/earn/missions`

## Experiencia

- Hero: "Completa misiones".
- Misiones: primera compra, completar KYC, activar cashback, leer una leccion, invitar usuarios, jugar reto online, compartir campana.
- Estados: disponible, en progreso, completada, reclamada, vencida.
- Resumen lateral: racha, bonus semanal, puntos disponibles y token destacado.
- Juego online: puede aparecer como mision destacada o reto semanal, apoyado en Play to Earn.

## Modales

| Modal | Uso |
|---|---|
| Ver mision | Requisitos, tiempo y recompensa. |
| Reclamar recompensa | Confirmar puntos/token y destino. |
| Reto online | Abrir instrucciones del juego o simulador. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-011-01 | Crear ruta Misiones | EN REVISION | La ruta responde con dashboard landing. |
| GAN-011-02 | Crear cards de misiones | EN REVISION | Estados claros y compactos. |
| GAN-011-03 | Crear mision de juego online | EN REVISION | Reto destacado con recompensa visible. |
| GAN-011-04 | Crear flujo reclamar | EN REVISION | Modal de recompensa listo. |

---

# GAN-012 - Sponsor Ads

## Objetivo

Convertir Sponsor Ads en un programa para usuarios/embajadores que promocionan Deco en redes, comunidades o contenido aprobado y ganan tokens por campanas validas.

## Ruta

`/earn/sponsor-ads`

## Experiencia

- Hero: "Promociona y gana".
- Campanas: TikTok, Instagram, YouTube, X, comunidades, tutoriales, lives, banners.
- Metricas: impresiones validas, clics, registros, contenido aprobado, recompensa.
- Recompensas: DECO, USDT, token Launchpad, puntos o boosts segun campana.
- Reglas: no spam, no promesas falsas, disclosure publicitario, revision de contenido, antiabuso.
- Esta ruta se apoya en `/legals/sponsor-ads`, pero enfocada a usuario creador/embajador.

## Modales

| Modal | Uso |
|---|---|
| Tomar campana | Confirmar requisitos, canal y recompensa. |
| Enviar publicacion | Registrar URL, evidencia y canal. |
| Ver reglas | Politica publicitaria y antiabuso. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-012-01 | Crear ruta Sponsor Ads | EN REVISION | La ruta responde con dashboard landing. |
| GAN-012-02 | Crear catalogo de campanas | EN REVISION | Campanas claras, comerciales y accionables. |
| GAN-012-03 | Crear flujo enviar publicacion | EN REVISION | Modal recibe URL/evidencia mock. |
| GAN-012-04 | Mostrar reglas antiabuso | EN REVISION | No spam, no promesas falsas y disclosure visibles. |

---

# GAN-013 - Modales Y Acciones

## Objetivo

Definir los flujos accionables para que Ganar no sea solo informacion.

## Acciones Base

| Accion | Modulo |
|---|---|
| Copiar enlace | Referidos |
| Compartir invitacion | Referidos |
| Solicitar cobro | Referidos / Cashback / Ranking |
| Ver reglas | Todos |
| Activar cashback | Cashback |
| Participar en proyecto | Launchpad |
| Configurar alias | Ranking |
| Canjear puntos | Puntos Deco |
| Iniciar leccion | Aprende y Gana |
| Completar quiz | Aprende y Gana |
| Ver mision | Misiones |
| Reclamar recompensa | Misiones |
| Tomar campana | Sponsor Ads |
| Enviar publicacion | Sponsor Ads |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-013-01 | Crear modal compartido | EN REVISION | Un patron sirve para confirmar acciones. |
| GAN-013-02 | Crear estados de exito/error | POR HACER | Acciones mock responden visualmente. |
| GAN-013-03 | Crear copy de condiciones | EN REVISION | Cada accion explica que pasa despues. |

---

# GAN-014 - Contratos Backend Futuros

## Objetivo

Preparar las interfaces para conectar luego el backend o gateway de usuario sin rehacer la UX.

## Endpoints Futuros A Considerar

| Endpoint | Uso |
|---|---|
| `GET /api/earn/summary` | Resumen global de Ganar. |
| `GET /api/earn/points` | Puntos, canjes, vencimientos e historial. |
| `GET /api/earn/referrals` | Invitados, enlace, estado y comisiones. |
| `POST /api/earn/referrals/share` | Registrar accion de compartir. |
| `POST /api/earn/payouts` | Solicitar cobro de recompensa. |
| `GET /api/earn/launchpad/projects` | Proyectos disponibles. |
| `POST /api/earn/launchpad/intents` | Enviar interes o participacion. |
| `GET /api/earn/cashback` | Cashback acumulado e historial. |
| `POST /api/earn/cashback/activate` | Activar promocion. |
| `GET /api/earn/learn` | Rutas educativas, progreso y quizzes. |
| `POST /api/earn/learn/complete` | Completar leccion o quiz. |
| `GET /api/earn/missions` | Misiones, rachas, juego online y estados. |
| `POST /api/earn/missions/claim` | Reclamar recompensa de mision. |
| `GET /api/earn/sponsor-ads` | Campanas disponibles y metricas. |
| `POST /api/earn/sponsor-ads/submissions` | Enviar publicacion o evidencia. |
| `GET /api/earn/top-earners` | Ranking mensual. |
| `POST /api/earn/top-earners/alias` | Configurar alias publico. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-014-01 | Definir tipos TypeScript | EN REVISION | Modelos listos para reemplazar mocks. |
| GAN-014-02 | Separar datos mock | EN REVISION | Mock data vive fuera de componentes visuales. |
| GAN-014-03 | Preparar estados async | POR HACER | Loading, empty, error y success visibles. |

---

# GAN-015 - Copy Legal Y Riesgo

## Objetivo

Mantener Ganar comercial sin crear promesas indebidas.

## Lenguaje Recomendado

| Evitar | Usar |
|---|---|
| Gana seguro | Recompensa sujeta a reglas. |
| Ganancia fija | Recompensa estimada. |
| Inversion garantizada | Participacion con riesgo visible. |
| Cobro inmediato siempre | Liquidacion segun condiciones. |
| Top garantizado | Ranking mensual sujeto a actividad valida. |

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-015-01 | Revisar copy de Referidos | POR HACER | Condiciones claras y breves. |
| GAN-015-02 | Revisar copy de Launchpad | POR HACER | Riesgo y vesting visibles. |
| GAN-015-03 | Revisar copy de Cashback | POR HACER | Reglas de elegibilidad visibles. |
| GAN-015-04 | Revisar copy de Ranking | POR HACER | Privacidad y antiabuso claros. |
| GAN-015-05 | Revisar copy de Puntos Deco | POR HACER | Canje, vencimiento y reglas visibles. |
| GAN-015-06 | Revisar copy de Aprende y Gana | POR HACER | Educativo sin abuso ni trampas. |
| GAN-015-07 | Revisar copy de Misiones | POR HACER | Recompensas sujetas a actividad valida. |
| GAN-015-08 | Revisar copy de Sponsor Ads | POR HACER | Disclosure, no spam y no promesas falsas. |

---

# GAN-016 - QA Visual, Responsive Y Docs

## Objetivo

Cerrar Ganar con revision visual, build, typecheck, README, CHANGELOG y version cuando aplique.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| GAN-016-01 | Typecheck | EN REVISION | `pnpm exec tsc --noEmit --pretty false` pasa. |
| GAN-016-02 | Build | EN REVISION | `pnpm run build` pasa. |
| GAN-016-03 | QA visual desktop | POR HACER | Rutas principales se ven correctas en desktop. |
| GAN-016-04 | QA visual mobile | POR HACER | Rutas principales se ven correctas en mobile. |
| GAN-016-05 | Actualizar README | HECHO | Documenta Ganar y rutas nuevas. |
| GAN-016-06 | Actualizar CHANGELOG | HECHO | Incluye cambios de Ganar. |
| GAN-016-07 | Actualizar version | HECHO | Version actualizada a 0.14.0. |

---

# Decisiones Pendientes

Estas decisiones se deben confirmar antes o durante la implementacion:

| Decision | Opciones Iniciales |
|---|---|
| Moneda de recompensa | DECO, USDT, token Launchpad, Puntos Deco, saldo Deco o seleccion por campana. |
| Referidos | Por primera operacion, por volumen, por nivel o combinacion. |
| Cashback | Por compras con tarjeta, pagos, comercios aliados o actividad dentro de Deco. |
| Launchpad | Solo interes/whitelist o participacion simulada con cupo. |
| Ranking | Publico con alias, privado por defecto o opt-in obligatorio. |
| Market Maker en Ganar | No aparece como item ni card; vive en Mercados. |
| Sponsor Ads | Usuarios creadores pueden ganar por promocion aprobada, sin spam ni promesas falsas. |
| Misiones | Incluir juego online como reto destacado o mantenerlo como ruta Play to Earn posterior. |

## Orden Recomendado De Implementacion

1. GAN-002 Componentes compartidos.
2. GAN-003 Dashboard Ganar.
3. GAN-004 Referidos.
4. GAN-006 Cashback.
5. GAN-005 Launchpad.
6. GAN-008 Ranking de Ganadores.
7. GAN-007 Retirar Market Maker de Ganar.
8. GAN-009 Puntos Deco.
9. GAN-010 Aprende y Gana.
10. GAN-011 Misiones.
11. GAN-012 Sponsor Ads.
12. GAN-014 Contratos backend futuros.
13. GAN-015 Copy legal.
14. GAN-016 QA, README, CHANGELOG y version.
