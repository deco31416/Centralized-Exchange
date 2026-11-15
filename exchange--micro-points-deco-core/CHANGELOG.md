# Changelog
## [Unreleased]

### Documentación y publicación
- Se documentan el estado de prototipo inicial, el mapa de dependencias y los límites de integración de este componente.
- Se añaden enlaces al mapa general y criterios para no declarar capacidad sin pruebas reproducibles.

### Seguridad
- Se actualizan exclusiones locales y la plantilla de entorno para mantener credenciales fuera del repositorio.


## [0.1.27] - 2026-07-07

### Añadido

- Entidad `PointSecureForm` para soportes estructurados de origen de fondos,
  identidad, soporte fiscal, disputas y evidencia de proveedor.
- Endpoints `GET /points-deco/forms`, `POST /points-deco/forms` y
  `POST /points-deco/forms/:id/review` para crear y revisar formularios
  seguros.

### Seguridad

- Cada formulario exige consentimiento, sanea campos recibidos, guarda solo
  referencias de evidencia y registra `auditTrail`.
- Los endpoints se mantienen protegidos por `InternalAuthGuard`; acciones admin
  deben pasar por Gateway Admin y controles del Admin Panel.

## [0.1.26] - 2026-07-07

### Añadido

- Endpoints `GET /points-deco/reports/audit-export` y
  `GET /points-deco/reports/audit-export.csv` para exportar una vista de
  auditoria por orden.
- El export cruza orden, movimientos de caja, liquidacion, disputa y accion
  economica asociada sin exponer documentos sensibles.

### Seguridad

- El export se genera desde Mongo persistente y permanece protegido por
  `InternalAuthGuard`; su consumo administrativo debe pasar por Gateway Admin.

## [0.1.25] - 2026-07-07

### Añadido

- Endpoint `GET /points-deco/orders/:id/receipt.pdf` para descargar el
  comprobante operativo de una orden Puntos Deco.
- Servicio `PointsDecoReceiptPdfService` para generar PDF auditable sin
  dependencias externas.
- Endpoints `GET /points-deco/reports/monthly` y
  `GET /points-deco/reports/monthly.csv` para resumen mensual por Punto Deco,
  moneda y estado.

### Seguridad

- Los reportes y PDF se construyen desde datos persistentes y mantienen el
  acceso protegido por `InternalAuthGuard`; el consumo administrativo sigue
  pasando por Gateway Admin.

## [0.1.24] - 2026-07-05

### Añadido

- Integración previa con `custody-fiat` para registrar intención de liquidación
  fiat antes de ejecutar `release_to_point` sin hold confirmado.
- Nuevo adapter `PointsDecoCustodySettlementService` con idempotency key
  `points-deco:{actionId}:custody-settlement-intent:v1`.
- Smoke test actualizado para cubrir la intención de custodia antes del payout
  contable por ledger.

### Seguridad

- Si `custody-fiat` no registra la intención, la acción económica permanece en
  cola de revisión y no aplica el ledger payout.
- La liquidación real por proveedor sigue pendiente; esta fase solo deja
  intención auditable y reconciliable.

## [0.1.23] - 2026-07-05

### Añadido

- Adapter ledger para `release_to_point` sin hold confirmado.
- `execute` ahora liquida `non_hold_point_payout` contra la cuenta sistema del
  Punto Deco en `wallet-ledger-core`.
- Smoke test ampliado para cubrir `refund_user`, `release_to_point` y rechazo
  controlado de acciones economicas.

### Seguridad

- `release_to_point` exige `pointId`, moneda de origen y monto de origen antes
  de solicitar mutacion contable.
- La liquidacion es contable interna; la salida real por custodia/proveedor
  sigue separada, auditada y reconciliable.

## [0.1.22] - 2026-07-05

### Añadido

- Adapter automatico inicial para acciones economicas sin hold confirmado.
- `execute` ahora intenta aplicar `refund_user` seguro contra
  `wallet-ledger-core` mediante
  `POST /internal/ledger/points-deco/economic-actions`.
- Idempotency key estable por accion economica:
  `points-deco:{actionId}:ledger-economic-action:v1`.
- Smoke test actualizado para validar ejecucion por adapter ledger.

### Seguridad

- Solo se automatiza `non_hold_refund` hacia wallet de usuario.
- `release_to_point` permanece en cola manual hasta que cada Punto Deco tenga
  cuenta de liquidacion/custodia configurada.

