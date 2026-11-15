"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, X } from "lucide-react"
import { WalletBlcFundingService, type BlcDepositMethod } from "@/services/WalletBlcFundingService"
import { useAuth } from "@/components/p2p/use-auth"
import { toast } from "@/hooks/use-toast"

interface ModalFundBlcProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const MODE: "development" | "production" =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_BLC_DEV_TOPUP !== "true"
    ? "production"
    : "development"

export default function ModalFundBlc({ open, onClose, onSuccess }: ModalFundBlcProps) {
  const { user, isLoading: authLoading } = useAuth()
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [reference, setReference] = useState("")
  const [methods, setMethods] = useState<BlcDepositMethod[]>([])
  const [selectedMethodId, setSelectedMethodId] = useState("")
  const [loadingMethods, setLoadingMethods] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const numericAmount = Number(amount)

  useEffect(() => {
    if (!open) return
    setError(null)
    setSuccess(null)

    if (MODE === "production") {
      setLoadingMethods(true)
      WalletBlcFundingService.getBlcDepositMethods()
        .then((data) => {
          setMethods(data)
          if (data.length > 0) {
            setSelectedMethodId(data[0].methodId)
          }
        })
        .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar metodos BLC"))
        .finally(() => setLoadingMethods(false))
    }
  }, [open])

  const selectedMethod = useMemo(
    () => methods.find((m) => m.methodId === selectedMethodId) ?? null,
    [methods, selectedMethodId],
  )

  if (!open) return null

  const submitDisabled =
    !user?.id ||
    authLoading ||
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0 ||
    submitting ||
    (MODE === "production" && !selectedMethodId)

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    if (!user?.id) {
      const loginError = "Se requiere iniciar sesión para operar con BLC."
      setError(loginError)
      toast({
        title: "Login requerido",
        description: loginError,
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      if (MODE === "development") {
        await WalletBlcFundingService.createBlcDevTopup({
          amount: numericAmount,
          currency: "BLC",
          reason: note || "development topup",
        })
        setSuccess("Top-up BLC de prueba registrado correctamente.")
        toast({
          title: "Operacion exitosa",
          description: "BLC agregado en modo desarrollo",
        })
      } else {
        const created = await WalletBlcFundingService.createBlcDepositRequest({
          amount: numericAmount,
          currency: "BLC",
          selectedPaymentMethodId: selectedMethodId,
          userNote: note || undefined,
          reference: reference || undefined,
        })
        setSuccess(`Solicitud creada: ${created.reference} (estado ${created.status}).`)
        toast({
          title: "Solicitud enviada",
          description: `Solicitud BLC ${created.reference} en estado ${created.status}`,
        })
      }

      onSuccess?.()
      onClose()
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo completar la operacion BLC"
      setError(message)
      toast({
        title: "Operacion fallida",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {MODE === "development" ? "Agregar BLC de prueba" : "Solicitar carga BLC"}
            </h3>
            <p className="text-xs text-muted-foreground">
              BLC es saldo interno de plataforma. No es moneda fiat legal.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {MODE === "production" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Metodo/cuenta deco-exchange</label>
              {loadingMethods ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Cargando metodos...
                </div>
              ) : methods.length > 0 ? (
                <select
                  value={selectedMethodId}
                  onChange={(e) => setSelectedMethodId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground"
                >
                  {methods.map((m) => (
                    <option key={m.methodId} value={m.methodId}>
                      {m.name} · {m.fiatCode}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-muted-foreground">No hay metodos disponibles para tu region.</p>
              )}
              {selectedMethod && (
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">{selectedMethod.accountLabel}</p>
                  <p>{selectedMethod.accountReferenceMasked}</p>
                  <p className="mt-1">{selectedMethod.instructions}</p>
                </div>
              )}
            </div>
          )}

          {!authLoading && !user?.id && (
            <p className="text-xs text-destructive">
              Se requiere iniciar sesión para solicitar o cargar BLC.
            </p>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Monto BLC</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Nota</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={MODE === "development" ? "development topup" : "Detalle opcional para revision admin"}
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground outline-none"
            />
          </div>

          {MODE === "production" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Referencia (opcional)</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="BLC-MX-ABC123"
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground outline-none"
              />
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
          {success && <p className="text-xs text-green-500">{success}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted/30"
            >
              Cerrar
            </button>
            <button
              type="button"
              disabled={submitDisabled}
              onClick={handleSubmit}
              className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
            >
              {submitting
                ? "Enviando..."
                : MODE === "development"
                  ? "Agregar BLC de prueba"
                  : "Ya realice el pago / Enviar solicitud"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
