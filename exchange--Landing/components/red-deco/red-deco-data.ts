import {
  AlertTriangle,
  Banknote,
  Building2,
  CircleDollarSign,
  Clock3,
  FileText,
  Landmark,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Store,
  WalletCards,
  type LucideIcon,
} from "lucide-react"

export type RedDecoService = {
  id: string
  title: string
  description: string
  metric: string
  detail: string
  href: string
  icon: LucideIcon
}

export type RedDecoLocation = {
  id: string
  name: string
  zone: string
  distance: string
  type: string
  hours: string
  limit: string
  services: string[]
  status: string
  riskLabel: string
}

export type RedDecoRoute = {
  id: string
  title: string
  path: string
  fee: string
  time: string
  receive: string
  status: string
}

export type AliadoDecoPartnerLevel = {
  level: string
  title: string
  profile: string
  permissions: string
  limit: string
}

export type AliadoDecoOrder = {
  id: string
  type: string
  amount: string
  user: string
  result: string
  commission: string
  status: string
  timer: string
}

export type AliadoDecoMetric = {
  label: string
  value: string
  detail: string
  icon: LucideIcon
}

export type AliadoDecoLiquidity = {
  asset: string
  available: string
  range: string
  status: string
}

export type AliadoDecoDispute = {
  id: string
  title: string
  detail: string
  status: string
  risk: string
}

export type AliadoDecoReportRecord = {
  id: string
  date: string
  counterparty: string
  service: string
  amount: string
  commission: string
  taxBase: string
  status: string
}

export type AliadoDecoFiscalSummary = {
  label: string
  value: string
  detail: string
}

export type AliadoDecoExportFile = {
  name: string
  format: string
  period: string
  status: string
}

export type AliadoDecoComplianceRule = {
  title: string
  detail: string
  status: string
}

export type AliadoDecoSecureForm = {
  id: string
  title: string
  requester: string
  fields: string
  retention: string
  status: string
}

export const redDecoServices: RedDecoService[] = [
  {
    id: "deposit",
    title: "Depositar efectivo",
    description: "Entrega efectivo y recibe saldo Deco, fiat digital o USDT con comprobante.",
    metric: "COP -> USDT",
    detail: "Tasa bloqueada",
    href: "/bolsillito/red-deco/deposit",
    icon: Banknote,
  },
  {
    id: "withdraw",
    title: "Retirar efectivo",
    description: "Usa saldo Deco y cobra efectivo con un aliado verificado.",
    metric: "Saldo -> COP",
    detail: "QR dinamico",
    href: "/bolsillito/red-deco/withdraw",
    icon: WalletCards,
  },
  {
    id: "remittance",
    title: "Enviar remesa",
    description: "Envia dinero entre paises usando la ruta mas barata disponible.",
    metric: "LATAM",
    detail: "Ruta inteligente",
    href: "/bolsillito/red-deco/remittance",
    icon: CircleDollarSign,
  },
]

export const redDecoLocations: RedDecoLocation[] = [
  {
    id: "pd-chapinero-01",
    name: "Comercio Aliado 72",
    zone: "Chapinero, Bogota",
    distance: "850 m",
    type: "Comercio verificado",
    hours: "09:00 - 18:00",
    limit: "Hasta 1.5M COP",
    services: ["Deposito", "Retiro", "Remesa"],
    status: "Disponible",
    riskLabel: "Nivel 3",
  },
  {
    id: "pd-medellin-02",
    name: "Aliado Laureles",
    zone: "Laureles, Medellin",
    distance: "2.1 km",
    type: "Cajero operativo",
    hours: "10:00 - 19:00",
    limit: "Hasta 600K COP",
    services: ["Deposito", "Retiro"],
    status: "Cupo medio",
    riskLabel: "Nivel 2",
  },
  {
    id: "pd-cali-03",
    name: "Mesa Sur Aliada",
    zone: "Granada, Cali",
    distance: "Zona cercana",
    type: "Empresa aliada",
    hours: "08:00 - 17:00",
    limit: "Hasta 8M COP",
    services: ["Remesa", "Banco", "Wallet"],
    status: "Con cita",
    riskLabel: "Nivel 4",
  },
]

