/**
 * 🔒 Redis Blacklist para Session Revocation
 * Almacena tokens revocados (logout, cambio password, etc.)
 */

import { Redis } from 'ioredis'

let redisClient: Redis | null = null

/**
 * Inicializa conexión a Redis
 */
function getRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URI || process.env.REDIS_URL
  if (!redisUrl) {
    return null
  }

  if (!redisClient || redisClient.status === 'end') {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        if (times > 3) return null
        return Math.min(times * 50, 2000)
      }
    })
    
    redisClient.on('error', (err) => {
      console.error('❌ Redis blacklist error:', err)
    })
  }
  
  return redisClient
}

function shouldFailSecure(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Agregar JWT a blacklist (logout, revocación)
 * @param token - JWT completo
 * @param expiresIn - Segundos hasta que expire naturalmente (para auto-limpieza)
 */
export async function addToBlacklist(
  token: string,
  expiresIn: number = 3600 // 1 hora por defecto
): Promise<boolean> {
  try {
    const redis = getRedisClient()
    if (!redis) return !shouldFailSecure()
    const key = `blacklist:jwt:${token}`
    
    // SET con TTL = tiempo restante del token
    await redis.setex(key, expiresIn, '1')
    return true
  } catch (error) {
    console.error('❌ Error adding to blacklist:', error)
    return false
  }
}

/**
 * Verificar si JWT está en blacklist
 */
export async function isBlacklisted(token: string): Promise<boolean> {
  try {
    const redis = getRedisClient()
    if (!redis) return shouldFailSecure()
    const key = `blacklist:jwt:${token}`
    const exists = await redis.exists(key)
    return exists === 1
  } catch (error) {
    console.error('❌ Error checking blacklist:', error)
    return shouldFailSecure()
  }
}

/**
 * Revocar todas las sesiones de un usuario (logout global)
 * @param userId - ID del usuario
 * @param expiresIn - Segundos (usar el TTL máximo del refresh token: 7 días)
 */
export async function revokeAllUserSessions(
  userId: string,
  expiresIn: number = 604800 // 7 días
): Promise<boolean> {
  try {
    const redis = getRedisClient()
    if (!redis) return !shouldFailSecure()
    const key = `revoked:user:${userId}`
    const timestamp = Date.now()
    
    // Marcar usuario como "revocado" con timestamp
    await redis.setex(key, expiresIn, timestamp.toString())
    return true
  } catch (error) {
    console.error('❌ Error revoking user sessions:', error)
    return false
  }
}

/**
 * Verificar si todas las sesiones del usuario fueron revocadas
 * @param userId - ID del usuario
 * @param tokenIssuedAt - Timestamp iat del JWT (en segundos)
 */
export async function areUserSessionsRevoked(
  userId: string,
  tokenIssuedAt: number
): Promise<boolean> {
  try {
    const redis = getRedisClient()
    if (!redis) return shouldFailSecure()
    const key = `revoked:user:${userId}`
    const revocationTimestamp = await redis.get(key)
    
    if (!revocationTimestamp) return false
    
    // Si el token fue emitido ANTES de la revocación, está revocado
    const revocationTime = parseInt(revocationTimestamp, 10)
    return (tokenIssuedAt * 1000) < revocationTime
  } catch (error) {
    console.error('❌ Error checking user revocation:', error)
    return shouldFailSecure()
  }
}

/**
 * Limpiar blacklist (mantenimiento)
 * Redis auto-limpia con TTL, pero esto es para forzar limpieza
 */
export async function clearExpiredBlacklistEntries(): Promise<number> {
  try {
    const redis = getRedisClient()
    if (!redis) return 0
    // Redis auto-limpia con EXPIRE, solo retornar count
    const keys = await redis.keys('blacklist:jwt:*')
    return keys.length
  } catch (error) {
    console.error('❌ Error clearing blacklist:', error)
    return 0
  }
}

/**
 * Cerrar conexión Redis (cleanup)
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}
