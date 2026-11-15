import { NextResponse } from 'next/server'
import { getAdminGatewayBaseUrl } from '../_shared/gateway'

type ResetPasswordBody = {
  token: string
  newPassword: string
}

export async function POST(req: Request) {
  let body: ResetPasswordBody
  try {
    body = (await req.json()) as ResetPasswordBody
  } catch {
    return NextResponse.json({ success: false, error: 'Body inválido' }, { status: 400 })
  }

  if (!body.token || !body.newPassword) {
    return NextResponse.json({ success: false, error: 'token y newPassword son requeridos' }, { status: 400 })
  }

  const gatewayBase = getAdminGatewayBaseUrl()
  const url = `${gatewayBase}/auth/reset-password`

  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: body.token, new_password: body.newPassword }),
    cache: 'no-store',
  })

  const data = (await upstream.json().catch(() => null)) as any

  if (!upstream.ok) {
    const message = data?.message || data?.error || 'Error al restablecer la contraseña'
    return NextResponse.json({ success: false, error: message }, { status: upstream.status })
  }

  const success = data?.success === true
  return NextResponse.json({ success, message: data?.message })
}
