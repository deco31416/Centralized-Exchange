import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "rejected"

interface StatusBadgeProps {
  status: TransactionStatus
  className?: string
}

const statusConfig: Record<
  TransactionStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pendiente",
    className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  processing: {
    label: "Procesando",
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  completed: {
    label: "Completado",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  failed: {
    label: "Fallido",
    className: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/20",
  },
  rejected: {
    label: "Rechazado",
    className: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/20",
  }
  
  return (
    <Badge
      className={cn(
        "border font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
