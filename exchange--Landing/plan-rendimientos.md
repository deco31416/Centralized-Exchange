# Plan Rendimientos - Deco Exchange

Documento de control tipo Jira para construir la seccion Rendimiento paso a paso.

Regla principal: Rendimiento no se mezcla con Ganar. Rendimiento es para hacer trabajar el saldo o los criptoactivos del usuario con riesgo visible, condiciones claras y calculos estimados. Ganar queda para referidos, cashback, launchpad, ranking y programas de comunidad.

Definicion oficial: Rendimiento no se construye como dashboard administrativo tradicional ni como landing estatica. Cada modulo debe ser un dashboard landing operativo: explica el producto, guia al usuario y muestra una experiencia funcional conectable al backend/gateway de usuario.

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
- No prometer ganancias fijas, garantizadas o libres de riesgo.
- Usar siempre lenguaje de rendimiento estimado, variable y sujeto a disponibilidad.
- Mostrar riesgo, plazo, comisiones, liquidez y condiciones antes de confirmar.
- No mezclar Rendimiento con Ganar; referidos, cashback y launchpad van en otro plan.
- Cada modulo debe sentirse como dashboard landing operativo, igual que P2P y Market Maker.
- La primera pantalla debe explicar el producto y permitir una accion real de usuario.
- Cada URL debe renderizar una sola vista. No usar tabs internas para mezclar modulos de Rendimiento.
- Estos modulos son mockups de UX conectables: luego se integran al backend/BFF/gateway de usuario sin rehacer la interfaz.

## Criterio Legal Y De Producto

Rendimiento debe cuidarse mas que otras secciones porque puede parecer producto financiero de inversion. La interfaz debe evitar frases como:

| No usar | Usar |
|---|---|
| Gana 2% mensual garantizado | Rendimiento estimado mensual |
| Te pagamos fijo | Proyeccion sujeta a condiciones |
| Deposita y gana seguro | Participa bajo riesgo variable |
| Sin riesgo | Riesgo visible antes de confirmar |

## Referencias Legales Internas

| Fuente | Uso En Rendimiento |
|---|---|
| `/legals/risks` | Riesgo de mercado, liquidez, contraparte y operacion. |
| `/legals/comisiones` | Cargos, tasas y criterios de calculo. |
| `/legals/calculadora` | Simulaciones de retorno y escenarios. |
| `/legals/tasas` | Tasas de referencia. |
| `/legals/monedas` | Monedas y activos soportados. |
| `/legals/reservas` | Prueba de reservas y respaldo. |
| `/legals/transparencia` | Custodia, solvencia y reportes. |
| `/legals/auditorias` | Auditorias y controles. |
| `/legals/seguros` | Coberturas y limitaciones. |
| `/legals/licencias` | Disponibilidad regulatoria por jurisdiccion. |
| `/legals/criptoactivos` | Uso permitido de activos digitales. |
| `/legals/deco-custody` | Custodia y operacion de activos. |

## Patron Aprobado

Las referencias internas aprobadas para la forma del producto son:

1. `/markets/p2p`
   Dashboard landing operativo para intercambio entre personas.

2. `/markets/market-maker`
   Dashboard landing operativo para OTC, cupos, acuerdos y negociaciones.

Rendimiento debe seguir esa misma logica:

| Bloque | Regla |
|---|---|
| Header de producto | Debe explicar que es Rendimiento, para quien es y que accion permite. |
| Rutas independientes | Cada producto debe vivir en su URL sin tabs internas compartidas. |
| Resumen operativo | Debe mostrar saldo elegible, rendimiento estimado, riesgo y actividad. |
| Vistas funcionales | Deben parecer producto real conectable a backend. |
| Acciones claras | Cada vista debe tener una accion natural del usuario. |
| Copy | Comercial, claro, en espanol, sin promesa fija. |
| Componentizacion | Cada vista y pieza repetible debe vivir en componentes separados. |

## Roadmap General

