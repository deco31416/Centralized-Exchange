# Plan Red Deco - Deco Exchange

Documento de control tipo Jira para disenar y construir Red Deco: red fisica aliada para depositar efectivo, retirar efectivo, cambiar saldo y enviar/recibir remesas usando comercios, cajeros, empresas, P2P, bancos, stablecoins y liquidez interna de Deco.

Decision de producto: Red Deco es una capa propia de Deco Exchange. Para usuario final vive dentro de Bolsillito; para comercios, cajeros y empresas vive dentro de Ganar como oportunidad de ingresos bajo el nombre Aliado Deco.

## Taxonomia De Marca

Esta seccion es normativa. Si hay duda en UI, rutas, codigo, admin panel o microservicios, se debe seguir esta tabla.

| Nombre | Que es | Audiencia | Donde vive | Ruta principal | No usar para |
|---|---|---|---|---|---|
| Red Deco | Red fisica de aliados para efectivo, retiros y remesas. | Usuario final. | Bolsillito. | `/bolsillito/red-deco` | Recompensas, puntos acumulables o gamificacion. |
| Aliado Deco | Programa para operar como aliado/cajero/comercio/empresa y ganar comisiones. | Personas verificadas, comercios y empresas. | Ganar. | `/earn/aliado-deco` | Balance de puntos, misiones o fidelizacion. |
| Puntos Deco / Deco Points | Recompensas del usuario por actividad, misiones, aprender, cashback o campanas. | Usuario final. | Ganar. | `/earn/deco-points` | Red fisica, cajeros, comercios o remesas presenciales. |

Reglas de naming:

- En Bolsillito se dice `Red Deco`.
- En Ganar, para el operador fisico, se dice `Aliado Deco`.
- En Ganar, para recompensas, se dice `Puntos Deco` o `Deco Points`.
- No escribir `Punto Deco` en singular para el producto fisico; causa confusion con puntos/recompensas.
- No escribir `Puntos Deco` para la red fisica; queda reservado a recompensas.
- En cards de la red fisica se prefiere la palabra `aliado` sobre `punto`.
- En codigo nuevo se prefiere `red-deco` para experiencia usuario y `aliado-deco` para experiencia operador.
- Las rutas legacy `/bolsillito/puntos-deco` y `/earn/punto-deco` pueden existir solo como compatibilidad/redireccion, nunca como rutas canonicas.

Glosario rapido:

- Aliado: persona, comercio, empresa o mesa habilitada para atender operaciones fisicas.
- Red: conjunto de aliados disponibles por zona, pais, servicio, horario y limites.
- Punto: palabra generica de ubicacion; evitarla como nombre de producto.
- Deco Points: unidad de recompensa o fidelizacion, no ubicacion fisica.

---

## Vision

Red Deco convierte personas verificadas, comercios y empresas en nodos de liquidez fisica y digital.

El usuario final debe poder:

- Buscar un Aliado Deco cercano.
- Depositar efectivo y recibir saldo Deco, fiat digital o stablecoin.
- Retirar efectivo usando saldo Deco.
- Enviar remesas a otro pais con una ruta barata.
- Recibir remesas como efectivo, saldo, banco, wallet local o P2P.
- Ver tasa, fee, tiempo estimado y comprobante antes de confirmar.

El aliado debe poder:

- Activarse como Aliado Deco segun su nivel.
- Ver operaciones pendientes, en curso y completadas.
- Aceptar o rechazar operaciones.
- Confirmar efectivo recibido o entregado.
- Ganar comisiones por deposito, retiro, remesa y volumen.
- Descargar reportes fiscales y comprobantes.
- Mantener chat seguro y trazabilidad de cada operacion.

---

## Principios

- Producto simple para usuario: monto, aliado cercano, tasa, fee, confirmacion y comprobante.
- Operacion guiada para cajero: no debe calcular manualmente tasas, comisiones ni equivalencias.
- Direccion exacta protegida: antes de aceptar se muestra zona aproximada; despues de aceptar se muestra el aliado operativo.
- GPS obligatorio para buscar aliados cercanos y validar operaciones presenciales.
- No mostrar publicamente liquidez exacta del aliado; mostrar rangos, limites y disponibilidad.
- No permitir intercambio libre de documentos sensibles por chat.
- Documentos adicionales solo por formulario seguro, con consentimiento, auditoria y expiracion.
- Todo debe quedar componentizado antes de conectar backend.
- La experiencia debe ser dashboard landing, como P2P, Market Maker, Bolsillito y Rendimiento: comercial, clara y operativa.
- El MVP es mock frontend; luego se conecta backend/gateway de usuario, KYC, ordenes, liquidez y motor de rutas.

