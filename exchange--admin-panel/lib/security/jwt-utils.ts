/**
 * 🔒 JWT Utilities para verificación en BFF
 * NO instalar librerías nuevas - usar crypto nativo de Node.js
 */

interface JWTPayload {
  sub: string // userId
  email: string
  roles: string[]
  iat: number
  exp: number
  iss?: string
  aud?: string
  sessionId?: string
}

interface VerifyResult {
  valid: boolean
  payload?: JWTPayload
  error?: string
}

/**
 * Decodifica JWT sin verificar (solo parseo base64)
 * NOTA: NO usar esto para validación, solo para inspección
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8')
    return JSON.parse(decoded) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Verifica expiración del JWT (sin verificar firma)
 * Útil para checks rápidos antes de llamar al microservicio
 */
export function isJWTExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) return true
  
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

/**
 * Valida JWT completo llamando al microservicio de auth
 * Esta es la forma CORRECTA - el microservicio tiene el secret
 */
export async function verifyJWTWithService(
  token: string,
  gatewayUrl: string = 'http://localhost:8080',
  internalToken: string = process.env.INTERNAL_AUTH_TOKEN || ''
): Promise<VerifyResult> {
  try {
    // Pre-check: ¿expirado localmente?
    if (isJWTExpired(token)) {
      return {
        valid: false,
        error: 'Token expired'
      }
    }
    
    // Verificar con el microservicio que tiene el JWT_SECRET
    const response = await fetch(`${gatewayUrl}/api/v1/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-auth-token': internalToken,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    })
    
    if (!response.ok) {
      const error = await response.text()
      return {
        valid: false,
        error: error || 'Invalid token'
      }
    }
    
    const data = await response.json()
    return {
      valid: true,
      payload: data.user || decodeJWT(token)
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    }
  }
}

/**
 * Extrae roles del JWT decodificado
 */
export function getJWTRoles(token: string): string[] {
  const payload = decodeJWT(token)
  return payload?.roles || []
}

/**
 * Verifica si el JWT tiene al menos uno de los roles requeridos
 */
export function hasRequiredRole(token: string, requiredRoles: string[]): boolean {
  const userRoles = getJWTRoles(token)
  return requiredRoles.some(role => userRoles.includes(role))
}

/**
 * Extrae userId del JWT
 */
export function getJWTUserId(token: string): string | null {
  const payload = decodeJWT(token)
  return payload?.sub || null
}

/**
 * Extrae sessionId del JWT (si existe)
 */
export function getJWTSessionId(token: string): string | null {
  const payload = decodeJWT(token)
  return payload?.sessionId || null
}
