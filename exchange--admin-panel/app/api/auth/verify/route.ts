import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isJWTExpired } from '@/lib/security/jwt-utils'
import { isBlacklisted, areUserSessionsRevoked } from '@/lib/security/redis-blacklist'
import { getAdminGatewayBaseUrl } from '../_shared/gateway'

type VerifiedAdminPayload = {
  sub?: string
  email?: string
  roles?: string[]
  iat?: number
  sessionId?: string
}

/**
 * 🔒 Verificar JWT completo con todas las validaciones de seguridad
 * Este endpoint es llamado por AuthGuard (defense-in-depth)
 * 
 * Validaciones:
 * ✓ Token existe
 * ✓ No expirado
 * ✓ No en blacklist (logout individual)
 * ✓ Usuario no revocado globalmente (logout all devices)
 * ✓ Firma válida por Gateway Admin
 */
export async function GET() {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')

  if (!adminToken?.value) {
    return NextResponse.json(
      { error: 'No token found', code: 'NO_TOKEN' },
      { status: 401 }
    )
  }

  const token = adminToken.value

  // 1. Verificar expiración local (rápido)
  if (isJWTExpired(token)) {
    return NextResponse.json(
      { error: 'Token expired', code: 'EXPIRED' },
      { status: 401 }
    )
  }

  // 2. Verificar firma y payload con Gateway Admin.
  const gatewayBase = getAdminGatewayBaseUrl()
  const upstream = await fetch(`${gatewayBase}/auth/verify-token`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  }).catch(() => null)

  if (!upstream) {
    return NextResponse.json(
      { error: 'Gateway admin unavailable', code: 'GATEWAY_UNAVAILABLE' },
      { status: 503 }
    )
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: 'Invalid token signature', code: 'INVALID_SIGNATURE' },
      { status: 401 }
    )
  }

  const verification = await upstream.json().catch(() => null)
  const payload = (verification?.user ?? null) as VerifiedAdminPayload | null
  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid token format', code: 'INVALID_FORMAT' },
      { status: 401 }
    )
  }

  // 3. Verificar blacklist (logout individual)
  const blacklisted = await isBlacklisted(token)
  if (blacklisted) {
    return NextResponse.json(
      { error: 'Token revoked', code: 'REVOKED' },
      { status: 401 }
    )
  }

  // 4. Verificar revocación global de usuario (logout all devices)
  const userId = typeof payload.sub === 'string' ? payload.sub : null
  if (userId && typeof payload.iat === 'number') {
    const globallyRevoked = await areUserSessionsRevoked(userId, payload.iat)
    if (globallyRevoked) {
      return NextResponse.json(
        { error: 'All sessions revoked', code: 'GLOBAL_REVOKE' },
        { status: 401 }
      )
    }
  }

  // ✅ Token válido
  return NextResponse.json({
    authenticated: true,
    user: {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      sessionId: payload.sessionId
    }
  })
}
