export type EarnProgram = {
  id:
    | "referrals"
    | "deco-points"
    | "cashback"
    | "learn-and-earn"
    | "missions"
    | "sponsor-ads"
    | "launchpad"
    | "top-earners"
  title: string
  eyebrow: string
  description: string
  metric: string
  detail: string
  href: string
  status: string
  cta: string
}

export type EarnMetric = {
  label: string
  value: string
  detail: string
}

export type EarnTimelineEvent = {
  id: string
  title: string
  detail: string
  status: string
  date: string
}

export type EarnReferralUser = {
  id: string
  name: string
  joinedAt: string
  status: "Activo" | "Pendiente" | "En revision"
  volume: string
  reward: string
}

export type EarnCashbackCategory = {
  id: string
  title: string
  description: string
  rate: string
  limit: string
  status: "Activa" | "Disponible" | "Pausada"
}

export type EarnCashbackMovement = {
  id: string
  title: string
  date: string
  amount: string
  reward: string
  status: "Pendiente" | "Aprobado" | "Pagado" | "Rechazado"
}

export type EarnLaunchpadProject = {
  id: string
  name: string
  sector: string
  description: string
  stage: string
  target: string
  userCap: string
  accepted: string
  vesting: string
  risk: string
  status: "Abierto" | "Whitelist" | "Cerrado"
}

export type EarnTopEarner = {
  rank: number
  alias: string
  program: string
  points: string
  reward: string
  badge: string
}

export type EarnPointsSource = {
  id: string
  title: string
  description: string
  points: string
  status: "Activa" | "Pendiente" | "Disponible"
}

export type EarnPointsReward = {
  id: string
  title: string
  description: string
  cost: string
  value: string
  status: "Disponible" | "Limitado" | "Pronto"
}

export type EarnPointsMovement = {
  id: string
  title: string
  date: string
  source: string
  points: string
  status: "Aprobado" | "Pendiente" | "Canjeado" | "Vence pronto"
}

export type EarnLearningPath = {
  id: string
  title: string
  description: string
  progress: string
  reward: string
  status: "Disponible" | "En curso" | "Completado"
}

export type EarnMission = {
  id: string
  title: string
  description: string
  progress: string
  reward: string
  status: "Disponible" | "En progreso" | "Completada" | "Reclamada"
}

export type EarnSponsorCampaign = {
  id: string
  title: string
  channel: string
  description: string
  reward: string
  requirement: string
  status: "Abierta" | "Revision" | "Limitada"
}

export const earnMetrics: EarnMetric[] = [
  {
    label: "Nivel actual",
    value: "Embajador",
    detail: "Nivel 5 disponible",
  },
  {
    label: "Recompensas",
    value: "128.40 USDT",
    detail: "Sujeta a reglas",
  },
  {
    label: "Programas",
    value: "8",
    detail: "Rutas independientes",
  },
  {
    label: "Proximo corte",
    value: "30 Jun",
    detail: "Liquidacion estimada",
  },
]

