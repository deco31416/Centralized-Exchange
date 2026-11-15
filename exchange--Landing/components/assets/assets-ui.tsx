import Link from "next/link"
import type { ReactNode } from "react"
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react"

import {
  assetTypeLabels,
  paymentMethodTypeLabels,
  productLabels,
  statusLabels,
  type AssetKind,
  type AssetProduct,
  type AssetStatus,
  type CatalogAsset,
  type CatalogPaymentMethod,
  type PaymentMethodType,
} from "@/components/assets/assets-data"
import Footer from "@/components/Main/layout/footer/footer"
import Navbar from "@/components/Main/layout/navbar/navbar"
import { cn } from "@/lib/utils"

export function AssetsPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-24 md:px-6 md:pt-28">{children}</main>
      <Footer />
    </div>
  )
}

export function AssetsHero({
  aside,
  description,
  eyebrow = "Assets",
  title,
}: {
  aside?: ReactNode
  description: string
  eyebrow?: string
  title: string
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035] md:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,620px)] lg:items-center">
        <div className="max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-foreground md:text-5xl">{title}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
    </section>
  )
}

export function AssetsHeroStat({
  detail,
  label,
  value,
}: {
  detail: string
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{label}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
        <p className="text-3xl font-black leading-none text-foreground">{value}</p>
        <p className="min-w-0 text-sm leading-snug text-muted-foreground sm:text-right">{detail}</p>
      </div>
    </div>
  )
}

export function AssetsPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-[var(--radius)] border border-border bg-card/90 p-5 dark:bg-white/[0.035]", className)}>
      {children}
    </section>
  )
}

export function StatusPill({ status }: { status: AssetStatus }) {
  return (
    <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-black text-muted-foreground">
      {statusLabels[status]}
    </span>
  )
}

export function CatalogIcon({
  color,
  label,
}: {
  color: string
  label: string
}) {
  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-xs font-black text-white"
      style={{ backgroundColor: color }}
    >
      {label.slice(0, 4)}
    </span>
  )
}

export function AssetCard({ asset }: { asset: CatalogAsset }) {
  return (
    <Link
      href={`/assets/${asset.slug}`}
      className="group flex min-h-[220px] flex-col justify-between rounded-[var(--radius)] border border-border bg-background p-4 transition hover:bg-muted/45"
    >
      <span>
        <span className="flex items-start justify-between gap-3">
          <CatalogIcon color={asset.color} label={asset.iconLabel} />
          <StatusPill status={asset.status} />
        </span>
        <span className="mt-4 block text-xs font-bold uppercase tracking-[0.16em] text-primary">{asset.symbol}</span>
        <span className="mt-1 block text-xl font-black text-foreground">{asset.name}</span>
        <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{asset.description}</span>
      </span>
      <span className="mt-5 flex items-end justify-between gap-3">
        <span>
          <span className="block text-sm font-black text-foreground">{asset.referencePair}</span>
          <span className="block text-xs text-muted-foreground">{asset.referenceValue}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-black text-foreground">
          Ver ficha
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  )
}

export function PaymentMethodCard({ method }: { method: CatalogPaymentMethod }) {
  return (
    <Link
      href={`/assets/payment-methods/${method.slug}`}
      className="group flex min-h-[220px] flex-col justify-between rounded-[var(--radius)] border border-border bg-background p-4 transition hover:bg-muted/45"
    >
      <span>
        <span className="flex items-start justify-between gap-3">
          <CatalogIcon color={method.color} label={method.iconLabel} />
          <StatusPill status={method.status} />
        </span>
        <span className="mt-4 block text-xs font-bold uppercase tracking-[0.16em] text-primary">
          {paymentMethodTypeLabels[method.type]}
        </span>
        <span className="mt-1 block text-xl font-black text-foreground">{method.name}</span>
        <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{method.description}</span>
      </span>
      <span className="mt-5 flex items-end justify-between gap-3">
        <span>
          <span className="block text-sm font-black text-foreground">{method.currencies.join(", ")}</span>
          <span className="block text-xs text-muted-foreground">{method.estimatedTime}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-black text-foreground">
          Ver método
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  )
}

export function CatalogSection({
  actionHref,
  actionLabel,
  children,
  description,
  eyebrow,
  title,
}: {
  actionHref?: string
  actionLabel?: string
  children: ReactNode
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <AssetsPanel>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black text-foreground">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-black text-foreground transition hover:bg-muted"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      {children}
    </AssetsPanel>
  )
}

export function ProductPills({ products }: { products: AssetProduct[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {products.map((product) => (
        <span key={product} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-black text-muted-foreground">
          {productLabels[product]}
        </span>
      ))}
    </div>
  )
}

export function MetricGrid({
  metrics,
}: {
  metrics: Array<{ label: string; value: string; detail: string }>
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-[var(--radius)] border border-border bg-card/90 p-4 dark:bg-white/[0.035]">
          <p className="text-xs font-semibold text-muted-foreground">{metric.label}</p>
          <p className="mt-2 text-2xl font-black text-foreground">{metric.value}</p>
          <p className="text-xs text-muted-foreground">{metric.detail}</p>
        </div>
      ))}
    </div>
  )
}

export function InfoRows({
  rows,
}: {
  rows: Array<{ label: string; value: ReactNode }>
}) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start justify-between gap-4 rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background px-4 py-3">
          <span className="text-sm text-muted-foreground">{row.label}</span>
          <span className="max-w-[60%] text-right text-sm font-black text-foreground">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export function LegalLinks({
  links,
}: {
  links: Array<{ href: string; label: string }>
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-black text-muted-foreground transition hover:text-foreground"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          {link.label}
        </Link>
      ))}
    </div>
  )
}

export function CatalogSearchShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="rounded-full border border-border bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        {children}
      </div>
    </div>
  )
}

export function getAssetKindIcon(type: AssetKind) {
  if (type === "fiat") return <Banknote className="h-4 w-4 text-primary" />
  if (type === "deco-token") return <BadgeCheck className="h-4 w-4 text-primary" />
  return <WalletCards className="h-4 w-4 text-primary" />
}

export function getPaymentMethodIcon(type: PaymentMethodType) {
  if (type === "bank") return <Landmark className="h-4 w-4 text-primary" />
  if (type === "card") return <CreditCard className="h-4 w-4 text-primary" />
  if (type === "cash") return <Building2 className="h-4 w-4 text-primary" />
  return <WalletCards className="h-4 w-4 text-primary" />
}

export function TypeLabel({ type }: { type: AssetKind }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-black text-muted-foreground">
      {getAssetKindIcon(type)}
      {assetTypeLabels[type]}
    </span>
  )
}