---

## Ubicacion En Producto

| Area | Ruta | Proposito |
|---|---|---|
| Bolsillito | `/bolsillito/red-deco` | Vista usuario final para buscar, depositar, retirar y enviar remesas. |
| Ganar | `/earn/aliado-deco` | Vista comercial para convertirse en aliado y ganar comisiones. |
| Remesas | `/bolsillito/remittances` | Debe ofrecer opcion "Enviar con Aliado Deco". |
| P2P | `/markets/p2p` | Debe conectar operadores verificados cercanos cuando aplique. |
| Assets | `/assets/payment-methods/red-deco` | Metodo fisico: red de aliados. |
| Footer | Para ti / Para empresas | Links a Red Deco y Aliado Deco. |
| Help Center | Futuro `/help/red-deco` | Guias, seguridad, disputas, impuestos y requisitos. |
| Legales | Futuro `/legals/red-deco` | Terminos, limites, AML, KYC/KYB, fiscal y privacidad. |

---

## Rutas MVP

| Ruta | Tipo | Proposito |
|---|---|---|
| `/bolsillito/red-deco` | Hub usuario | Buscar aliados, explicar servicios y simular operacion. |
| `/bolsillito/red-deco/deposit` | Flujo usuario | Depositar efectivo y recibir saldo/USDT. |
| `/bolsillito/red-deco/withdraw` | Flujo usuario | Retirar efectivo usando saldo Deco. |
| `/bolsillito/red-deco/remittance` | Flujo usuario | Enviar remesa con aliado fisico. |
| `/bolsillito/red-deco/nearby` | Mapa/lista | Aliados cercanos con disponibilidad aproximada. |
| `/earn/aliado-deco` | Landing aliado | Convertirse en Aliado Deco y ver ganancias. |
| `/earn/aliado-deco/apply` | Solicitud | Registro de persona, comercio o empresa. |
| `/earn/aliado-deco/dashboard` | Operacion | Consola del cajero/aliado. |
| `/earn/aliado-deco/orders` | Ordenes | Pendientes, en curso, completadas y disputas. |
| `/earn/aliado-deco/reports` | Fiscal | Reportes, comprobantes, CSV/PDF y contrapartes. |
| `/earn/aliado-deco/compliance` | Cumplimiento | KYC/KYB, limites, formularios y auditoria. |

---

## Servicios

| Servicio | Usuario entrega | Usuario recibe | Motor posible |
|---|---|---|---|
| Deposito efectivo | COP u otra moneda local | Saldo Deco, fiat digital o USDT | Aliado Deco origen + tesoreria Deco. |
| Retiro efectivo | Saldo Deco, fiat digital o USDT | Efectivo local | Aliado Deco cercano. |
| Cambio presencial | Fiat efectivo | Stablecoin o fiat digital | Tasa Deco + liquidez del aliado. |
| Remesa origen | Efectivo local | Orden internacional | Aliado Deco + ruta inteligente. |
| Remesa destino | Orden/saldo | Efectivo, banco o wallet local | Aliado Deco destino, P2P, banco o wallet. |
| Banco destino | Efectivo/saldo origen | Deposito bancario local | Aliado, P2P o rail local. |
| Wallet destino | Efectivo/saldo origen | Nequi, Daviplata, Pix, etc. | Metodo local disponible. |

---

## Tipos De Aliado

| Tipo | Perfil | Uso |
|---|---|---|
| Cajero Deco | Persona verificada | Montos pequenos y medianos, bajo riesgo. |
| Comercio aliado | Local fisico | Depositos, retiros y remesas con direccion comercial. |
| Empresa aliada | Empresa KYB | Alto volumen, reportes formales y contratos. |
| Mesa de efectivo | Operador profesional | Liquidez grande y rutas regionales. |
| Aliado destino | Aliado en pais receptor | Entrega efectivo, banco o wallet local. |

