import Link from "next/link"
import {
  ArrowRight,
  BadgePercent,
  BarChart3,
  CreditCard,
  HandCoins,
  Landmark,
  Plug,
  Repeat,
  Rocket,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const products: Array<{
  title: string
  description: string
  badge: string | null
  icon: LucideIcon
  learnMoreLink: string
  size: "half" | "third" | "fifth"
}> = [
  {
    title: "Mercado P2P",
    description: "Compra y vende criptomonedas directamente con otros usuarios sin intermediarios",
    badge: "TENDENCIA",
    icon: Users,
    learnMoreLink: "/markets/p2p",
    size: "half",
  },
  {
    title: "Mercado Spot",
    description: "Opera criptomonedas en tiempo real con herramientas avanzadas de trading",
    badge: null,
    icon: BarChart3,
    learnMoreLink: "/easy-crypto/spot-lite",
    size: "half",
  },
  {
    title: "Intercambio Fiat",
    description: "Compra, vende y convierte monedas fiduciarias de manera rápida y sencilla",
    badge: null,
    icon: Landmark,
    learnMoreLink: "/easy-crypto/buy",
    size: "half",
  },
  {
    title: "Market Maker",
    description: "Conviértete en proveedor de liquidez y recibe beneficios en las operaciones del mercado",
    badge: "EMPRESAS",
    icon: HandCoins,
    learnMoreLink: "/markets/market-maker",
    size: "half",
  },
  {
    title: "Wallet",
    description: "Gestiona y almacena tus activos digitales con seguridad multicapa",
    badge: null,
    icon: Wallet,
    learnMoreLink: "/dashboard",
    size: "third",
  },
  {
    title: "Launchpad",
    description: "Accede anticipadamente a nuevos proyectos y oportunidades",
    badge: "TENDENCIA",
    icon: Rocket,
    learnMoreLink: "/legals/criptoactivos",
    size: "third",
  },
  {
    title: "Staking",
    description: "Participa en herramientas de staking y consulta opciones de rendimiento para tus activos",
    badge: "RENDIMIENTO",
    icon: TrendingUp,
    learnMoreLink: "/legals/risks",
    size: "third",
  },
  {
    title: "Intercambio",
    description: "Intercambia criptomonedas de manera rápida y simple",
    badge: null,
    icon: Repeat,
    learnMoreLink: "/easy-crypto/convert",
    size: "fifth",
  },
  {
    title: "Pagos",
    description: "Acepta y envía pagos desde cualquier parte del mundo",
    badge: null,
    icon: CreditCard,
    learnMoreLink: "/easy-crypto/send",
    size: "fifth",
  },
  {
    title: "Plugins",
    description: "Integra fácilmente pagos cripto en tu sitio web o e-commerce",
    badge: "EMPRESAS",
    icon: Plug,
    learnMoreLink: "/legals/widgets",
    size: "fifth",
  },
  {
    title: "Referidos",
    description: "Invita amigos y gana recompensas por cada registro exitoso",
    badge: "POPULAR",
    icon: UserPlus,
    learnMoreLink: "/legals/referidos",
    size: "fifth",
  },
  {
    title: "Cashback",
    description: "Recibe reembolsos por tus operaciones dentro de la plataforma",
    badge: null,
    icon: BadgePercent,
    learnMoreLink: "/legals/lee-y-gana",
    size: "fifth",
  },
]

const productCardClass =
  "overflow-hidden rounded-[var(--radius)] border-border bg-card shadow-[0_18px_45px_rgba(15,23,42,0.10),0_4px_12px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(15,23,42,0.14),0_4px_12px_rgba(15,23,42,0.08)] dark:shadow-none dark:hover:shadow-none"

function ProductIcon({ icon: Icon, size = "md" }: { icon: LucideIcon; size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: "h-12 w-12 md:h-16 md:w-16",
    md: "h-16 w-16 md:h-20 md:w-20",
    lg: "h-20 w-20 md:h-24 md:w-24",
  }

  return (
    <div className={`grid shrink-0 place-items-center rounded-[calc(var(--radius)-0.65rem)] border border-border bg-muted/30 text-primary ${dimensions[size]}`}>
      <Icon className="h-1/2 w-1/2" strokeWidth={1.9} />
    </div>
  )
}

export default function ProductsSection() {
  // Filtrar productos por tamaño
  const halfProducts = products.filter((product) => product.size === "half")
  const thirdProducts = products.filter((product) => product.size === "third")
  const fifthProducts = products.filter((product) => product.size === "fifth")

  return (
    <section id="productos" className="py-12 md:py-16 bg-background">
      <div className="container">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-10">Nuestros productos</h2>

        {/* Productos de tamaño medio (2 por fila) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          {halfProducts.map((product, index) => (
            <Card key={index} className={productCardClass}>
              <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl md:text-2xl font-bold">{product.title}</h3>
                    {product.badge && (
                      <Badge variant="outline" className="rounded-full border-border bg-foreground text-background dark:bg-white dark:text-black">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-base md:text-lg text-muted-foreground">{product.description}</p>
                </div>
                <div className="flex justify-between items-end mt-6">
                  <Link
                    href={product.learnMoreLink}
                    className="flex items-center text-sm md:text-base text-muted-foreground hover:text-foreground"
                  >
                    Más información <ArrowRight className="ml-1 h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                  <ProductIcon icon={product.icon} size="lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Productos de tamaño pequeño (3 por fila) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          {thirdProducts.map((product, index) => (
            <Card key={index} className={productCardClass}>
              <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl md:text-2xl font-bold">{product.title}</h3>
                    {product.badge && (
                      <Badge variant="outline" className="rounded-full border-border bg-foreground text-background dark:bg-white dark:text-black">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-base text-muted-foreground">{product.description}</p>
                </div>
                <div className="flex justify-between items-end mt-6">
                  <Link
                    href={product.learnMoreLink}
                    className="flex items-center text-sm md:text-base text-muted-foreground hover:text-foreground"
                  >
                    Explorar <ArrowRight className="ml-1 h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                  <ProductIcon icon={product.icon} size="md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Productos de tamaño muy pequeño (5 por fila) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {fifthProducts.map((product, index) => (
            <Card key={index} className={productCardClass}>
              <CardContent className="p-4 md:p-6 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg md:text-xl font-bold">{product.title}</h3>
                    {product.badge && (
                      <Badge variant="outline" className="rounded-full border-border bg-foreground text-xs text-background dark:bg-white dark:text-black">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">{product.description}</p>
                </div>
                <div className="flex justify-between items-end mt-4 md:mt-6">
                  <Link
                    href={product.learnMoreLink}
                    className="flex items-center text-xs md:text-sm text-muted-foreground hover:text-foreground"
                  >
                    Detalles <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                  </Link>
                  <ProductIcon icon={product.icon} size="sm" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
