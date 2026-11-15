"use client"

import { Mail } from "lucide-react"

export function StepSuccess({
  onLoginClick,
}: {
  onLoginClick?: () => void
}) {
  return (
    <div className="text-center space-y-4 py-6">
      <Mail className="w-16 h-16 text-primary mx-auto" />
      <h2 className="text-2xl font-bold">¡Registro exitoso!</h2>
      <p className="text-muted-foreground">
        Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.
      </p>
      <p className="text-sm text-muted-foreground">
        Si no encuentras el correo, revisa tu carpeta de spam.
      </p>
      {onLoginClick ? (
        <button
          type="button"
          className="w-full mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={onLoginClick}
        >
          Iniciar sesión
        </button>
      ) : null}
    </div>
  )
}
