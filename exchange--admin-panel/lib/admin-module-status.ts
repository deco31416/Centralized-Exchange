export type ConnectionState = "connected" | "partial" | "pending"

export type MicroserviceBuildStatus = "created" | "missing" | "gateway_pending" | "gateway_connected"

export type AdminMicroserviceStatus = {
  name: string
  repo: string
  status: MicroserviceBuildStatus
  gatewayRoute?: string
  nextStep: string
}

export type AdminModuleStatus = {
  name: string
  description: string
  gateway: string
  state: ConnectionState
  percent: number
  microservices: AdminMicroserviceStatus[]
}

export const adminModuleStatuses: AdminModuleStatus[] = [
  {
    name: "Autenticación admin",
    description: "Login, OTP, sesión, roles y usuarios administrativos.",
    gateway: "Gateway admin",
    state: "connected",
    percent: 100,
    microservices: [
      {
        name: "Auth admin",
        repo: "exchange--micro-auth-admin",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/auth, /api/v1/auth/verify-token",
        nextStep: "Mantener roles, sesiones y auditoría de acceso.",
      },
    ],
  },
  {
    name: "Usuarios y roles",
    description: "Admins, roles y usuarios finales conectados; tier/VIP queda pendiente de perfil financiero.",
    gateway: "Gateway admin",
    state: "partial",
    percent: 88,
    microservices: [
      {
        name: "Auth admin",
        repo: "exchange--micro-auth-admin",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/admins, /api/v1/roles, /api/v1/sessions",
        nextStep: "Conectar edición completa y trazabilidad de cambios.",
      },
      {
        name: "Auth user",
        repo: "exchange--micro-auth",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/internal/users, /api/v1/internal/users/:id/profile",
        nextStep: "Agregar tier operativo, VIP e historial de sesiones de clientes.",
      },
    ],
  },
  {
    name: "Dashboard operativo",
    description: "Conteos de usuarios, ledger, P2P y KYC/riesgo agregados; faltan series históricas reales.",
    gateway: "Gateway admin",
    state: "partial",
    percent: 68,
    microservices: [
      {
        name: "Dashboard analytics",
        repo: "exchange--micro-admin-analytics",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/admin-analytics",
        nextStep: "Agregar series históricas, volumen USD y revenue desde eventos reales.",
      },
      {
        name: "Wallet ledger",
        repo: "exchange--micro-wallet-ledger-core",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/wallet/wallets",
        nextStep: "Exponer agregados reales para series históricas del dashboard.",
      },
    ],
  },
  {
    name: "Catálogo de activos",
    description: "Catálogo, activos fiat/crypto y canales de fondeo conectados; pares/redes operativas siguen pendientes.",
    gateway: "Gateway admin",
    state: "partial",
    percent: 86,
    microservices: [
      {
        name: "Asset registry",
        repo: "exchange--micro-asset-registry",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/catalog",
        nextStep: "Completar pares, redes, auditoría de cambios y validaciones avanzadas del catálogo.",
      },
    ],
  },
  {
    name: "Wallet ledger",
    description: "Wallets fiat/crypto, balances y ledger conectados; custodia hot/cold y reconciliación quedan pendientes.",
    gateway: "Gateway admin",
    state: "partial",
    percent: 80,
    microservices: [
      {
        name: "Wallet ledger",
        repo: "exchange--micro-wallet-ledger-core",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/wallet/wallets, /api/v1/wallet/admin/transactions",
        nextStep: "Agregar agregados por estado, reconciliación y reportes exportables.",
      },
      {
        name: "Custodia crypto",
        repo: "exchange--micro-custody-crypto",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/custody-crypto/admin/custody/balances, /api/v1/custody-crypto/admin/watchtower/status",
        nextStep: "Agregar acciones auditadas para bloqueo, límites, reconciliación y watchtower.",
      },
      {
        name: "Custodia fiat",
        repo: "exchange--micro-custody-fiat",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/custody-fiat/overview, /api/v1/custody-fiat/providers",
        nextStep: "Conectar saldos reales de proveedores, acciones auditadas, retenciones y conciliación bancaria profunda.",
      },
    ],
  },
  {
    name: "Pricing y tasas",
    description: "Pricing agregado, fee schedules y bandas de spread conectadas; faltan edición auditada y simulador.",
    gateway: "Gateway admin",
    state: "partial",
    percent: 68,
    microservices: [
      {
        name: "Pricing fiat",
        repo: "exchange--micro-pricing-fee-fiat",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/pricing/prices/all, /api/v1/admin/pricing/price-bands/fiat",
        nextStep: "Agregar edición auditada de bandas fiat, simulación y aprobación.",
      },
      {
        name: "Pricing crypto",
        repo: "exchange--micro-pricing-fee-crypto",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/pricing/prices/all, /api/v1/admin/pricing/price-bands/crypto",
        nextStep: "Agregar edición auditada de bandas cripto, stale prices y alertas.",
      },
      {
        name: "Pricing aggregator",
        repo: "exchange--micro-pricing-fee-aggregator",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/pricing/prices/matrix, /api/v1/admin/pricing/fee-schedules",
        nextStep: "Agregar edición auditada, aprobación, spread avanzado y simulador de cotización.",
      },
    ],
  },
  {
    name: "Operaciones fiat/crypto",
    description: "Funding BLC, retiros, remesas, DECOPAY, QR P2P y transferencias ledger conectadas; send sigue en integración.",
    gateway: "Gateway admin",
    state: "partial",
    percent: 74,
    microservices: [
      {
        name: "Funding core",
        repo: "exchange--micro-funding-core",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/funding/admin",
        nextStep: "Completar conciliación avanzada, auditoría de acciones y reportes de funding.",
      },
      {
        name: "Withdrawal orchestrator",
        repo: "exchange--micro-withdrawal-orchestrator",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/withdrawals/admin",
        nextStep: "Completar aprobación avanzada, liquidación externa y auditoría de estados.",
      },
      {
        name: "Internal transfers",
        repo: "exchange--micro-internal-transfers",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/internal/p2p/admin/codes, /api/v1/wallet/admin/transactions?type=P2P_TRANSFER",
        nextStep: "Conectar acciones admin sobre códigos P2P y eventos de disputa.",
      },
      {
        name: "Remittances core",
        repo: "exchange--micro-remittances-core",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/remittances/admin/all",
        nextStep: "Agregar acciones admin por estado, SLA regional y reportes de liquidación.",
      },
      {
        name: "DECOPAY core",
        repo: "exchange--micro-decopay-core",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/DECOPAY/requests",
        nextStep: "Agregar conciliación, disputas y métricas comerciales por comercio.",
      },
      {
        name: "Exchange engine",
        repo: "exchange--micro-exchange-engine",
        status: "missing",
        nextStep: "Crear motor para compra, venta, conversión y liquidación.",
      },
    ],
  },
  {
    name: "Auditoría y custodia",
    description: "KYC/Risk y lectura de custodia crypto conectados; auditorías de balance y flujos siguen pendientes.",
    gateway: "Gateway admin",
    state: "partial",
    percent: 45,
    microservices: [
      {
        name: "KYC/Risk",
        repo: "exchange--micro-kyc-risk",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/kyc-risk",
        nextStep: "Ampliar fuentes reales: sanciones, OSINT, blockchain analytics y eventos de seguridad.",
      },
      {
        name: "Custodia crypto",
        repo: "exchange--micro-custody-crypto",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/custody-crypto/admin/custody/balances, /api/v1/custody-crypto/admin/deposits",
        nextStep: "Conectar reconciliación profunda y evidencia por transacción.",
      },
      {
        name: "Audit balance integrity",
        repo: "exchange--micro-audit-balance-integrity",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/audit-balance-integrity/overview, /api/v1/audit-balance-integrity/latest",
        nextStep: "Conectar activos y pasivos reales desde custodia crypto/fiat y ledger; agregar evidencias exportables.",
      },
      {
        name: "Audit crypto flows",
        repo: "exchange--micro-audit-crypto-flows",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/audit-crypto-flows/overview, /api/v1/audit-crypto-flows/reconciliation",
        nextStep: "Conectar indexadores reales, hashes, evidencias, wallet sweeping y analítica blockchain.",
      },
      {
        name: "Audit fiat flows",
        repo: "exchange--micro-audit-fiat-flows",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/audit-fiat-flows/overview, /api/v1/audit-fiat-flows/reconciliation",
        nextStep: "Conectar proveedores reales, ledger real, evidencias y exportables regulatorios.",
      },
    ],
  },
  {
    name: "Mercado P2P",
    description: "Órdenes y disputas conectadas; reputación dedicada y túnel P2P siguen pendientes.",
    gateway: "Gateway admin",
    state: "partial",
    percent: 55,
    microservices: [
      {
        name: "P2P core",
        repo: "exchange--micro-p2p-core",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/admin/p2p/orders, /api/v1/admin/p2p/disputes",
        nextStep: "Agregar acciones admin completas, ofertas, reputación dedicada y métricas operativas.",
      },
      {
        name: "P2P tunnel",
        repo: "exchange--micro-p2p-tunnel",
        status: "gateway_pending",
        nextStep: "Conectar mensajería, evidencia y eventos de disputa.",
      },
    ],
  },
  {
    name: "Puntos Deco",
    description: "Red física verificada para recargas, retiros, remesas y operaciones asistidas de efectivo.",
    gateway: "Gateway admin",
    state: "partial",
    percent: 94,
    microservices: [
      {
        name: "Points Deco core",
        repo: "exchange--micro-points-deco-core",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/points-deco/overview, /api/v1/points-deco/points, /api/v1/points-deco/orders, /api/v1/points-deco/disputes, /api/v1/points-deco/economic-actions, /api/v1/points-deco/reports/fiscal",
        nextStep:
          "Confirmar settlement real de proveedores por país; completar KYB, GPS protegido, TOTP/SMS y PDF fiscal formal.",
      },
      {
        name: "Custodia fiat",
        repo: "exchange--micro-custody-fiat",
        status: "gateway_connected",
        gatewayRoute:
          "/api/v1/admin/fiat-custody/points-deco-settlement-intents",
        nextStep:
          "Convertir dispatch auditado en settlement real con evidencia de proveedor y conciliación bancaria.",
      },
      {
        name: "KYC/Risk",
        repo: "exchange--micro-kyc-risk",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/kyc-risk",
        nextStep: "Cruzar niveles de usuario, riesgo de punto, blacklist y señales AML.",
      },
      {
        name: "Limits Policy",
        repo: "exchange--micro-limits-policy",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/limits-policy",
        nextStep: "Aplicar límites por país, punto, usuario, moneda, horario y nivel KYC.",
      },
    ],
  },
  {
    name: "Trading",
    description: "Spot, Trading Pro, market data, alertas, OTC, futuros, copy trading y bots.",
    gateway: "Gateway admin",
    state: "pending",
    percent: 22,
    microservices: [
      {
        name: "Trading engine",
        repo: "exchange--micro-trading-engine",
        status: "missing",
        nextStep: "Crear motor base para spot, órdenes avanzadas, fills, historial y ejecución.",
      },
      {
        name: "Market data",
        repo: "exchange--micro-market-data",
        status: "gateway_connected",
        gatewayRoute: "/api/v1/market-data",
        nextStep: "Consumir en vistas de mercado y ampliar velas, profundidad y señales.",
      },
      {
        name: "Price alerts",
        repo: "exchange--micro-price-alerts",
        status: "missing",
        nextStep: "Crear reglas de alertas conectadas a market data y notificaciones.",
      },
      {
        name: "OTC core",
        repo: "exchange--micro-otc-core",
        status: "missing",
        nextStep: "Crear workflow OTC y Market Maker para cotización, contraparte y liquidación.",
      },
      {
        name: "Futures core",
        repo: "exchange--micro-futures-core",
        status: "missing",
        nextStep: "Crear módulo I+D+i para margen, riesgo, liquidaciones y contratos.",
      },
      {
        name: "Trading automation",
        repo: "exchange--micro-trading-automation",
        status: "missing",
        nextStep: "Crear módulo futuro para bots, estrategias y copy trading.",
      },
    ],
  },
]

export function getConnectionSummary(items = adminModuleStatuses) {
  const total = items.length
  const connected = items.filter((item) => item.state === "connected").length
  const partial = items.filter((item) => item.state === "partial").length
  const pending = items.filter((item) => item.state === "pending").length
  const average = Math.round(
    items.reduce((sum, item) => sum + item.percent, 0) / Math.max(total, 1),
  )

  return { total, connected, partial, pending, average }
}

export function getMicroserviceSummary(items = adminModuleStatuses) {
  const microservices = items.flatMap((item) => item.microservices)

  return {
    total: microservices.length,
    connected: microservices.filter((item) => item.status === "gateway_connected").length,
    created: microservices.filter((item) => item.status === "created").length,
    gatewayPending: microservices.filter((item) => item.status === "gateway_pending").length,
    missing: microservices.filter((item) => item.status === "missing").length,
  }
}
