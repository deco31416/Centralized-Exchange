import Link from "next/link"
import Image from "next/image"
import { Github, Music2, Send, ShieldCheck, Twitter } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import LegalFooter from "@/components/Main/layout/footer/legal-footer"
import { BrandLogo } from "@/components/common/brand-logo"

const footerLinks = {
  company: [
    { label: "Home", href: "/" },
    { label: "Tarifas", href: "/legals/comisiones" },
    { label: "Roadmap", href: "/roadmap" },
    { label: "Prueba de Reservas", href: "/legals/reservas" },
    { label: "Help Center", href: "/legals/help-center" },
    { label: "Legales", href: "/legals" },
    { label: "Únete al equipo", href: "/unete-al-equipo" },
    { label: "Contacto", href: "/legals/contacto" },
  ],
  personalUse: [
    { label: "Comprar Cripto", href: "/easy-crypto/buy" },
    { label: "Intercambio Fiat", href: "/assets/fiat" },
    { label: "Red Deco", href: "/bolsillito/red-deco" },
    { label: "Mercado P2P", href: "/markets/p2p" },
    { label: "Wallet", href: "/dashboard" },
    { label: "Staking", href: "/rendimiento/staking-tokens" },
    { label: "Referidos", href: "/earn/referrals" },
    { label: "Launchpad", href: "/earn/launchpad" },
    { label: "Estado del Servicio", href: "/status" },
  ],
  businessUse: [
    { label: "Guía de Marca", href: "/brand" },
    { label: "Procesamiento Cripto", href: "/business/crypto-processing" },
    { label: "E-Commerce plugins", href: "/business/ecommerce-plugins" },
    { label: "Market Maker", href: "/markets/market-maker" },
    { label: "Aliado Deco", href: "/earn/aliado-deco" },
  ],
  support: [
    { label: "Telegram", href: "https://t.me/deco31416" },
    { label: "Email", href: "mailto:contacto@deco31416.com" },
  ],
}

const footerResourceLinks = {
  decoMarkets: [
    { label: "Resumen del mercado", href: "/markets/market-analysis" },
    { label: "Catálogo de activos", href: "/assets" },
    { label: "Bitcoin", href: "/assets/btc" },
    { label: "Ethereum", href: "/assets/eth" },
    { label: "Solana", href: "/assets/sol" },
    { label: "DECOToken", href: "/assets/deco" },
  ],
  decoTools: [
    { label: "Calculadora DECO", href: "/legals/calculadora" },
    { label: "Comprar cripto", href: "/easy-crypto/buy" },
    { label: "Convertir activos", href: "/easy-crypto/convert" },
    { label: "Enviar activos", href: "/easy-crypto/send" },
    { label: "Mercado P2P", href: "/markets/p2p" },
    { label: "Developers", href: "/developers" },
    { label: "Wallet", href: "/dashboard" },
  ],
  fiatRates: [
    { label: "Monedas fiat", href: "/assets/fiat" },
    { label: "Dólar USD", href: "/assets/usd" },
    { label: "Peso COP", href: "/assets/cop" },
    { label: "Peso MXN", href: "/assets/mxn" },
    { label: "Tasas de divisas fiat", href: "/legals/tasas" },
    { label: "Comisiones", href: "/legals/comisiones" },
  ],
  paymentMethods: [
    { label: "Métodos de pago", href: "/assets/payment-methods" },
    { label: "Nequi", href: "/assets/payment-methods/nequi" },
    { label: "PSE", href: "/assets/payment-methods/pse" },
    { label: "Daviplata", href: "/assets/payment-methods/daviplata" },
    { label: "NuBank", href: "/assets/payment-methods/nubank" },
    { label: "Pix", href: "/assets/payment-methods/pix" },
    { label: "Red Deco", href: "/assets/payment-methods/red-deco" },
    { label: "Efectivo", href: "/assets/payment-methods/cash" },
    { label: "Tarjetas", href: "/assets/payment-methods/cards" },
  ],
  cryptoEducation: [
    { label: "¿Qué es una criptomoneda?", href: "/legals/knowledge-base" },
    { label: "Bitcoin", href: "/assets/btc" },
    { label: "Ethereum", href: "/assets/eth" },
    { label: "Seguridad y prevención", href: "/legals/prevention" },
    { label: "Riesgos de activos digitales", href: "/legals/risks" },
    { label: "KYC / AML", href: "/legals/kyc-aml" },
    { label: "Aprende sobre criptomonedas", href: "/legals/knowledge-base" },
  ],
}