---

## Niveles

| Nivel | Nombre | Permisos | Limite sugerido MVP |
|---|---|---|---|
| 1 | Persona verificada | Depositos pequenos | Bajo. |
| 2 | Cajero operativo | Depositos y retiros | Medio. |
| 3 | Comercio aliado | Depositos, retiros y remesas | Medio alto. |
| 4 | Empresa verificada | Remesas y mayor volumen | Alto. |
| 5 | Mesa profesional | Liquidez regional y rutas | Personalizado. |

Regla: remesas internacionales y montos altos solo para niveles 3, 4 y 5.

---

## Flujo Usuario - Deposito

1. Usuario elige "Depositar efectivo".
2. Activa GPS o selecciona ciudad/zona.
3. Ingresa monto, ejemplo `100,000 COP`.
4. Deco muestra estimado: saldo, USDT o moneda elegida.
5. Deco muestra aliados cercanos compatibles.
6. Usuario elige Aliado Deco.
7. Deco reserva tasa por ventana corta.
8. Aliado Deco acepta operacion.
9. Usuario recibe direccion exacta y codigo QR.
10. Cajero confirma efectivo recibido.
11. Deco acredita saldo.
12. Se genera comprobante para usuario y aliado.

---

## Flujo Usuario - Retiro

1. Usuario elige "Retirar efectivo".
2. Deco valida saldo, KYC y limites.
3. Usuario elige monto y moneda.
4. Deco muestra aliados cercanos con disponibilidad.
5. Usuario crea orden y saldo queda bloqueado.
6. Aliado Deco acepta.
7. Usuario llega y valida QR/codigo.
8. Cajero entrega efectivo.
9. Usuario confirma recibido.
10. Deco libera compensacion al aliado.
11. Se genera comprobante.

---

## Flujo Usuario - Remesa

1. Usuario elige pais destino.
2. Ingresa monto origen.
3. Elige beneficiario o crea beneficiario.
4. Selecciona entrega: efectivo, saldo Deco, banco, wallet local o P2P.
5. Deco calcula mejor ruta disponible.
6. Muestra tasa, fee, tiempo y monto final.
7. Usuario paga en Aliado Deco origen o con saldo.
8. Deco ejecuta ruta.
9. Beneficiario recibe en Aliado Deco destino, banco, wallet o saldo.
10. Se generan comprobantes para origen, destino y aliado.

---

## Flujo Remesa Entre Paises

Regla principal: una remesa internacional no es una sola accion. Es una orden con tramo origen, tramo de conversion/ruta, tramo destino, liquidacion y conciliacion.

Ejemplo: Colombia a Peru.

1. Remitente crea remesa en Colombia.
2. Deco valida KYC del remitente, pais origen, limites, riesgo y metodo de pago.
3. Remitente elige beneficiario y metodo destino: efectivo, banco, wallet, saldo Deco o P2P.
4. Deco calcula ruta: Aliado Deco origen, tesoreria, stablecoin, P2P, banco, Aliado Deco destino o market maker.
5. Deco muestra monto origen, moneda destino, tasa, fee, tiempo, ruta resumida y riesgos visibles.
6. El Aliado Deco origen acepta recibir efectivo o el usuario paga con saldo.
7. Deco bloquea la tasa por ventana corta y crea hold de liquidacion.
8. Al confirmar el pago origen, la orden pasa a `funded`.
9. El motor de rutas reserva liquidez destino antes de prometer entrega final.
10. El Aliado Deco destino, banco, wallet o P2P acepta la entrega.
11. El beneficiario valida codigo/QR o datos de entrega.
12. Se libera el pago destino.
13. Orden pasa a `settled`.
14. Se generan comprobantes separados: remitente, beneficiario, aliado origen, aliado destino y Deco.
15. Conciliacion verifica caja, saldo, fee, comision, spread, impuestos y liquidacion entre paises.

Si cualquier tramo falla:

- No se debe perder la trazabilidad.
- La orden queda en estado reversible o disputa.
- El usuario ve una razon clara y un siguiente paso.
- El dinero queda retenido hasta resolver, devolver o reenrutar.
- La ruta puede cambiar sin cambiar el comprobante original; se agrega anexo de reenrutamiento.

---

## Estados Canonicos De Orden

Toda orden de Aliado Deco debe tener estados explicitos para que frontend, admin panel y microservicios hablen el mismo idioma.

| Estado | Significado | Quien puede actuar |
|---|---|---|
| `draft` | Usuario esta simulando. | Usuario. |
| `quoted` | Tasa y fee calculados. | Usuario. |
| `pending_point` | Esperando aceptacion de Aliado Deco. | Aliado Deco. |
| `accepted` | Aliado acepto la operacion. | Usuario y aliado. |
| `funding_pending` | Falta recibir efectivo/saldo origen. | Usuario/aliado origen. |
| `funded` | Origen confirmado; fondos retenidos. | Deco/routing. |
| `route_reserved` | Liquidez destino reservada. | Motor de rutas. |
| `destination_pending` | Falta entrega destino. | Aliado destino/banco/wallet/P2P. |
| `delivered` | Beneficiario o usuario recibio. | Beneficiario/aliado destino. |
| `settled` | Orden conciliada y cerrada. | Deco/admin. |
| `cancelled` | Cancelada antes de fondos o dentro de reglas. | Usuario/aliado/Deco. |
| `expired` | Vencio tasa, QR o aceptacion. | Sistema. |
| `disputed` | Hay reclamo o inconsistencia. | Soporte/admin. |
| `refunded` | Fondos devueltos al origen. | Deco/admin. |
| `rerouted` | Ruta destino cambio por disponibilidad. | Deco/routing. |

Regla: no usar textos sueltos como estados. Los textos de UI pueden variar, pero los estados internos deben ser estos o una evolucion controlada.

---

## Control Contable Y Conciliacion

Cada operacion debe producir movimientos separados, no un solo registro plano.

Movimientos minimos:

- Entrada fiat origen.
- Hold de saldo/fiat/stablecoin.
- Fee Deco.
- Comision aliado origen.
- Comision aliado destino si aplica.
- Spread o margen de ruta.
- Salida destino.
- Ajuste por redondeo.
- Reserva de disputa si aplica.
- Liquidacion final entre aliados o tesoreria.

Ledger minimo por orden:

| Campo | Motivo |
|---|---|
| `orderId` | Trazabilidad global. |
| `routeId` | Saber que ruta ejecuto la orden. |
| `originCountry` / `destinationCountry` | Control de corredor internacional. |
| `originCurrency` / `destinationCurrency` | Conciliacion multi moneda. |
| `quotedRate` | Tasa mostrada al usuario. |
| `executedRate` | Tasa realmente ejecutada. |
| `feeDeco` | Ingreso plataforma. |
| `pointCommissionOrigin` | Ingreso aliado origen. |
| `pointCommissionDestination` | Ingreso aliado destino. |
| `treasuryExposure` | Riesgo asumido por Deco. |
| `settlementStatus` | Pendiente, parcial, completo o disputa. |
| `proofHash` | Integridad de comprobantes. |

Regla: cada cambio critico debe quedar en auditoria inmutable: quien, cuando, desde que dispositivo, IP aproximada, pais, estado anterior y estado nuevo.

---

## Permisos Por Rol

| Rol | Puede ver | Puede hacer | No puede hacer |
|---|---|---|---|
| Usuario remitente | Su orden, tasa, aliado asignado y comprobante | Crear, pagar, cancelar si aplica, disputar | Ver liquidez exacta o datos sensibles del aliado. |
| Beneficiario | Orden recibida y metodo de entrega | Reclamar, confirmar, disputar | Ver datos completos del remitente salvo ley/regla. |
| Aliado origen | Operaciones asignadas, monto a recibir, comision | Aceptar, confirmar efectivo, reportar problema | Cambiar tasa, cambiar beneficiario o pedir documentos por chat libre. |
| Aliado destino | Operaciones asignadas, monto a entregar, comision | Aceptar, entregar, confirmar | Ver liquidez origen o datos no necesarios. |
| Admin soporte | Ordenes, evidencia, estados y auditoria | Pausar, disputar, reenrutar, resolver | Alterar ledger sin registro. |
| Riesgo/AML | Datos de riesgo, limites, alertas | Bloquear, escalar, solicitar formulario | Exponer datos al aliado sin base. |
| Tesoreria | Saldos, reservas, settlement | Conciliar, liquidar, ajustar | Modificar KYC o chats. |

