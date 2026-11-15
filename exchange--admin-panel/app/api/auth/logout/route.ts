import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeJWT, getJWTUserId } from '@/lib/security/jwt-utils'
import { addToBlacklist, revokeAllUserSessions } from '@/lib/security/redis-blacklist'

/**
 * 🔒 Logout con revocación de token en blacklist
 * 
 * Query params:
 *  - allDevices=true → Revoca TODAS las sesiones del usuario (logout global)
 */
export async function POST(request: Request) {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')
  const { searchParams } = new URL(request.url)
  const allDevices = searchParams.get('allDevices') === 'true'

  // Agregar token actual a blacklist
  if (adminToken?.value) {
    const payload = decodeJWT(adminToken.value)
    
    if (payload) {
      // Calcular tiempo restante del token
      const now = Math.floor(Date.now() / 1000)
      const expiresIn = payload.exp - now
      
      if (expiresIn > 0) {
        // Agregar a blacklist con TTL = tiempo restante
        await addToBlacklist(adminToken.value, expiresIn)
      }

      // Logout global (todas las sesiones)
      if (allDevices) {
        const userId = getJWTUserId(adminToken.value)
        if (userId) {
          await revokeAllUserSessions(userId, 604800) // 7 días (máximo refresh token)
          console.log(`🔒 Revoked all sessions for user: ${userId}`)
        }
      }
    }
  }

  // Limpiar cookies
  const res = NextResponse.json({ 
    success: true,
    message: allDevices 
      ? 'Logged out from all devices' 
      : 'Logged out successfully'
  })
  
  res.cookies.set('admin_token', '', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/', 
    maxAge: 0 
  })
  
  res.cookies.set('admin_refresh_token', '', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/', 
    maxAge: 0 
  })
  
  return res
}
