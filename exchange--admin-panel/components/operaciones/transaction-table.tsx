"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { StatusBadge, TransactionStatus } from "./status-badge"
import { AmountDisplay } from "./amount-display"
import { cn } from "@/lib/utils"
import { useState } from "react"

export interface Transaction {
  id: string
  userId?: string
  userName?: string
  amount?: number | string
  currency?: string
  asset?: string
  method?: string
  status?: TransactionStatus | string
  createdAt?: string
  timestamp?: string
  [key: string]: any
}

interface Column {
  key: string
  label: string
  render?: (value: any, row: Transaction) => React.ReactNode
  className?: string
}

interface TransactionTableProps {
  data: Transaction[]
  columns: Column[]
  onRowClick?: (transaction: Transaction) => void
  className?: string
  itemsPerPage?: number
  emptyMessage?: string
}

export function TransactionTable({
  data,
  columns,
  onRowClick,
  className,
  itemsPerPage = 10,
  emptyMessage = "No hay registros para mostrar",
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const statusMap: Record<string, TransactionStatus> = {
    "Pendiente": "pending",
    "Procesando": "processing",
    "Completada": "completed",
    "Completado": "completed",
    "Fallida": "failed",
    "Fallido": "failed",
    "Cancelada": "cancelled",
    "Cancelado": "cancelled",
    "Rechazada": "rejected",
    "Rechazado": "rejected",
    "Activa": "completed",
    "Activo": "completed",
    "Inactiva": "cancelled",
    "Inactivo": "cancelled",
    "Suspendida": "pending",
    "Suspendido": "pending",
    "En Mantenimiento": "processing",
    "Bloqueada": "rejected",
    "Bloqueado": "rejected",
    "Segura": "completed",
    "Seguro": "completed",
    "En Auditoría": "processing",
    "Con Discrepancias": "failed",
  }

  const defaultRender = (key: string, value: any, row: Transaction) => {
    if (key === "status") {
      // Mapear valores en español a inglés si es necesario
      let statusValue = value
      if (typeof value === "string" && statusMap[value]) {
        statusValue = statusMap[value]
      }
      return <StatusBadge status={statusValue as TransactionStatus} />
    }
    if (key === "amount") {
      // Si el amount ya viene formateado como string, devolverlo tal cual
      if (typeof value === "string") {
        return value
      }
      // Si es número, usar AmountDisplay con currency o asset
      return <AmountDisplay amount={value} currency={row.currency || row.asset} />
    }
    if ((key === "createdAt" || key === "timestamp") && typeof value === "string") {
      return new Date(value).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
    return value
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : defaultRender(column.key, row[column.key], row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={cn(
                  currentPage === 1 && "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className={cn(
                  currentPage === totalPages &&
                    "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