---

## Flujo Aliado - Consola

La consola del Aliado Deco debe ser simple y operativa.

Secciones:

- Pendientes.
- En curso.
- Completadas.
- Disputas.
- Caja disponible.
- Liquidez declarada por rangos.
- Ganancias del dia.
- Reportes fiscales.
- Configuracion de horarios y limites.

Card de orden pendiente:

| Campo | Ejemplo |
|---|---|
| Codigo | `PD-4821` |
| Tipo | Deposito efectivo |
| Monto | `100,000 COP` |
| Usuario | Verificado nivel 3 |
| Recibe usuario | `24.80 USDT` |
| Comision aliado | `1,200 COP` |
| Tiempo restante | `08:42` |
| Acciones | Aceptar / Rechazar |

---

## Motor De Rutas

La promesa de bajo costo depende de enrutar bien cada remesa.

Rutas posibles:

- Aliado Deco origen a Aliado Deco destino.
- Aliado Deco origen a P2P verificado destino.
- Aliado Deco origen a banco local destino.
- Aliado Deco origen a wallet local destino.
- Saldo Deco a stablecoin y luego salida local.
- Market Maker a liquidez mayorista.
- Tesoreria Deco a metodo local.

MVP frontend: mostrar la "mejor ruta disponible" como dato mock.

Backend futuro: motor de rutas con costo, tiempo, liquidez, riesgo, disponibilidad, pais y limites regulatorios.

---

## Seguridad

| Riesgo | Regla |
|---|---|
| Secuestro o robo | No mostrar direccion exacta ni liquidez exacta antes de aceptar. |
| Operacion falsa | QR dinamico, codigo corto y expiracion. |
| Usuario no verificado | Montos presenciales requieren KYC minimo. |
| Cajero riesgoso | Niveles, reputacion, auditoria y limites. |
| Documentos sensibles | Solo formulario seguro, no chat libre. |
| Disputa | Boton reportar problema y retencion temporal. |
| Lavado de dinero | Limites, monitoreo AML, reglas por pais y trazabilidad. |
| Suplantacion | Validacion de cuenta, selfie/KYC segun riesgo y device signals. |

Controles adicionales obligatorios:

- GPS aproximado antes de aceptar; GPS exacto solo para orden aceptada.
- Geofence opcional para confirmar que usuario y aliado estan cerca al cerrar.
- QR dinamico con expiracion corta y un solo uso.
- PIN de confirmacion para usuario y operador del aliado.
- Liveness/selfie solo en operaciones de mayor riesgo.
- Device fingerprint para detectar cuentas nuevas operando montos altos.
- Cooldown para aliados nuevos antes de subir limites.
- Limites diarios, semanales y mensuales por usuario, aliado, pais y corredor.
- Alertas por patron: muchas operaciones fraccionadas, beneficiarios repetidos, cambios frecuentes de aliado, rutas inusuales.
- Boton de emergencia o "no puedo continuar" que congele la orden sin revelar al otro lado el motivo.
- Horarios operativos visibles y bloqueo fuera de horario.
- Direccion residencial prohibida para aliados de alto volumen; preferir comercio o empresa.
- Seguro/garantia/deposito operativo para aliados de nivel alto cuando aplique.

---

## Debilidades Detectadas En Auditoria

