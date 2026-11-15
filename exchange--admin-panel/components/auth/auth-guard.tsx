'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

/**
 * Client-side auth guard para proteger páginas
 * El middleware ya redirige sin token, esto es defensa en profundidad
 */
export function AuthGuard({ children, requiredRoles = [] }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar que existe admin_token (httpOnly, no accesible desde JS)
        // Llamamos a un endpoint de verificación
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Unauthorized')
        }

        const data = await response.json()
        
        // Verificar roles si se requieren
        if (requiredRoles.length > 0) {
          const userRoles = data.user?.roles || []
          const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))
          
          if (!hasRequiredRole) {
            router.push('/dashboard?error=insufficient_permissions')
            return
          }
        }

        setIsAuthorized(true)
      } catch (error) {
        // Token inválido o expirado - redirigir al login
        const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'logindeco'
        router.push(`/${adminPath}?returnUrl=${encodeURIComponent(pathname)}`)
      }
    }

    checkAuth()
  }, [pathname, router, requiredRoles])

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
