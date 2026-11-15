import { NextResponse } from 'next/server'
import { getAdminGatewayBaseUrl } from '../_shared/gateway'

type LoginRequestBody = {
  email: string
  password: string
  rememberMe?: boolean
}

export async function POST(req: Request) {
  let body: LoginRequestBody
  try {
    body = (await req.json()) as LoginRequestBody
  } catch {
    return NextResponse.json({ success: false, error: 'Body inválido' }, { status: 400 })
  }

  const { email, password, rememberMe } = body
  if (!email || !password) {
    return NextResponse.json({ success: false, error: 'Email y contraseña son requeridos' }, { status: 400 })
  }

  const gatewayBase = getAdminGatewayBaseUrl()
  const url = `${gatewayBase}/auth/v2/login?include_refresh_token=true`

  let upstream: Response
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Gateway admin no disponible. Verifica que exchange--api-gateway-admin esté levantado.',
      },
      { status: 503 },
    )
  }

  const data = (await upstream.json().catch(() => null)) as any

  if (!upstream.ok) {
    const message = data?.message || data?.error || upstream.statusText || 'Error al iniciar sesión'
    return NextResponse.json({ success: false, error: message }, { status: upstream.status })
  }

  // v2: { ok, nextStep, sessionId, access_token, refresh_token, user }
  const ok = !!data?.ok
  if (!ok) {
    const message = data?.message || 'Error al iniciar sesión'
    return NextResponse.json({ success: false, error: message }, { status: 401 })
  }

  const nextStep = data?.nextStep as string | undefined
  if (nextStep === 'OTP_REQUIRED') {
    return NextResponse.json({
      success: true,
      requiresOtp: true,
      sessionId: data?.sessionId,
      debugOtpCode: data?.debugOtpCode,
    })
  }

  const accessToken = data?.access_token as string | undefined
  const refreshToken = data?.refresh_token as string | undefined

  if (!accessToken) {
    return NextResponse.json({ success: false, error: 'Access token faltante' }, { status: 500 })
  }

  const res = NextResponse.json({
    success: true,
    accessToken,
    refreshToken,
    user: data?.user,
    requiresOtp: false,
  })

  const isProd = process.env.NODE_ENV === 'production'
  const maxAgeSeconds = rememberMe ? 7 * 24 * 60 * 60 : undefined

  res.cookies.set('admin_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    ...(maxAgeSeconds ? { maxAge: maxAgeSeconds } : {}),
  })

  if (refreshToken) {
    res.cookies.set('admin_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      ...(maxAgeSeconds ? { maxAge: maxAgeSeconds } : {}),
    })
  }

  return res
}