| Debilidad | Riesgo | Mitigacion |
|---|---|---|
| Aliados persona sin local fijo | Riesgo fisico, robo, suplantacion | Limites bajos, zona aproximada, KYC alto, reputacion y no remesas grandes. |
| Direccion exacta antes de pago | Exposicion de usuario/aliado | Mostrar solo tras aceptacion y dentro de ventana de tiempo. |
| Liquidez visible | Riesgo de robo al aliado | Mostrar rangos, nunca caja exacta. |
| Chat libre para documentos | Privacidad y fraude | Formularios seguros con campos definidos, expiracion y auditoria. |
| Remesa sin reserva destino | Orden queda financiada sin entrega posible | Reservar ruta/liquidez destino antes de prometer entrega. |
| Tasa bloqueada demasiado tiempo | Riesgo de mercado | Ventana corta y re-cotizacion obligatoria. |
| Confirmacion unilateral | Aliado o usuario puede mentir | Doble confirmacion, QR, evidencia, geofence y disputa. |
| Multipais sin corredor definido | Riesgo regulatorio | Reglas por corredor origen/destino y nivel KYC/KYB. |
| Comisiones mezcladas | Problemas fiscales | Ledger separado por fee, comision, spread, impuestos y ajuste. |
| Beneficiarios no validados | Fraude/remesa a tercero riesgoso | Beneficiario guardado, validacion segun monto y listas de riesgo. |
| Operacion offline | Perdida de control | Modo offline no permitido en MVP; si existe futuro, requiere limites y sincronizacion firmada. |
| Admin con demasiado poder | Riesgo interno | RBAC, 4-eyes approval para ajustes criticos y auditoria inmutable. |

---

## Chat Seguro

El chat sirve para coordinar, no para recolectar documentos sin control.

Permitido:

- Confirmar llegada.
- Coordinar lugar de atencion.
- Avisar retraso.
- Reportar problema.
- Pedir soporte.

No permitido como flujo principal:

- Fotos de identidad sueltas.
- Capturas bancarias sin formulario.
- Datos personales fuera de campos controlados.
- Direcciones residenciales expuestas.

Si el aliado necesita soporte fiscal adicional, se usa formulario seguro dentro de la orden.

---

## Fiscal Y Cumplimiento

Cada Aliado Deco debe tener un centro de cumplimiento.

Debe guardar por operacion:

- Codigo de operacion.
- Fecha y hora.
- Pais, ciudad y zona.
- Tipo de operacion.
- Monto fiat.
- Monto cripto/saldo.
- Tasa usada.
- Fee Deco.
- Comision del aliado.
- Aliado Deco responsable.
- Identificador fiscal del aliado.
- Contraparte segun nivel KYC permitido.
- Estado.
- Comprobante.
- Notas internas.
- Formularios seguros asociados.

Exportables:

- PDF por operacion.
- CSV mensual.
- Reporte fiscal mensual.
- Resumen por contraparte.
- Total volumen procesado.
- Total ingresos por comisiones.
- Historial de remesas.

---

## Formularios Seguros

Los formularios seguros reemplazan pedir documentos por chat.

Tipos de formulario:

- Soporte fiscal del aliado.
- Declaracion de origen de fondos.
- Comprobante bancario.
- Comprobante de entrega.
- Datos de beneficiario.
- Reporte de incidente.
- Evidencia de disputa.

Reglas:

- Cada formulario pertenece a una orden.
- Cada campo tiene proposito legal/operativo.
- El usuario ve por que se solicita.
- El archivo o dato expira si ya no es necesario.
- El aliado solo ve lo estrictamente necesario.
- Admin/riesgo puede ver mas datos segun rol.
- Todo acceso queda auditado.

---

## Contratos Con Microservicios Y Admin Panel

Este frontend necesita que microservicios y admin panel expongan contratos claros.

Endpoints o dominios esperados:

- Cotizacion: pais origen, pais destino, monto, moneda, metodo y usuario.
- Aliados cercanos: ubicacion aproximada, servicio, horario, limites y disponibilidad.
- Ordenes: crear, aceptar, cancelar, confirmar, disputar, reenrutar y cerrar.
- Rutas: calcular, reservar, ejecutar y fallar con razon.
- KYC/KYB: nivel, permisos, restricciones y paises habilitados.
- Riesgo: score, alertas, limites y reglas por corredor.
- Ledger: movimientos, hold, fees, comisiones y settlement.
- Chat: mensajes permitidos, adjuntos bloqueados y formularios seguros.
- Reportes: exportar PDF/CSV, resumen fiscal y contrapartes permitidas.
- Auditoria: eventos de estado, IP/dispositivo, actor y cambios criticos.

Eventos importantes:

