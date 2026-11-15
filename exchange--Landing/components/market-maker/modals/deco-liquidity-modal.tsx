"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { decoProposal } from "../market-maker-data"
import { cn } from "@/lib/utils"

type DecoLiquidityModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const steps = ["Cupo", "Precio", "Margen", "Enviar"]

export function DecoLiquidityModal({ open, onOpenChange }: DecoLiquidityModalProps) {
  const [step, setStep] = React.useState(0)

  React.useEffect(() => {
    if (!open) setStep(0)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] overflow-hidden rounded-[var(--radius)] border-border bg-card p-0 dark:bg-background">
        <div className="border-b border-border px-6 py-5">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-black">Propuesta a Deco</DialogTitle>
          </DialogHeader>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {steps.map((item, index) => (
              <div
                key={item}
                className={cn(
                  "rounded-full border border-border px-3 py-2 text-center text-xs font-bold text-muted-foreground",
                  index === step && "bg-foreground text-background"
                )}
              >
                <span className="font-mono text-primary">0{index + 1}</span> {item}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[300px] px-6 py-5">
          {step === 0 && (
            <div className="rounded-xl border border-border bg-background p-5">
              <p className="text-sm font-bold text-muted-foreground">Cupo disponible</p>
              <p className="mt-2 text-3xl font-black text-foreground">{decoProposal.amount} {decoProposal.asset}</p>
              <p className="mt-2 text-sm text-muted-foreground">Liquidez reservada para la mesa Deco.</p>
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-5">
                <p className="text-sm font-bold text-muted-foreground">Precio para Deco</p>
                <p className="mt-2 text-3xl font-black text-foreground">{decoProposal.makerRate}</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-5">
                <p className="text-sm font-bold text-muted-foreground">Liquidación</p>
                <p className="mt-2 text-3xl font-black text-foreground">{decoProposal.settlement}</p>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-background p-5">
                <p className="text-sm font-bold text-muted-foreground">Mesa</p>
                <p className="mt-2 text-2xl font-black text-foreground">{decoProposal.makerRate}</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-5">
                <p className="text-sm font-bold text-muted-foreground">Deco vende</p>
                <p className="mt-2 text-2xl font-black text-foreground">{decoProposal.decoTarget}</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-5">
                <p className="text-sm font-bold text-muted-foreground">Margen Deco</p>
                <p className="mt-2 text-2xl font-black text-foreground">{decoProposal.decoMargin}</p>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              {[
                ["Activo", decoProposal.asset],
                ["Monto", decoProposal.amount],
                ["Precio para Deco", decoProposal.makerRate],
                ["Precio comercial", decoProposal.decoTarget],
                ["Margen esperado", decoProposal.decoMargin],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-black text-foreground">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 sm:justify-between">
          <Button variant="outline" className="rounded-full" onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}>
            {step === 0 ? "Cancelar" : "Atrás"}
          </Button>
          <Button className="rounded-full px-7" onClick={() => (step === steps.length - 1 ? onOpenChange(false) : setStep(step + 1))}>
            {step === steps.length - 1 ? "Enviar propuesta" : "Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