| ID | Epica | Estado | Prioridad | Ruta |
|---|---|---|---|---|
| RND-001 | Arquitectura de menu Rendimiento | EN REVISION | Alta | Navbar |
| RND-002 | Dashboard Rendimiento | EN REVISION | Alta | `/rendimiento` |
| RND-003 | Staking de Tokens | EN REVISION | Alta | `/rendimiento/staking-tokens` |
| RND-004 | Boveda Programada | EN REVISION | Alta | `/rendimiento/boveda-programada` |
| RND-005 | Reservas | EN REVISION | Alta | `/rendimiento/reservas` |
| RND-006 | Calculadora de Retorno | EN REVISION | Alta | `/rendimiento/calculator` |
| RND-007 | Actividad y posiciones | EN REVISION | Media | `/rendimiento/activity` |
| RND-008 | Modales de accion | EN REVISION | Alta | Compartido |
| RND-009 | Revision legal/copy | EN REVISION | Alta | Compartido |
| RND-010 | QA visual, responsive y docs | EN REVISION | Alta | Compartido |

---

# RND-001 - Arquitectura De Menu Rendimiento

## Objetivo

Ordenar el menu Rendimiento para que se entienda como productos de crecimiento y respaldo de saldo, sin mezclarlo con programas de recompensa o comunidad.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| RND-001-01 | Validar nombres del menu | EN REVISION | El menu usa nombres claros y comerciales. |
| RND-001-02 | Separar Rendimiento de Ganar | EN REVISION | Referidos, cashback, launchpad y ranking no quedan en Rendimiento. |
| RND-001-03 | Definir rutas oficiales | EN REVISION | Las rutas siguen `/rendimiento/*`. |
| RND-001-04 | Ajustar copys cortos del dropdown | EN REVISION | Descripciones breves, claras y sin promesa fija. |

## Menu Propuesto

1. Staking de Tokens
2. Boveda Programada
3. Reservas
4. Calculadora de Retorno

---

# RND-002 - Dashboard Rendimiento

## Objetivo

Crear la ruta base de Rendimiento como dashboard landing operativo. Debe mostrar el estado general del usuario y llevarlo a elegir un producto con informacion suficiente.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| RND-002-01 | Header de producto | EN REVISION | Explica Rendimiento sin prometer ganancias. |
| RND-002-02 | Rutas independientes | EN REVISION | Cada URL muestra una sola vista sin tabs internas. |
| RND-002-03 | Resumen operativo | EN REVISION | Muestra saldo elegible, rendimiento estimado, posiciones y riesgo. |
| RND-002-04 | Productos destacados | EN REVISION | Presenta opciones accionables y compactas. |
| RND-002-05 | Actividad reciente | EN REVISION | Muestra movimientos, vencimientos o simulaciones. |
| RND-002-06 | Estados vacios | POR HACER | Si no hay posiciones, guia sin verse vacio. |

## Bloques Esperados

| Bloque | Contenido |
|---|---|
| Hero | Rendimiento estimado para saldo y tokens elegibles. |
| KPIs | Saldo elegible, retorno estimado, posiciones activas, riesgo promedio. |
| Productos | Staking flexible, boveda programada, calculadora, respaldo. |
| Actividad | Depositos, retiros, vencimientos, simulaciones. |
| Riesgo | Aviso visible conectado a legales. |

---

# RND-003 - Staking De Tokens

## Objetivo

Crear una experiencia para que el usuario seleccione un activo, revise condiciones y simule/active staking cuando este disponible.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| RND-003-01 | Lista de tokens elegibles | EN REVISION | Muestra activos con rendimiento estimado, red y disponibilidad. |
| RND-003-02 | Selector de modalidad | EN REVISION | Flexible y bloqueado se entienden claramente. |
| RND-003-03 | Panel de detalle | EN REVISION | Expone APY estimado, minimo, liquidez, riesgo y comision. |
| RND-003-04 | Modal de activacion | EN REVISION | Usuario confirma monto y acepta condiciones. |
| RND-003-05 | Posicion activa mockup | EN REVISION | Se ve saldo bloqueado/flexible, retorno estimado y accion de salida. |
| RND-003-06 | Relacion con reservas | EN REVISION | Staking muestra cuanto representa dentro del pool global y reservas totales. |

## Copy Base

- "Rendimiento estimado"
- "Sujeto a disponibilidad"
- "Riesgo variable"
- "Consulta condiciones antes de confirmar"

---

# RND-004 - Boveda Programada

## Objetivo

