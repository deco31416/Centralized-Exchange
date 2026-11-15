import {
  BadgeCheck,
  BadgeDollarSign,
  Banknote,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Calculator,
  Code2,
  Coins,
  Cookie,
  CreditCard,
  FileCheck2,
  FileText,
  Fingerprint,
  Flag,
  Gift,
  Globe2,
  Handshake,
  Landmark,
  LockKeyhole,
  Megaphone,
  MessageCircle,
  Palette,
  Rocket,
  Scale,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  Store,
  Trophy,
  WalletCards,
} from "lucide-react"

export type LegalLandingItem = {
  title: string
  description: string
  href: string
  icon: typeof ShieldCheck
}

export type LegalLandingSection = {
  eyebrow: string
  index: string
  items: LegalLandingItem[]
}

export const legalJurisdictions = [
  { country: "Colombia", detail: "Disponibilidad regulatoria en revisión" },
  { country: "Miami", detail: "Presencia estratégica" },
  { country: "LatAm", detail: "Expansión progresiva" },
  { country: "Global", detail: "Acceso sujeto a jurisdicción" },
]

export const legalSections: LegalLandingSection[] = [
  {
    eyebrow: "Legales",
    index: "01-",
    items: [
      { title: "KYC / AML", description: "Identidad, prevención y cumplimiento.", href: "/legals/kyc-aml", icon: Fingerprint },
      { title: "Privacidad", description: "Uso, protección y tratamiento de datos.", href: "/legals/privacy", icon: LockKeyhole },
      { title: "Términos", description: "Condiciones generales de uso.", href: "/legals/terms", icon: FileText },
      { title: "Riesgos", description: "Riesgos de activos digitales y mercado.", href: "/legals/risks", icon: ShieldAlert },
      { title: "Prevención", description: "Prevención de fraude y actividad sospechosa.", href: "/legals/prevention", icon: ShieldCheck },
      { title: "Denuncias", description: "Canal para reportes y solicitudes.", href: "/legals/reports", icon: MessageCircle },
      { title: "Cookies", description: "Preferencias y tecnologías de seguimiento.", href: "/legals/cookies", icon: Cookie },
      { title: "Comunidad", description: "Reglas de convivencia del ecosistema.", href: "/legals/community", icon: Globe2 },
      { title: "Marca", description: "Uso de identidad, logos y co-branding.", href: "/legals/brand", icon: Palette },
      { title: "Roadmap", description: "Fases, dependencias y límites del producto.", href: "/legals/roadmap", icon: Rocket },
      { title: "Únete al equipo", description: "Aviso para candidatos y colaboradores.", href: "/legals/unete-al-equipo", icon: BriefcaseBusiness },
    ],
  },
  {
    eyebrow: "Operación",
    index: "02-",
    items: [
      { title: "Comisiones", description: "Tasas, cargos y criterios de cálculo.", href: "/legals/comisiones", icon: Coins },
      { title: "Calculadora", description: "Simulación de fiat, cripto y métodos.", href: "/legals/calculadora", icon: Calculator },
      { title: "Tasas", description: "Referencias de divisas fiat.", href: "/legals/tasas", icon: Banknote },
      { title: "Monedas", description: "Información de fiat y criptoactivos.", href: "/legals/monedas", icon: Globe2 },
      { title: "Tarjetas", description: "Políticas aplicables a tarjetas.", href: "/legals/tarjetas", icon: CreditCard },
      { title: "Cajeros", description: "Disponibilidad y políticas de cajeros.", href: "/legals/cajeros", icon: Landmark },
      { title: "Reservas PoR", description: "Prueba de reservas y transparencia.", href: "/legals/reservas", icon: FileCheck2 },
      { title: "Transparencia", description: "Custodia, solvencia y reportes.", href: "/legals/transparencia", icon: Scale },
      { title: "Auditorías", description: "Pruebas, controles y auditorías.", href: "/legals/auditorias", icon: BadgeCheck },
      { title: "Licencias", description: "Estado regulatorio y permisos.", href: "/legals/licencias", icon: ShieldQuestion },
      { title: "Seguros", description: "Coberturas y limitaciones.", href: "/legals/seguros", icon: ShieldCheck },
      { title: "Efectivo", description: "Custodia y manejo del efectivo.", href: "/legals/efectivo", icon: WalletCards },
      { title: "Red Deco", description: "Aliados, efectivo y remesas presenciales.", href: "/legals/red-deco", icon: Landmark },
      { title: "Electrónicos", description: "Medios electrónicos aceptados.", href: "/legals/electronicos", icon: Boxes },
      { title: "Criptoactivos", description: "Activos digitales y uso permitido.", href: "/legals/criptoactivos", icon: Sparkles },
    ],
  },
  {
    eyebrow: "Integraciones",
    index: "03-",
    items: [
      { title: "DECO Custody", description: "Términos de custodia y operación.", href: "/legals/deco-custody", icon: ShieldCheck },
      { title: "Cuenta ADT", description: "Condiciones de cuenta especializada.", href: "/legals/cuenta-adt", icon: FileText },
      { title: "Cuenta Trader", description: "Condiciones para empresas y traders.", href: "/legals/cuenta-trader", icon: Landmark },
      { title: "Puntos DECO", description: "Cashback y puntos del ecosistema.", href: "/legals/giros-puntos", icon: Gift },
      { title: "Aliado Deco", description: "Reglas para operar como aliado verificado.", href: "/legals/aliado-deco", icon: Handshake },
      { title: "White Label", description: "Corresponsales e infraestructura.", href: "/legals/white-label", icon: Handshake },
      { title: "Widgets", description: "Políticas de integración web.", href: "/legals/widgets", icon: Code2 },
      { title: "Procesamiento Cripto", description: "Pagos cripto para comercios e integradores.", href: "/legals/crypto-processing", icon: BadgeDollarSign },
      { title: "E-Commerce plugins", description: "Plugins, widgets, SDK y sandbox comercial.", href: "/legals/ecommerce-plugins", icon: Store },
      { title: "Developers", description: "Portal técnico, Data API, widgets y sandbox.", href: "/developers", icon: Code2 },
    ],
  },
  {
    eyebrow: "Programas",
    index: "04-",
    items: [
      { title: "Bug Bounty", description: "Reporte responsable de vulnerabilidades.", href: "/legals/bug-bounty", icon: ShieldAlert },
      { title: "Score Traders", description: "Criterios y términos del programa.", href: "/legals/score-traders", icon: Trophy },
      { title: "Referidos", description: "Políticas de invitaciones y recompensas.", href: "/legals/referidos", icon: Gift },
      { title: "Play to Earn", description: "Términos de participación.", href: "/legals/play-to-earn", icon: Sparkles },
      { title: "Lee y Gana", description: "Condiciones del programa educativo.", href: "/legals/lee-y-gana", icon: BookOpen },
      { title: "Sponsor Ads", description: "Normas de anuncios patrocinados.", href: "/legals/sponsor-ads", icon: Megaphone },
    ],
  },
]

export const legalControlItems: LegalLandingItem[] = [
  { title: "DECOToken", description: "Políticas, utilidad y alcance del activo del ecosistema.", href: "/legals/deco-token", icon: Coins },
  { title: "API para desarrolladores", description: "Documentación y criterios para integraciones.", href: "/legals/api-developer", icon: Code2 },
  { title: "Centro de ayuda", description: "Soporte, preguntas frecuentes y guías.", href: "/legals/help-center", icon: BookOpen },
  { title: "Contacto", description: "Canal directo con el equipo legal.", href: "/legals/contacto", icon: MessageCircle },
]
