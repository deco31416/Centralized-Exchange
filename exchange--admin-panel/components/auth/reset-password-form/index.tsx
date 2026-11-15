'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/auth/password-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconAlertCircle, IconLoader2, IconCheck } from '@tabler/icons-react'

interface ResetPasswordFormProps {
  token: string
  onSubmit: (token: string, newPassword: string) => Promise<void>
  loading?: boolean
  error?: string | null
  success?: boolean
}

export function ResetPasswordForm({
  token,
  onSubmit,
  loading = false,
  error = null,
  success = false,
}: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!newPassword.trim()) {
      errors.newPassword = 'La contraseña es requerida'
    } else if (newPassword.length < 8) {
      errors.newPassword = 'La contraseña debe tener al menos 8 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      errors.newPassword = 'Debe contener mayúsculas, minúsculas y números'
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Confirma tu contraseña'
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    await onSubmit(token, newPassword)
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <IconCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Contraseña actualizada</h3>
          <p className="text-muted-foreground text-sm">
            Tu contraseña ha sido restablecida exitosamente.
          </p>
        </div>

        <Button onClick={() => window.location.href = '/'} className="w-full">
          Ir al login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Nueva contraseña</h3>
        <p className="text-muted-foreground text-sm">
          Ingresa tu nueva contraseña. Debe ser segura y fácil de recordar.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PasswordInput
        id="new-password"
        name="new-password"
        value={newPassword}
        onChange={setNewPassword}
        label="Nueva contraseña"
        placeholder="Mínimo 8 caracteres"
        required
        autoComplete="new-password"
        disabled={loading}
        error={validationErrors.newPassword}
      />

      <PasswordInput
        id="confirm-password"
        name="confirm-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        label="Confirmar contraseña"
        placeholder="Repite la contraseña"
        required
        autoComplete="new-password"
        disabled={loading}
        error={validationErrors.confirmPassword}
      />

      <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
        <p className="font-medium mb-1">Requisitos de contraseña:</p>
        <ul className="space-y-1 text-xs">
          <li>• Mínimo 8 caracteres</li>
          <li>• Al menos una mayúscula</li>
          <li>• Al menos una minúscula</li>
          <li>• Al menos un número</li>
        </ul>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            Actualizando...
          </>
        ) : (
          'Restablecer contraseña'
        )}
      </Button>
    </form>
  )
}