export const earnPrograms: EarnProgram[] = [
  {
    id: "referrals",
    title: "Referidos",
    eyebrow: "Invita",
    description: "Convierte tu comunidad en comisiones elegibles por usuarios activos.",
    metric: "Codigo listo",
    detail: "Enlace, invitados y liquidacion",
    href: "/earn/referrals",
    status: "En revision",
    cta: "Ver programa",
  },
  {
    id: "deco-points",
    title: "Puntos Deco",
    eyebrow: "Fidelidad",
    description: "Acumula puntos por actividad valida y canjealos por beneficios del ecosistema.",
    metric: "8,420 pts",
    detail: "Disponible, pendiente y canjes",
    href: "/earn/deco-points",
    status: "En desarrollo",
    cta: "Ver puntos",
  },
  {
    id: "cashback",
    title: "Cashback",
    eyebrow: "Devuelve valor",
    description: "Muestra devoluciones por compras, pagos y actividad elegible.",
    metric: "Corte mensual",
    detail: "Pendiente, aprobado y pagado",
    href: "/earn/cashback",
    status: "En revision",
    cta: "Ver cashback",
  },
  {
    id: "learn-and-earn",
    title: "Aprende y Gana",
    eyebrow: "Educacion",
    description: "Completa rutas educativas, quizzes y retos para ganar puntos o tokens.",
    metric: "3 rutas",
    detail: "Progreso, racha y recompensa",
    href: "/earn/learn-and-earn",
    status: "En desarrollo",
    cta: "Aprender",
  },
  {
    id: "missions",
    title: "Misiones",
    eyebrow: "Retos",
    description: "Cumple tareas diarias, juega retos online y reclama recompensas elegibles.",
    metric: "7 activas",
    detail: "Diarias, semanales y juego",
    href: "/earn/missions",
    status: "En desarrollo",
    cta: "Ver misiones",
  },
  {
    id: "sponsor-ads",
    title: "Sponsor Ads",
    eyebrow: "Embajadores",
    description: "Promociona Deco con campanas aprobadas y gana tokens por contenido valido.",
    metric: "4 campanas",
    detail: "Redes, evidencia y revision",
    href: "/earn/sponsor-ads",
    status: "En desarrollo",
    cta: "Ver campanas",
  },
  {
    id: "launchpad",
    title: "Launchpad",
    eyebrow: "Acceso temprano",
    description: "Presenta proyectos seleccionados con cupos, riesgo y vesting visible.",
    metric: "Whitelist",
    detail: "Cupo, fechas y condiciones",
    href: "/earn/launchpad",
    status: "En desarrollo",
    cta: "Ver launchpad",
  },
  {
    id: "top-earners",
    title: "Ranking de Ganadores",
    eyebrow: "Reconocimiento",
    description: "Activa competencia mensual con alias publico, premios y reglas antiabuso.",
    metric: "Top mensual",
    detail: "Privacidad y premios",
    href: "/earn/top-earners",
    status: "En desarrollo",
    cta: "Ver ranking",
  },
]

export const earnTimeline: EarnTimelineEvent[] = [
  {
    id: "GAN-ACT-001",
    title: "Plan Ganar aprobado",
    detail: "Nivel 5 se define como impacto, comunidad y recompensas.",
    status: "Base",
    date: "Hoy",
  },
  {
    id: "GAN-ACT-002",
    title: "Menu Ganar limpio",
    detail: "Market Maker queda solo en Mercados para evitar duplicar producto.",
    status: "Navegacion",
    date: "Hoy",
  },
  {
    id: "GAN-ACT-003",
    title: "Siguiente modulo",
    detail: "Puntos Deco se construye como base de fidelizacion para Ganar.",
    status: "En desarrollo",
    date: "Ahora",
  },
]

export const earnPointsStats: EarnMetric[] = [
  {
    label: "Disponibles",
    value: "8,420",
    detail: "Puntos canjeables",
  },
  {
    label: "Pendientes",
    value: "1,180",
    detail: "En validacion",
  },
  {
    label: "Nivel",
    value: "Embajador",
    detail: "Multiplicador 1.2x",
  },
  {
    label: "Vencen",
    value: "640",
    detail: "30 dias",
  },
]

export const earnPointsSources: EarnPointsSource[] = [
  {
    id: "PTS-REF",
    title: "Referidos activos",
    description: "Usuarios invitados con operacion valida.",
    points: "+1,200 pts",
    status: "Activa",
  },
  {
    id: "PTS-CBK",
    title: "Cashback usado",
    description: "Compras y pagos elegibles del ciclo.",
    points: "+480 pts",
    status: "Pendiente",
  },
  {
    id: "PTS-LEARN",
    title: "Aprende y Gana",
    description: "Lecciones y quizzes completados.",
    points: "+320 pts",
    status: "Disponible",
  },
  {
    id: "PTS-MSN",
    title: "Misiones Deco",
    description: "Retos diarios y semanales.",
    points: "+750 pts",
    status: "Disponible",
  },
]

export const earnPointsRewards: EarnPointsReward[] = [
  {
    id: "RWD-DECO",
    title: "Token DECO",
    description: "Canje directo a balance elegible.",
    cost: "2,500 pts",
    value: "25 DECO",
    status: "Disponible",
  },
  {
    id: "RWD-FEE",
    title: "Boost de fee",
    description: "Descuento temporal en operaciones.",
    cost: "1,800 pts",
    value: "-15%",
    status: "Limitado",
  },
  {
    id: "RWD-LCH",
    title: "Token Launchpad",
    description: "Recompensa ligada a campana activa.",
    cost: "3,200 pts",
    value: "75 LCH",
    status: "Disponible",
  },
  {
    id: "RWD-ACCESS",
    title: "Acceso prioritario",
    description: "Cupo temprano para beneficios Deco.",
    cost: "5,000 pts",
    value: "Whitelist",
    status: "Pronto",
  },
]

