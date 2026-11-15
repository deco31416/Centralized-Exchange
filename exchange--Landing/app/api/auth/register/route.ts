import { NextRequest, NextResponse } from 'next/server';
import { getUserGatewayBaseUrl } from '../../_shared/gateway';
import { getInternalAuthToken } from '../../_shared/internal-auth';
import { enforceTrustedOrigin } from '../../_shared/origin-guard';
import { enforceRateLimit } from '../../_shared/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/register
 *
 * BFF de registro: reenvía email + password al gateway → micro-auth.
 * No almacena tokens (el registro no autentica automáticamente en este flujo).
 * El usuario debe hacer login después de registrarse.
 */
export async function POST(request: NextRequest) {
  try {
    const blockedOrigin = enforceTrustedOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limited = enforceRateLimit(request, {
      key: 'auth:register',
      limit: 5,
      windowMs: 10 * 60_000,
    });
    if (limited) return limited;

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const base = getUserGatewayBaseUrl();
    const url = `${base}/auth/register`;
    const internalAuthToken = getInternalAuthToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-auth': internalAuthToken,
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[BFF /api/auth/register] Error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
