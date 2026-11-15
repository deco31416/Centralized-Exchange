"use client"

import { useMemo, useState } from "react"

import {
  assetTypeLabels,
  paymentMethodTypeLabels,
  type AssetKind,
  type CatalogAsset,
  type CatalogPaymentMethod,
  type PaymentMethodType,
} from "@/components/assets/assets-data"
import {
  AssetCard,
  CatalogSearchShell,
  CatalogSection,
  PaymentMethodCard,
} from "@/components/assets/assets-ui"
import { cn } from "@/lib/utils"

type Filter = "all" | AssetKind | PaymentMethodType

export function AssetsCatalogClient({
  assets,
  methods,
  mode = "all",
}: {
  assets: CatalogAsset[]
  methods: CatalogPaymentMethod[]
  mode?: "all" | "assets" | "methods"
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")

  const filters: Array<{ label: string; value: Filter }> = useMemo(() => {
    if (mode === "methods") {
      return [
        { label: "Todos", value: "all" },
        ...(["wallet", "bank", "rail", "cash", "card"] as PaymentMethodType[]).map((type) => ({
          label: paymentMethodTypeLabels[type],
          value: type,
        })),
      ]
    }

    if (mode === "assets") {
      return [
        { label: "Todos", value: "all" },
        ...(["crypto", "stablecoin", "fiat", "deco-token"] as AssetKind[]).map((type) => ({
          label: assetTypeLabels[type],
          value: type,
        })),
      ]
    }

    return [
      { label: "Todos", value: "all" },
      { label: "Cripto", value: "crypto" },
      { label: "Stablecoins", value: "stablecoin" },
      { label: "Fiat", value: "fiat" },
      { label: "Tokens", value: "deco-token" },
      { label: "Wallets", value: "wallet" },
      { label: "Bancos", value: "bank" },
      { label: "Efectivo", value: "cash" },
      { label: "Tarjetas", value: "card" },
    ]
  }, [mode])

  const normalizedQuery = query.trim().toLowerCase()

  const visibleAssets = assets.filter((asset) => {
    const matchesQuery =
      !normalizedQuery ||
      asset.name.toLowerCase().includes(normalizedQuery) ||
      asset.symbol.toLowerCase().includes(normalizedQuery) ||
      asset.description.toLowerCase().includes(normalizedQuery)
    const matchesFilter = filter === "all" || asset.type === filter
    return matchesQuery && matchesFilter && mode !== "methods"
  })

  const visibleMethods = methods.filter((method) => {
    const matchesQuery =
      !normalizedQuery ||
      method.name.toLowerCase().includes(normalizedQuery) ||
      method.description.toLowerCase().includes(normalizedQuery) ||
      method.currencies.join(" ").toLowerCase().includes(normalizedQuery) ||
      method.country.toLowerCase().includes(normalizedQuery)
    const matchesFilter = filter === "all" || method.type === filter
    return matchesQuery && matchesFilter && mode !== "assets"
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center">
        <CatalogSearchShell>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar BTC, USD, Nequi..."
            className="w-full bg-transparent text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground"
          />
        </CatalogSearchShell>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-full border border-border bg-background px-3 py-2 text-xs font-black text-muted-foreground transition hover:text-foreground",
                filter === item.value && "bg-foreground text-background hover:text-background",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {mode !== "methods" ? (
        <CatalogSection
          eyebrow="Activos"
          title="Cripto, fiat y token Deco"
          description="Fichas públicas con mercado, disponibilidad, productos soportados y respaldo legal."
        >
          {visibleAssets.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleAssets.map((asset) => (
                <AssetCard key={asset.slug} asset={asset} />
              ))}
            </div>
          ) : (
            <EmptySearch />
          )}
        </CatalogSection>
      ) : null}

      {mode !== "assets" ? (
        <CatalogSection
          eyebrow="Métodos"
          title="Formas de mover valor"
          description="Bancos, wallets, rails, efectivo y tarjetas con reglas públicas antes de operar."
        >
          {visibleMethods.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleMethods.map((method) => (
                <PaymentMethodCard key={method.slug} method={method} />
              ))}
            </div>
          ) : (
            <EmptySearch />
          )}
        </CatalogSection>
      ) : null}
    </div>
  )
}

function EmptySearch() {
  return (
    <div className="rounded-[var(--radius)] border border-dashed border-border bg-background p-8 text-center">
      <p className="text-sm font-black text-foreground">Sin resultados</p>
      <p className="mt-1 text-sm text-muted-foreground">Prueba con otro activo, moneda, país o método.</p>
    </div>
  )
}