export const earnPointsMovements: EarnPointsMovement[] = [
  {
    id: "PTS-3146",
    title: "Referido activo",
    date: "26 Jun",
    source: "Referidos",
    points: "+420 pts",
    status: "Aprobado",
  },
  {
    id: "PTS-3138",
    title: "Quiz seguridad",
    date: "25 Jun",
    source: "Aprende",
    points: "+120 pts",
    status: "Aprobado",
  },
  {
    id: "PTS-3129",
    title: "Compra elegible",
    date: "24 Jun",
    source: "Cashback",
    points: "+180 pts",
    status: "Pendiente",
  },
  {
    id: "PTS-3117",
    title: "Canje token",
    date: "20 Jun",
    source: "Canje",
    points: "-2,500 pts",
    status: "Canjeado",
  },
]

export const earnLearningStats: EarnMetric[] = [
  {
    label: "Progreso",
    value: "62%",
    detail: "Rutas activas",
  },
  {
    label: "Racha",
    value: "6 dias",
    detail: "Aprendizaje continuo",
  },
  {
    label: "Ganado",
    value: "920 pts",
    detail: "Validado",
  },
  {
    label: "Pendiente",
    value: "280 pts",
    detail: "Quiz por cerrar",
  },
]

export const earnLearningPaths: EarnLearningPath[] = [
  {
    id: "LEARN-CRYPTO",
    title: "Cripto basico",
    description: "Wallets, redes, tokens y operaciones simples.",
    progress: "80%",
    reward: "300 pts",
    status: "En curso",
  },
  {
    id: "LEARN-SECURITY",
    title: "Seguridad Deco",
    description: "Protege tu cuenta, claves y dispositivos.",
    progress: "100%",
    reward: "180 pts",
    status: "Completado",
  },
  {
    id: "LEARN-TRADING",
    title: "Trading responsable",
    description: "Riesgo, ordenes, volatilidad y control.",
    progress: "35%",
    reward: "420 pts",
    status: "Disponible",
  },
  {
    id: "LEARN-WALLET",
    title: "Bolsillito y fiat",
    description: "Recargas, envios, retiros y disponibilidad.",
    progress: "20%",
    reward: "240 pts",
    status: "Disponible",
  },
]

export const earnMissionStats: EarnMetric[] = [
  {
    label: "Activas",
    value: "7",
    detail: "Hoy",
  },
  {
    label: "Racha",
    value: "4 dias",
    detail: "Bonus semanal",
  },
  {
    label: "Reclamable",
    value: "360 pts",
    detail: "Listo mock",
  },
  {
    label: "Juego",
    value: "1 reto",
    detail: "Online semanal",
  },
]

export const earnMissions: EarnMission[] = [
  {
    id: "MSN-DAILY",
    title: "Opera una vez",
    description: "Completa una compra, venta o cambio simple.",
    progress: "1 / 1",
    reward: "120 pts",
    status: "Completada",
  },
  {
    id: "MSN-LEARN",
    title: "Cierra una leccion",
    description: "Termina una lectura y responde el quiz.",
    progress: "2 / 3",
    reward: "180 pts",
    status: "En progreso",
  },
  {
    id: "MSN-GAME",
    title: "Reto online Deco",
    description: "Juego semanal con ranking y premio token.",
    progress: "0 / 1",
    reward: "50 DECO",
    status: "Disponible",
  },
  {
    id: "MSN-SHARE",
    title: "Comparte campana",
    description: "Publica una pieza aprobada de Deco.",
    progress: "Revisado",
    reward: "240 pts",
    status: "Reclamada",
  },
]