- `point.order.created`
- `point.order.accepted`
- `point.order.funded`
- `point.route.reserved`
- `point.destination.accepted`
- `point.order.delivered`
- `point.order.settled`
- `point.order.disputed`
- `point.order.refunded`
- `point.order.rerouted`
- `point.risk.blocked`
- `point.report.generated`

---

## Visibilidad Publica Vs Login

| Elemento | Publico | Login |
|---|---|---|
| Que es Red Deco | Si | Si |
| Beneficios generales | Si | Si |
| Lista aproximada de zonas | Si | Si |
| Aliados cercanos exactos | No | Si |
| Direccion exacta | No | Solo orden aceptada |
| Liquidez exacta del aliado | No | Solo internamente |
| Crear operacion | No | Si |
| Ver tasas estimadas | Si | Si |
| Bloquear tasa | No | Si |
| Chat | No | Si |
| Reportes fiscales | No | Aliado autenticado |
| Datos de contraparte | No | Segun permisos y ley |

---

## Componentizacion Esperada

Carpeta propuesta:

`components/red-deco/`

Componentes:

- `red-deco-data.ts`
- `red-deco-hero.tsx`
- `red-deco-service-card.tsx`
- `red-deco-nearby-list.tsx`
- `red-deco-route-card.tsx`
- `red-deco-fee-summary.tsx`
- `red-deco-order-card.tsx`
- `red-deco-safety-panel.tsx`
- `red-deco-compliance-panel.tsx`
- `red-deco-partner-levels.tsx`
- `red-deco-dashboard-shell.tsx`
- `red-deco-reports-table.tsx`
- `red-deco-secure-form.tsx`

Regla: no hardcodear cada pagina; usar data compartida y componentes reutilizables.

---

## UI Y Estilo

- Mantener estilo aprobado en Home, P2P, Market Maker, Bolsillito y Rendimiento.
- Nada de bordes naranjas pesados en cards de seleccion.
- Cards compactas, rectangulares y claras.
- Textos cortos, comerciales y operativos.
- Botones claros: buscar aliado, crear orden, aceptar, confirmar, reportar.
- Para mapa/lista: priorizar lista primero; mapa puede ser fase posterior.
- Si hay GPS: explicar con microcopy breve por privacidad y seguridad.
- Usar etiquetas: `Disponible`, `Cerca`, `Horario`, `Verificado`, `Limite`, `Fee`.

---

## Copy Base

### Usuario

Titulo:

`Red Deco`

Subtitulo:

`Deposita, retira y envia dinero con aliados verificados cerca de ti.`

CTA:

`Buscar aliado cercano`

### Aliado

Titulo:

`Conviertete en Aliado Deco`

Subtitulo:

`Gana comisiones atendiendo depositos, retiros y remesas desde tu comercio o cuenta verificada.`

CTA:

`Solicitar activacion`

### Seguridad

`Tu direccion exacta y los datos sensibles solo se muestran cuando la operacion esta aceptada y protegida.`

### Fiscal

`Cada operacion genera comprobante y registro para facilitar reportes contables y tributarios.`

---

## Backend Futuro

Servicios necesarios:

- KYC/KYB.
- GPS y geocoding.
- Ordenes presenciales.
- Caja y liquidez por aliado.
- Motor de rutas.
- Tasas y fees.
- Bloqueo temporal de tasa.
- Chat seguro.
- Formularios seguros.
- Reportes fiscales.
- Disputas.
- AML/riesgo.
- Notificaciones.
- Auditoria.

Entidades base:

- `Point`
- `PointOperator`
- `PointLevel`
- `PointService`
- `PointLiquidity`
- `PointOrder`
- `PointRoute`
- `PointFee`
- `PointReport`
- `PointDispute`
- `SecureForm`
- `CounterpartyRecord`

Nota tecnica: las entidades `Point*` son nombres internos heredables para microservicios. No son marca visible al usuario. En UI, ayuda, marketing y navegacion se debe usar `Red Deco` o `Aliado Deco`.

Guia de marca complementaria: `docs/red-deco-taxonomy.md`.

---

## Fases

### Fase 1 - Plan y arquitectura visual

