import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminGatewayBaseUrl } from '../auth/_shared/gateway'

const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN || ''

/**
 * 📋 GET /api/users - Listar usuarios con filtros
 * Query params: page, limit, status, role, search
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
    const role = searchParams.get('role')

    if (role) {
      return NextResponse.json({
        users: [],
        total: 0,
        source: 'count-only',
        partial: true,
        note: 'La segmentación por rol o tier todavía no está expuesta por Gateway Admin.',
      })
    }
    
    // Construir query string
    const params = new URLSearchParams()
    if (searchParams.get('page')) params.set('page', searchParams.get('page')!)
    if (searchParams.get('limit')) params.set('limit', searchParams.get('limit')!)
    if (searchParams.get('status')) params.set('status', searchParams.get('status')!)
    if (searchParams.get('search')) params.set('search', searchParams.get('search')!)

    const queryString = params.toString()
    const url = `${gatewayBase}/internal/users${queryString ? '?' + queryString : ''}`

    const headers = {
      'Authorization': `Bearer ${adminToken}`,
      'x-internal-auth': INTERNAL_AUTH_TOKEN,
      'x-internal-auth-token': INTERNAL_AUTH_TOKEN,
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const countResponse = await fetch(`${gatewayBase}/internal/users/count`, {
        method: 'GET',
        headers,
      })

      if (countResponse.ok) {
        const countData = await countResponse.json()
        return NextResponse.json({
          users: [],
          total: Number(countData.count || 0),
          source: 'count-only',
          partial: true,
          note: 'El conteo está conectado, pero el listado de usuarios aún no está expuesto por Gateway Admin.',
        })
      }

      const error = await response.text()
      return NextResponse.json(
        { error: error || 'Failed to fetch users' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
