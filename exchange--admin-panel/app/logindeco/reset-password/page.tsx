'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/auth/auth-layout'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { getAuthConfig } from '@/lib/auth-config'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconAlertCircle } from '@tabler/icons-react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const authConfig = getAuthConfig()

  const handleResetPassword = async (token: string, newPassword: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(authConfig.apiEndpoints.resetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json().catch(() => null) as any
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || data?.message || 'Error al restablecer la contraseña')
      }

      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al restablecer la contraseña'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Enlace inválido">
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'El enlace es inválido. Solicita un nuevo enlace de recuperación.'}
          </AlertDescription>
        </Alert>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <ResetPasswordForm
        token={token!}
        onSubmit={handleResetPassword}
        loading={loading}
        error={error}
        success={success}
      />
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </AuthLayout>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
