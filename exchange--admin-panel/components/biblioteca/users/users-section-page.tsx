"use client"

import Link from "next/link"
import {
  IconArrowRight,
  IconClock,
  IconCrown,
  IconDatabase,
  IconShield,
  IconUserCheck,
  IconUsers,
  IconUserX,
  type Icon,
} from "@tabler/icons-react"

import { PageConnectionHeader } from "@/components/page-connection-header"
import { StatsCards } from "@/components/operaciones/stats-cards"
import { TransactionTable } from "@/components/operaciones/transaction-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminUsers } from "@/components/biblioteca/users/use-admin-users"
import type { ConnectionState } from "@/lib/admin-module-status"

type UsersSectionPageProps = {
  title: string
  description: string
  status?: string
  role?: string
  state?: ConnectionState
  percent?: number
  note?: string
  variant?: "index" | "table" | "pending"
}

const modules: Array<{
  title: string
  description: string
  href: string
  countKey: "active" | "pending" | "blocked" | "vip"
  Icon: Icon
}> = [
  {
    title: "Usuarios activos",
    description: "Cuentas habilitadas o con estado activo.",
    href: "/biblioteca/users/activos",
    countKey: "active",
    Icon: IconUserCheck,
  },
  {
    title: "Usuarios pendientes",
    description: "Cuentas esperando verificación o activación.",
    href: "/biblioteca/users/pendientes",
    countKey: "pending",
    Icon: IconClock,
  },
  {
    title: "Usuarios bloqueados",
    description: "Cuentas suspendidas por seguridad o cumplimiento.",
    href: "/biblioteca/users/bloqueados",
    countKey: "blocked",
    Icon: IconUserX,
  },
  {
    title: "Usuarios VIP",
    description: "Segmento premium cuando el backend exponga tier o nivel.",
    href: "/biblioteca/users/vip",
    countKey: "vip",
    Icon: IconCrown,
  },
]

const columns = [
  {
    key: "id",
    label: "ID",
    className: "font-mono text-xs",
    render: (value: string) => value.substring(0, 10),
  },
  { key: "userName", label: "Usuario" },
  { key: "email", label: "Email", className: "text-sm" },
  { key: "statusLabel", label: "Estado" },
  { key: "kycStatus", label: "KYC" },
  { key: "tier", label: "Nivel" },
  { key: "country", label: "País" },
  { key: "createdAt", label: "Registro", className: "text-sm" },
]

export function UsersSectionPage({
  title,
  description,
  status,
  role,
  state = "partial",
  percent = 45,
  note,
  variant = "table",
}: UsersSectionPageProps) {
  const { users, source, loading, error, note: sourceNote, summary } = useAdminUsers({ status, role })
  const countOnly = source === "count-only"
  const headerNote =
    note ||
    (countOnly
      ? "Conteo conectado; listado detallado pendiente en Gateway Admin."
      : "Listado consultado por Gateway Admin.")

  const stats = [
    {
      title: "Total usuarios",
      value: loading ? "..." : summary.total,
      icon: <IconUsers className="size-5" />,
    },
    {
      title: "Activos",
      value: loading || countOnly ? "—" : summary.active,
      icon: <IconUserCheck className="size-5" />,
    },
    {
      title: "Pendientes",
      value: loading || countOnly ? "—" : summary.pending,
      icon: <IconClock className="size-5" />,
    },
    {
      title: "Bloqueados",
      value: loading || countOnly ? "—" : summary.blocked,
      icon: <IconShield className="size-5" />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageConnectionHeader
        title={title}
        description={description}
        state={state}
        percent={percent}
        note={headerNote}
      />

      {variant !== "pending" ? <StatsCards stats={stats} /> : null}

      {sourceNote || error ? (
        <Card className="rounded-[1.5rem]">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-background">
              <IconDatabase className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">{error ? "Fuente no disponible" : "Conexión parcial"}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {error || sourceNote}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {variant === "index" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map(({ title: moduleTitle, description: moduleDescription, href, countKey, Icon }) => (
            <Link key={href} href={href}>
              <Card className="h-full rounded-[1.5rem] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgb(15_23_42/0.12)] dark:hover:shadow-[0_18px_55px_rgb(148_163_184/0.08)]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full border bg-background">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <span className="text-2xl font-bold tabular-nums">
                      {loading || countOnly ? "—" : summary[countKey]}
                    </span>
                  </div>
                  <CardTitle className="pt-3">{moduleTitle}</CardTitle>
                  <CardDescription className="leading-6">{moduleDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2 text-sm font-semibold text-primary">
                  Ver módulo
                  <IconArrowRight className="size-4" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : variant === "pending" ? (
        <Card className="rounded-[1.5rem]">
          <CardHeader>
            <div className="mb-3 flex size-12 items-center justify-center rounded-full border bg-background">
              <IconClock className="size-6 text-primary" />
            </div>
            <CardTitle>Historial pendiente de conectar</CardTitle>
            <CardDescription className="leading-6">
              El micro de auth de usuarios todavía no expone historial de sesiones para clientes.
              Esta página queda lista para recibir el endpoint cuando exista.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <TransactionTable
          data={users as any}
          columns={columns}
          emptyMessage="No hay usuarios para mostrar"
        />
      )}
    </div>
  )
}
