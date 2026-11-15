import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminGatewayBaseUrl } from '../auth/_shared/gateway'

const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN || ''

/**
 * 👥 GET /api/admins - Listar solo usuarios administrativos
 * Query params: page, limit
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')?.value
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gatewayBase = getAdminGatewayBaseUrl()
    const { searchParams } = new URL(request.url)
    
    const params = new URLSearchParams()
    if (searchParams.get('page')) params.set('page', searchParams.get('page')!)
    if (searchParams.get('limit')) params.set('limit', searchParams.get('limit')!)

    const queryString = params.toString()
    const url = `${gatewayBase}/internal/admins${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
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
        { error: error || 'Failed to fetch admins' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error fetching admins:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
