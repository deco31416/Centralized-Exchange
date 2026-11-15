import Link from "next/link"
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react"

import { AssetChartPanel } from "@/components/assets/assets-chart-panel"
import {
  getRelatedMethodsForAsset,
  productLabels,
  type CatalogAsset,
} from "@/components/assets/assets-data"
import {
  AssetsHero,
  AssetsHeroStat,
  AssetsPageShell,
  AssetsPanel,
  CatalogIcon,
  InfoRows,
  LegalLinks,
  MetricGrid,
  PaymentMethodCard,
  ProductPills,
  StatusPill,
  TypeLabel,
} from "@/components/assets/assets-ui"

export function AssetDetailPage({ asset }: { asset: CatalogAsset }) {
  const relatedMethods = getRelatedMethodsForAsset(asset)

  return (
    <AssetsPageShell>
      <div className="space-y-8">
        <AssetsHero
          eyebrow={`Assets · ${asset.symbol}`}
          title={asset.name}
          description={asset.detail}
          aside={
            <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <CatalogIcon color={asset.color} label={asset.iconLabel} />
                <StatusPill status={asset.status} />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">{asset.referencePair}</p>
              <p className="mt-1 text-3xl font-black text-foreground">{asset.referenceValue}</p>
              <p className="mt-1 text-sm text-muted-foreground">{asset.referenceChange} · referencia pública</p>
            </div>
          }
        />

        <MetricGrid metrics={asset.metrics} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <AssetChartPanel asset={asset} />

            <AssetsPanel>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Usos en Deco</p>
                  <h2 className="mt-2 text-2xl font-black text-foreground">Rutas disponibles</h2>
                </div>
                <TypeLabel type={asset.type} />
              </div>
              <ProductPills products={asset.products} />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {asset.products.slice(0, 6).map((product) => (
                  <ProductRouteCard key={product} product={product} asset={asset} />
                ))}
              </div>
            </AssetsPanel>

            {relatedMethods.length > 0 ? (
              <AssetsPanel>
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Métodos relacionados</p>
                  <h2 className="mt-2 text-2xl font-black text-foreground">Cómo mover {asset.symbol}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Métodos públicos asociados a la moneda. La disponibilidad real depende del usuario.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedMethods.map((method) => (
                    <PaymentMethodCard key={method.slug} method={method} />
                  ))}
                </div>
              </AssetsPanel>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <AssetsPanel>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Disponibilidad</p>
              <h2 className="mt-2 text-2xl font-black text-foreground">Vista pública</h2>
              <div className="mt-4">
                <InfoRows
                  rows={[
                    { label: "Simbolo", value: asset.symbol },
                    { label: "Tipo", value: <TypeLabel type={asset.type} /> },
                    { label: "Países", value: asset.countries.join(", ") },
                    { label: "Redes/Rails", value: asset.networks.join(", ") },
                  ]}
                />
              </div>
            </AssetsPanel>

            <AssetsPanel>
              <div className="mb-3 flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-black text-foreground">Datos privados</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Saldo, límites, wallets, referencias y acciones reales requieren iniciar sesión y validación del backend.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Ver en mi cuenta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </AssetsPanel>

            <AssetsPanel>
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-black text-foreground">Riesgos y reglas</h2>
              </div>
              <div className="space-y-2">
                {asset.risks.map((risk) => (
                  <div key={risk} className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                    {risk}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <LegalLinks links={asset.legalLinks} />
              </div>
            </AssetsPanel>
          </aside>
        </div>
      </div>
    </AssetsPageShell>
  )
}

function ProductRouteCard({
  asset,
  product,
}: {
  asset: CatalogAsset
  product: CatalogAsset["products"][number]
}) {
  const hrefByProduct: Partial<Record<CatalogAsset["products"][number], string>> = {
    "add-money": "/bolsillito/add-money",
    buy: "/easy-crypto/buy",
    convert: "/easy-crypto/convert",
    p2p: "/markets/p2p",
    remittances: "/bolsillito/remittances",
    sell: "/easy-crypto/sell",
    send: "/easy-crypto/send",
    spot: "/easy-crypto/spot-lite",
    staking: "/rendimiento/staking-tokens",
    "withdraw-credit": "/bolsillito/withdraw-credit",
  }

  return (
    <Link
      href={hrefByProduct[product] ?? "/assets"}
      className="group rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4 transition hover:bg-muted/45"
    >
      <p className="text-sm font-black text-foreground">{productLabels[product]}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Usar {asset.symbol} en {productLabels[product].toLowerCase()}.
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-foreground">
        Abrir flujo
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
