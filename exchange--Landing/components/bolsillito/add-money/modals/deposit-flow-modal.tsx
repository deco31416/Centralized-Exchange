"use client"

import { Banknote, Building2, CreditCard, Landmark, Smartphone, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AddMoneyMethod } from "../add-money-options"

type DepositFlowModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  method: AddMoneyMethod | null
  amount: number
  currency: string
  regionLabel: string
}

const flowCopy = {
  bank: {
    title: "Depósito bancario",
    icon: Landmark,
    steps: ["Copia la referencia", "Paga desde tu banco", "Confirma el comprobante"],
  },
  electronic: {
    title: "Medio electrónico",
    icon: Smartphone,
    steps: ["Revisa el proveedor", "Envía el monto exacto", "Adjunta soporte"],
  },
  cash: {
    title: "Depósito en efectivo",
    icon: Store,
    steps: ["Genera el código", "Paga en punto aliado", "Espera confirmación"],
  },
  card: {
    title: "Pago con tarjeta",
    icon: CreditCard,
    steps: ["Valida el total", "Continúa al proveedor", "Recibe confirmación"],
  },
} as const

function formatAmount(amount: number, currency: string) {
  return `${amount.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`
}

export function DepositFlowModal({
  open,
  onOpenChange,
  method,
  amount,
  currency,
  regionLabel,
}: DepositFlowModalProps) {
  const flow = method ? flowCopy[method.category] : flowCopy.bank
  const Icon = flow.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px] overflow-hidden rounded-[var(--radius)] border-border bg-card p-0 dark:bg-background">
        <div className="border-b border-border px-6 py-5">
          <DialogHeader className="text-left">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <DialogTitle className="text-2xl font-black">{flow.title}</DialogTitle>
            <DialogDescription>
              Mockup de instrucciones para {regionLabel} · {currency}. Luego el backend entregará referencia, expiración y datos reales.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-4">
              <p className="text-xs font-semibold text-muted-foreground">Método</p>
              <p className="mt-1 text-sm font-black text-foreground">{method?.title ?? "Método"}</p>
            </div>
            <div className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-4">
              <p className="text-xs font-semibold text-muted-foreground">Monto</p>
              <p className="mt-1 text-sm font-black text-foreground">{formatAmount(amount, currency)}</p>
            </div>
            <div className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-4">
              <p className="text-xs font-semibold text-muted-foreground">Tiempo</p>
              <p className="mt-1 text-sm font-black text-foreground">{method?.time ?? "Según red"}</p>
            </div>
          </div>

          <div className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background p-5">
            <div className="mb-4 flex items-center gap-2">
              {method?.category === "bank" ? <Building2 className="h-4 w-4 text-primary" /> : <Banknote className="h-4 w-4 text-primary" />}
              <p className="text-sm font-black text-foreground">Acción simulada</p>
            </div>
            <div className="grid gap-2">
              {flow.steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm">
                  <span className="font-mono text-xs font-black text-primary">0{index + 1}</span>
                  <span className="text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Este flujo es visual. La confirmación real dependerá del servicio de funding.
          </p>
          <Button className="rounded-full px-7" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
