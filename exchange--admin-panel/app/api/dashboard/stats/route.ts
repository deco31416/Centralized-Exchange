/**
 * 📊 Dashboard Stats - Obtener estadísticas reales del sistema
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminGatewayBaseUrl } from '../../auth/_shared/gateway'

const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN || ''

async function fetchTotal(url: string, headers: Record<string, string>) {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`)
  }

  const payload = await response.json()
  return Number(payload.total ?? payload.count ?? 0)
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')?.value
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gatewayBase = getAdminGatewayBaseUrl()
    const headers = {
      'Authorization': `Bearer ${adminToken}`,
      'x-internal-auth': INTERNAL_AUTH_TOKEN,
      'x-internal-auth-token': INTERNAL_AUTH_TOKEN,
    }

    // Obtener conteos reales de usuarios
    const [totalUsers, activeUsers, pendingUsers, totalAdmins] = await Promise.all([
      fetchTotal(`${gatewayBase}/internal/users?limit=1`, headers),
      fetchTotal(`${gatewayBase}/internal/users?limit=1&status=active`, headers),
      fetchTotal(`${gatewayBase}/internal/users?limit=1&status=pending_verification`, headers),
      fetchTotal(`${gatewayBase}/internal/admins?limit=1`, headers),
    ])

    return NextResponse.json({
      totalUsers,
      totalAdmins,
      activeUsers,
      pendingUsers,
      connection: {
        activeUsers: 'connected',
        pendingUsers: 'connected',
      },
    })
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
