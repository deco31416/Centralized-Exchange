import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminGatewayBaseUrl } from '../../auth/_shared/gateway'

const INTERNAL_AUTH_TOKEN = process.env.INTERNAL_AUTH_TOKEN || ''

/**
 * 👤 GET /api/admins/:id - Obtener detalle de un administrador específico
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

    const { id } = await params
    const gatewayBase = getAdminGatewayBaseUrl()

    const response = await fetch(`${gatewayBase}/internal/admins/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'x-internal-auth': INTERNAL_AUTH_TOKEN,
        'x-internal-auth-token': INTERNAL_AUTH_TOKEN,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: error || 'Failed to fetch admin details' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error fetching admin details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * 🔄 PUT /api/admins/:id - Actualizar roles de un administrador
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const gatewayBase = getAdminGatewayBaseUrl()

    const response = await fetch(`${gatewayBase}/internal/admins/${id}/roles`, {
      method: 'PUT',
      headers: {
        'x-internal-auth-token': INTERNAL_AUTH_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: error || 'Failed to update admin roles' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error updating admin roles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * 🗑️ DELETE /api/admins/:id - Desactivar un administrador
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const gatewayBase = getAdminGatewayBaseUrl()

    const response = await fetch(`${gatewayBase}/internal/admins/${id}`, {
      method: 'DELETE',
      headers: {
        'x-internal-auth-token': INTERNAL_AUTH_TOKEN,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: error || 'Failed to delete admin' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error deleting admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
