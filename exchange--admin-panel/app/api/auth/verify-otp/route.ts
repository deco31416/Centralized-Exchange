import { NextResponse } from 'next/server'
import { getAdminGatewayBaseUrl } from '../_shared/gateway'

type VerifyOtpBody = {
  sessionId: string
  code: string
  rememberMe?: boolean
}

export async function POST(req: Request) {
  let body: VerifyOtpBody
  try {
    body = (await req.json()) as VerifyOtpBody
  } catch {
    return NextResponse.json({ success: false, error: 'Body inválido' }, { status: 400 })
  }

  const { sessionId, code, rememberMe } = body
  if (!sessionId || !code) {
    return NextResponse.json({ success: false, error: 'sessionId y code son requeridos' }, { status: 400 })
  }

  const gatewayBase = getAdminGatewayBaseUrl()
  const url = `${gatewayBase}/auth/v2/login/verify-otp?include_refresh_token=true`

  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, otpCode: code }),
    cache: 'no-store',
  })

  const data = (await upstream.json().catch(() => null)) as any

  if (!upstream.ok) {
    const message = data?.message || data?.error || 'OTP inválido'
    return NextResponse.json({ success: false, error: message }, { status: upstream.status })
  }

  const ok = !!data?.ok
  if (!ok) {
    return NextResponse.json({ success: false, error: data?.message || 'OTP inválido' }, { status: 401 })
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