Incluir la idea de plazo definido sin presentarla como promesa fija. La Boveda Programada permite bloquear saldo o cripto por un periodo con una proyeccion estimada.

## Regla Principal

Boveda Programada no debe decir "te pagamos 2% mensual" ni "ganancia garantizada". Debe decir "rendimiento estimado", "referencia", "proyeccion" y "sujeto a condiciones".

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| RND-004-01 | Definir tarjetas de plazo | EN REVISION | 30, 60 y 90 dias aparecen como opciones claras. |
| RND-004-02 | Simular retorno por monto | EN REVISION | El usuario ve escenarios antes de confirmar. |
| RND-004-03 | Mostrar condiciones | EN REVISION | Incluye minimo, liquidez, retiro anticipado y comisiones. |
| RND-004-04 | Modal de confirmacion | EN REVISION | Requiere aceptar riesgo y condiciones. |
| RND-004-05 | Estado de vencimiento | EN REVISION | Muestra fecha estimada, progreso y accion al vencimiento. |
| RND-004-06 | Relacion con reservas | EN REVISION | La boveda muestra cuanto representa dentro de reservas bloqueadas y reservas totales. |

## Parametros Mockup Iniciales

| Activo | Minimo | Plazos | Copy |
|---|---:|---|---|
| USDT | 20 USDT | 30, 60, 90 dias | Proyeccion estimada, no garantizada. |
| USDC | 20 USDC | 30, 60, 90 dias | Sujeto a disponibilidad. |
| DECO | Por definir | Flexible/programado | Token propio del ecosistema. |

## Ejemplo De Copy Permitido

"Bloquea USDT por un periodo definido y consulta un rendimiento estimado antes de confirmar."

## Ejemplo De Copy Prohibido

"Deposita 20 USDT y gana 2% mensual garantizado."

---

# RND-005 - Reservas

## Objetivo

Convertir reservas, auditorias, seguros y custodia en una experiencia visual de confianza, no en una pagina legal plana. Reservas debe declarar reservas crypto, reservas fiat, fondos de usuarios consolidados, reservas bloqueadas, respaldo estimado del usuario y prueba Merkle de inclusion del usuario en el snapshot.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| RND-005-01 | Panel de reservas totales | EN REVISION | Muestra respaldo y estado mockup. |
| RND-005-02 | Panel de auditorias | EN REVISION | Resume controles y reportes disponibles. |
| RND-005-03 | Panel de seguros | EN REVISION | Explica cobertura y limitaciones. |
| RND-005-04 | Panel de custodia | EN REVISION | Muestra tipo de custodia y riesgos. |
| RND-005-05 | Links legales | EN REVISION | Enlaza a legales relevantes sin saturar la pantalla. |
| RND-005-06 | Mis reservas | EN REVISION | Muestra saldo del usuario, respaldo estimado y fondos bloqueados. |
| RND-005-07 | Reservas crypto y fiat | EN REVISION | Separa activos on-chain, saldos fiat y cobertura por categoria. |
| RND-005-08 | Consolidado usuarios | EN REVISION | Muestra total de fondos de usuarios como crypto + fiat. |
| RND-005-09 | Prueba Merkle usuario | EN REVISION | Muestra root, leaf hash, snapshot y estado de inclusion mock. |
| RND-005-10 | Asi esta tu dinero | EN REVISION | Muestra distribucion privada del usuario y porcentaje sobre fondos/reservas. |
| RND-005-11 | Gating por login | EN REVISION | Desglose personal y Merkle se ocultan sin sesion activa. |

---

# RND-006 - Calculadora De Retorno

## Objetivo

Crear una calculadora de retorno conectable que permita simular escenarios antes de activar staking o boveda.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| RND-006-01 | Inputs principales | EN REVISION | Activo, monto, plazo y modalidad. |
| RND-006-02 | Escenarios | EN REVISION | Conservador, base y alto sin prometer resultados. |
| RND-006-03 | Desglose | EN REVISION | Retorno estimado, comision, neto estimado y riesgo. |
| RND-006-04 | CTA contextual | EN REVISION | Permite ir a staking o boveda segun simulacion. |
| RND-006-05 | Avisos legales | EN REVISION | El usuario entiende que es simulacion. |

---

# RND-007 - Actividad Y Posiciones

