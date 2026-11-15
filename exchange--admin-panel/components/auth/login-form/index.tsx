'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PasswordInput } from '@/components/auth/password-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconAlertCircle, IconLoader2 } from '@tabler/icons-react'
import type { LoginCredentials, AuthError } from '@/lib/types/auth'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  onForgotPassword: () => void
  loading?: boolean
  error?: AuthError | null
}

export function LoginForm({
  onSubmit,
  onForgotPassword,
  loading = false,
  error = null,
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!email.trim()) {
      errors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email inválido'
    }

    if (!password.trim()) {
      errors.password = 'La contraseña es requerida'
    } else if (password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    await onSubmit({ email, password, rememberMe })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
            {error.remainingAttempts !== undefined && error.remainingAttempts > 0 && (
              <span className="block mt-1 text-xs">
                Intentos restantes: {error.remainingAttempts}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.invalid"
          required
          autoComplete="email"
          disabled={loading}
          className={validationErrors.email ? 'border-destructive' : ''}
        />
        {validationErrors.email && (
          <p className="text-destructive text-sm">{validationErrors.email}</p>
        )}
      </div>

      <PasswordInput
        id="password"
        name="password"
        value={password}
        onChange={setPassword}
        label="Contraseña"
        required
        disabled={loading}
        error={validationErrors.password}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            disabled={loading}
          />
          <Label
            htmlFor="remember"
            className="text-sm font-normal cursor-pointer"
          >
            Recordarme
          </Label>
        </div>

        <Button
          type="button"
          variant="link"
          className="px-0 text-sm"
          onClick={onForgotPassword}
          disabled={loading}
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </Button>
    </form>
  )
}
