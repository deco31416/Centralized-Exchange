"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { PageConnectionHeader } from "@/components/page-connection-header"
import {
  IconTransfer,
  IconUsers,
  IconBuildingStore,
  IconQrcode,
  IconChartLine,
} from "@tabler/icons-react"
import Link from "next/link"
import { useWalletTransactions } from "@/components/biblioteca/transactions/use-wallet-transactions"

type P2PCode = {
  code: string
  status: "PENDING" | "USED" | "EXPIRED" | "CANCELLED"
}

function normalizeResponse<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== "object") return []
  const data = (payload as { data?: unknown }).data
  return Array.isArray(data) ? (data as T[]) : []
}

export default function TransferenciasPage() {
  const { summary: txSummary, loading: loadingTx, error: txError } = useWalletTransactions()
  const [qrTotal, setQrTotal] = useState(0)
  const [qrPending, setQrPending] = useState(0)
  const [qrUsed, setQrUsed] = useState(0)
  const [loadingQr, setLoadingQr] = useState(true)

  useEffect(() => {
    async function loadQrOverview() {
      try {
        const res = await fetch("/api/p2p/admin/codes?limit=100", { cache: "no-store" })
        if (!res.ok) return
        const payload = await res.json()
        const codes = normalizeResponse<P2PCode>(payload)
        setQrTotal(codes.length)
        setQrPending(codes.filter((code) => code.status === "PENDING").length)
        setQrUsed(codes.filter((code) => code.status === "USED").length)
      } finally {
        setLoadingQr(false)
      }
    }

    loadQrOverview()
  }, [])

  const stats = [
    {
      title: "Transferencias",
      value: loadingTx ? "—" : txSummary.p2pTransfers.toLocaleString(),
      icon: <IconTransfer className="size-5" />,
      change: {
        value: 0,
        label: "ledger",
      },
    },
    {
      title: "Entre Usuarios",
      value: loadingTx ? "—" : txSummary.p2pTransfers.toLocaleString(),
      icon: <IconUsers className="size-5" />,
      change: {
        value: 0,
        label: "P2P_TRANSFER",
      },
    },
    {
      title: "A Tiendas",
      value: "Parcial",
      icon: <IconBuildingStore className="size-5" />,
      change: {
        value: 0,
        label: "DECOPAY",
      },
    },
    {
      title: "QR P2P",
      value: loadingQr ? "—" : qrTotal.toLocaleString("es-CO"),
      icon: <IconQrcode className="size-5" />,
      change: {
        value: 0,
        label: "internal-transfers",
      },
    },
  ]

  const modules = [
    {
      title: "Usuarios",
      description: "Movimientos entre usuarios registrados en wallet-ledger.",
      href: "/operaciones/transferencias/usuarios",
      icon: <IconUsers className="size-6" />,
      stats: loadingTx ? "Cargando..." : `${txSummary.p2pTransfers} movimientos`,
      color: "from-blue-500/10 to-blue-500/5",
      state: txError ? "partial" as const : "connected" as const,
      percent: txError ? 65 : 100,
    },
    {
      title: "Tiendas",
      description: "Pagos a comercios y tiendas asociados al flujo DECOPAY.",
      href: "/operaciones/transferencias/tiendas",
      icon: <IconBuildingStore className="size-6" />,
      stats: "DECOPAY conectado",
      color: "from-purple-500/10 to-purple-500/5",
      state: "partial" as const,
      percent: 65,
    },
    {
      title: "QR P2P",
      description: "Códigos y cobros QR gestionados por internal-transfers.",
      href: "/operaciones/transferencias/qr-p2p",
      icon: <IconQrcode className="size-6" />,
      stats: loadingQr ? "Cargando..." : `${qrPending} activos`,
      color: "from-emerald-500/10 to-emerald-500/5",
      state: "partial" as const,
      percent: 70,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title="Transferencias internas"
        description="Seguimiento de movimientos entre usuarios, tiendas y pagos por QR."
        state="partial"
        percent={txError ? 60 : 72}
        note="Usuarios lee P2P_TRANSFER desde wallet-ledger, QR consulta internal-transfers y tiendas usa DECOPAY por Gateway Admin."
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className={`bg-gradient-to-br ${module.color} cursor-pointer transition-all hover:shadow-md`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    {module.icon}
                  </div>
                  <IconChartLine className="size-5 text-muted-foreground" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <CardTitle>{module.title}</CardTitle>
                  <ConnectionStatusBadge state={module.state} percent={module.percent} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
                <p className="text-sm font-semibold text-primary">
                  {module.stats}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen operativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @xl/main:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold">{loadingQr ? "—" : qrPending}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completadas hoy</p>
              <p className="text-2xl font-bold">{loadingQr ? "—" : qrUsed}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monto promedio</p>
              <p className="text-2xl font-bold">—</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fallidas</p>
              <p className="text-2xl font-bold">—</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
