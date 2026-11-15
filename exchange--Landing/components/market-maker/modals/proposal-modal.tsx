"use client"

import { HandCoins, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ProposalModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
}

export function ProposalModal({ open, onOpenChange, title, description }: ProposalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] overflow-hidden rounded-[var(--radius)] border-border bg-card p-0 dark:bg-background">
        <div className="border-b border-border px-6 py-5">
          <DialogHeader className="text-left">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HandCoins className="h-5 w-5" />
            </div>
            <DialogTitle className="text-2xl font-black">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 px-6 py-5">
          {["Revisión comercial", "Confirmación de cupo", "Aprobación de límites"].map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <span className="font-mono text-xs font-black text-primary">0{index + 1}</span>
              <span className="text-foreground">{step}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            La mesa Deco confirmará condiciones y disponibilidad.
          </p>
          <Button className="rounded-full px-7" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
