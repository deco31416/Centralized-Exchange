import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas públicas que NO requieren autenticación
const PUBLIC_PATHS = ['/api', '/_next', '/favicon.ico', '/icon', '/apple-icon']

// Next.js middleware estándar
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Ignorar rutas públicas y assets
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'logindeco'
  const adminLoginPath = `/${adminPath}`
  const adminResetPath = `/${adminPath}/reset-password`
  const adminVerifyOtpPath = `/${adminPath}/verify-otp`
  
  // Verificar si se debe desactivar autenticación (SOLO desarrollo)
  const skipAuthInDev = process.env.SKIP_AUTH_IN_DEV === 'true'
  const disableAuth = process.env.DISABLE_AUTH === 'true' || process.env.SKIP_AUTH === 'true'
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // SOLO en desarrollo con flag explícito
  if (isDevelopment && skipAuthInDev) {
    if (pathname === '/' || pathname === adminLoginPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }
  
  // NUNCA permitir DISABLE_AUTH en producción (seguridad crítica)
  if (!isDevelopment && disableAuth) {
    console.error('[SECURITY] DISABLE_AUTH está activado en producción - RECHAZADO')
    return NextResponse.json(
      { error: 'Unauthorized - Invalid configuration' },
      { status: 401 }
    )
  }
  
  // Si en producción con DISABLE_AUTH, permitir (pero logueado arriba)
  if (isDevelopment && disableAuth) {
    if (pathname === '/' || pathname === adminLoginPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }
  
  // Verificar token de admin (cookie httpOnly o header Authorization)
  const adminToken = request.cookies.get('admin_token')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '')

  // Rutas del sistema de auth (permitidas sin token)
  const isAuthRoute = pathname === adminLoginPath || 
                      pathname.startsWith(adminResetPath) ||
                      pathname.startsWith(adminVerifyOtpPath)
  
  // Ruta raíz - redirigir al login
  if (pathname === '/') {
    if (adminToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL(adminLoginPath, request.url))
  }

  // ✅ SEGURIDAD: Proteger TODAS las rutas excepto las de auth
  if (!isAuthRoute && !adminToken) {
    // Redirigir al login con returnUrl para volver después
    const url = new URL(adminLoginPath, request.url)
    url.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Si tiene token y intenta ir a rutas de auth, redirigir al dashboard
  if (isAuthRoute && adminToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
