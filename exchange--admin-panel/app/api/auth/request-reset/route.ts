import { NextResponse } from 'next/server'
import { getAdminGatewayBaseUrl } from '../_shared/gateway'

type RequestResetBody = {
  email: string
}

export async function POST(req: Request) {
  let body: RequestResetBody
  try {
    body = (await req.json()) as RequestResetBody
  } catch {
    return NextResponse.json({ success: false, error: 'Body inválido' }, { status: 400 })
  }

  if (!body.email) {
    return NextResponse.json({ success: false, error: 'Email es requerido' }, { status: 400 })
  }

  const gatewayBase = getAdminGatewayBaseUrl()
  const url = `${gatewayBase}/auth/forgot-password`

  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email }),
    cache: 'no-store',
  })

  const data = (await upstream.json().catch(() => null)) as any

  // forgot-password es anti-enumeración: incluso si no existe el email, suele devolver success=true
  if (!upstream.ok) {
    const message = data?.message || data?.error || 'Error al enviar el email'
    return NextResponse.json({ success: false, error: message }, { status: upstream.status })
  }

  return NextResponse.json({ success: true, message: data?.message })
}
