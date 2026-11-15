'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconAlertCircle, IconLoader2, IconCheck } from '@tabler/icons-react'

interface RequestResetFormProps {
  onSubmit: (email: string) => Promise<void>
  onBack: () => void
  loading?: boolean
  error?: string | null
  success?: boolean
}

export function RequestResetForm({
  onSubmit,
  onBack,
  loading = false,
  error = null,
  success = false,
}: RequestResetFormProps) {
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState('')

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setValidationError('El email es requerido')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Email inválido')
      return false
    }
    setValidationError('')
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail()) {
      return
    }

    await onSubmit(email)
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <IconCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Email enviado</h3>
          <p className="text-muted-foreground text-sm">
            Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
          </p>
          <p className="text-muted-foreground text-xs">
            Revisa tu bandeja de entrada y spam.
          </p>
        </div>

        <Button onClick={onBack} variant="outline" className="w-full">
          Volver al login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Recuperar contraseña</h3>
        <p className="text-muted-foreground text-sm">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="reset-email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.invalid"
          required
          autoComplete="email"
          disabled={loading}
          className={validationError ? 'border-destructive' : ''}
        />
        {validationError && (
          <p className="text-destructive text-sm">{validationError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar enlace de recuperación'
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
