"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type State = "idle" | "loading" | "success" | "error"

// Alineado con el Matches() de ResetPasswordDto en micro-auth
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Mínimo 8 caracteres."
  if (!PASSWORD_REGEX.test(pw)) {
    return "Debe incluir mayúscula, minúscula, número y carácter especial (@$!%*?&)."
  }
  return null
}

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [state, setState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState<string>("No se pudo restablecer la contraseña.")
  const [fieldError, setFieldError] = useState<string | null>(null)

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm text-center space-y-6">
          <XCircle className="w-14 h-14 mx-auto text-destructive" />
          <h1 className="text-xl font-semibold">Enlace de restablecimiento inválido</h1>
          <p className="text-muted-foreground text-sm">
            El enlace que usaste no contiene un token válido. Solicita un nuevo enlace
            usando la opción "¿Olvidaste tu contraseña?" en el inicio de sesión.
          </p>
          <Button className="w-full" onClick={() => router.push("/")}>
            Volver al inicio
          </Button>
        </div>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldError(null)

    const pwError = validatePassword(newPassword)
    if (pwError) {
      setFieldError(pwError)
      return
    }

    if (newPassword !== confirmPassword) {
      setFieldError("Las contraseñas no coinciden.")
      return
    }

    setState("loading")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
        credentials: "include",
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        setState("success")
      } else {
        const msg =
          typeof data?.message === "string"
            ? data.message
            : typeof data?.error === "string"
              ? data.error
              : "No se pudo restablecer la contraseña. El enlace puede haber expirado."
        setErrorMsg(msg)
        setState("error")
      }
    } catch {
      setErrorMsg("Error de conexión. Inténtalo de nuevo.")
      setState("error")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm space-y-6">
        {state === "success" ? (
          <div className="text-center space-y-6">
            <CheckCircle2 className="w-14 h-14 mx-auto text-green-500" />
            <h1 className="text-xl font-semibold">¡Contraseña actualizada correctamente!</h1>
            <p className="text-muted-foreground text-sm">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Button className="w-full" onClick={() => router.push("/")}>
              Iniciar sesión
            </Button>
          </div>
        ) : state === "error" ? (
          <div className="text-center space-y-6">
            <XCircle className="w-14 h-14 mx-auto text-destructive" />
            <h1 className="text-xl font-semibold">No se pudo restablecer la contraseña</h1>
            <p className="text-muted-foreground text-sm">{errorMsg}</p>
            <div className="flex flex-col gap-2">
              <Button className="w-full" onClick={() => router.push("/")}>
                Volver al inicio
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-xl font-semibold">Restablecer contraseña</h1>
              <p className="text-muted-foreground text-sm">
                Ingresa tu nueva contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    disabled={state === "loading"}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowNew((v) => !v)}
                    tabIndex={-1}
                    aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    disabled={state === "loading"}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                    aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {fieldError && (
                <p className="text-sm text-destructive">{fieldError}</p>
              )}

              <p className="text-xs text-muted-foreground">
                La contraseña debe tener al menos 8 caracteres e incluir mayúscula,
                minúscula, número y un carácter especial (@$!%*?&).
              </p>

              <Button type="submit" className="w-full" disabled={state === "loading"}>
                {state === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Actualizando…
                  </>
                ) : (
                  "Actualizar contraseña"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm text-center space-y-6">
            <Loader2 className="w-14 h-14 mx-auto animate-spin text-muted-foreground" />
            <h1 className="text-xl font-semibold">Cargando…</h1>
          </div>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