## Objetivo

Mostrar al usuario sus posiciones mockup, actividad, vencimientos y movimientos relacionados con Rendimiento.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| RND-007-01 | Tabla/lista de posiciones | EN REVISION | Posiciones activas y finalizadas se entienden. |
| RND-007-02 | Timeline de actividad | EN REVISION | Muestra activacion, acumulacion, retiro y vencimiento. |
| RND-007-03 | Estado vacio | EN REVISION | Guia al usuario a simular o activar. |
| RND-007-04 | Filtros simples | EN REVISION | Activo, modalidad y estado. |

---

# RND-008 - Modales De Accion

## Objetivo

Crear los flujos modales necesarios para que la experiencia se sienta real y luego conectable al backend.

## Tareas

| ID | Modal | Estado | Criterio de terminado |
|---|---|---|---|
| RND-008-01 | Simular retorno | EN REVISION | Calcula escenario y muestra desglose. |
| RND-008-02 | Activar staking | EN REVISION | Confirma activo, monto, red y riesgo. |
| RND-008-03 | Crear boveda | EN REVISION | Confirma plazo, vencimiento y condiciones. |
| RND-008-04 | Retirar flexible | EN REVISION | Explica tiempo de retiro y comisiones. |
| RND-008-05 | Ver condiciones | EN REVISION | Resume legales sin sacar al usuario del flujo. |

---

# RND-009 - Revision Legal Y Copy

## Objetivo

Auditar todos los textos para que sean comerciales, claros y legalmente prudentes.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| RND-009-01 | Eliminar promesas fijas | EN REVISION | No existe copy de ganancia garantizada. |
| RND-009-02 | Revisar terminos de riesgo | EN REVISION | Todos los flujos muestran riesgo variable. |
| RND-009-03 | Revisar jurisdiccion | EN REVISION | Disponibilidad queda sujeta a pais/usuario. |
| RND-009-04 | Revisar comisiones | EN REVISION | Comisiones aparecen antes de confirmar. |
| RND-009-05 | Revisar links legales | EN REVISION | Cada producto enlaza a legal correcto. |

---

# RND-010 - QA Visual Y Responsive

## Objetivo

Verificar que Rendimiento respete el estilo aprobado del home y funcione en desktop/mobile.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| RND-010-01 | Revisar desktop | POR HACER | Layout sin solapes ni espacios raros. |
| RND-010-02 | Revisar mobile | POR HACER | Cards, tabs y modales caben correctamente. |
| RND-010-03 | Revisar dark/light | POR HACER | Contraste correcto en ambos temas. |
| RND-010-04 | Revisar copy visible | POR HACER | Textos no se cortan ni desbordan. |
| RND-010-05 | Verificacion tecnica | HECHO | Typecheck/build pasan con `pnpm`. |
| RND-010-06 | README/CHANGELOG/version | HECHO | Release 0.14.0 documenta Reservas y Merkle/login. |

---

## Backend/Gateway Futuro

Estos campos deben quedar pensados para conectar luego al backend o gateway de usuario:

| Entidad | Campos esperados |
|---|---|
| Producto rendimiento | id, nombre, modalidad, activo, paises, estado, riesgo. |
| Tasa estimada | productoId, periodo, valorReferencia, fechaActualizacion. |
| Posicion usuario | id, userId, productoId, monto, estado, fechaInicio, fechaVencimiento. |
| Movimiento | id, posicionId, tipo, monto, fecha, estado. |
| Condicion legal | productoId, pais, version, urlLegal, requiereAceptacion. |

## Pendientes De Decision

| Decision | Estado | Nota |
|---|---|---|
| Nombre final de Boveda Programada | PROPUESTO | Alternativas: Plan Bloqueado, Rendimiento Programado, Cuenta de Rendimiento. |
| Activos iniciales | PENDIENTE | USDT, USDC, ETH y DECO como propuesta inicial. |
| Minimos por activo | PENDIENTE | USDT/USDC mockup inicial: 20 unidades. |
| Disponibilidad por pais | PENDIENTE | Debe conectarse luego al modal de idioma/pais/moneda. |
| Politica de retiro anticipado | PENDIENTE | Definir si aplica bloqueo total, penalidad o no disponible. |
