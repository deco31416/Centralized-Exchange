# Plan Crypto Facil - Deco Exchange

Documento de control tipo Jira para renovar la seccion Crypto facil paso a paso.

Regla principal: Crypto facil es el Nivel 1 de la plataforma. Debe ser la experiencia mas clara, simple y confiable para usuarios nuevos. No debe sentirse como formulario viejo ni como dashboard administrativo.

Definicion oficial: cada ruta de Crypto facil debe ser una experiencia propia, igual que Bolsillito. Una URL debe renderizar una sola vista con hero de producto, flujo operativo, resumen lateral, modales de confirmacion y estados claros.

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

- Trabajar una ruta a la vez.
- Todo debe quedar componetizado.
- Gestor de paquetes oficial: `pnpm`. No usar `npm`.
- Una URL debe renderizar una sola experiencia. No usar tabs internas para mezclar productos.
- Cada pantalla debe tener hero de producto como Bolsillito.
- Cada pantalla debe tener flujo operativo, resumen lateral y modal de confirmacion cuando aplique.
- Mantener estilo aprobado del home, Bolsillito y Rendimiento.
- Usar controles compactos, cards rectangulares, buscadores correctos y acento naranja discreto.
- Reutilizar idioma, pais/region y moneda desde el modal global de preferencias cuando aplique.
- Los modulos son mockups UX conectables: luego se integran al backend/BFF/gateway sin rehacer interfaz.

## Patron Aprobado

Referencias internas aprobadas:

1. `/bolsillito/add-money`
   Flujo de recarga con hero, pasos, buscador, metodos compactos, resumen lateral y modal.

2. `/bolsillito/send-money`
   Flujo de envio con selector, monto, resumen y confirmacion.

3. `/bolsillito/remittances`
   Flujo de remesa con cotizacion, destino, resumen y modal.

4. `/rendimiento/staking-tokens` y `/rendimiento/boveda-programada`
   Producto con hero, selector operativo, monto, resumen lateral y relacion con reservas.

## Roadmap General

| ID | Epica | Estado | Prioridad | Ruta |
|---|---|---|---|---|
| CRF-001 | Arquitectura menu Crypto facil | POR HACER | Alta | Navbar |
| CRF-002 | Compra cripto | EN REVISION | Alta | `/easy-crypto/buy` |
| CRF-003 | Vende cripto | EN REVISION | Alta | `/easy-crypto/sell` |
| CRF-004 | Convertidor | EN REVISION | Alta | `/easy-crypto/convert` |
| CRF-005 | Envia cripto | EN REVISION | Alta | `/easy-crypto/send` |
| CRF-006 | Opera en vivo / Spot Lite | EN REVISION | Media | `/easy-crypto/spot-lite` |
| CRF-007 | Componentes compartidos | EN REVISION | Alta | `components/easy-crypto` |
| CRF-008 | Modales de accion | EN REVISION | Alta | Compartido |
| CRF-009 | Revision copy y legal | POR HACER | Alta | Compartido |
| CRF-010 | QA visual y responsive | POR HACER | Alta | Compartido |

---

# CRF-001 - Arquitectura Menu Crypto Facil

## Objetivo

Revisar el menu Crypto facil para que los nombres y descripciones reflejen productos simples, claros y accionables.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| CRF-001-01 | Revisar nombres del dropdown | POR HACER | Los nombres son claros y consistentes. |
| CRF-001-02 | Revisar descripciones cortas | POR HACER | Las descripciones son comerciales, breves y naturales. |
| CRF-001-03 | Validar rutas canonicas | POR HACER | Todas las rutas `/easy-crypto/*` responden. |
| CRF-001-04 | Documentar regla visual | POR HACER | Crypto facil sigue el patron de Bolsillito. |

## Menu Actual A Evaluar

1. Compra cripto
2. Vende cripto
3. Convertidor
4. Envia cripto
5. Opera en vivo

---

# CRF-002 - Compra Cripto

## Objetivo