export const earnSponsorStats: EarnMetric[] = [
  {
    label: "Campanas",
    value: "4",
    detail: "Disponibles",
  },
  {
    label: "Aprobadas",
    value: "2",
    detail: "Contenido valido",
  },
  {
    label: "Pendiente",
    value: "75 DECO",
    detail: "Revision",
  },
  {
    label: "Alcance",
    value: "18.4K",
    detail: "Mock validado",
  },
]

export const earnSponsorCampaigns: EarnSponsorCampaign[] = [
  {
    id: "ADS-TIKTOK",
    title: "Video corto Deco",
    channel: "TikTok / Reels",
    description: "Explica como usar Crypto facil en menos de 45 segundos.",
    reward: "40 DECO",
    requirement: "URL publica + disclosure",
    status: "Abierta",
  },
  {
    id: "ADS-YT",
    title: "Tutorial Bolsillito",
    channel: "YouTube",
    description: "Muestra recarga, envio y retiro con lenguaje educativo.",
    reward: "120 USDT",
    requirement: "Video 3 min + enlace",
    status: "Limitada",
  },
  {
    id: "ADS-COM",
    title: "Comunidad local",
    channel: "Telegram / Discord",
    description: "Comparte una guia aprobada y resuelve dudas basicas.",
    reward: "600 pts",
    requirement: "Captura + enlace",
    status: "Abierta",
  },
  {
    id: "ADS-LCH",
    title: "Campana Launchpad",
    channel: "X / Threads",
    description: "Promociona proyecto destacado con riesgo visible.",
    reward: "75 LCH",
    requirement: "Post + disclaimer",
    status: "Revision",
  },
]

export const earnReferralStats: EarnMetric[] = [
  {
    label: "Invitados",
    value: "42",
    detail: "Usuarios registrados",
  },
  {
    label: "Activos",
    value: "18",
    detail: "Con operacion valida",
  },
  {
    label: "Pendiente",
    value: "128.40 USDT",
    detail: "Sujeto a corte",
  },
  {
    label: "Pagado",
    value: "840.00 USDT",
    detail: "Historico mock",
  },
]

export const earnReferralUsers: EarnReferralUser[] = [
  {
    id: "REF-1042",
    name: "Laura M.",
    joinedAt: "12 Jun",
    status: "Activo",
    volume: "4,200 USDT",
    reward: "18.40 USDT",
  },
  {
    id: "REF-1038",
    name: "Carlos R.",
    joinedAt: "10 Jun",
    status: "Pendiente",
    volume: "Sin primera operacion",
    reward: "0.00 USDT",
  },
  {
    id: "REF-1029",
    name: "Mesa Andes",
    joinedAt: "04 Jun",
    status: "Activo",
    volume: "28,500 USDT",
    reward: "92.00 USDT",
  },
  {
    id: "REF-1015",
    name: "Valentina P.",
    joinedAt: "29 May",
    status: "En revision",
    volume: "1,140 USDT",
    reward: "18.00 USDT",
  },
]

export const earnCashbackStats: EarnMetric[] = [
  {
    label: "Acumulado",
    value: "46.80 USDT",
    detail: "Ciclo actual",
  },
  {
    label: "Pendiente",
    value: "18.25 USDT",
    detail: "En validacion",
  },
  {
    label: "Pagado",
    value: "214.90 USDT",
    detail: "Historico mock",
  },
  {
    label: "Categorias",
    value: "4",
    detail: "Elegibles por region",
  },
]

export const earnCashbackCategories: EarnCashbackCategory[] = [
  {
    id: "CB-CARD",
    title: "Compras con tarjeta",
    description: "Devolucion por compras elegibles con tarjeta Deco.",
    rate: "0.8%",
    limit: "Hasta 25 USDT/mes",
    status: "Disponible",
  },
  {
    id: "CB-PAY",
    title: "Pagos DecoPay",
    description: "Cashback por pagos procesados dentro del ecosistema.",
    rate: "1.2%",
    limit: "Hasta 40 USDT/mes",
    status: "Activa",
  },
  {
    id: "CB-PARTNER",
    title: "Comercios aliados",
    description: "Promociones por compras con comercios verificados.",
    rate: "2.0%",
    limit: "Segun campana",
    status: "Disponible",
  },
  {
    id: "CB-BOOST",
    title: "Boost embajador",
    description: "Beneficio temporal para usuarios Nivel 5.",
    rate: "+0.5%",
    limit: "Cupo limitado",
    status: "Pausada",
  },
]

