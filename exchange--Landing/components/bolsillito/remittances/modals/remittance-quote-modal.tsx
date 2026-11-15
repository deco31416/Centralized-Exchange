"use client"

import { ArrowRightLeft, FileCheck2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { RemittanceRoute } from "../remittances-options"

type RemittanceQuoteModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: RemittanceRoute | null
  sendAmount: number
  sourceCurrency: string
  receiveAmount: number
}

function formatAmount(amount: number, currency: string) {
  return `${amount.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`
}

export function RemittanceQuoteModal({
  open,
  onOpenChange,
  route,
  sendAmount,
  sourceCurrency,
  receiveAmount,
}: RemittanceQuoteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px] overflow-hidden rounded-[var(--radius)] border-border bg-card p-0 dark:bg-background">
        <div className="border-b border-border px-6 py-5">
          <DialogHeader className="text-left">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <DialogTitle className="text-2xl font-black">Cotización de remesa</DialogTitle>
            <DialogDescription>
              Mockup referencial. Luego el backend entregará tasa, comisión, expiración y compliance real.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-4">
              <p className="text-xs font-semibold text-muted-foreground">Envías</p>
              <p className="mt-1 text-sm font-black text-foreground">{formatAmount(sendAmount, sourceCurrency)}</p>
            </div>
            <div className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-4">
              <p className="text-xs font-semibold text-muted-foreground">Destino</p>
              <p className="mt-1 text-sm font-black text-foreground">{route?.country ?? "Destino"}</p>
            </div>
            <div className="rounded-[calc(var(--radius)-0.65rem)] border border-border bg-background p-4">
              <p className="text-xs font-semibold text-muted-foreground">Reciben</p>
              <p className="mt-1 text-sm font-black text-foreground">
                {formatAmount(receiveAmount, route?.currency ?? sourceCurrency)}
              </p>
            </div>
          </div>

          <div className="rounded-[calc(var(--radius)-0.45rem)] border border-border bg-background p-5">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-black text-foreground">Validaciones del flujo</p>
            </div>
            <div className="grid gap-2">
              {["Validar origen de fondos", "Confirmar beneficiario", "Reservar tasa temporal"].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm">
                  <span className="font-mono text-xs font-black text-primary">0{index + 1}</span>
                  <span className="text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileCheck2 className="h-3.5 w-3.5" />
            La tasa final se bloqueará desde backend.
          </p>
          <Button className="rounded-full px-7" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