export const redDecoRoutes: RedDecoRoute[] = [
  {
    id: "co-pe",
    title: "Colombia a Peru",
    path: "Aliado origen + wallet local",
    fee: "1.2%",
    time: "15-45 min",
    receive: "PEN o saldo Deco",
    status: "Mejor costo",
  },
  {
    id: "co-mx",
    title: "Colombia a Mexico",
    path: "Aliado origen + P2P verificado",
    fee: "1.5%",
    time: "30-60 min",
    receive: "MXN banco",
    status: "Ruta estable",
  },
  {
    id: "co-ve",
    title: "Colombia a Venezuela",
    path: "Aliado origen + aliado destino",
    fee: "1.8%",
    time: "20-90 min",
    receive: "Efectivo o USDT",
    status: "Control alto",
  },
]

export const aliadoDecoPartnerLevels: AliadoDecoPartnerLevel[] = [
  {
    level: "01",
    title: "Persona verificada",
    profile: "Operador individual",
    permissions: "Depositos pequenos",
    limit: "Bajo",
  },
  {
    level: "02",
    title: "Cajero operativo",
    profile: "Punto con historial",
    permissions: "Depositos y retiros",
    limit: "Medio",
  },
  {
    level: "03",
    title: "Comercio aliado",
    profile: "Local fisico",
    permissions: "Depositos, retiros y remesas",
    limit: "Medio alto",
  },
  {
    level: "04",
    title: "Empresa verificada",
    profile: "KYB completo",
    permissions: "Remesas y volumen",
    limit: "Alto",
  },
]

export const aliadoDecoOrders: AliadoDecoOrder[] = [
  {
    id: "PD-4821",
    type: "Deposito efectivo",
    amount: "100,000 COP",
    user: "Usuario nivel 3",
    result: "24.80 USDT",
    commission: "1,200 COP",
    status: "Pendiente",
    timer: "08:42",
  },
  {
    id: "PD-4822",
    type: "Retiro efectivo",
    amount: "350,000 COP",
    user: "Usuario nivel 4",
    result: "Efectivo local",
    commission: "2,900 COP",
    status: "En curso",
    timer: "12:10",
  },
  {
    id: "PD-4823",
    type: "Remesa destino",
    amount: "200,000 COP",
    user: "Beneficiario validado",
    result: "920 MXN",
    commission: "0.4%",
    status: "Ruta reservada",
    timer: "18:30",
  },
]

export const aliadoDecoMetrics: AliadoDecoMetric[] = [
  {
    label: "Caja declarada",
    value: "4.8M COP",
    detail: "Rango operativo visible para Deco",
    icon: Banknote,
  },
  {
    label: "Ganancia hoy",
    value: "38,400 COP",
    detail: "Comisiones mock liquidadas",
    icon: CircleDollarSign,
  },
  {
    label: "Ordenes activas",
    value: "3",
    detail: "Pendientes y en curso",
    icon: Clock3,
  },
  {
    label: "Riesgo",
    value: "Normal",
    detail: "Sin bloqueo operativo",
    icon: ShieldCheck,
  },
]

export const aliadoDecoLiquidity: AliadoDecoLiquidity[] = [
  {
    asset: "COP efectivo",
    available: "4.8M",
    range: "Hasta 1.5M por orden",
    status: "Disponible",
  },
  {
    asset: "USDT saldo",
    available: "1,240",
    range: "Ruta remesa y retiros",
    status: "Reservable",
  },
  {
    asset: "Banco local",
    available: "2 cuentas",
    range: "Solo titular validado",
    status: "Verificado",
  },
]

export const aliadoDecoHistory: AliadoDecoOrder[] = [
  {
    id: "PD-4818",
    type: "Deposito efectivo",
    amount: "80,000 COP",
    user: "Usuario nivel 3",
    result: "19.82 USDT",
    commission: "960 COP",
    status: "Liquidado",
    timer: "09:15",
  },
  {
    id: "PD-4817",
    type: "Retiro efectivo",
    amount: "240,000 COP",
    user: "Usuario nivel 4",
    result: "Efectivo entregado",
    commission: "2,100 COP",
    status: "Completado",
    timer: "08:42",
  },
]

export const aliadoDecoDisputes: AliadoDecoDispute[] = [
  {
    id: "DSP-104",
    title: "Confirmacion pendiente",
    detail: "Usuario no confirmo recibido. Fondos retenidos hasta resolver.",
    status: "En revision",
    risk: "Medio",
  },
  {
    id: "DSP-098",
    title: "Comprobante solicitado",
    detail: "Soporte fiscal adicional solicitado por el aliado.",
    status: "Formulario seguro",
    risk: "Bajo",
  },
]

