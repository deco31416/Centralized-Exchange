'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconAlertCircle, IconLoader2 } from '@tabler/icons-react'

interface VerifyOtpFormProps {
  onSubmit: (code: string) => Promise<void>
  loading?: boolean
  error?: string | null
  debugOtpCode?: string | null
}

export function VerifyOtpForm({
  onSubmit,
  loading = false,
  error = null,
  debugOtpCode = null,
}: VerifyOtpFormProps) {
  const [code, setCode] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const validate = () => {
    const normalized = code.trim()
    if (!normalized) {
      setValidationError('El código es requerido')
      return false
    }
    if (!/^\d{6}$/.test(normalized)) {
      setValidationError('El código debe tener 6 dígitos')
      return false
    }
    setValidationError(null)
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(code.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {debugOtpCode && (
        <Alert>
          <AlertDescription>
            Código de prueba: <span className="font-semibold">{debugOtpCode}</span>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="otp-code">
          Código OTP <span className="text-destructive">*</span>
        </Label>
        <Input
          id="otp-code"
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
          disabled={loading}
          className={validationError ? 'border-destructive' : ''}
        />
        {validationError && <p className="text-destructive text-sm">{validationError}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            Verificando...
          </>
        ) : (
          'Verificar'
        )}
      </Button>
    </form>
  )
}
