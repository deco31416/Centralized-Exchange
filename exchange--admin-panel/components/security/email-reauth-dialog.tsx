"use client"

import { useEffect, useState } from "react"
import { ShieldCheck } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type EmailReauthDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified: () => void
  title?: string
  description?: string
}

function getMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback
  const value = payload as { message?: unknown; error?: unknown }
  if (typeof value.message === "string") return value.message
  if (typeof value.error === "string") return value.error
  return fallback
}

export function EmailReauthDialog({
  open,
  onOpenChange,
  onVerified,
  title = "Confirmación de seguridad",
  description = "Ingresa el código enviado al correo del administrador para autorizar esta acción sensible.",
}: EmailReauthDialogProps) {
  const [code, setCode] = useState("")
  const [requesting, setRequesting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function requestCode() {
    setRequesting(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/reauth/email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(getMessage(payload, "No se pudo enviar el código de seguridad"))
      }

      const expiresIn = Number(payload?.expires_in) || 0
      setMessage(
        expiresIn > 0
          ? `Código enviado. Vigente por ${Math.ceil(expiresIn / 60)} min.`
          : "Código enviado al correo del administrador.",
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar el código de seguridad",
      )
    } finally {
      setRequesting(false)
    }
  }

  async function verifyCode() {
    if (!code.trim()) {
      setError("Ingresa el código de seguridad.")
      return
    }

    setVerifying(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/reauth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpCode: code.trim() }),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(getMessage(payload, "Código inválido o vencido"))
      }

      setCode("")
      onOpenChange(false)
      onVerified()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido o vencido")
    } finally {
      setVerifying(false)
    }
  }

  useEffect(() => {
    if (!open) return

    setCode("")
    void requestCode()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[1.5rem] sm:max-w-md">
        <DialogHeader className="gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-extrabold">{title}</DialogTitle>
            <DialogDescription className="mt-2 leading-6">{description}</DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid gap-3">
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Código OTP"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="h-12 rounded-full px-5 text-base font-bold tracking-[0.2em]"
            onKeyDown={(event) => {
              if (event.key === "Enter") void verifyCode()
            }}
          />

          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          {error ? <p className="text-sm font-bold text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={requesting || verifying}
            onClick={() => void requestCode()}
          >
            {requesting ? "Enviando..." : "Reenviar"}
          </Button>
          <Button
            type="button"
            className="rounded-full"
            disabled={requesting || verifying}
            onClick={() => void verifyCode()}
          >
            {verifying ? "Verificando..." : "Autorizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
