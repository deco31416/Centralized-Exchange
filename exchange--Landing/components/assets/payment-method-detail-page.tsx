import Link from "next/link"
import { ArrowRight, ExternalLink, LockKeyhole, ShieldCheck } from "lucide-react"

import {
  productLabels,
  statusLabels,
  type CatalogPaymentMethod,
} from "@/components/assets/assets-data"
import {
  AssetsHero,
  AssetsPageShell,
  AssetsPanel,
  CatalogIcon,
  InfoRows,
  LegalLinks,
  ProductPills,
  StatusPill,
  getPaymentMethodIcon,
} from "@/components/assets/assets-ui"

export function PaymentMethodDetailPage({ method }: { method: CatalogPaymentMethod }) {
  return (
    <AssetsPageShell>
      <div className="space-y-8">
        <AssetsHero
          eyebrow="Assets · Método de pago"
          title={method.name}
          description={method.detail}
          aside={
            <div className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <CatalogIcon color={method.color} label={method.iconLabel} />
                <StatusPill status={method.status} />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">{method.country}</p>
              <p className="mt-1 text-3xl font-black text-foreground">{method.currencies.join(", ")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{method.providerType}</p>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <AssetsPanel>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Operación</p>
                  <h2 className="mt-2 text-2xl font-black text-foreground">Reglas públicas</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Estos valores son referenciales. Los límites reales dependen del usuario, proveedor y KYC.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-black text-muted-foreground">
                  {getPaymentMethodIcon(method.type)}
                  {method.providerType}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Tiempo", value: method.estimatedTime, detail: "Estimado" },
                  { label: "Mínimo", value: method.minAmount, detail: "General" },
                  { label: "Fee", value: method.feeLabel, detail: "Referencial" },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4">
                    <p className="text-xs font-semibold text-muted-foreground">{metric.label}</p>
                    <p className="mt-2 text-2xl font-black text-foreground">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </AssetsPanel>

            <AssetsPanel>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Productos</p>
              <h2 className="mt-2 text-2xl font-black text-foreground">Donde aplica</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Un método puede aplicar a recargas, retiros, P2P, remesas o compra cripto según país.
              </p>
              <div className="mt-4">
                <ProductPills products={method.products} />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {method.products.map((product) => (
                  <MethodFlowCard key={product} product={product} />
                ))}
              </div>
            </AssetsPanel>

            <AssetsPanel>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Disponibilidad</p>
              <h2 className="mt-2 text-2xl font-black text-foreground">Cobertura pública</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{method.availabilityNotes}</p>
              <div className="mt-5">
                <InfoRows
                  rows={[
                    { label: "Países", value: method.countries.join(", ") },
                    { label: "Monedas", value: method.currencies.join(", ") },
                    { label: "KYC", value: method.requiresKyc ? "Requerido para operar" : "No requerido" },
                    { label: "Titularidad", value: method.requiresOwnership ? "Debe coincidir" : "Según operación" },
                  ]}
                />
              </div>
            </AssetsPanel>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <AssetsPanel>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Resumen</p>
              <h2 className="mt-2 text-2xl font-black text-foreground">{method.name}</h2>
              <div className="mt-4">
                <InfoRows
                  rows={[
                    { label: "Tipo", value: method.providerType },
                    { label: "País", value: method.country },
                    { label: "Moneda", value: method.currencies.join(", ") },
                    { label: "Estado", value: statusLabels[method.status] },
                    {
                      label: "Oficial",
                      value: (
                        <a
                          href={method.officialSite.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground transition hover:text-primary"
                        >
                          {method.officialSite.label}
                        </a>
                      ),
                    },
                  ]}
                />
              </div>
              <a
                href={method.officialSite.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
              >
                Página oficial
                <ExternalLink className="h-4 w-4" />
              </a>
            </AssetsPanel>

            <AssetsPanel>
              <div className="mb-3 flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-black text-foreground">Acción privada</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Crear orden, generar referencia, ver cuenta destino o consultar estado requiere iniciar sesión.
              </p>
              <Link
                href="/bolsillito/add-money"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Usar método
                <ArrowRight className="h-4 w-4" />
              </Link>
            </AssetsPanel>

            <AssetsPanel>
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-black text-foreground">Condiciones</h2>
              </div>
              <LegalLinks links={method.legalLinks} />
            </AssetsPanel>
          </aside>
        </div>
      </div>
    </AssetsPageShell>
  )
}

function MethodFlowCard({ product }: { product: CatalogPaymentMethod["products"][number] }) {
  const hrefByProduct: Partial<Record<CatalogPaymentMethod["products"][number], string>> = {
    "add-money": "/bolsillito/add-money",
    buy: "/easy-crypto/buy",
    p2p: "/markets/p2p",
    remittances: "/bolsillito/remittances",
    "withdraw-credit": "/bolsillito/withdraw-credit",
  }

  return (
    <Link
      href={hrefByProduct[product] ?? "/assets"}
      className="group rounded-[calc(var(--radius)-0.55rem)] border border-border bg-background p-4 transition hover:bg-muted/45"
    >
      <p className="text-sm font-black text-foreground">{productLabels[product]}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Flujo publico con accion privada al confirmar.
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-foreground">
        Abrir
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
