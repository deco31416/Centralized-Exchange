"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

type State = "loading" | "success" | "error" | "no-token"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [state, setState] = useState<State>(token ? "loading" : "no-token")
  const [errorMsg, setErrorMsg] = useState<string>("No pudimos verificar tu email.")

  useEffect(() => {
    if (!token) return

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
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
                : "No pudimos verificar tu email. El enlace puede haber expirado."
          setErrorMsg(msg)
          setState("error")
        }
      } catch {
        setErrorMsg("Error de conexión. Inténtalo de nuevo.")
        setState("error")
      }
    }

    verify()
  }, [token])

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm text-center space-y-6">
        {state === "loading" && (
          <>
            <Loader2 className="w-14 h-14 mx-auto animate-spin text-muted-foreground" />
            <h1 className="text-xl font-semibold">Verificando tu email…</h1>
            <p className="text-muted-foreground text-sm">Por favor espera un momento.</p>
          </>
        )}

        {state === "no-token" && (
          <>
            <XCircle className="w-14 h-14 mx-auto text-destructive" />
            <h1 className="text-xl font-semibold">Token de verificación faltante o inválido</h1>
            <p className="text-muted-foreground text-sm">
              El enlace que usaste no es válido. Solicita un nuevo correo de verificación
              iniciando sesión en tu cuenta.
            </p>
            <Button className="w-full" onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle2 className="w-14 h-14 mx-auto text-green-500" />
            <h1 className="text-xl font-semibold">¡Email verificado correctamente!</h1>
            <p className="text-muted-foreground text-sm">
              Tu cuenta está activa. Ya puedes iniciar sesión.
            </p>
            <Button className="w-full" onClick={() => router.push("/")}>
              Iniciar sesión
            </Button>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="w-14 h-14 mx-auto text-destructive" />
            <h1 className="text-xl font-semibold">No pudimos verificar tu email</h1>
            <p className="text-muted-foreground text-sm">{errorMsg}</p>
            <div className="flex flex-col gap-2">
              <Button className="w-full" onClick={() => router.push("/")}>
                Iniciar sesión
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
                Volver al inicio
              </Button>
            </div>
          </>
        )}

        {(state === "success" || state === "error" || state === "no-token") && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <Mail className="w-4 h-4" />
            <span>¿Problemas? Contacta a soporte.</span>
          </div>
        )}
      </div>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm text-center space-y-6">
            <Loader2 className="w-14 h-14 mx-auto animate-spin text-muted-foreground" />
            <h1 className="text-xl font-semibold">Verificando tu email…</h1>
            <p className="text-muted-foreground text-sm">Por favor espera un momento.</p>
          </div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
