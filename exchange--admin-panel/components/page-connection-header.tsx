import { ConnectionStatusBadge } from "@/components/connection-status-badge"
import { Badge } from "@/components/ui/badge"
import type { ConnectionState } from "@/lib/admin-module-status"

export function PageConnectionHeader({
  title,
  description,
  state,
  percent,
  note,
}: {
  title: string
  description: string
  state: ConnectionState
  percent: number
  note?: string
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
        {note ? <p className="mt-1 text-xs text-muted-foreground">{note}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ConnectionStatusBadge state={state} percent={percent} />
        <Badge
          variant="outline"
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
        >
          Gateway admin
        </Badge>
      </div>
    </div>
  )
}