export const earnCashbackMovements: EarnCashbackMovement[] = [
  {
    id: "CBK-2042",
    title: "Pago DecoPay",
    date: "26 Jun",
    amount: "380.00 USDT",
    reward: "4.56 USDT",
    status: "Pendiente",
  },
  {
    id: "CBK-2038",
    title: "Compra tarjeta virtual",
    date: "24 Jun",
    amount: "120.00 USDT",
    reward: "0.96 USDT",
    status: "Aprobado",
  },
  {
    id: "CBK-2029",
    title: "Comercio aliado",
    date: "20 Jun",
    amount: "640.00 USDT",
    reward: "12.80 USDT",
    status: "Pagado",
  },
  {
    id: "CBK-2011",
    title: "Compra no elegible",
    date: "16 Jun",
    amount: "42.00 USDT",
    reward: "0.00 USDT",
    status: "Rechazado",
  },
]

export const earnLaunchpadStats: EarnMetric[] = [
  {
    label: "Proyectos",
    value: "3",
    detail: "Mock disponibles",
  },
  {
    label: "Cupo usuario",
    value: "1,500 USDT",
    detail: "Sujeto a KYC",
  },
  {
    label: "Bloqueado",
    value: "420 USDT",
    detail: "Participacion mock",
  },
  {
    label: "Vesting",
    value: "6-12 m",
    detail: "Segun proyecto",
  },
]

export const earnLaunchpadProjects: EarnLaunchpadProject[] = [
  {
    id: "LCH-001",
    name: "Deco Payrails",
    sector: "Pagos",
    description: "Infraestructura para pagos crypto-fiat en comercios aliados.",
    stage: "Ronda comunidad",
    target: "250,000 USDT",
    userCap: "500 USDT",
    accepted: "USDT / USDC",
    vesting: "20% TGE + 8 meses",
    risk: "Alto",
    status: "Abierto",
  },
  {
    id: "LCH-002",
    name: "Andes Remit",
    sector: "Remesas",
    description: "Proyecto regional para rutas de remesa y liquidacion local.",
    stage: "Whitelist",
    target: "120,000 USDT",
    userCap: "300 USDT",
    accepted: "USDT",
    vesting: "10% TGE + 12 meses",
    risk: "Alto",
    status: "Whitelist",
  },
  {
    id: "LCH-003",
    name: "Deco Rewards",
    sector: "Fidelidad",
    description: "Capa de beneficios para cashback, rankings y comunidad.",
    stage: "Cerrada",
    target: "90,000 USDT",
    userCap: "250 USDT",
    accepted: "USDT / DECO",
    vesting: "Lineal 6 meses",
    risk: "Medio-alto",
    status: "Cerrado",
  },
]

export const earnTopEarnerStats: EarnMetric[] = [
  {
    label: "Tu posicion",
    value: "#12",
    detail: "Mes actual",
  },
  {
    label: "Puntos",
    value: "8,420",
    detail: "Actividad valida",
  },
  {
    label: "Premio token",
    value: "35 DECO",
    detail: "O token Launchpad",
  },
  {
    label: "Corte",
    value: "30 Jun",
    detail: "Ranking mensual",
  },
]

export const earnTopEarners: EarnTopEarner[] = [
  {
    rank: 1,
    alias: "DecoAndes",
    program: "Referidos",
    points: "24,820",
    reward: "250 DECO",
    badge: "Embajador Oro",
  },
  {
    rank: 2,
    alias: "PuntosPro",
    program: "Puntos Deco",
    points: "21,340",
    reward: "180 DECO",
    badge: "Fidelidad",
  },
  {
    rank: 3,
    alias: "CashbackMax",
    program: "Cashback",
    points: "18,910",
    reward: "120 DECO",
    badge: "Compras",
  },
  {
    rank: 4,
    alias: "LaunchEarly",
    program: "Launchpad",
    points: "14,700",
    reward: "75 LCH",
    badge: "Explorador",
  },
  {
    rank: 12,
    alias: "Tu alias",
    program: "Referidos",
    points: "8,420",
    reward: "35 DECO",
    badge: "En carrera",
  },
]