## [0.1.21] - 2026-07-05

### Añadido

- Transiciones administrativas para acciones economicas sin hold confirmado:
  `queue`, `execute` y `reject`.
- Endpoints internos `POST /points-deco/economic-actions/:id/queue`,
  `POST /points-deco/economic-actions/:id/execute` y
  `POST /points-deco/economic-actions/:id/reject`.
- Campos de revision, ejecucion, rechazo, referencia operativa y `auditTrail`
  para trazabilidad de cada accion economica.
- Pruebas smoke para cola, ejecucion con evidencia y rechazo controlado.

### Seguridad

- Las transiciones solo cambian estado operativo auditado. La mutacion real de
  saldos/custodia sigue separada y debe ejecutarse por contratos controlados de
  ledger, custodia o proveedor.

## [0.1.20] - 2026-07-05

### Añadido

- Coleccion `points_deco_economic_actions` para registrar ajustes economicos
  de disputas cuando no existe un hold confirmado que pueda liberarse o
  capturarse de forma automatica.
- Endpoint interno `GET /points-deco/economic-actions` para que Gateway Admin
  pueda listar acciones pendientes por disputa, orden, punto, usuario, estado o
  resolucion.
- Prueba smoke para `refund_user` sin hold confirmado, dejando una accion
  economica `pending_review`.

### Seguridad

- `refund_user` y `release_to_point` siguen sin mover dinero cuando no hay hold
  confirmado; ahora dejan una accion auditable para revision de custodia/ledger.
- Las acciones economicas quedan idempotentes por disputa y resolucion para
  evitar duplicar solicitudes operativas ante reintentos.

## [0.1.19] - 2026-07-03

### Añadido

- Ejecutores controlados para resoluciones `refund_user` y `release_to_point`
  aprobadas por maker-checker.
- Pruebas smoke para reembolso por liberacion de hold y liberacion al Punto
  Deco por captura de hold.

### Seguridad

- `refund_user` solo libera holds confirmados en `wallet-ledger-core` y cancela
  la orden; si no existe hold seguro, la disputa queda en revision
  administrativa.
- `release_to_point` solo captura holds confirmados y mueve la orden a
  `settlement_pending`; la conciliacion final sigue separada del executor.
- Los reembolsos o liquidaciones sin hold no se ejecutan automaticamente hasta
  conectar flujos dedicados de custodia/ledger.

## [0.1.18] - 2026-07-03

### Añadido

- Ejecutor real controlado para resoluciones `cancel_order` aprobadas por
  maker-checker.
- Metodo operacional `cancelAfterApprovedDispute` para cancelar ordenes en
  disputa sin reabrir el flujo normal de usuario.
- Estados de ejecucion `executed_cancelled` y `failed_review_required`.

### Seguridad

- `cancel_order` delega la liberacion de hold al flujo idempotente de
  `wallet-ledger-core` cuando la orden lo requiere.
- No se permite cancelar por executor una orden `completed` o `expired`.
- Si ledger no puede liberar de forma segura, la disputa queda en revision
  administrativa y no continua con mutaciones economicas.

## [0.1.17] - 2026-07-03

### Añadido

- Endpoint interno `POST /points-deco/disputes/:id/execute-resolution`.
- Estado de ejecucion controlada para resoluciones de disputa:
  `not_started`, `queued_for_executor`, `executed_noop` y `blocked`.
- Plan idempotente de ejecucion segun resolucion aprobada:
  reembolso, liberacion al punto, cancelacion, revision manual o sin accion.

### Seguridad

- `execute-resolution` solo acepta disputas resueltas y aprobadas por
  maker-checker.
- El endpoint no mueve fondos directamente; deja trazabilidad para que el
  ejecutor downstream de ledger/custodia/conciliacion aplique el movimiento con
  sus controles.

## [0.1.16] - 2026-07-03

### Añadido

- Flujo maker-checker para resoluciones de disputas Puntos Deco.
- Endpoints internos `POST /points-deco/disputes/:id/approve-resolution` y
  `POST /points-deco/disputes/:id/reject-resolution`.
- Metadatos de doble control en disputas: maker, checker, notas, estado de
  aprobacion y fecha de aplicacion controlada.

### Seguridad

- El mismo administrador que prepara una resolucion no puede aprobarla como
  checker.
