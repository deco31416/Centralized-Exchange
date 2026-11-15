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
import { cn } from "@/lib/utils"

type CreateOfferModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const steps = ["Activo", "Cupo", "Condiciones", "Resumen"]

export function CreateOfferModal({ open, onOpenChange }: CreateOfferModalProps) {
  const [step, setStep] = React.useState(0)

  React.useEffect(() => {
    if (!open) setStep(0)
  }, [open])

  const isLastStep = step === steps.length - 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] overflow-hidden rounded-[var(--radius)] border-border bg-card p-0 dark:bg-background">
        <div className="border-b border-border px-6 py-5">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-black">Crear oferta OTC</DialogTitle>
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
                <span className="font-mono text-primary dark:text-primary">0{index + 1}</span> {item}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[330px] px-6 py-5">
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {["USDT", "USDC", "BTC"].map((asset) => (
                <button key={asset} className="rounded-xl border border-border bg-background p-4 text-left hover:bg-muted/40">
                  <p className="text-lg font-black text-foreground">{asset}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Liquidez mayorista</p>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="rounded-xl border border-border bg-background p-4">
                <span className="text-xs font-bold text-muted-foreground">Cupo disponible</span>
                <input className="mt-2 w-full bg-transparent text-2xl font-black text-foreground outline-none" defaultValue="100,000,000" />
              </label>
              <label className="rounded-xl border border-border bg-background p-4">
                <span className="text-xs font-bold text-muted-foreground">Ticket mínimo</span>
                <input className="mt-2 w-full bg-transparent text-2xl font-black text-foreground outline-none" defaultValue="10,000" />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Spread", "-3%"],
                ["Liquidación", "T+0"],
                ["País", "Colombia"],
              ].map(([label, value]) => (
                <label key={label} className="rounded-xl border border-border bg-background p-4">
                  <span className="text-xs font-bold text-muted-foreground">{label}</span>
                  <input className="mt-2 w-full bg-transparent text-xl font-black text-foreground outline-none" defaultValue={value} />
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {[
                ["Oferta", "Vende 100M USDT"],
                ["Precio preferencial", "-3%"],
                ["Ticket mínimo", "10,000 USDT"],
                ["Liquidación", "T+0 · Colombia"],
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
          <Button className="rounded-full px-7" onClick={() => (isLastStep ? onOpenChange(false) : setStep(step + 1))}>
            {isLastStep ? "Publicar oferta" : "Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
