# Technical Debt Register

## BUY-EXECUTION-001 — PARCIALMENTE CERRADA (2026-05-09)

### Cerrado
- Gateway user con proxy operativo para funding: route funding/** en proxy controller y forwarding habilitado en proxy service.
- BFF smart route operativa: app/api/easy-crypto/buy/[[...path]]/route.ts.
- Resolucion server-side de walletId antes de crear/confirmar intencion de compra.
- Servicio cliente de compra creado: services/EasyCryptoBuyService.ts.
- Selector de metodos de pago conectado a API real de funding/methods.
- Flujo de estado de compra conectado en UI: IDLE -> CREATING_INTENT -> INTENT_READY -> CONFIRMING -> COMPLETED/FAILED.
- Hook useBuyQuote con debounce de 800ms.
- BuyQuotePreviewCard con countdown en vivo y callback onExpired.

### Bloqueante pendiente
- Codigo: FUNDING-PAYMENTS-ADAPTER-001.
- Problema: payments-core (:9000) no expone endpoints /payments/intent, /payments/quote, /payments/confirm.
- Efecto: funding-core PaymentGatewayAdapter responde BadGatewayException en intent/confirm cuando llama a payments-core.
- Impacto funcional: GET funding/methods funciona; compra end-to-end no completa hasta habilitar esos endpoints.

### Cierre total requerido
- Implementar /payments/intent, /payments/quote y /payments/confirm en Exchange--micro-payments-core.
- Alternativa: reemplazar adapter de funding-core por integration real equivalente con contrato compatible.
- Revalidar flujo completo desde deco-exchange buy page hasta funding-core confirm.

## BUY-QUOTE-DEBOUNCE-001 — CERRADA (2026-05-09)
- Estado: cerrado.
- Evidencia: hooks/use-buy-quote.ts aplica debounce de 800ms antes de solicitar cotizacion.

## BUY-QUOTE-COUNTDOWN-001 — CERRADA (2026-05-09)
- Estado: cerrado.
- Evidencia: components/trading-actions/BuyQuotePreviewCard.tsx implementa countdown en vivo y onExpired.

## BUY-ASSET-CATALOG-001 — PARCIAL (2026-05-08)
- Estado: parcial.
- Avance: /easy-crypto/buy consume assets desde /api/prices/all con metadata (canBuy, category, iconUrl) y ya no queda restringido a BTC.
- Pendiente: publicar estado de aprobación comercial explícito por asset para evitar reglas implícitas por category/canBuy.

## BUY-FIAT-CATALOG-001 — PARCIAL (2026-05-08)
- Estado: parcial.
- Avance: fiat selector usa catálogo real de precios y separa activos internos por tipo en UI.
- Pendiente: BLC requiere pricing en tiempo real para habilitar cotización/selección operativa.

## BUY-PAYMENT-METHODS-CATALOG-001 — PARCIAL (2026-05-08)
- Estado: parcial.
- Avance: funding-core /funding/methods acepta filtros fiat/country y devuelve catálogo operativo por región (MX/CO/VE/PE/BR/AR/CL/US/EU/GB/SV).
- Pendiente: migrar de adapter mock a integración persistente (DB o provider real) y versionado de catálogo.

## BUY-ASSET-LOGOS-001 — OPERATIVA (2026-05-08)
- Estado: operativa.
- Evidencia: dropdowns y quote preview de buy usan logo redondo con fallback reusable (sin src vacíos).

## BLC-INTERNAL-UNIT-001 — PARCIAL (2026-05-08)
- Estado: parcial.
- Avance: BLC agregado en asset-registry como unidad interna representativa (category INTERNAL, isInternal true, canWithdraw false).
- Restricción: no se expone como fiat legal ni habilita retiro externo.
- Pendiente: feed de precio para operaciones de compra/cotización cuando negocio lo apruebe.

## BLC-LOGO-001 — OPERATIVA (2026-05-08)
- Estado: operativa.
- Evidencia: existe asset físico en public/images/logos/stablecoin/blc-deco-exchange-credit-logo.svg y está cableado en catálogo y fallback local.

## BUY-DROPDOWN-OUTSIDE-CLICK-001 — OPERATIVA (2026-05-08)
- Estado: operativa.
- Evidencia: AssetAmountInput agrega pointerdown/escape con cierre por click outside y roles de accesibilidad.

## FUNDING-METHODS-COUNTRY-CATALOG-001 — OPERATIVA (2026-05-08)
- Estado: operativa.
- Evidencia: funding-core expone catálogo por país/fiat para MX, CO, VE, PE, BR, AR, CL, US, EU, UK, SV con flags administrativos e internos.

## FUNDING-METHODS-ADMIN-001 — OPERATIVA BACKEND (2026-05-09)
- Estado: operativa backend.
- Avance: funding-core publica endpoints admin para CRUD de métodos y revisión de solicitudes BLC; gateway-admin expone contrato canonico /admin/funding/* con guard admin.
- Pendiente: panel admin visual dedicado y migración de persistencia a DB formal (actualmente persistencia en archivo local).

## BLC-DEV-TOPUP-001 — OPERATIVA (2026-05-09)
- Estado: operativa.
- Avance: /dashboard wallet usa BFF dedicado /api/wallet/blc/dev-topup, gateway-user propaga x-user-id y funding-core acredita en wallet-ledger.
- Avance: sin sesión responde 401; en development acredita saldo BLC real y devuelve tx de wallet-ledger.
- Alcance: no visible en /easy-crypto/buy; bloqueado en producción salvo flag explícito BLC_DEV_TOPUP_ENABLED.

## BLC-MANUAL-DEPOSIT-REQUEST-001 — OPERATIVA BACKEND (2026-05-09)
- Estado: operativa backend.
- Avance: creación de solicitudes manuales PENDING_REVIEW, consulta por usuario y notificación admin best-effort.
- Avance: aprobación admin intenta acreditación real en wallet-ledger; si falla, la solicitud queda NEEDS_MORE_INFO para evitar aprobación silenciosa sin crédito.

## BLC-DASHBOARD-WALLET-001 — PARCIAL (2026-05-09)
- Estado: parcial.
- Evidencia: card BLC en tab Wallet con badge Unidad interna, copy de saldo interno y botón Cargar BLC.
- Evidencia: modal BLC refresca balances al éxito y muestra error real cuando falla.
- Pendiente: validación browser autenticada end-to-end pendiente en entorno QA (la sesión no estuvo disponible durante la auditoría runtime).

## BLC-PRICING-FEED-001 — PARCIAL (2026-05-09)
- Estado: parcial.
- Avance: buy tiene fallback visual para BLC en catálogo de activos.
- Pendiente: exponer BLC como activo interno en /api/prices/all de forma nativa desde servicios de pricing.

## FUNDING-METHODS-ADMIN-UI-001 — ABIERTA (2026-05-09)
- Estado: abierta.
- Problema: endpoints admin de funding y BLC están operativos, pero no existe panel visual admin dedicado en frontend para su gestión.

## BLC-ADMIN-UI-001 — ABIERTA (2026-05-09)
- Estado: abierta.
- Problema: no existe UI admin para operar estados de solicitudes BLC (approve/reject/needs-more-info) ni para gestión de métodos de depósito BLC.

## BLC-STORE-PERSISTENCE-001 — ABIERTA (2026-05-09)
- Estado: abierta.
- Problema: funding-core mantiene métodos/solicitudes BLC en archivo local (blc-deposit-store.json), sin persistencia corporativa transaccional.
- Riesgo: consistencia limitada en despliegues multi-instancia.

## BLC-ADMIN-CONFIG-001 — PARCIAL (2026-05-08)
- Estado: parcial.
- Avance: endpoints admin para habilitar/deshabilitar/editar métodos BLC y aprobar/rechazar solicitudes.
- Pendiente: enforcement de permisos granulares por rol admin y auditoría persistente de nivel corporativo.

## WALLET-FIAT-CATALOG-DUPLICATION-001 — ABIERTA (2026-05-08)
- Estado: abierta.
- Problema: wallet dashboard sigue usando SUPPORTED_CURRENCIES hardcodeado en components/dashboard/constants.ts.
- Riesgo: divergencia de catálogo frente a asset-registry/pricing.