- La aprobacion maker-checker no mueve saldos por si sola; solo habilita el
  siguiente ejecutor controlado de ledger/custodia/conciliacion.

## [0.1.15] - 2026-07-03

### Añadido

- Servicio `PointsDecoDisputeService` para separar revision, resolucion y
  rechazo de disputas del flujo principal de ordenes.
- Endpoints internos `GET /points-deco/disputes/:id`,
  `POST /points-deco/disputes/:id/review`,
  `POST /points-deco/disputes/:id/resolve` y
  `POST /points-deco/disputes/:id/reject`.
- Contexto operativo en cada disputa: punto, usuario, tipo de orden, monedas,
  montos, rol de apertura, SLA, evidencia y auditoria.

### Seguridad

- Resolver una disputa no mueve dinero ni cambia custodia de forma automatica;
  deja una decision auditada para aplicar por maker-checker y conciliacion.

## [0.1.14] - 2026-07-03

### Añadido

- Servicio `PointsDecoReportService` para separar reportes fiscales del service
  principal.
- Endpoint `GET /points-deco/reports/fiscal` con resumen administrativo desde
  liquidaciones reales.
- Endpoint `GET /points-deco/reports/fiscal.csv` para exportar liquidaciones en
  CSV con diferencias, ledger, aprobacion y estado fiscal.

### Cambiado

- `GET /points-deco/reports` ahora devuelve catalogo de reportes desde el
  servicio especializado, evitando una segunda fuente de verdad.

## [0.1.13] - 2026-07-03

### Añadido

- Publicacion de conciliacion final balanceada hacia
  `exchange--micro-audit-fiat-flows`.
- Registro de esperado vs real, diferencias, estado de ledger, aprobacion y
  estado fiscal mediante
  `POST /api/v1/audit-fiat-flows/reconciliation/points-deco`.

### Seguridad

- Si auditoria fiat no responde durante el cierre, la orden puede quedar
  completada pero el resultado devuelve `fiatReconciliation.status =
  review_required` para seguimiento administrativo.

## [0.1.12] - 2026-07-02

### Añadido

- Servicio de conciliacion y liquidacion de ordenes Puntos Deco.
- Coleccion `points_deco_settlements` para registrar diferencias de origen,
  destino, estado de ledger, aprobacion y estado de reporte fiscal.
- Endpoints internos `GET /points-deco/settlements` y
  `GET /points-deco/orders/:id/settlement`.
- Validacion de cierre: `complete-settlement` solo marca la orden como
  completada cuando la conciliacion queda balanceada.

### Seguridad

- Las ordenes con diferencias de caja, ledger sin captura, limites pendientes o
  disputa quedan en `review_required` y requieren revision administrativa antes
  de cierre final.

## [0.1.11] - 2026-07-02

### Añadido

- Cliente interno para `exchange--micro-pricing-fee-fiat` en cotizaciones de
  Puntos Deco.
- Soporte para cotizar pares fiat y rutas fiat contra stablecoin usando USD
  como referencia operativa de USDT/USDC.
- Metadatos de pricing en la orden: fuente, operacion, corredor, metodo y
  warning cuando se usa fallback.

### Seguridad

- Si pricing fiat no responde, la cotizacion queda marcada como
  `local-fallback`; la operacion no se cae, pero admin/auditoria puede detectar
  que no vino de pricing real.

### Cambiado

- Documentado `PRICING_FIAT_SERVICE_URL` con el puerto local real de
  `exchange--micro-pricing-fee-fiat` (`3014`).

## [0.1.10] - 2026-07-02

### Añadido

- Resumen interno de caja por Punto Deco y moneda con entradas, salidas y
  saldos fisicos.
- Comprobantes operativos JSON por orden desde movimientos de caja, estado de
  ledger y auditoria de la orden.
- Listado administrativo de comprobantes para conciliacion posterior.

### Seguridad

- Los comprobantes son evidencia operativa y no se presentan como recibos
  fiscales definitivos hasta conectar exportacion y aprobacion administrativa.

## [0.1.9] - 2026-07-02

### Añadido

- Cliente interno para `exchange--micro-audit-fiat-flows`.
- Envio de evidencia fiat al confirmar `cash_received` y `cash_delivered`.
- Respuesta `fiatAudit` en confirmaciones de efectivo para saber si la
  evidencia fue registrada o requiere revision administrativa.