Renovar `/easy-crypto/buy` para que sea la puerta principal de entrada a cripto: elegir moneda fiat, activo cripto, monto, metodo, cotizacion y confirmacion.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| CRF-002-01 | Hero de producto | EN REVISION | Explica compra cripto y usa preferencias de pais/moneda. |
| CRF-002-02 | Selector de metodo | EN REVISION | Metodos compactos por pais/categoria. |
| CRF-002-03 | Panel de monto | EN REVISION | Monto fiat y cripto estimado se entienden. |
| CRF-002-04 | Resumen lateral | EN REVISION | Muestra activo, tasa, comision, metodo y total. |
| CRF-002-05 | Modal de compra | EN REVISION | Revisa cotizacion, metodo, comision e intencion antes de confirmar. |
| CRF-002-06 | Estados de error/vacio | EN REVISION | Sin metodo, monto minimo y cotizacion vencida se ven claros. |

---

# CRF-003 - Vende Cripto

## Objetivo

Renovar `/easy-crypto/sell` para vender cripto y recibir moneda local con claridad sobre red, saldo, tasa, comision y metodo de recepcion.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| CRF-003-01 | Hero de producto | EN REVISION | Explica venta cripto y recepcion fiat. |
| CRF-003-02 | Selector de activo | EN REVISION | Activo y saldo estimado se entienden. |
| CRF-003-03 | Metodo de recepcion | EN REVISION | Bolsillito, banco local y wallet aliada quedan visibles. |
| CRF-003-04 | Resumen lateral | EN REVISION | Muestra tasa, recibes y tiempo estimado. |
| CRF-003-05 | Modal de venta | EN REVISION | Confirma monto, recepcion y estado pendiente de backend. |

---

# CRF-004 - Convertidor

## Objetivo

Renovar `/easy-crypto/convert` como swap simple entre activos, rapido y sin complejidad de trading.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| CRF-004-01 | Hero de producto | EN REVISION | Explica conversion simple entre saldos. |
| CRF-004-02 | Selector de origen/destino | EN REVISION | Dos activos, swap y pares rapidos. |
| CRF-004-03 | Cotizacion | EN REVISION | Tasa, spread estimado y refresco. |
| CRF-004-04 | Resumen lateral | EN REVISION | Muestra entregas, recibes y condiciones. |
| CRF-004-05 | Modal de conversion | EN REVISION | Confirma conversion antes de ejecutar. |

---

# CRF-005 - Envia Cripto

## Objetivo

Renovar `/easy-crypto/send` para enviar cripto a usuario o wallet externa con red, direccion, fee y confirmacion clara.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| CRF-005-01 | Hero de producto | EN REVISION | Explica envio cripto y cero comisiones internas si aplica. |
| CRF-005-02 | Modo de envio | EN REVISION | Usuario Deco, wallet externa y QR quedan planteados. |
| CRF-005-03 | Selector activo/red | EN REVISION | Activo, red y fee quedan visibles. |
| CRF-005-04 | Destinatario | EN REVISION | Busqueda de usuario real se conserva. |
| CRF-005-05 | Resumen lateral | EN REVISION | Muestra red, fee, monto y destino. |
| CRF-005-06 | Modal de confirmacion | EN REVISION | Advierte firma pendiente y riesgo de red externa. |

---

# CRF-006 - Opera En Vivo / Spot Lite

## Objetivo

Renovar `/easy-crypto/spot-lite` como una experiencia simple para ver tendencia y operar sin entrar al mercado avanzado.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| CRF-006-01 | Hero de producto | EN REVISION | Explica operacion simple con mercado en vivo. |
| CRF-006-02 | Selector de par | EN REVISION | Base/cotizacion quedan visibles. |
| CRF-006-03 | Grafica TradingView | EN REVISION | TradingView Advanced Chart como referencia publica con fallback de carga. |
| CRF-006-04 | Accion rapida | EN REVISION | Compra/venta rapida planteada. |
| CRF-006-05 | Resumen lateral | EN REVISION | Par, accion, monto, resultado y riesgo. |

---

# CRF-007 - Componentes Compartidos

## Objetivo

Crear piezas reutilizables para no duplicar logica visual entre compra, venta, convertidor, envio y spot-lite.