export const aliadoDecoFiscalSummary: AliadoDecoFiscalSummary[] = [
  {
    label: "Volumen mensual",
    value: "18.4M COP",
    detail: "Depositos, retiros y remesas cerradas.",
  },
  {
    label: "Comisiones",
    value: "184,900 COP",
    detail: "Ingreso operativo estimado del aliado.",
  },
  {
    label: "Contrapartes",
    value: "42",
    detail: "Usuarios unicos con comprobante.",
  },
  {
    label: "Retenciones",
    value: "Pendiente",
    detail: "Mock hasta conectar motor fiscal.",
  },
]

export const aliadoDecoReportRecords: AliadoDecoReportRecord[] = [
  {
    id: "RPT-4823",
    date: "2026-06-28",
    counterparty: "Usuario nivel 4",
    service: "Remesa destino",
    amount: "200,000 COP",
    commission: "0.4%",
    taxBase: "920 MXN",
    status: "Conciliado",
  },
  {
    id: "RPT-4822",
    date: "2026-06-28",
    counterparty: "Usuario nivel 4",
    service: "Retiro efectivo",
    amount: "350,000 COP",
    commission: "2,900 COP",
    taxBase: "Efectivo entregado",
    status: "Comprobante",
  },
  {
    id: "RPT-4818",
    date: "2026-06-27",
    counterparty: "Usuario nivel 3",
    service: "Deposito efectivo",
    amount: "80,000 COP",
    commission: "960 COP",
    taxBase: "19.82 USDT",
    status: "Liquidado",
  },
  {
    id: "RPT-4817",
    date: "2026-06-27",
    counterparty: "Usuario nivel 4",
    service: "Retiro efectivo",
    amount: "240,000 COP",
    commission: "2,100 COP",
    taxBase: "Efectivo local",
    status: "Liquidado",
  },
]

export const aliadoDecoExportFiles: AliadoDecoExportFile[] = [
  {
    name: "Reporte mensual aliado",
    format: "PDF",
    period: "Junio 2026",
    status: "Listo mock",
  },
  {
    name: "Operaciones conciliadas",
    format: "CSV",
    period: "Ultimos 30 dias",
    status: "Listo mock",
  },
  {
    name: "Contrapartes resumidas",
    format: "CSV",
    period: "Fiscal",
    status: "Privado",
  },
]

export const aliadoDecoComplianceRules: AliadoDecoComplianceRule[] = [
  {
    title: "Datos sensibles por formulario",
    detail: "Documento, soporte bancario o evidencia fiscal no deben pedirse libremente por chat.",
    status: "Obligatorio",
  },
  {
    title: "Direccion protegida",
    detail: "Antes de aceptar una orden se muestra zona aproximada; luego se revela punto operativo.",
    status: "Activo",
  },
  {
    title: "Contraparte trazable",
    detail: "Cada operacion conserva alias, nivel, comprobante y motivo de solicitud adicional.",
    status: "Auditable",
  },
  {
    title: "Retencion limitada",
    detail: "Archivos sensibles expiran segun politica y quedan asociados al caso, no al chat.",
    status: "Pendiente backend",
  },
]

export const aliadoDecoSecureForms: AliadoDecoSecureForm[] = [
  {
    id: "FRM-204",
    title: "Soporte fiscal adicional",
    requester: "Aliado Comercio 72",
    fields: "Identidad, comprobante de pago, declaracion de origen",
    retention: "30 dias",
    status: "Borrador",
  },
  {
    id: "FRM-198",
    title: "Validacion de retiro alto",
    requester: "Mesa Sur Aliada",
    fields: "PIN, QR, foto de comprobante, autorizacion",
    retention: "15 dias",
    status: "Plantilla",
  },
]

export const redDecoControls = [
  { label: "QR dinamico", value: "Un uso", icon: ReceiptText },
  { label: "GPS protegido", value: "Zona primero", icon: MapPin },
  { label: "KYC/KYB", value: "Por nivel", icon: ShieldCheck },
  { label: "Reporte fiscal", value: "PDF/CSV", icon: FileText },
]

export const aliadoDecoPartnerBenefits = [
  { label: "Depositos", value: "Comision fija", icon: Landmark },
  { label: "Retiros", value: "Fee operativo", icon: Banknote },
  { label: "Remesas", value: "Ruta barata", icon: Store },
  { label: "Empresa", value: "KYB + limites", icon: Building2 },
]