const socialLinks: Array<{ Icon: LucideIcon; href: string; label: string }> = [
  { Icon: Music2, href: "https://www.tiktok.com/@deco31416", label: "TikTok @deco31416" },
  { Icon: Github, href: "https://github.com/deco31416", label: "GitHub @deco31416" },
  { Icon: Twitter, href: "https://twitter.com/deco31416", label: "X @deco31416" },
  { Icon: Send, href: "https://t.me/deco31416", label: "Telegram @deco31416" },
]

function FooterSocialIcon({ Icon, href, label }: { Icon: LucideIcon; href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
    </a>
  )
}

function FooterTextLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:")

  if (isExternal) {
    return (
      <a
        href={href}
        className="text-sm md:text-base text-muted-foreground hover:text-foreground"
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {label}
      </a>
    )
  }

  return (
    <Link href={href} className="text-sm md:text-base text-muted-foreground hover:text-foreground">
      {label}
    </Link>
  )
}

function FooterResourceColumn({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h3 className="mb-4 text-base font-bold text-foreground md:mb-5 md:text-lg">{title}</h3>
      <ul className="space-y-2 md:space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <FooterTextLink {...link} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container max-w-[1440px] py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <BrandLogo variant="name" />
            </Link>

            <p className="text-muted-foreground mb-6 max-w-md text-base md:text-lg">
              Revolucionamos la forma de intercambiar desde cualquier parte del mundo.
            </p>

            <div className="flex items-center mb-6">
              <Image
                src="/images/main/trustpilot-logo.png"
                alt="Trustpilot"
                width={120}
                height={30}
                className="h-8 w-auto dark:hidden md:h-12"
                style={{ width: "auto" }}
              />
              <Image
                src="/images/main/logo-trustpilot-white.png"
                alt="Trustpilot"
                width={120}
                height={30}
                className="hidden h-8 w-auto dark:block md:h-12"
                style={{ width: "auto" }}
              />
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <Link href="/#wallet" className="inline-block">
                <Image
                  src="/images/main/icon-app-es-dark.svg"
                  alt="Download on App Store"
                  width={120}
                  height={40}
                  className="h-10 md:h-12 w-auto"
                />
              </Link>
              <Link href="/#wallet" className="inline-block">
                <Image
                  src="/images/main/googleplay.png"
                  alt="Get it on Google Play"
                  width={135}
                  height={40}
                  className="h-10 md:h-12 w-auto"
                />
              </Link>
            </div>

            <a
              href="https://www.deco31416.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border rounded-md px-4 py-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-primary" />
              Backed by deco31416
            </a>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 md:mb-6">Compañía</h3>
            <ul className="space-y-2 md:space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <FooterTextLink {...link} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 md:mb-6">Para ti</h3>
            <ul className="space-y-2 md:space-y-3">
              {footerLinks.personalUse.map((link) => (
                <li key={link.label}>
                  <FooterTextLink {...link} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-8 md:mb-10">
              <h3 className="font-bold text-lg mb-4 md:mb-6">Para empresas</h3>
              <ul className="space-y-2 md:space-y-3">
                {footerLinks.businessUse.map((link) => (
                  <li key={link.label}>
                    <FooterTextLink {...link} />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 md:mb-6">Soporte</h3>
              <ul className="space-y-2 md:space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <FooterTextLink {...link} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <section className="border-t border-border">
        <div className="container max-w-[1440px] py-10 md:py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-10">
            <FooterResourceColumn title="Mercados DECO" links={footerResourceLinks.decoMarkets} />
            <FooterResourceColumn title="Herramientas" links={footerResourceLinks.decoTools} />
            <FooterResourceColumn title="Tasas fiat" links={footerResourceLinks.fiatRates} />
            <FooterResourceColumn title="Métodos de pago" links={footerResourceLinks.paymentMethods} />
            <FooterResourceColumn title="Educación cripto" links={footerResourceLinks.cryptoEducation} />
          </div>
        </div>
      </section>

      <LegalFooter />

      <div className="border-t border-border py-6 md:py-8">
        <div className="container max-w-[1440px] flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="flex items-center gap-4 md:gap-6">
            {socialLinks.map((link) => (
              <FooterSocialIcon key={link.label} {...link} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-md text-muted-foreground">
            <Link href="/legals/comisiones" className="hover:text-foreground">
              Tarifas
            </Link>
            <Link href="/legals/kyc-aml" className="hover:text-foreground">
              AML
            </Link>
            <Link href="/legals/privacy" className="hover:text-foreground">
              Política de privacidad
            </Link>
            <Link href="/legals/terms" className="hover:text-foreground">
              Condiciones de uso
            </Link>
            <span>© {new Date().getFullYear()} DECO EXCHANGE. All Rights Reserved.</span>
          </div>

        </div>
      </div>

    </footer>
  )
}
