'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/auth/auth-layout'
import { LoginForm } from '@/components/auth/login-form'
import { RequestResetForm } from '@/components/auth/request-reset-form'
import type { LoginCredentials, LoginResponse, AuthError } from '@/lib/types/auth'
import { getAuthConfig } from '@/lib/auth-config'

type ViewState = 'login' | 'forgot-password'

function AdminLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')
  
  const [view, setView] = useState<ViewState>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)
  
  const authConfig = getAuthConfig()

  const handleLogin = async (credentials: LoginCredentials) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(authConfig.apiEndpoints.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })

      const data = (await response.json().catch(() => null)) as LoginResponse | null

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Error al iniciar sesión')
      }

      // Si requiere OTP, redirigir a página de verificación
      if (data.requiresOtp) {
        const params = new URLSearchParams()
        if (data.sessionId) params.set('session', data.sessionId)
        if (data.debugOtpCode) params.set('debugOtp', data.debugOtpCode)
        router.push(`/${authConfig.adminPath}/verify-otp?${params.toString()}`)
        return
      }

      // Redirigir al dashboard o a la URL de retorno
      router.push(returnUrl || '/dashboard')
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Error al iniciar sesión',
        code: 'UNKNOWN',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequestReset = async (email: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(authConfig.apiEndpoints.requestReset, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      const data = await response.json().catch(() => null) as any
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Error al enviar el email')
      }

      setResetSuccess(true)
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Error al enviar el email',
        code: 'UNKNOWN',
      })
    } finally {
      setLoading(false)
    }
  }

  const renderView = () => {
    switch (view) {
      case 'forgot-password':
        return (
          <RequestResetForm
            onSubmit={handleRequestReset}
            onBack={() => {
              setView('login')
              setResetSuccess(false)
              setError(null)
            }}
            loading={loading}
            error={error?.message}
            success={resetSuccess}
          />
        )
      
      case 'login':
      default:
        return (
          <LoginForm
            onSubmit={handleLogin}
            onForgotPassword={() => setView('forgot-password')}
            loading={loading}
            error={error}
          />
        )
    }
  }

  return (
    <AuthLayout
      title="Panel administrativo"
      subtitle={view === 'login' ? 'Ingresa tus credenciales de administrador' : undefined}
    >
      {renderView()}
    </AuthLayout>
  )
}

export default function AdminLoginPage() {
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
      <AdminLoginContent />
    </Suspense>
  )
}
