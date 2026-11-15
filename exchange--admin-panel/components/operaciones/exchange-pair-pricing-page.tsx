"use client"

import { useEffect, useMemo, useState } from "react"
import { IconArrowRight, IconCoin, IconExchange, IconTrendingUp } from "@tabler/icons-react"
import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { Transaction, TransactionTable } from "@/components/operaciones/transaction-table"

type AssetKind = "fiat" | "crypto"
type OperationKind = "compras" | "ventas" | "convertir"

type ExchangePair = {
  pair: string
  from: string
  to: string
  rate: number
  inverseRate: number
  fromSource: string
  toSource: string
}

type ExchangePairPricingPageProps = {
  operation: OperationKind
  fromKind: AssetKind
  toKind: AssetKind
}

const operationLabels: Record<OperationKind, string> = {
  compras: "Compras",
  ventas: "Ventas",
  convertir: "Convertir",
}

const kindLabels: Record<AssetKind, string> = {
  fiat: "Fiat",
  crypto: "Crypto",
}

const sourceGroups: Record<AssetKind, string[]> = {
  fiat: ["fiat", "stablecoin"],
  crypto: ["crypto", "launchpad"],
}

function formatRate(value: number) {
  if (!Number.isFinite(value)) return "—"
  if (value >= 100) return value.toLocaleString("es-CO", { maximumFractionDigits: 2 })
  if (value >= 1) return value.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  return value.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}

function mapPairToRow(pair: ExchangePair): Transaction {
  return {
    id: pair.pair,
    pair: pair.pair,
    fromCurrency: pair.from,
    toCurrency: pair.to,
    rate: pair.rate,
    inverseRate: pair.inverseRate,
    source: `${pair.fromSource} → ${pair.toSource}`,
    status: "Referencia",
  }
}

export function ExchangePairPricingPage({ operation, fromKind, toKind }: ExchangePairPricingPageProps) {
  const [pairs, setPairs] = useState<ExchangePair[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const flowLabel = `${kindLabels[fromKind]} → ${kindLabels[toKind]}`
  const title = `${operationLabels[operation]}: ${flowLabel}`

  useEffect(() => {
    let cancelled = false

    async function loadPairs() {
      try {
        setError(null)
        const response = await fetch("/api/pricing/prices/matrix", { cache: "no-store" })
        if (!response.ok) throw new Error("No se pudo consultar la matriz de pricing")

        const payload = await response.json()
        const allPairs = Array.isArray(payload?.pairs) ? (payload.pairs as ExchangePair[]) : []
        const filteredPairs = allPairs.filter((pair) =>
          sourceGroups[fromKind].includes(pair.fromSource) &&
          sourceGroups[toKind].includes(pair.toSource),
        )

        if (!cancelled) setPairs(filteredPairs)
      } catch (err) {
        if (!cancelled) {
          setPairs([])
          setError(err instanceof Error ? err.message : "No se pudo consultar pricing")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPairs()

    return () => {
      cancelled = true
    }
  }, [fromKind, toKind])

  const rows = useMemo(() => pairs.map(mapPairToRow), [pairs])
  const averageRate = useMemo(() => {
    const rates = pairs.map((pair) => Number(pair.rate)).filter((rate) => Number.isFinite(rate) && rate > 0)
    if (!rates.length) return "—"
    return formatRate(rates.reduce((sum, rate) => sum + rate, 0) / rates.length)
  }, [pairs])

  const stats = [
    {
      title: "Pares",
      value: loading ? "—" : pairs.length.toLocaleString("es-CO"),
      icon: <IconExchange className="size-5" />,
      change: { value: 0, label: "pricing" },
    },
    {
      title: "Origen",
      value: kindLabels[fromKind],
      icon: <IconCoin className="size-5" />,
      change: { value: 0, label: "asset" },
    },
    {
      title: "Destino",
      value: kindLabels[toKind],
      icon: <IconArrowRight className="size-5" />,
      change: { value: 0, label: "asset" },
    },
    {
      title: "Tasa promedio",
      value: loading ? "—" : averageRate,
      icon: <IconTrendingUp className="size-5" />,
      change: { value: 0, label: "referencial" },
    },
  ]

  const columns = [
    { key: "pair", label: "Par", className: "font-mono" },
    { key: "fromCurrency", label: "De", className: "font-mono" },
    { key: "toCurrency", label: "A", className: "font-mono" },
    {
      key: "rate",
      label: "Tasa",
      className: "text-right tabular-nums",
      render: (value: number) => formatRate(value),
    },
    {
      key: "inverseRate",
      label: "Inversa",
      className: "text-right tabular-nums",
      render: (value: number) => formatRate(value),
    },
    { key: "source", label: "Fuente" },
    { key: "status", label: "Estado" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title={title}
        description="Referencia operativa de pares disponible desde pricing aggregator."
        state="partial"
        percent={45}
        note="La matriz de pricing está conectada por Gateway Admin; falta crear el motor de ejecución, bloqueo de cotización y liquidación."
      />

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <StatsCards stats={stats} />

      <TransactionTable
        data={rows}
        columns={columns}
        itemsPerPage={12}
      />
    </div>
  )
}
