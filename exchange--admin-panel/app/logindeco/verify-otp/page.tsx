'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/auth/auth-layout'
import { VerifyOtpForm } from '@/components/auth/verify-otp-form'
import { getAuthConfig } from '@/lib/auth-config'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconAlertCircle } from '@tabler/icons-react'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')
  const debugOtpCode = searchParams.get('debugOtp')
  const authConfig = getAuthConfig()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async (code: string) => {
    if (!sessionId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(authConfig.apiEndpoints.verifyOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId, code }),
      })

      const data = await response.json().catch(() => null) as any

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'OTP inválido')
      }

      router.push('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OTP inválido')
    } finally {
      setLoading(false)
    }
  }

  if (!sessionId) {
    return (
      <AuthLayout title="Sesión inválida">
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            La sesión de verificación es inválida o expiró. Vuelve a iniciar sesión.
          </AlertDescription>
        </Alert>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Verificación OTP" subtitle="Ingresa el código enviado a tu email">
      <VerifyOtpForm
        onSubmit={handleVerify}
        loading={loading}
        error={error}
        debugOtpCode={debugOtpCode}
      />
    </AuthLayout>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </AuthLayout>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  )
}
