import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminGatewayBaseUrl } from '../../auth/_shared/gateway'

const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN || ''

/**
 * 🔍 GET /api/users/[id] - Obtener detalles de un usuario
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')?.value
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gatewayBase = getAdminGatewayBaseUrl()
    const { id } = await params

    const response = await fetch(`${gatewayBase}/internal/users/${id}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'x-internal-auth': INTERNAL_AUTH_TOKEN,
        'x-internal-auth-token': INTERNAL_AUTH_TOKEN,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: error || 'User not found' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