## Tareas

| ID | Componente | Estado | Criterio de terminado |
|---|---|---|---|
| CRF-007-01 | `EasyCryptoHero` | EN REVISION | Hero reusable con titulo, copy y accion. |
| CRF-007-02 | `EasyCryptoPanel` | EN REVISION | Panel reusable para montos, selects y bloques operativos. |
| CRF-007-03 | `EasyCryptoSummary` | EN REVISION | Resumen lateral reusable. |
| CRF-007-04 | `EasyCryptoMethodGrid` | EN REVISION | Metodos compactos por busqueda. |
| CRF-007-05 | `EasyCryptoConfirmModal` | EN REVISION | Confirmacion comun con condiciones. |

---

# CRF-008 - Modales De Accion

## Objetivo

Crear flujos modales para que cada accion se sienta real y luego conectable.

## Tareas

| ID | Modal | Estado | Criterio de terminado |
|---|---|---|---|
| CRF-008-01 | Confirmar compra | EN REVISION | Cotizacion, metodo, comision e intencion en modal. |
| CRF-008-02 | Confirmar venta | EN REVISION | Recepcion fiat y condiciones en modal. |
| CRF-008-03 | Confirmar conversion | EN REVISION | Entregas, recibes y tasa en modal. |
| CRF-008-04 | Confirmar envio | EN REVISION | Destino, red, fee y firma en modal. |
| CRF-008-05 | Cotizacion expirada | EN REVISION | Compra conserva expiracion/refresco de cotizacion. |

---

# CRF-009 - Revision Copy Y Legal

## Objetivo

Auditar textos para que sean claros, comerciales y prudentes.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| CRF-009-01 | Revisar promesas | POR HACER | No hay promesas de precio, rendimiento o ejecucion garantizada. |
| CRF-009-02 | Revisar fees | POR HACER | Comisiones y red aparecen antes de confirmar. |
| CRF-009-03 | Revisar redes | POR HACER | Advertencias de red/direccion se ven antes de enviar. |
| CRF-009-04 | Revisar pais/moneda | POR HACER | Disponibilidad queda sujeta a preferencias y KYC. |

---

# CRF-010 - QA Visual Y Responsive

## Objetivo

Verificar que Crypto facil respete el estilo aprobado y funcione en desktop/mobile/light/dark.

## Tareas

| ID | Tarea | Estado | Criterio de terminado |
|---|---|---|---|
| CRF-010-01 | Revisar desktop | POR HACER | Layout sin solapes ni espacios raros. |
| CRF-010-02 | Revisar mobile | POR HACER | Inputs, cards y modales caben correctamente. |
| CRF-010-03 | Revisar dark/light | POR HACER | Contraste correcto en ambos temas. |
| CRF-010-04 | Revisar copy visible | POR HACER | Textos no se cortan ni desbordan. |
| CRF-010-05 | Verificacion tecnica | POR HACER | Typecheck/build pasan con `pnpm`. |

---

## Backend/Gateway Futuro

Campos esperados para integrar luego:

| Entidad | Campos esperados |
|---|---|
| Quote | id, side, fromAsset, toAsset, amount, rate, fee, expiresAt. |
| Metodo pago | id, pais, moneda, tipo, nombre, tiempo, comision, estado. |
| Orden simple | id, userId, side, quoteId, status, createdAt, settledAt. |
| Envio cripto | id, asset, network, destination, fee, status, txHash. |
| Preferencias | language, region, currency, kycLevel, availability. |

## Pendientes De Decision

| Decision | Estado | Nota |
|---|---|---|
| Si compra/venta usan saldo Bolsillito como metodo principal | PENDIENTE | Puede conectar Crypto facil con Bolsillito. |
| Activos iniciales visibles | PENDIENTE | BTC, ETH, USDT, USDC, SOL, DECO como propuesta. |
| Redes visibles por activo | PENDIENTE | Deben venir luego del backend/catalogo. |
| Nombres finales de CTAs | PENDIENTE | Comprar ahora, Vender ahora, Convertir, Enviar. |