- [x] Definir vision del producto.
- [x] Definir ubicacion en menus y rutas.
- [x] Separar experiencia usuario y aliado.
- [x] Definir servicios MVP.
- [x] Definir seguridad, fiscal y cumplimiento.
- [x] Auditar flujo internacional entre paises.
- [x] Definir estados canonicos de orden.
- [x] Definir ledger, conciliacion y roles.
- [x] Documentar debilidades y mitigaciones de seguridad.
- [x] Documentar contratos esperados para microservicios/admin panel.
- [x] Crear plan maestro.

### Fase 2 - Frontend publico usuario

- [x] Crear `/bolsillito/red-deco`.
- [x] Crear hero dashboard landing.
- [x] Crear cards de servicios: deposito, retiro, remesa.
- [x] Crear buscador mock de aliados cercanos.
- [x] Crear lista de aliados con zona, horario, limites y estado.
- [x] Crear simulador simple de monto, tasa y fee.
- [x] Crear panel de seguridad.

### Fase 3 - Flujos usuario

- [x] Crear `/bolsillito/red-deco/deposit`.
- [x] Crear `/bolsillito/red-deco/withdraw`.
- [x] Crear `/bolsillito/red-deco/remittance`.
- [x] Crear `/bolsillito/red-deco/nearby`.
- [x] Crear resumen de orden mock.
- [x] Crear estado de tasa bloqueada mock.
- [x] Crear comprobante mock.

### Fase 4 - Frontend aliado

- [x] Crear `/earn/aliado-deco`.
- [x] Crear seccion comercial de beneficios.
- [x] Crear niveles: persona, comercio, empresa, mesa.
- [x] Crear ganancias estimadas.
- [x] Crear requisitos y permisos.
- [x] Crear CTA de solicitud.

### Fase 5 - Consola aliado mock

- [x] Crear `/earn/aliado-deco/dashboard`.
- [x] Crear ordenes pendientes.
- [x] Crear ordenes en curso.
- [x] Crear historial.
- [x] Crear caja y liquidez declarada.
- [x] Crear ganancias del dia.
- [x] Crear estados de disputa.

### Fase 6 - Reportes y cumplimiento

- [x] Crear `/earn/aliado-deco/reports`.
- [x] Crear tabla de operaciones.
- [x] Crear resumen fiscal mensual.
- [x] Crear exportables mock PDF/CSV.
- [x] Crear `/earn/aliado-deco/compliance`.
- [x] Crear formulario seguro mock.
- [x] Crear reglas de datos sensibles.

### Fase 7 - Integraciones de navegacion

- [x] Agregar Red Deco al menu de Bolsillito.
- [x] Agregar Aliado Deco al menu de Ganar.
- [x] Conectar con Remesas.
- [x] Conectar con P2P como operador cercano.
- [x] Conectar con Assets como metodo fisico.
- [x] Conectar Footer.
- [x] Conectar Help Center/Legales cuando existan.

### Fase 8 - QA visual y tecnico

- [ ] Revisar desktop.
- [ ] Revisar mobile.
- [ ] Revisar light/dark si aplica.
- [ ] Revisar textos largos.
- [x] Revisar rutas 200.
- [x] Ejecutar typecheck.
- [x] Ejecutar build.
- [ ] Actualizar README.
- [ ] Actualizar CHANGELOG.
- [ ] Actualizar version si corresponde.

---

## Preguntas Abiertas

- Nombre final de red fisica: `Red Deco` aprobado como separacion de `Puntos Deco / Deco Points`.
- Si el usuario final vera mapa desde MVP o solo lista por zona.
- Que paises arrancan primero: Colombia, Mexico, Peru, Venezuela, Republica Dominicana.
- Limites iniciales por pais y nivel.
- Si remesa internacional en MVP sera solo mock visual o flujo completo.
- Como se presentara la tasa: tasa Deco, tasa P2P, tasa aliado o mejor ruta.
- Si Aliado Deco debe tener contrato comercial antes de operar.
- Que datos fiscales son visibles para el aliado segun pais.
- Que formularios seguros son obligatorios por monto.
- Si se permite aliado persona sin local fisico o solo comercios verificados.

---

## Estado

Plan renombrado y primera implementacion MVP en curso con rutas Red Deco y Aliado Deco.

