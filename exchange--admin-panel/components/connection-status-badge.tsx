import { IconCircleCheck, IconClock, IconPlugConnected } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import type { ConnectionState } from "@/lib/admin-module-status"

const stateConfig = {
  connected: {
    label: "Conectado",
    Icon: IconCircleCheck,
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  partial: {
    label: "Parcial",
    Icon: IconPlugConnected,
    className:
      "border-slate-400/30 bg-slate-500/10 text-slate-700 dark:text-slate-200",
  },
  pending: {
    label: "Pendiente",
    Icon: IconClock,
    className:
      "border-zinc-400/25 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  },
} satisfies Record<ConnectionState, { label: string; Icon: typeof IconCircleCheck; className: string }>

export function ConnectionStatusBadge({
  state,
  percent,
}: {
  state: ConnectionState
  percent?: number
}) {
  const config = stateConfig[state]
  const Icon = config.Icon

  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
    >
      <Icon className="size-3.5" />
      {config.label}
      {typeof percent === "number" ? ` ${percent}%` : null}
    </Badge>
  )
}