### Seguridad

- Si auditoria fiat no responde, la orden no se cae, pero la respuesta queda
  marcada como `review_required` para conciliacion posterior.

## [0.1.8] - 2026-07-02

### Añadido

- Caja fisica interna por Punto Deco y moneda en
  `points_deco_cash_positions`.
- Movimientos auditables de caja en `points_deco_cash_movements`.
- Endpoints internos para listar posiciones, listar movimientos, ajustes
  manuales y cierre diario de caja.
- Registro automatico de entrada de efectivo al confirmar `cash_received`.
- Registro automatico de salida de efectivo al confirmar `cash_delivered`.
- Smoke test para entrada/salida de caja y bloqueo de saldo fisico negativo.

### Seguridad

- La caja real del punto queda solo para operacion/admin; el usuario final solo
  debe ver rangos seguros de liquidez.
- No se permite dejar saldos fisicos negativos en movimientos de salida.

## [0.1.7] - 2026-07-02

### Añadido

- Cliente interno para `exchange--micro-wallet-ledger-core`.
- Hold automatico de ledger para ordenes `cash_out` y `remittance` despues de
  crear la orden persistente.
- Persistencia de estado de hold: moneda, monto en minor units, evento, tx,
  error y timestamp.
- Endpoints para confirmar efectivo recibido, efectivo entregado y completar
  settlement.

### Seguridad

- Una orden que requiere hold no puede ser aceptada si el ledger no confirma
  `held`.
- Cancelar una orden con hold confirmado intenta liberar ledger antes de marcar
  la orden como cancelada.
- Confirmar efectivo entregado captura el hold y deja la orden en
  `settlement_pending`.

## [0.1.6] - 2026-07-02

### Añadido

- Maquina de estados para ordenes de Puntos Deco.
- Endpoints para aceptar orden, revelar ubicacion protegida, check-in,
  confirmar codigo, cancelar y abrir disputa.
- Auditoria basica por transicion en `auditTrail` de la orden.
- Timestamps operativos por estado: aceptacion, ubicacion revelada, check-in,
  codigo confirmado, cancelacion y disputa.

### Seguridad

- La aceptacion de una orden queda bloqueada si `limits-policy/precheck`
  devolvio `REVIEW` o requiere aprobacion administrativa.
- Estados terminales no pueden seguir operando salvo disputa posterior a
  completado.

## [0.1.5] - 2026-07-02

### Añadido

- Cliente interno para `exchange--micro-limits-policy`.
- Precheck de limites antes de crear ordenes de Puntos Deco.
- Persistencia de decision de limites, version de politica, aprobacion requerida
  y siguiente accion operativa en cada orden.

### Seguridad

- `BLOCK` rechaza la orden antes de persistir.
- `REVIEW` permite crear la orden solo como pendiente de aprobacion antes de
  ledger, custodia o movimiento de efectivo.

## [0.1.4] - 2026-06-28

### Añadido

- Smoke script runtime para validar health, endpoints protegidos y rutas por
  Gateway Admin/User sin modificar credenciales MongoDB/Redis.

## [0.1.3] - 2026-06-28

### Añadido

- Middleware de logs estructurados por request con `requestId`, ruta, estado y
  duracion.
- Propagacion de `x-request-id`/`x-correlation-id` desde gateways.

## [0.1.2] - 2026-06-28

### Añadido

- Swagger/OpenAPI disponible solo en ambientes distintos de `production`.
- Dependencia `@nestjs/swagger` para documentacion developer del micro.

## [0.1.1] - 2026-06-28

### Añadido

- Smoke test del contrato principal de cotizacion, listado cercano y politicas
  de privacidad de ubicacion.
- Log de arranque del micro con puerto, prefijo y ambiente.

### Corregido

- Filtro de servicios de Puntos Deco para aceptar valores como `cash_in` sin
  romper por normalizacion de mayusculas.

### Documentado

- Siguiente fase: publicar repo privado y agregar Swagger/OpenAPI solo en
  desarrollo.

## [0.1.0] - 2026-06-27

### Añadido

- Skeleton inicial de `exchange--micro-points-deco-core`.
- Healthcheck, auth interna, contratos iniciales y documentacion.
- Modelos base para puntos, ordenes y disputas.
- Separacion explicita: Puntos Deco es linea propia y P2P/Remesas/Bolsillito
  son dominios complementarios.
